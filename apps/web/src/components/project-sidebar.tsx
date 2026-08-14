"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  File01Icon,
  FileAddIcon,
  Folder01Icon,
  Refresh01FreeIcons,
} from "@hugeicons/core-free-icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shadcn/ui/tooltip";
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

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

interface ProjectSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SessionUser;
}

type TreeItem = {
  name: string;
  isDir: boolean;
  path: string;
  children?: TreeItem[];
};

export function ProjectSidebar({ user, ...props }: ProjectSidebarProps) {
  const { projectId, accessToken, containerReady } = useProjectContext();
  const [fileTree, setFileTree] = useState<TreeItem[]>([]);
  const [loadingState, setLoadingState] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!containerReady) return;

    const socketUrl = `ws://localhost:3001/files?token=${accessToken}&projectId=${projectId}`;
    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      setLoadingState(true);
      websocketRef.current = ws;
    };

    ws.onmessage = (event) => {
      const { tree } = JSON.parse(event.data);
      setFileTree(tree);
    };

    return () => ws.close();
  }, [containerReady, projectId, accessToken]);

  function refreshFiles() {}

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader className="h-8 border-b bg-muted/80 px-3 flex justify-center">
        <div className="flex w-full items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Explorer
          </span>
          <div className="flex gap-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-accent  flex items-center justify-center"
                >
                  <HugeiconsIcon
                    icon={Refresh01FreeIcons}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>Refresh files</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-accent  flex items-center justify-center"
                >
                  <HugeiconsIcon
                    icon={FileAddIcon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>Create file</TooltipContent>
            </Tooltip>
          </div>
        </div>
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

async function fetchFileData(
  path: string,
  projectId: string,
  accessToken: string,
  setOpenFile: (file: { path: string; data: string }) => void,
): Promise<void> {
  try {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");

    const res = await fetch(
      `${BACKEND_API_URL}/projects/${projectId}/container/files/${encodedPath}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await res.text();
    setOpenFile({ path, data });
  } catch (error) {
    console.log(error);
  }
}

function Tree({ item }: { item: TreeItem }) {
  const { projectId, accessToken, setOpenFile } = useProjectContext();

  if (!item.isDir) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={async () =>
            await fetchFileData(item.path, projectId, accessToken, setOpenFile)
          }
          className="h-7 text-sm cursor-pointer"
        >
          <HugeiconsIcon
            icon={File01Icon}
            strokeWidth={2}
            className="size-4 shrink-0"
          />
          <span className="truncate">{item.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="h-7 text-sm cursor-pointer">
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4 shrink-0"
            />
            <HugeiconsIcon
              icon={Folder01Icon}
              strokeWidth={2}
              className="size-4 shrink-0"
            />
            <span className="truncate">{item.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <Tree key={child.path || child.name} item={child} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
