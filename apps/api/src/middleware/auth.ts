import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import dotenv from "dotenv";

dotenv.config();

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];

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

  try {
    const secret = new TextEncoder().encode(INTERNAL_API_SECRET);

    const { payload } = await jwtVerify(token, secret, {
      issuer: "launch-app",
      audience: "api-service-layer",
    });

    if (!payload.uid || typeof payload.uid !== "string") {
      return res.status(401).json({ error: "Invalid token payload." });
    }

    req.user = payload.uid;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}
