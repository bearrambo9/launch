"use client";

import { deleteProject } from "@/actions/projects";
import { Button } from "@/shadcn/ui/button";
import { TableRow, TableCell } from "@/shadcn/ui/table";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  updatedAt: Date;
  public: boolean;
}

export function ProjectRow({ project }: { project: Project }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <TableCell className="font-medium">{project.name}</TableCell>
      <TableCell>{new Date(project.updatedAt).toLocaleDateString()}</TableCell>
      <TableCell>{project.public ? "True" : "False"}</TableCell>
      <TableCell>
        <Button
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            deleteProject(project.id);
          }}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
