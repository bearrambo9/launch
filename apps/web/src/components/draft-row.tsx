import { SidebarMenuItem } from "@/shadcn/ui/sidebar";
import { File01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";

export function DraftRow({
  isDir,
  createFile,
  cancelDraft,
}: {
  isDir: boolean;
  createFile: (name: string) => void;
  cancelDraft: () => void;
}) {
  const [name, setName] = useState("");
  const settledRef = useRef(false);

  return (
    <SidebarMenuItem>
      <div className="flex items-center gap-2 h-7 px-2">
        <HugeiconsIcon
          icon={isDir ? Folder01Icon : File01Icon}
          strokeWidth={2}
          className="size-4 shrink-0 text-muted-foreground"
        />
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              settledRef.current = true;
              createFile(name.trim());
            }
            if (e.key === "Escape") {
              settledRef.current = true;
              cancelDraft();
            }
          }}
          onBlur={() => {
            if (settledRef.current) return;
            settledRef.current = true;
            name.trim() ? createFile(name.trim()) : cancelDraft();
          }}
          className="bg-transparent outline-none border border-secondary rounded px-1 text-sm w-full"
        />
      </div>
    </SidebarMenuItem>
  );
}
