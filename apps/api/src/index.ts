import express from "express";
import { createServer } from "http";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

server.listen(process.env.PORT);
