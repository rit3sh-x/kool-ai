import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";
import type { Fragment } from "@/generated/prisma";
import { MessageLoading } from "./message-loading";
import { AlertTriangleIcon, MessageSquareIcon } from "lucide-react";

interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
}

export const MessagesContainerSkeleton = () => {
    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="flex flex-col gap-4 p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
                                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                                <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none" />
                <div className="bg-card border border-border rounded-lg p-3">
                    <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export const MessagesContainerError = () => {
    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                            <AlertTriangleIcon className="w-8 h-8 text-destructive" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Failed to load messages</h3>
                        <p className="text-sm text-muted-foreground">
                            There was an error loading the conversation. Please try again.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MessagesEmpty = ({ projectId }: { projectId: string }) => {
    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                            <MessageSquareIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Start a conversation</h3>
                        <p className="text-sm text-muted-foreground">
                            Send your first message to begin working on this project.
                        </p>
                    </div>
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none" />
                <MessageForm projectId={projectId} />
            </div>
        </div>
    );
};

export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastAssistantMessageRef = useRef<string | null>(null);
    const trpc = useTRPC();
    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId,
    }, {
        refetchInterval: 5000
    }))

    useEffect(() => {
        const lastAssistantMessage = messages.findLast((message) => message.role === "ASSISTANT")

        if (lastAssistantMessage?.fragment && lastAssistantMessage.id !== lastAssistantMessageRef.current) {
            setActiveFragment(lastAssistantMessage.fragment);
            lastAssistantMessageRef.current = lastAssistantMessage.id;
        }
    }, [messages, setActiveFragment])

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages.length]);

    const lastMessage = messages[messages.length - 1];
    const lastMessageByUser = lastMessage?.role === "USER";

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="flex flex-col gap-4">
                    {messages.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragment?.id}
                            onFragmentClick={() => setActiveFragment(message.fragment)}
                            type={message.type}
                        />
                    ))}
                    {lastMessageByUser && <MessageLoading />}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none" />
                <MessageForm projectId={projectId} />
            </div>
        </div>
    )
}