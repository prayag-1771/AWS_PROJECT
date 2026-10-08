import Link from "next/link";
import DeadlineList from "./components/DeadlineList";
import Icon from "./components/Icon";
import PageHeader from "./components/PageHeader";
import ProgressBar from "./components/ProgressBar";
import SeedButton from "./components/SeedButton";
import { listActivity } from "@/lib/activity";
import { listCourses } from "@/lib/courses";
import { listDeadlines } from "@/lib/deadlines";
import { timeAgo } from "@/lib/format";
import { listModules } from "@/lib/modules";
import { describeDeadline, percent } from "@/lib/progress";
import { getSettings } from "@/lib/settings";
import { systemChecks } from "@/lib/status";

export const dynamic = "force-dynamic";

// The dashboard still renders, in a degraded state, when the database is down.
async function loadData() {
  try {
    const [courses, modules, deadlines, activity, settings] = await Promise.all(
      [
        listCourses(),
        listModules(),
        listDeadlines(),
        listActivity(),
        getSettings(),
      ]
    );

    return { courses, modules, deadlines, activity, settings };
  } catch (error) {
    console.error(error);

    return null;
  }
}

export default async function Dashboard() {
  const [data, checks] = await Promise.all([loadData(), systemChecks()]);

  const courses = data?.courses || [];
  const modules = data?.modules || [];
  const activity = data?.activity || [];
  const windowDays = parseInt(data?.settings.deadline_window || "7", 10);

  const open = (data?.deadlines || [])
    .map(describeDeadline)
    .filter((item) => !item.done);
  const dueSoon = open.filter((item) => item.days <= windowDays);
  const overdue = open.filter((item) => item.days < 0).length;

  const topics = courses.reduce((sum, item) => sum + item.topic_count, 0);
  const done = courses.reduce((sum, item) => sum + item.done_count, 0);
  const finished = modules.filter(
    (item) => item.topic_count > 0 && item.done_count === item.topic_count
  ).length;
  const ongoing = courses.filter((item) => item.status === "Ongoing").length;

  const stats = [
    {
      label: "Courses",
      value: data ? String(courses.length) : "–",
      note: `${ongoing} ongoing`,
      icon: "courses",
      color: "",
    },
    {
      label: "Modules Completed",
      value: data ? `${finished} of ${modules.length}` : "–",
      note: "all topics ticked off",
      icon: "modules",
      color: "blue",
    },
    {
      label: "Overall Progress",
      value: data ? `${percent(done, topics)}%` : "–",
      note: `${done} of ${topics} topics`,
      icon: "check",
      color: "green",
    },
    {
      label: `Due in ${windowDays} Days`,
      value: data ? String(dueSoon.length) : "–",
      note: overdue ? `${overdue} overdue` : "nothing overdue",
      icon: "clock",
      color: overdue ? "red" : "amber",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Study Planner"
        title="Dashboard"
        subtitle="Your courses, progress and upcoming deadlines at a glance."
      >
        <Link className="primary-button" href="/courses/new">
          <Icon name="plus" size={16} />
          New Course
        </Link>
      </PageHeader>

      <section className="stats">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className={`stat-icon ${stat.color}`}>
              <Icon name={stat.icon} size={20} />
            </div>
            <div>
              <p>{stat.label}</p>
              <h2>{stat.value}</h2>
              <small>{stat.note}</small>
            </div>
          </div>
        ))}
      </section>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Course Progress</h2>
              <p>Topics completed in each course.</p>
            </div>

            <Link href="/courses">View all →</Link>
          </div>

          <div className="project-list">
            {!data && (
              <div className="empty-state">
                <strong>Database unavailable</strong>
                <span>Courses could not be loaded.</span>
              </div>
            )}

            {data && courses.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Icon name="courses" size={22} />
                </div>
                <strong>No courses yet</strong>
                <span>
                  Add your first course, or load sample data to explore the
                  planner.
                </span>
                <div className="empty-actions">
                  <Link className="primary-button" href="/courses/new">
                    <Icon name="plus" size={16} />
                    New Course
                  </Link>
                  <SeedButton />
                </div>
              </div>
            )}

            {courses.slice(0, 6).map((course) => (
              <Link
                className="project-row"
                href={`/courses/${course.id}`}
                key={course.id}
              >
                <div className="row-main">
                  <strong>{course.name}</strong>
                  <span>
                    {course.module_count}{" "}
                    {course.module_count === 1 ? "module" : "modules"} ·{" "}
                    {course.done_count} of {course.topic_count} topics
                  </span>
                </div>

                <ProgressBar
                  done={course.done_count}
                  total={course.topic_count}
                />
              </Link>
            ))}
          </div>
        </section>

        <div>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Upcoming Deadlines</h2>
                <p>The next things due.</p>
              </div>

              <Link href="/deadlines">View all →</Link>
            </div>

            <DeadlineList
              items={open.slice(0, 5)}
              showCourse
              emptyText="Nothing is due. Enjoy the break."
            />
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Platform Health</h2>
                <p>Checked live on every page load.</p>
              </div>

              <Link href="/architecture">Architecture →</Link>
            </div>

            {checks.map((check) => (
              <div className="health-row" key={check.name}>
                <span>
                  <i className={check.healthy ? "dot" : "dot red"} />
                  <span>
                    {check.name}
                    <br />
                    <small>{check.service}</small>
                  </span>
                </span>
                <small>{check.detail}</small>
              </div>
            ))}
          </section>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Recent Activity</h2>
            <p>What you have done lately.</p>
          </div>
        </div>

        {activity.length === 0 && (
          <div className="empty-state">
            <span>Nothing has happened yet.</span>
          </div>
        )}

        {activity.map((entry) => (
          <div className="activity-row" key={entry.id}>
            <span>
              <strong>{entry.entity_name}</strong>{" "}
              <span className="muted">
                · {entry.entity} {entry.action}
              </span>
            </span>
            <time>{timeAgo(entry.created_at)}</time>
          </div>
        ))}
      </section>
    </>
  );
}
