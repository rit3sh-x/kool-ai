"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MessagesContainer, MessagesContainerError, MessagesContainerSkeleton } from "../components/messages-container";
import { Suspense, useState } from "react";
import type { Fragment } from "@/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectHeader, ProjectHeaderError, ProjectHeaderSkeleton } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { EyeIcon, CodeIcon, CrownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
    projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
    const { has } = useAuth();
    const hasPremiumAccess = has?.({ plan: "premium" }) ?? false;
    const [activeFragement, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<"preview" | "code">("preview");

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                    <ErrorBoundary fallback={<ProjectHeaderError />}>
                        <Suspense fallback={<ProjectHeaderSkeleton />}>
                            <ProjectHeader projectId={projectId} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<MessagesContainerError />}>
                        <Suspense fallback={<MessagesContainerSkeleton />}>
                            <MessagesContainer
                                projectId={projectId}
                                activeFragment={activeFragement}
                                setActiveFragment={setActiveFragment}
                            />
                        </Suspense>
                    </ErrorBoundary>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors" />
                <ResizablePanel defaultSize={65} minSize={50}>
                    <Tabs className="h-full gap-y-0" defaultValue="preview" value={tabState} onValueChange={(value) => setTabState((value) as "preview" | "code")}>
                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="preview" className="rounded-md">
                                    <EyeIcon /> <span>Demo</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="rounded-md">
                                    <CodeIcon /> <span>Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasPremiumAccess && (
                                    <Button asChild size="sm" variant={"tertiary"}>
                                        <Link href={"/pricing"}>
                                            <CrownIcon /> Upgrade
                                        </Link>
                                    </Button>
                                )}
                                <UserControl />
                            </div>
                        </div>
                        <TabsContent value="preview">
                            {!!activeFragement && <FragmentWeb data={activeFragement} />}
                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragement?.files && <FileExplorer files={activeFragement.files as { [path: string]: string }} />}
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}