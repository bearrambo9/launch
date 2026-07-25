import Docker from "dockerode";
import { prisma } from "../lib/prisma.js";
import type { Project } from "../generated/prisma/index.js";

const docker = new Docker();

export async function initializeProjectContainer(
  project: Project,
): Promise<string> {
  let containerId = project.containerId;

  if (containerId) {
    // Run it and unload it and stuff

    console.log("Container exists");

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
