"use server";

import { validateProjectName } from "@/lib/project-validation";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export async function createProject(name: string, isPublic: boolean) {
  const error = validateProjectName(name);
  if (error) throw new Error("Invalid request");

  const res = await fetch(`${BACKEND_API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, public: isPublic }),
  });

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error("A project with that name already exists.");
    }
    throw new Error("Failed to create project.");
  }

  const data = await res.json();

  console.log(data);

  return data;
}
