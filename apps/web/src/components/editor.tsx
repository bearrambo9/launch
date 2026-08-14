"use client";

import dynamic from "next/dynamic";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import { useProjectContext } from "./project-provider";

const Terminal = dynamic(() => import("./terminal"), { ssr: false });

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type Tab = {
  name: string;
  active: boolean;
};

export default function Editor() {
  const { projectId, accessToken, containerReady, openFile } =
    useProjectContext();
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);

  const socketUrl = `ws://localhost:3001/terminal?token=${accessToken}&projectId=${projectId}`;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex h-8 shrink-0 items-center border-b bg-muted/80 overflow-x-auto">
        {openTabs.length > 0 &&
          openTabs.map((tab) => (
            <div
              key={tab.name}
              className={`flex h-full shrink-0 items-center gap-2 border-r px-3 text-xs ${
                tab.active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>{tab.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenTabs((tabs) =>
                    tabs.filter((t) => t.name !== tab.name),
                  );
                }}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  className="size-3 opacity-60"
                />
              </Button>
            </div>
          ))}
      </div>
      <div className="flex items-center shrink-0 border-b bg-accent px-3">
        <span className="text-xs text-muted-foreground">
          /workspace/{openFile && openFile.path ? `${openFile.path}` : ""}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          value={openFile?.data ?? "// Start writing some code!"}
          path={openFile?.path}
          height="100%"
          defaultLanguage="typescript"
          theme="vs"
        />
      </div>
      <div className="h-48 shrink-0 min-h-0 border-t bg-background flex flex-col">
        <div className="h-6 shrink-0 items-center justify-between border-b px-2">
          <span className="text-xs text-muted-foreground">Terminal</span>
        </div>
        {containerReady && <Terminal socketUrl={socketUrl} />}
      </div>
    </div>
  );
}
