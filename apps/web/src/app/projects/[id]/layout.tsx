import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SignJWT } from "jose";
import { SidebarProvider, SidebarInset } from "@/shadcn/ui/sidebar";
import { SiteHeader } from "@/shadcn/site-header";
import { ProjectSidebar } from "@/components/project-sidebar";
import { ProjectProvider } from "@/components/project-provider";
import { SessionUser } from "@/types/auth";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, project] = await Promise.all([
    auth(),
    prisma.project.findUnique({ where: { id } }),
  ]);

  if (!session?.user) redirect("/login");
  if (!project || project.ownerId !== session.user.id) notFound();

  const user: SessionUser = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image ?? "/avatars/default.jpg",
  };

  const secret = new TextEncoder().encode(process.env.INTERNAL_API_SECRET);
  const accessToken = await new SignJWT({
    iss: "launch-app",
    aud: "api-service-layer",
    uid: session.user.id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  return (
    <ProjectProvider projectId={id} accessToken={accessToken}>
      <SidebarProvider
        style={{ "--header-height": "3rem" } as React.CSSProperties}
      >
        <div className="flex h-svh w-full flex-col">
          <SiteHeader projectName={project.name} />
          <div className="flex flex-1 overflow-hidden">
            <ProjectSidebar user={user} />
            <SidebarInset>{children}</SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </ProjectProvider>
  );
}
