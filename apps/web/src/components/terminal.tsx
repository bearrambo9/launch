"use client";

import { useEffect } from "react";
import { useXTerm } from "react-xtermjs";
import { FitAddon } from "@xterm/addon-fit";

interface TerminalProps {
  socketUrl: string;
}

export default function Terminal({ socketUrl }: TerminalProps) {
  const { instance, ref: terminalRef } = useXTerm({
    options: { cursorBlink: true, convertEol: true },
  });

  useEffect(() => {
    if (!instance) return;

    const fitAddon = new FitAddon();
    instance.loadAddon(fitAddon);

    fitAddon.fit();

    const ws = new WebSocket(socketUrl);
    ws.binaryType = "arraybuffer";

    const dataListener = instance.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(new TextEncoder().encode(data));
      }
    });

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        instance.write(new Uint8Array(event.data));
      } else if (typeof event.data === "string") {
        instance.write(event.data);
      }
    };

    // Fit addon updated Terminal dimensions so restate it

    const previousTerminalDimensions = {
      rows: instance.rows,
      cols: instance.cols,
    };

    const handleResize = () => {
      fitAddon.fit();

      const { rows, cols } = instance;

      if (ws.readyState === WebSocket.OPEN) {
        // Prevent sending unneccessary resize events because its spamming it

        if (
          rows == previousTerminalDimensions.rows &&
          cols == previousTerminalDimensions.cols
        )
          return;

        console.log(`Resize event: ${rows}, ${cols}`);

        previousTerminalDimensions.rows = rows;
        previousTerminalDimensions.cols = cols;

        ws.send(
          JSON.stringify({
            event: "resize",
            rows: rows,
            cols: cols,
          }),
        );
      }
    };

    const frameId = requestAnimationFrame(handleResize);

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      dataListener.dispose();
      fitAddon.dispose();
      ws.close();
    };
  }, [instance, socketUrl]);

  return <div ref={terminalRef} className="flex-1 min-h-0" />;
}
