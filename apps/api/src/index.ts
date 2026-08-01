import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import projectsRouter from "./routes/projects.js";
import { createServer } from "http";
import { WebSocketServer } from "ws";

dotenv.config();

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });

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

wss.on("connection", (ws) => {
  console.log("New client connected!");
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
