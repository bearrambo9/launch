import type { Request, Response, NextFunction } from "express";
import type { IncomingMessage } from "http";
import { jwtVerify } from "jose";
import dotenv from "dotenv";
import { prisma } from "../lib/prisma.js";

dotenv.config();

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function getOwnedProject(projectId: string, uid: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: uid,
    },
  });
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];

  if (req.method === "OPTIONS") {
    return next();
  }

  if (
    !authHeader ||
    typeof authHeader !== "string" ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({ error: "Invalid token." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Malformed payload." });
  }

  const uid = await verifyJwtToken(token);

  if (!uid) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }

  req.user = uid;
  next();
}
export async function validateWebSocketUpgrade(
  request: IncomingMessage,
): Promise<{ uid: string } | null> {
  if (!request.url) return null;

  const parsedUrl = new URL(
    request.url,
    `http://${request.headers.host || "localhost"}`,
  );

  const token = parsedUrl.searchParams.get("token");

  if (!token) {
    return null;
  }

  const uid = await verifyJwtToken(token);

  if (!uid) {
    return null;
  }

  return { uid };
}

async function verifyJwtToken(token: string): Promise<string | null> {
  try {
    const secret = new TextEncoder().encode(INTERNAL_API_SECRET);

    const { payload } = await jwtVerify(token, secret, {
      issuer: "launch-app",
      audience: "api-service-layer",
    });

    if (!payload.uid || typeof payload.uid !== "string") {
      return null;
    }

    return payload.uid;
  } catch (error) {
    return null;
  }
}
