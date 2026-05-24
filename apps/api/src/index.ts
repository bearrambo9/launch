import express from "express";
import { createServer } from "http";
import * as dotenv from "dotenv";
import projectsRouter from "./routes/projects.js";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(express.json());

app.use("/projects", projectsRouter);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
