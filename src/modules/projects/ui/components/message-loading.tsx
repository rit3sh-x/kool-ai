import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";

const ShimmerMessages = () => {
    const messages = [
        "Crafting your site...",
        "Designing magic...",
        "Building blocks...",
        "Shaping ideas...",
        "Polishing details...",
        "Koolifying design...",
        "Almost there...",
        "Loading creativity...",
        "Setting the stage...",
        "Final touches...",
        "Just a moment..."
    ];

    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length);
        }, 2000)

        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground animate-pulse">
                {messages[index]}
            </span>
        </div>
    )
}

export const MessageLoading = () => {
    return (
        <div className="flex flex-col group px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Image
                    src={"/logo.svg"}
                    width={18}
                    height={18}
                    alt="Kool"
                    className="shrink-0"
                />
                <span className="text-sm font-medium">Kool</span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-4">
                <ShimmerMessages />
            </div>
        </div>
    )
}