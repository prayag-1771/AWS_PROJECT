import { notFound } from "next/navigation";
import PageHeader from "../../../components/PageHeader";
import ProjectForm from "../../ProjectForm";
import { getProject } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const project = Number.isInteger(id) && id > 0 ? await getProject(id) : null;

  if (!project) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Project Management"
        title="Edit Project"
        back={{ href: `/projects/${project.id}`, label: project.name }}
      />

      <ProjectForm project={project} />
    </>
  );
}
