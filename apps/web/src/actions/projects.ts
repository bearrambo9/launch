"use server";

import { validateProjectName } from "@/lib/project-validation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectRole } from "@/prisma-client";
import { revalidatePath } from "next/cache";

export async function createProject(
  name: string,
  isPublic: boolean,
  template?: string | null,
): Promise<{ error: string } | { redirectUrl: string }> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { error: "You are not authorized." };
  }

  const user = session.user;

  if (!name || typeof name !== "string" || typeof isPublic !== "boolean") {
    return { error: "Project name and publicity are required." };
  }

  const nameError = validateProjectName(name);

  if (nameError !== null) {
    return { error: nameError };
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        public: isPublic,
        ...(template != null && { template }),
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: ProjectRole.OWNER },
        },
      },
    });

    revalidatePath("/dashboard/projects/");
    return { redirectUrl: `/projects/${project.id}` };
  } catch (error) {
    console.log(error);
    return { error: "Failed to create project." };
  }
}

export async function deleteProject(
  id: string,
): Promise<{ error: string } | { result: string }> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { error: "You are not authorized." };
  }

  const user = session.user;

  if (!id) return { error: "No project ID." };

  const project = await prisma.project.findFirst({
    where: {
      id: id,
      ownerId: user.id,
    },
  });

  if (!project) return { error: "No project found." };

  try {
    const result = await prisma.project.delete({
      where: {
        id: project.id,
      },
    });

    revalidatePath("/dashboard/projects/");

    return { result: "success" };
  } catch (error) {
    console.log(error);
    return { error: "Failed to delete project." };
  }
}
