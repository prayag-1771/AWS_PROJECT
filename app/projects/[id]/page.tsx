import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "../../components/DeleteButton";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "@/lib/format";
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
    </>
  );
}
