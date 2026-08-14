"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  File01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { NavUser } from "@/shadcn/nav-user";
import { SessionUser } from "@/types/auth";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/shadcn/ui/sidebar";
import { useProjectContext } from "./project-provider";

interface ProjectSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SessionUser;
}

type TreeItem = {
  name: string;
  isDir: boolean;
  children?: TreeItem[];
};
export function ProjectSidebar({ user, ...props }: ProjectSidebarProps) {
  const { projectId, accessToken, containerReady } = useProjectContext();
  const [fileTree, setFileTree] = useState<TreeItem[]>([]);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    if (!containerReady) return;

    const socketUrl = `ws://localhost:3001/files?token=${accessToken}&projectId=${projectId}`;
    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      setLoadingState(true);
    };

    ws.onmessage = (event) => {
      const { tree } = JSON.parse(event.data);
      setFileTree(tree);
    };

    return () => ws.close();
  }, [containerReady, projectId, accessToken]);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader className="h-8 border-b bg-muted/80 px-3 flex justify-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroupContent>
          <SidebarMenu>
            {containerReady ? (
              loadingState ? (
                fileTree.length === 0 ? (
                  <div className="px-3 py-1 text-xs text-muted-foreground">
                    No files yet
                  </div>
                ) : (
                  fileTree.map((item, index) => (
                    <Tree key={index} item={item} />
                  ))
                )
              ) : (
                <div className="px-3 py-1 text-xs text-muted-foreground">
                  Loading files...
                </div>
              )
            ) : (
              <div className="px-3 py-1 text-xs text-muted-foreground">
                Initializing container...
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

function Tree({ item }: { item: TreeItem }) {
  if (!item.isDir) {
    return (
      <SidebarMenuButton className="h-7 text-sm data-[active=true]:bg-transparent">
        <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-4" />
        {item.name}
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="h-7 text-sm">
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4 transition-transform"
            />
            <HugeiconsIcon
              icon={Folder01Icon}
              strokeWidth={2}
              className="size-4"
            />
            {item.name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <Tree key={child.name} item={child} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
