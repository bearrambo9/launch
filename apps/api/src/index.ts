import express from "express";
import cors from "cors";
import projectsRouter from "./routes/projects.js";
import * as dotenv from "dotenv";
import { parse } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { validateWebSocketUpgrade } from "./middleware/auth.js";
import { handleTerminalConnection } from "./services/docker.service.js";

dotenv.config();

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (request, socket, head) => {
  const { pathname } = parse(request.url || "", true);
  const authData = await validateWebSocketUpgrade(request);

  if (!authData) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  if (pathname === "/terminal") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      (ws as any).user = authData.uid;
      (ws as any).containerId = authData.containerId;

      wss.emit("connection:terminal", ws, request);
    });
  }
});

app.use(
  cors({
    origin: `http://localhost:3000`,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());
app.use("/projects", projectsRouter);

wss.on("connection:terminal", (ws) => {
  const userId = (ws as any).user;
  const containerId = (ws as any).containerId;

  try {
    handleTerminalConnection(ws);
  } catch (error) {
    console.log(error);
    ws.close();
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
