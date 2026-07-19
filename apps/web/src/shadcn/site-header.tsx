"use client";

import Link from "next/link";
import { Button } from "@/shadcn/ui/button";
import { Separator } from "@/shadcn/ui/separator";
import { useSidebar } from "@/shadcn/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SidebarLeftIcon,
  ArrowLeft01Icon,
  PlayIcon,
  UserAdd01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

export function SiteHeader({ projectName }: { projectName: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-background">
      <div className="flex h-(--header-height) items-center gap-1 px-2">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} />
        </Button>
        <Button className="h-8 w-8" variant="ghost" size="icon" asChild>
          <Link href="/dashboard/projects">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Link>
        </Button>
        <Separator
          orientation="vertical"
          className="mx-1 data-vertical:h-4 data-vertical:self-auto"
        />
        <span className="text-sm font-medium">{projectName}</span>
      </div>

      <div className="flex h-(--header-height) items-center gap-2 px-2">
        <Button
          size="sm"
          className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
        >
          <HugeiconsIcon icon={PlayIcon} strokeWidth={2} className="size-4" />
          Run
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5">
          <HugeiconsIcon
            icon={UserAdd01Icon}
            strokeWidth={2}
            className="size-4"
          />
          Share
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <HugeiconsIcon
            icon={Settings01Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
      </div>
    </header>
  );
}
