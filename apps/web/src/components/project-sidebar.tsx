"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileAddIcon,
  FolderAddIcon,
  Refresh01FreeIcons,
} from "@hugeicons/core-free-icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shadcn/ui/tooltip";
import { NavUser } from "@/shadcn/nav-user";
import { SessionUser } from "@/types/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from "@/shadcn/ui/sidebar";
import { useProjectContext } from "./project-provider";
import { toast } from "sonner";
import { DraftRow } from "./draft-row";
import { Tree } from "./tree";
import { Draft, TreeItem } from "@/types/explorer";

interface ProjectSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SessionUser;
}

export function ProjectSidebar({ user, ...props }: ProjectSidebarProps) {
  const { projectId, accessToken, containerReady } = useProjectContext();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [fileTree, setFileTree] = useState<TreeItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
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
      const data = JSON.parse(event.data);

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const { tree } = data;

      setFileTree(tree);
    };

    return () => ws.close();
  }, [containerReady, projectId, accessToken]);

  function refreshFiles() {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({ event: "refresh" }));
    }
  }

  function createFile(name: string) {
    setDraft(null);

    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(
        JSON.stringify({
          event: "create",
          path: selectedPath ? `${selectedPath}/${name}` : name,
          isDir: draft?.isDir,
        }),
      );
    }
  }

  function cancelDraft() {
    setDraft(null);
  }

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
                  onClick={refreshFiles}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-accent flex items-center justify-center"
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
                  onClick={() =>
                    setDraft({ parentPath: selectedPath, isDir: true })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-accent flex items-center justify-center"
                >
                  <HugeiconsIcon
                    icon={FolderAddIcon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>Create folder</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({ parentPath: selectedPath, isDir: false })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-accent flex items-center justify-center"
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
        <div className="flex flex-col min-h-full">
          <SidebarGroupContent>
            <SidebarMenu>
              {containerReady ? (
                loadingState ? (
                  fileTree.length === 0 && !draft ? (
                    <div className="px-3 py-1 text-xs text-muted-foreground">
                      No files yet
                    </div>
                  ) : (
                    <>
                      {fileTree.map((item) => (
                        <Tree
                          key={item.path}
                          item={item}
                          setSelectedPath={setSelectedPath}
                          draft={draft}
                          createFile={createFile}
                          cancelDraft={cancelDraft}
                        />
                      ))}
                      {draft?.parentPath === null && (
                        <DraftRow
                          isDir={draft.isDir}
                          createFile={createFile}
                          cancelDraft={cancelDraft}
                        />
                      )}
                    </>
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
          <div className="flex-1" onClick={() => setSelectedPath(null)} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
