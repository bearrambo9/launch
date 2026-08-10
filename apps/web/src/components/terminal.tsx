"use client";

import useWebSocket from "react-use-websocket";
import { useEffect } from "react";
import { useXTerm } from "react-xtermjs";
import { FitAddon } from "@xterm/addon-fit";

export default function Terminal({ socketUrl }: { socketUrl: string | null }) {
  const { instance, ref: terminalRef } = useXTerm();

  const { sendMessage, lastMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (!instance) return;

    const fitAddon = new FitAddon();
    instance.loadAddon(fitAddon);
    fitAddon.fit();

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [instance]);

  useEffect(() => {
    if (!instance || !lastMessage) return;

    if (typeof lastMessage.data === "string") {
      instance.write(lastMessage.data);
    } else if (lastMessage.data instanceof Blob) {
      lastMessage.data.text().then((text) => instance.write(text));
    }
  }, [instance, lastMessage]);

  useEffect(() => {
    if (!instance) return;

    const disposable = instance.onData((data) => {
      sendMessage(data);
    });

    return () => {
      disposable.dispose();
    };
  }, [instance, sendMessage]);

  return <div ref={terminalRef} className="flex-1 min-h-0" />;
}
