import { AppSidebar } from "@/components/dashboard-sidebar";
import { auth } from "@/auth";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/ui/sidebar";
import { SessionUser } from "@/types/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const user: SessionUser = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
    image: session?.user?.image ?? "/avatars/default.jpg",
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="h-8 w-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground [&>svg]:size-4" />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
