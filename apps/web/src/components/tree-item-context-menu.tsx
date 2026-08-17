import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/shadcn/ui/context-menu";
import { TreeItem } from "@/types/explorer";

export function TreeItemContextMenu({ item }: { item: TreeItem }) {
  return (
    <ContextMenuContent>
      <ContextMenuLabel className="text-muted-foreground max-w-48 truncate">
        {item.name}
      </ContextMenuLabel>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem>Download {item.isDir && "as zip"}</ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroup>
        <ContextMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
          Delete
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContent>
  );
}
