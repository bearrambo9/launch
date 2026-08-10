"use client";

import dynamic from "next/dynamic";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/shadcn/ui/button";
import useWebSocket, { ReadyState } from "react-use-websocket";

const Terminal = dynamic(() => import("./terminal"), { ssr: false });
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type Tab = {
  name: string;
  active: boolean;
};

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
  const [containerId, setContainerId] = useState<string | null>(null);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeContainer = async () => {
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

        if (data.error || !data.containerId) {
          console.log(data.error);

          alert(
            "There was an error when initializing the container. Please check the console",
          );
        }

        setContainerId(data.containerId);
      } catch (error) {
        console.log(error);
      }
    };

    initializeContainer();
  }, [accessToken, projectId]);

  const socketUrl = containerId
    ? `ws://localhost:3001/terminal?containerId=${containerId}&token=${accessToken}`
    : null;

  const { sendMessage, lastMessage } = useWebSocket(socketUrl);

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
        <span className="text-xs text-muted-foreground">/file/placeholder</span>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          defaultLanguage="typescript"
          defaultValue="// start typing"
          theme="vs"
        />
      </div>
      <div className="h-48 shrink-0 min-h-0 border-t bg-background flex flex-col">
        <div className="flex h-6 shrink-0 items-center justify-between border-b px-2">
          <span className="text-xs text-muted-foreground">Terminal</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => {}}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              className="size-3 opacity-60"
            />
          </Button>
        </div>
        <Terminal socketUrl={socketUrl} />
      </div>
    </div>
  );
}
