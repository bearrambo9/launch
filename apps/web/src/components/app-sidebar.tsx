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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  RocketIcon,
  PlusSignIcon,
  GridViewIcon,
  HomeIcon,
  CompassIcon,
} from "@hugeicons/core-free-icons";
import { SessionUser } from "@/types/auth";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Field, FieldLabel } from "./ui/field";
import { Switch } from "./ui/switch";
import { validateProjectName } from "@/lib/project-validation";
import { createProject } from "@/actions/projects";

export const data = {
  navMain: [
    { title: "Home", url: "/dashboard/home", icon: HomeIcon },
    { title: "Projects", url: "/dashboard/projects", icon: GridViewIcon },
    { title: "Explore", url: "/dashboard/explore", icon: CompassIcon },
  ],
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "");
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: SessionUser }) {
  const [projectName, setProjectName] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(true);
  const [touched, setTouched] = React.useState(false);

  const error = touched ? validateProjectName(projectName) : null;
  const isValid =
    projectName.length > 0 && validateProjectName(projectName) === null;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (/^[\s-]/.test(e.target.value)) return;
    const slugified = slugify(e.target.value);
    setProjectName(slugified);
  }
  function handleDialogOpenChange(open: boolean) {
    if (!open) {
      setProjectName("");
      setIsPublic(false);
      setTouched(false);
    }
  }

  return (
    <Dialog onOpenChange={handleDialogOpenChange}>
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
                  <HugeiconsIcon
                    icon={RocketIcon}
                    className="size-5 shrink-0"
                  />
                  <span className="text-base font-semibold">getlaunch.dev</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <DialogTrigger asChild>
                <SidebarMenuButton className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground">
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                  <span>New Project</span>
                </SidebarMenuButton>
              </DialogTrigger>
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">Initialize project</DialogTitle>
          <DialogDescription>
            Allocates a fresh, isolated Linux environment with a clean file
            system and live terminal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col justify-items-start gap-3">
          <Field>
            <FieldLabel htmlFor="input-field-project-name">
              Project name
            </FieldLabel>
            <Input
              id="input-field-project-name"
              type="text"
              placeholder="my-new-project"
              value={projectName}
              onChange={handleNameChange}
              onBlur={() => setTouched(true)}
              aria-invalid={!!error}
              aria-describedby={
                error ? "project-name-error" : "project-name-hint"
              }
              className={
                error ? "border-destructive focus-visible:ring-destructive" : ""
              }
            />
            {error ? (
              <p
                id="project-name-error"
                className="text-destructive text-xs mt-1"
              >
                {error}
              </p>
            ) : (
              <p
                id="project-name-hint"
                className="text-muted-foreground text-xs mt-1"
              >
                Lowercase letters, numbers, and hyphens only. 3-50 characters.
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Privacy</FieldLabel>
            <div className="flex items-center gap-2">
              <Switch
                id="switch-project-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <label
                htmlFor="switch-project-public"
                className="text-sm cursor-pointer"
              >
                Project is public
              </label>
            </div>
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={!isValid}
            onClick={() => createProject(projectName, isPublic)}
          >
            <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
            Launch Environment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
