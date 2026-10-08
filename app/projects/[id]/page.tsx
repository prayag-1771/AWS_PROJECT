import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "../../components/DeleteButton";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "@/lib/format";
import ProjectDiagram from "../ProjectDiagram";
import { listModules } from "@/lib/modules";
import { getProject } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const project = Number.isInteger(id) && id > 0 ? await getProject(id) : null;

  if (!project) {
    notFound();
  }

  const modules = await listModules(project.id);

  return (
    <>
      <PageHeader
        eyebrow="Project"
        title={project.name}
        back={{ href: "/projects", label: "Projects" }}
      >
        <Link className="secondary-button" href={`/projects/${project.id}/edit`}>
          <Icon name="edit" size={16} />
          Edit
        </Link>
        <DeleteButton
          url={`/api/projects/${project.id}`}
          confirmText={`Delete "${project.name}" and all of its modules?`}
          redirectTo="/projects"
        />
      </PageHeader>

      <div className="panel" style={{ marginTop: 0 }}>
        <div className="panel-header">
          <div>
            <h2>Overview</h2>
            <p>Created {formatDate(project.created_at)}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="panel-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span>Environment</span>
              <strong>{project.environment}</strong>
            </div>
            <div className="detail-item">
              <span>Architecture</span>
              <strong>{project.architecture}</strong>
            </div>
            <div className="detail-item">
              <span>AWS Region</span>
              <strong>{project.region}</strong>
            </div>
            <div className="detail-item">
              <span>Last updated</span>
              <strong>{formatDate(project.updated_at)}</strong>
            </div>
          </div>

          {project.description && (
            <p className="description" style={{ marginTop: 20 }}>
              {project.description}
            </p>
          )}
        </div>
      </div>

      {modules.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Architecture</h2>
              <p>Generated from the design of each module.</p>
            </div>
          </div>
          <div className="panel-body">
            <ProjectDiagram modules={modules} />
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Modules</h2>
            <p>
              {modules.length} {modules.length === 1 ? "module" : "modules"} in
              this project
            </p>
          </div>

          <Link
            className="primary-button button-sm"
            href={`/modules/new?project=${project.id}`}
          >
            <Icon name="plus" size={14} />
            Add Module
          </Link>
        </div>

        <div className="project-list">
          {modules.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon name="modules" size={22} />
              </div>
              <strong>No modules yet</strong>
              <span>
                Add the services that make up this application and design how
                each one is deployed.
              </span>
            </div>
          )}

          {modules.map((item) => (
            <Link
              className="project-row"
              href={`/modules/${item.id}`}
              key={item.id}
            >
              <div className="row-main">
                <strong>{item.name}</strong>
                <span>
                  {item.type} · {item.deployment} · {item.disaster_recovery}
                </span>
              </div>

              <div className="row-side">
                <StatusBadge status={item.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
