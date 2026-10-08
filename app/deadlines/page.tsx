import Link from "next/link";
import DeadlineForm from "../components/DeadlineForm";
import DeadlineList from "../components/DeadlineList";
import PageHeader from "../components/PageHeader";
import { listCourses } from "@/lib/courses";
import { listDeadlines } from "@/lib/deadlines";
import { describeDeadline } from "@/lib/progress";

export const dynamic = "force-dynamic";

export default async function DeadlinesPage() {
  const [courses, deadlines] = await Promise.all([
    listCourses(),
    listDeadlines(),
  ]);

  const items = deadlines.map(describeDeadline);
  const open = items.filter((item) => !item.done);
  const overdue = open.filter((item) => item.days < 0).length;

  return (
    <>
      <PageHeader
        eyebrow="Planner"
        title="Deadlines"
        subtitle={`${open.length} open${overdue ? `, ${overdue} overdue` : ""} across all courses.`}
      />

      <div className="panel" style={{ marginTop: 0 }}>
        {courses.length === 0 ? (
          <div className="empty-state">
            <strong>Create a course first</strong>
            <span>Every deadline belongs to a course.</span>
            <div className="empty-actions">
              <Link className="primary-button" href="/courses/new">
                New Course
              </Link>
            </div>
          </div>
        ) : (
          <>
            <DeadlineForm
              courses={courses.map(({ id, name }) => ({ id, name }))}
            />
            <DeadlineList items={items} showCourse />
          </>
        )}
      </div>
    </>
  );
}
