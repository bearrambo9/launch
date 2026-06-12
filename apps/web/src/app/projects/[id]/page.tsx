import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true },
  });

  if (!project) notFound();

  console.log(project);

  return <div>{project.name}</div>;
}
