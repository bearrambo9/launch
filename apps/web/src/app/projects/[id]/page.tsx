"use client";

import dynamic from "next/dynamic";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const openTabs = [{ name: "page.tsx", active: true }];

export default function ProjectPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center border-b bg-muted/80">
        {openTabs.map((tab) => (
          <div
            key={tab.name}
            className={`flex items-center gap-2 border-r px-3 py-1 text-xs ${
              tab.active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>{tab.name}</span>
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              className="size-3 opacity-60"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center border-b bg-accent px-3 py-0.5">
        <span className="text-xs text-muted-foreground">/file/placeholder</span>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          defaultLanguage="typescript"
          defaultValue="// start typing"
          theme="vs"
        />
      </div>
    </div>
  );
}
