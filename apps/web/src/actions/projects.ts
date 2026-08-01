"use server";

import { validateProjectName } from "@/lib/project-validation";
import { auth } from "@/auth";
import { SignJWT } from "jose";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export async function createProject(
  name: string,
  isPublic: boolean,
  language?: string | null,
): Promise<{ error: string } | { redirectUrl: string }> {
  const session = await auth();

  if (!session || !session.user) {
    return { error: "Unauthorized, please log in." };
  }

  const user = session.user;
  const error = validateProjectName(name);
  if (error) return { error: "Invalid project name" };

  const secret = await new TextEncoder().encode(INTERNAL_API_SECRET);

  const token = await new SignJWT({
    sub: "launch-frontend",
    iss: "launch-app",
    aud: "api-service-layer",
    uid: user.id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1m")
    .sign(secret);

  const res = await fetch(`${BACKEND_API_URL}/projects`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      public: isPublic,
      ...(language ? { language } : {}),
    }),
  });

  if (!res.ok) {
    return { error: "Failed to create project. Please try again." };
  }

  const data = await res.json();

  return { redirectUrl: `/projects/${data.id}` };
}
