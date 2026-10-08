import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "../../components/DeleteButton";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import StatusBadge from "../../components/StatusBadge";
import TopicList from "../TopicList";
import { getModule } from "@/lib/modules";
import { progressStatus } from "@/lib/progress";
import { listTopics } from "@/lib/topics";

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

  const topics = await listTopics(current.id);

  return (
    <>
      <PageHeader
        eyebrow={`Module ${current.position}`}
        title={current.name}
        back={{
          href: `/courses/${current.course_id}`,
          label: current.course_name,
        }}
      >
        <Link className="secondary-button" href={`/modules/${current.id}/edit`}>
          <Icon name="edit" size={16} />
          Edit
        </Link>
        <DeleteButton
          url={`/api/modules/${current.id}`}
          confirmText={`Delete the module "${current.name}" and its topics?`}
          redirectTo={`/courses/${current.course_id}`}
        />
      </PageHeader>

      <div className="panel" style={{ marginTop: 0 }}>
        <div className="panel-header">
          <div>
            <h2>Overview</h2>
            <p>
              {current.done_count} of {current.topic_count} topics completed
            </p>
          </div>
          <StatusBadge
            status={progressStatus(current.done_count, current.topic_count)}
          />
        </div>

        <div className="panel-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span>Course</span>
              <strong>
                <Link href={`/courses/${current.course_id}`}>
                  {current.course_name}
                </Link>
              </strong>
            </div>
            <div className="detail-item">
              <span>Module number</span>
              <strong>{current.position}</strong>
            </div>
            <div className="detail-item">
              <span>Planned study time</span>
              <strong>{current.planned_hours} hours</strong>
            </div>
            <div className="detail-item">
              <span>Progress</span>
              <ProgressBar
                done={current.done_count}
                total={current.topic_count}
              />
            </div>
          </div>

          {current.description && (
            <p className="description" style={{ marginTop: 20 }}>
              {current.description}
            </p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Topics</h2>
            <p>Tick each topic off as you finish studying it.</p>
          </div>
        </div>

        <TopicList moduleId={current.id} topics={topics} />
      </div>
    </>
  );
}
