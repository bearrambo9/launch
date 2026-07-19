import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/shadcn/ui/sidebar";
import { SiteHeader } from "@/shadcn/site-header";
import { AppSidebar } from "@/shadcn/project-sidebar";
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

  if (!project) notFound();

  const user: SessionUser = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
    image: session?.user?.image ?? "/avatars/default.jpg",
  };

  return (
    <SidebarProvider
      style={{ "--header-height": "3rem" } as React.CSSProperties}
    >
      <div className="flex h-svh w-full flex-col">
        <SiteHeader projectName={project.name} />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar user={user} />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
