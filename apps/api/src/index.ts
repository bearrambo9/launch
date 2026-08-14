import express from "express";
import cors from "cors";
import projectsRouter from "./routes/projects.js";
import * as dotenv from "dotenv";
import { parse } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import {
  getOwnedProject,
  validateWebSocketUpgrade,
} from "./middleware/auth.js";
import {
  handleFilesConnection,
  handleTerminalConnection,
} from "./services/docker.service.js";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (request, socket, head) => {
  const { pathname, query } = parse(request.url || "", true);
  const authData = await validateWebSocketUpgrade(request);

  if (!authData) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();

    return;
  }

  if (pathname === "/terminal") {
    wss.handleUpgrade(request, socket, head, async (ws) => {
      const rows = parseInt(query.rows as string, 10) || 24;
      const cols = parseInt(query.cols as string, 10) || 80;

      (ws as any).rows = rows;
      (ws as any).cols = cols;

      const projectId = query.projectId as string;
      const project = await getOwnedProject(projectId, authData.uid);

      if (!project) {
        ws.close(4404, "Project not found");
        return;
      }

      (ws as any).user = authData.uid;
      (ws as any).containerId = project.containerId;

      wss.emit("connection:terminal", ws, request);
    });
  } else if (pathname === "/files") {
    wss.handleUpgrade(request, socket, head, async (ws) => {
      const projectId = query.projectId as string;
      const project = await getOwnedProject(projectId, authData.uid);

      if (!project) {
        ws.close(4404, "Project not found");
        return;
      }

      (ws as any).user = authData.uid;
      (ws as any).projectId = project.id;

      wss.emit("connection:files", ws, request);
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

wss.on("connection:terminal", async (ws) => {
  try {
    await handleTerminalConnection(ws);
  } catch (error) {
    console.log(error);
    ws.close();
  }
});

wss.on("connection:files", async (ws) => {
  try {
    await handleFilesConnection(ws);
  } catch (error) {
    console.log(error);
    ws.close();
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
