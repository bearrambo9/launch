"use client";
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  RocketIcon,
  PlusSignIcon,
  GridViewIcon,
  HomeIcon,
  CompassIcon,
} from "@hugeicons/core-free-icons";
import { SessionUser } from "@/types/auth";

export const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard/home",
      icon: HomeIcon,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: GridViewIcon,
    },
    {
      title: "Explore",
      url: "/dashboard/explore",
      icon: CompassIcon,
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: SessionUser }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <a href="/" className="flex items-center gap-2">
                <HugeiconsIcon icon={RocketIcon} className="size-5 shrink-0" />
                <span className="text-base font-semibold">getlaunch.dev</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground">
              <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
              <span>Create Project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
