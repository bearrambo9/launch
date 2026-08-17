import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/shadcn/ui/sidebar";
import {
  ArrowRight01Icon,
  File01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useProjectContext } from "./project-provider";
import { useEffect, useState } from "react";
import { ContextMenu, ContextMenuTrigger } from "@/shadcn/ui/context-menu";
import { DraftRow } from "./draft-row";
import { Draft, TreeItem } from "@/types/explorer";
import { toast } from "sonner";
import { TreeItemContextMenu } from "./tree-item-context-menu";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export function Tree({
  item,
  setSelectedPath,
  draft,
  createFile,
  cancelDraft,
}: {
  item: TreeItem;
  setSelectedPath: (path: string) => void;
  draft: Draft | null;
  createFile: (name: string) => void;
  cancelDraft: () => void;
}) {
  const { projectId, accessToken, setOpenFile } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (draft?.parentPath === item.path) setIsOpen(true);
  }, [draft, item.path]);

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
      toast("Failed to fetch files, check console.");
    }
  }

  if (!item.isDir) {
    return (
      <SidebarMenuItem>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <SidebarMenuButton
              onClick={async () =>
                await fetchFileData(
                  item.path,
                  projectId,
                  accessToken,
                  setOpenFile,
                )
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
          </ContextMenuTrigger>
          <TreeItemContextMenu item={item} />
        </ContextMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <ContextMenu>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <ContextMenuTrigger asChild>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className="h-7 text-sm cursor-pointer"
                onClick={() => setSelectedPath(item.path)}
              >
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
          </ContextMenuTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children?.map((child) => (
                <Tree
                  key={child.path || child.name}
                  item={child}
                  setSelectedPath={setSelectedPath}
                  draft={draft}
                  createFile={createFile}
                  cancelDraft={cancelDraft}
                />
              ))}
              {draft?.parentPath === item.path && (
                <DraftRow
                  isDir={draft.isDir}
                  createFile={createFile}
                  cancelDraft={cancelDraft}
                />
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
        <TreeItemContextMenu item={item} />
      </ContextMenu>
    </SidebarMenuItem>
  );
}
