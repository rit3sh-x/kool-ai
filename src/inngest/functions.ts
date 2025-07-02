import { inngest } from './client'
import { Sandbox } from "@e2b/code-interpreter"
import { createAgent, createNetwork, createTool, openai, type Tool, type Message, createState } from "@inngest/agent-kit"
import { getSandbox, lastAssistantTextMessageContent } from './utils';
import { prisma } from '@/lib/prismaClient';
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from '@/prompt';
import { z } from 'zod';
import { parseAgentOutput } from '@/lib/utils';
import { baseModel, apiKey, baseUrl, summaryModel, sandboxName } from '@/lib/modelProps';

interface AgentState {
    summary: string;
    files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
    { id: 'code-agent', name: 'Code Agent' },
    { event: 'code-agent/run' },
    async ({ event, step }) => {
        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create(sandboxName);
            return sandbox.sandboxId;
        });

        const previousMessages = await step.run("get-previous-messages", async () => {
            const formattedMessages: Message[] = [];

            const messages = await prisma.message.findMany({
                where: {
                    projectId: event.data.projectId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5
            })

            for (const message of messages) {
                formattedMessages.push({
                    type: "text",
                    role: message.role === "ASSISTANT" ? "assistant" : "user",
                    content: message.content
                })
            }

            return formattedMessages.reverse();
        });

        const state = createState<AgentState>(
            {
                summary: "",
                files: {},
            },
            {
                messages: previousMessages
            }
        )

        const codeAgent = createAgent<AgentState>({
            name: 'code-agent',
            description: 'A senior software engineer working in a sandboxed Next.js environment',
            system: PROMPT,
            model: openai({
                model: baseModel,
                apiKey: apiKey,
                baseUrl: baseUrl,
            }),
            tools: [
                createTool({
                    name: "terminal",
                    description: "Use the terminal to run commands",
                    parameters: z.object({
                        command: z.string(),
                    }),
                    handler: async ({ command }, { step }) => {
                        return await step?.run("terminal", async () => {
                            const buffers = { stdout: "", stderr: "" };

                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const result = await sandbox.commands.run(command, {
                                    onStdout: (data: string) => {
                                        buffers.stdout += data;
                                    },
                                    onStderr: (data: string) => {
                                        buffers.stderr += data;
                                    }
                                });
                                return result.stdout;
                            } catch (e) {
                                console.error(`Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`);
                                return `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
                            }
                        })
                    }
                }),
                createTool({
                    name: "createOrUpdateFiles",
                    description: "Create or update files in the environment",
                    parameters: z.object({
                        files: z.array(
                            z.object({
                                path: z.string(),
                                content: z.string(),
                            })
                        )
                    }),
                    handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
                        const newFiles = await step?.run("createOrUpdateFiles", async () => {
                            try {
                                if (!Array.isArray(files)) {
                                    console.error("Files parameter is not an array:", files);
                                    return `Error: Files parameter must be an array, received: ${typeof files}`;
                                }

                                const updatedFiles = network.state.data.files || {};
                                const sandbox = await getSandbox(sandboxId);

                                for (const file of files) {
                                    if (!file || typeof file.path !== 'string' || typeof file.content !== 'string') {
                                        console.error("Invalid file object:", file);
                                        continue;
                                    }

                                    updatedFiles[file.path] = file.content;
                                    await sandbox.files.write(file.path, file.content);
                                }

                                return updatedFiles;
                            } catch (e) {
                                console.error("Error in createOrUpdateFiles:", e);
                                return `Error: ${e}`;
                            }
                        });

                        if (typeof newFiles === "object" && newFiles !== null && !Array.isArray(newFiles)) {
                            network.state.data.files = newFiles;
                        }
                    }
                }),
                createTool({
                    name: "readFiles",
                    description: "Read files in the environment",
                    parameters: z.object({
                        files: z.array(z.string())
                    }),
                    handler: async ({ files }, { step }) => {
                        return await step?.run("readFiles", async () => {
                            try {
                                if (!Array.isArray(files)) {
                                    console.error("Files parameter is not an array:", files);
                                    return `Error: Files parameter must be an array, received: ${typeof files}`;
                                }

                                const sandbox = await getSandbox(sandboxId);
                                const contents = [];

                                for (const file of files) {
                                    if (typeof file !== 'string') {
                                        console.error("Invalid file path:", file);
                                        continue;
                                    }

                                    const content = await sandbox.files.read(file);
                                    contents.push({ path: file, content });
                                }

                                return JSON.stringify(contents);
                            } catch (e) {
                                console.error("Error in readFiles:", e);
                                return `Error: ${e}`;
                            }
                        });
                    }
                }),
            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    const lastAssistantMessageText = lastAssistantTextMessageContent(result);
                    if (lastAssistantMessageText && network) {
                        if (lastAssistantMessageText.includes("<task_summary>")) {
                            network.state.data.summary = lastAssistantMessageText;
                        }
                    }
                    return result;
                }
            }
        })

        const network = createNetwork<AgentState>({
            name: "coding-agent-network",
            agents: [codeAgent],
            maxIter: 15,
            defaultState: state,
            router: async ({ network }) => {
                const summary = network.state.data.summary;
                if (summary) {
                    return;
                }
                return codeAgent;
            }
        })

        const result = await network.run(event.data.value, { state: state });

        const fragmentTitleGenerator = createAgent({
            name: 'fragment-title-agent',
            description: 'A clean fragment title generator',
            system: FRAGMENT_TITLE_PROMPT,
            model: openai({
                model: summaryModel,
                apiKey: apiKey,
                baseUrl: baseUrl,
            }),
        })

        const responseGenerator = createAgent({
            name: 'response-title-agent',
            description: 'A response generator',
            system: RESPONSE_PROMPT,
            model: openai({
                model: summaryModel,
                apiKey: apiKey,
                baseUrl: baseUrl,
            }),
        })

        const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary);
        const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);

        const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId);
            const host = sandbox.getHost(3000);
            return `https://${host}`;
        });

        await step.run("save-to-db", async () => {
            if (isError) {
                return await prisma.message.create({
                    data: {
                        projectId: event.data.projectId,
                        content: "Something went wrong please try Again.",
                        role: "ASSISTANT",
                        type: "ERROR"
                    }
                })
            }
            return await prisma.message.create({
                data: {
                    projectId: event.data.projectId,
                    content: parseAgentOutput(responseOutput, false),
                    role: "ASSISTANT",
                    type: "RESULT",
                    fragment: {
                        create: {
                            sandboxUrl: sandboxUrl,
                            title: parseAgentOutput(fragmentTitleOutput, true),
                            files: result.state.data.files,
                        }
                    }
                }
            })
        })

        return {
            url: sandboxUrl,
            title: parseAgentOutput(fragmentTitleOutput, true),
            files: result.state.data.files,
            summary: result.state.data.summary,
        }
    }
)