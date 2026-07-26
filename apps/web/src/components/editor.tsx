"use client";

import dynamic from "next/dynamic";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { Button } from "@/shadcn/ui/button";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type Tab = {
  name: string;
  active: boolean;
};

/* Testing tab
{
  name: "test.txt",
  active: false,
}
*/

export default function Editor({
  accessToken,
  projectId,
}: {
  accessToken?: string;
  projectId: string;
}) {
  const [openTabs, setOpenTabs] = useState<Tab[]>([
    {
      name: "test.txt",
      active: false,
    },
  ]);

  useEffect(() => {
    const init = async () => {
      if (!accessToken) return;

      try {
        const res = await fetch(
          `${BACKEND_API_URL}/projects/${projectId}/container/initialize`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              projectId: projectId,
            }),
          },
        );

        const data = await res.json();

        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };

    init();
  }, [accessToken, projectId]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-8 shrink-0 items-center border-b bg-muted/80 overflow-x-auto">
        {" "}
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
      <div className="flex items-center shrink-0 border-b bg-accent px-3 py-0.5">
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
