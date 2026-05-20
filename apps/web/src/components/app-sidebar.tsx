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
  RoboticIcon,
  RocketIcon,
  PlusSignIcon,
  GridViewIcon,
  HomeIcon,
  CompassIcon,
} from "@hugeicons/core-free-icons";

const data = {
  user: {
    name: "user",
    email: "u@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />,
      isActive: true,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} />,
      isActive: true,
    },
    {
      title: "Explore",
      url: "/explore",
      icon: <HugeiconsIcon icon={CompassIcon} strokeWidth={2} />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
