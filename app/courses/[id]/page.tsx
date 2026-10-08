import Link from "next/link";
import { notFound } from "next/navigation";
import DeadlineForm from "../../components/DeadlineForm";
import DeadlineList from "../../components/DeadlineList";
import DeleteButton from "../../components/DeleteButton";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import StatusBadge from "../../components/StatusBadge";
import { getCourse } from "@/lib/courses";
import { listDeadlines } from "@/lib/deadlines";
import { listModules } from "@/lib/modules";
import { describeDeadline, progressStatus } from "@/lib/progress";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const course = Number.isInteger(id) && id > 0 ? await getCourse(id) : null;

  if (!course) {
    notFound();
  }

  const [modules, deadlines] = await Promise.all([
    listModules(course.id),
    listDeadlines(course.id),
  ]);

  const hours = modules.reduce((sum, item) => sum + item.planned_hours, 0);

  return (
    <>
      <PageHeader
        eyebrow={course.code || "Course"}
        title={course.name}
        back={{ href: "/courses", label: "Courses" }}
      >
        <Link className="secondary-button" href={`/courses/${course.id}/edit`}>
          <Icon name="edit" size={16} />
          Edit
        </Link>
        <DeleteButton
          url={`/api/courses/${course.id}`}
          confirmText={`Delete "${course.name}" with all of its modules, topics and deadlines?`}
          redirectTo="/courses"
        />
      </PageHeader>

      <div className="panel" style={{ marginTop: 0 }}>
        <div className="panel-header">
          <div>
            <h2>Overview</h2>
            <p>
              {course.done_count} of {course.topic_count} topics completed
            </p>
          </div>
          <StatusBadge status={course.status} />
        </div>

        <div className="panel-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span>Instructor</span>
              <strong>{course.instructor || "Not set"}</strong>
            </div>
            <div className="detail-item">
              <span>Semester</span>
              <strong>{course.semester}</strong>
            </div>
            <div className="detail-item">
              <span>Credits</span>
              <strong>{course.credits}</strong>
            </div>
            <div className="detail-item">
              <span>Planned study time</span>
              <strong>{hours} hours</strong>
            </div>
          </div>

          {course.description && (
            <p className="description" style={{ marginTop: 20 }}>
              {course.description}
            </p>
          )}

          <div style={{ marginTop: 20 }}>
            <ProgressBar
              wide
              done={course.done_count}
              total={course.topic_count}
            />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Modules</h2>
            <p>
              {modules.length} {modules.length === 1 ? "module" : "modules"} in
              this course
            </p>
          </div>

          <Link
            className="primary-button button-sm"
            href={`/modules/new?course=${course.id}`}
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
                Break the course into modules, then list the topics in each one.
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
                <strong>
                  {item.position}. {item.name}
                </strong>
                <span>
                  {item.done_count} of {item.topic_count} topics ·{" "}
                  {item.planned_hours} h planned
                </span>
              </div>

              <div className="row-side">
                <ProgressBar done={item.done_count} total={item.topic_count} />
                <StatusBadge
                  status={progressStatus(item.done_count, item.topic_count)}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Deadlines</h2>
            <p>Assignments, quizzes, labs and exams for this course.</p>
          </div>
        </div>

        <DeadlineForm courseId={course.id} />
        <DeadlineList items={deadlines.map(describeDeadline)} />
      </div>
    </>
  );
}
