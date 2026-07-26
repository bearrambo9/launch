import Docker from "dockerode";
import { prisma } from "../lib/prisma.js";
import type { Project } from "../generated/prisma/index.js";

const docker = new Docker();

export async function initializeProjectContainer(
  project: Project,
): Promise<string> {
  let containerId = project.containerId;

  if (containerId) {
    const projectContainer = await docker.getContainer(containerId);
    await projectContainer.start();

    return containerId;
  }

  const projectContainer = await docker.createContainer({
    Image: "launch-base:latest",
    name: `project-${project.id}`,
  });

  await projectContainer.start();
  containerId = projectContainer.id;

  await prisma.project.update({
    where: { id: project.id },
    data: { containerId },
  });

  return containerId;
}
