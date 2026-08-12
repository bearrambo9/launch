import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ProjectRow } from "@/components/project-row";

export default async function Page() {
  const session = await auth();
  const projects = await prisma.project.findMany({
    where: {
      ownerId: session?.user.id,
    },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold">Your projects</h1>
      <Table className="mt-4 text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Updated at</TableHead>
            <TableHead>Public</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
