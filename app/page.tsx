import Link from "next/link";
import DeadlineList from "./components/DeadlineList";
import Icon from "./components/Icon";
import ProgressBar from "./components/ProgressBar";
import SeedButton from "./components/SeedButton";
import { listActivity } from "@/lib/activity";
import { requireUser } from "@/lib/auth";
import { listCourses } from "@/lib/courses";
import { listDeadlines } from "@/lib/deadlines";
import { timeAgo } from "@/lib/format";
import { listModules } from "@/lib/modules";
import { describeDeadline, percent, today } from "@/lib/progress";
import { getSettings } from "@/lib/settings";
import { systemChecks } from "@/lib/status";

export const dynamic = "force-dynamic";

// The dashboard still renders, in a degraded state, when the database is down.
async function loadData(owner: string) {
  try {
    const [courses, modules, deadlines, activity, settings] = await Promise.all(
      [
        listCourses(owner),
        listModules(owner),
        listDeadlines(owner),
        listActivity(owner),
        getSettings(owner),
      ]
    );

    return { courses, modules, deadlines, activity, settings };
  } catch (error) {
    console.error(error);

    return null;
  }
}

const activityIcons: Record<string, string> = {
  course: "courses",
  module: "modules",
  topic: "check",
  deadline: "deadlines",
  file: "file",
  settings: "settings",
};

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: process.env.APP_TIMEZONE || "Asia/Kolkata",
    }).format(new Date())
  );

  if (hour < 12) {
    return "Good morning";
  }

  return hour < 17 ? "Good afternoon" : "Good evening";
}

export default async function Dashboard() {
  const user = await requireUser();
  const [data, checks] = await Promise.all([
    loadData(user.sub),
    systemChecks(),
  ]);

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
  const up = checks.filter((check) => check.healthy).length;

  const firstName = user.name.split(" ")[0] || user.name;
  const longDate = new Date(`${today()}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

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
      value: data ? `${finished} / ${modules.length}` : "–",
      note: "every topic ticked off",
      icon: "modules",
      color: "blue",
    },
    {
      label: `Due in ${windowDays} Days`,
      value: data ? String(dueSoon.length) : "–",
      note: overdue ? `${overdue} overdue` : "nothing overdue",
      icon: "clock",
      color: overdue ? "red" : "amber",
    },
    {
      label: "Platform Health",
      value: `${up} / ${checks.length}`,
      note: up === checks.length ? "all services up" : "a service is down",
      icon: "activity",
      color: up === checks.length ? "green" : "red",
    },
  ];

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">{longDate}</p>
          <h2>
            {greeting()}, {firstName}
          </h2>
          <p>
            {open.length
              ? `You have ${open.length} open ${open.length === 1 ? "deadline" : "deadlines"}${
                  overdue ? `, ${overdue} overdue` : ""
                }. Keep going.`
              : "No open deadlines. A good time to get ahead on your topics."}
          </p>
          <div className="hero-actions">
            <Link className="light-button" href="/courses/new">
              <Icon name="plus" size={16} />
              New Course
            </Link>
            <Link className="ghost-button" href="/deadlines">
              <Icon name="deadlines" size={16} />
              View deadlines
            </Link>
          </div>
        </div>

        <div className="hero-meter">
          <span>Overall progress</span>
          <strong>{percent(done, topics)}%</strong>
          <div className="bar">
            <span style={{ width: `${percent(done, topics)}%` }} />
          </div>
          <small>
            {done} of {topics} topics completed across {courses.length}{" "}
            {courses.length === 1 ? "course" : "courses"}
          </small>
        </div>
      </section>

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
                    {course.code ? `${course.code} · ` : ""}
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
      </div>

      <div className="grid-2">
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
                <span className="activity-dot">
                  <Icon name={activityIcons[entry.entity] || "activity"} size={15} />
                </span>
                <span>
                  <strong>{entry.entity_name}</strong>{" "}
                  <span className="muted">
                    · {entry.entity} {entry.action}
                  </span>
                </span>
              </span>
              <time>{timeAgo(entry.created_at)}</time>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Platform Health</h2>
              <p>Checked live from the running container.</p>
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
    </>
  );
}
