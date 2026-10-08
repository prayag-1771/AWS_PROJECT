import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "../../components/DeleteButton";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { moduleAspects } from "@/lib/aspects";
import { formatDate } from "@/lib/format";
import { getModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const current = Number.isInteger(id) && id > 0 ? await getModule(id) : null;

  if (!current) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow={`${current.type} module`}
        title={current.name}
        back={{
          href: `/projects/${current.project_id}`,
          label: current.project_name,
        }}
      >
        <Link className="secondary-button" href={`/modules/${current.id}/edit`}>
          <Icon name="edit" size={16} />
          Edit Design
        </Link>
        <DeleteButton
          url={`/api/modules/${current.id}`}
          confirmText={`Delete the module "${current.name}"?`}
          redirectTo={`/projects/${current.project_id}`}
        />
      </PageHeader>

      <div className="panel" style={{ marginTop: 0 }}>
        <div className="panel-header">
          <div>
            <h2>Overview</h2>
            <p>Last updated {formatDate(current.updated_at)}</p>
          </div>
          <StatusBadge status={current.status} />
        </div>

        <div className="panel-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span>Project</span>
              <strong>
                <Link href={`/projects/${current.project_id}`}>
                  {current.project_name}
                </Link>
              </strong>
            </div>
            <div className="detail-item">
              <span>Type</span>
              <strong>{current.type}</strong>
            </div>
            <div className="detail-item">
              <span>Deployment model</span>
              <strong>{current.deployment}</strong>
            </div>
            <div className="detail-item">
              <span>Created</span>
              <strong>{formatDate(current.created_at)}</strong>
            </div>
          </div>

          {current.description && (
            <p className="description" style={{ marginTop: 20 }}>
              {current.description}
            </p>
          )}
        </div>
      </div>

      <div className="aspect-grid">
        {moduleAspects(current).map((aspect) => (
          <div className="aspect-card" key={aspect.label}>
            <div className="aspect-head">
              <div className={`stat-icon ${aspect.color}`}>
                <Icon name={aspect.icon} size={16} />
              </div>
              {aspect.label}
            </div>
            <strong>{aspect.value}</strong>
            <p>{aspect.detail}</p>
          </div>
        ))}
      </div>
    </>
  );
}
