import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangleIcon, ChevronDownIcon, ChevronLeftIcon, SunMoonIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface ProjectHeaderProps {
    projectId: string;
}

export const ProjectHeaderSkeleton = () => {
    return (
        <header className="p-2 flex justify-between items-center border-b border-border bg-background">
            <div className="flex items-center gap-2 pl-2!">
                <div className="w-[32px] h-[32px] bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <ChevronDownIcon className="w-4 h-4 text-muted animate-pulse" />
            </div>
        </header>
    );
};

export const ProjectHeaderError = () => {
    return (
        <header className="p-2 flex justify-between items-center border-b border-border bg-background">
            <div className="flex items-center gap-2 pl-2!">
                <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangleIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Failed to load project</span>
                </div>
            </div>
        </header>
    );
};

export const ProjectHeader = ({ projectId }: ProjectHeaderProps) => {
    const trpc = useTRPC();
    const { data: project } = useSuspenseQuery(trpc.projects.getOne.queryOptions({ id: projectId }));
    const { setTheme, theme } = useTheme();

    return (
        <header className="p-2 flex justify-between items-center border-b">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} size={"sm"} className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2!">
                        <Image
                            src={"/logo.svg"}
                            width={18}
                            height={18}
                            alt="Kool"
                            className="shrink-0"
                        />
                        <span className="text-sm font-medium">{project.name}</span>
                        <ChevronDownIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start">
                    <DropdownMenuItem asChild>
                        <Link href={"/"}>
                            <ChevronLeftIcon />
                            <span>Go to dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2">
                            <SunMoonIcon className="size-4 text-muted-foreground" />
                            <span>Appearance</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                                    <DropdownMenuRadioItem value="light">
                                        <span>Light</span>
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="dark">
                                        <span>Dark</span>
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="system">
                                        <span>System</span>
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
};