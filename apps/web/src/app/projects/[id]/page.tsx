import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SignJWT } from "jose";
import Editor from "@/components/editor";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) notFound();

  if (!session || !session.user) redirect("/login");

  const secret = new TextEncoder().encode(process.env.INTERNAL_API_SECRET);
  const token = await new SignJWT({
    iss: "launch-app",
    aud: "api-service-layer",
    uid: session.user.id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  return <Editor accessToken={token} projectId={project.id} />;
}
