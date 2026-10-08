import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import ModuleForm from "../ModuleForm";
import { listProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function NewModulePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const projects = await listProjects();
  const requested = Number((await searchParams).project);
  const projectId = projects.some((project) => project.id === requested)
    ? requested
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Module Design"
        title="Create Module"
        subtitle="Describe the module, then choose its architecture."
        back={
          projectId
            ? { href: `/projects/${projectId}`, label: "Project" }
            : { href: "/modules", label: "Modules" }
        }
      />

      {projects.length === 0 ? (
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="empty-state">
            <strong>Create a project first</strong>
            <span>Every module belongs to a project.</span>
            <div className="empty-actions">
              <Link className="primary-button" href="/projects/new">
                New Project
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ModuleForm
          projects={projects.map(({ id, name }) => ({ id, name }))}
          projectId={projectId}
        />
      )}
    </>
  );
}
