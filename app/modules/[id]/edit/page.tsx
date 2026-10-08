import { notFound } from "next/navigation";
import PageHeader from "../../../components/PageHeader";
import ModuleForm from "../../ModuleForm";
import { getModule } from "@/lib/modules";
import { listProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const current = Number.isInteger(id) && id > 0 ? await getModule(id) : null;

  if (!current) {
    notFound();
  }

  const projects = await listProjects();

  return (
    <>
      <PageHeader
        eyebrow="Module Design"
        title="Edit Module"
        back={{ href: `/modules/${current.id}`, label: current.name }}
      />

      <ModuleForm
        projects={projects.map(({ id, name }) => ({ id, name }))}
        current={current}
      />
    </>
  );
}
