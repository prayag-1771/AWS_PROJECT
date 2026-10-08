import Link from "next/link";
import Icon from "./components/Icon";
import PageHeader from "./components/PageHeader";
import SeedButton from "./components/SeedButton";
import StatusBadge from "./components/StatusBadge";
import { Activity, listActivity } from "@/lib/activity";
import { timeAgo } from "@/lib/format";
import { listModules, Module } from "@/lib/modules";
import { ENVIRONMENTS } from "@/lib/options";
import { listProjects, Project } from "@/lib/projects";
import { systemChecks } from "@/lib/status";

export const dynamic = "force-dynamic";

type Data = { projects: Project[]; modules: Module[]; activity: Activity[] };

// The dashboard still renders, in a degraded state, when the database is down.
async function loadData(): Promise<Data | null> {
  try {
    const [projects, modules, activity] = await Promise.all([
      listProjects(),
      listModules(),
      listActivity(),
    ]);

    return { projects, modules, activity };
  } catch (error) {
    console.error(error);

    return null;
  }
}

export default async function Dashboard() {
  const [data, checks] = await Promise.all([loadData(), systemChecks()]);

  const projects = data?.projects || [];
  const modules = data?.modules || [];
  const activity = data?.activity || [];

  const active = projects.filter((item) => item.status === "Active").length;
  const running = modules.filter((item) => item.status === "Running").length;
  const up = checks.filter((check) => check.healthy).length;
  const healthy = up === checks.length;

  const stats = [
    {
      label: "Projects",
      value: data ? String(projects.length) : "–",
      note: `${active} active`,
      icon: "projects",
      color: "",
    },
    {
      label: "Modules",
      value: data ? String(modules.length) : "–",
      note: `${running} running`,
      icon: "modules",
      color: "blue",
    },
    {
      label: "Environment",
      value: process.env.APP_ENV || "Development",
      note: process.env.AWS_REGION || "ap-south-1",
      icon: "globe",
      color: "amber",
    },
    {
      label: "System Status",
      value: healthy ? "Healthy" : "Degraded",
      note: `${up} of ${checks.length} services up`,
      icon: "activity",
      color: healthy ? "green" : "red",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Cloud Platform"
        title="Dashboard"
        subtitle="Projects, modules and platform health at a glance."
      >
        <Link className="primary-button" href="/projects/new">
          <Icon name="plus" size={16} />
          New Project
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
              <h2>Recent Projects</h2>
              <p>The applications created most recently.</p>
            </div>

            <Link href="/projects">View all →</Link>
          </div>

          <div className="project-list">
            {!data && (
              <div className="empty-state">
                <strong>Database unavailable</strong>
                <span>Projects could not be loaded.</span>
              </div>
            )}

            {data && projects.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Icon name="projects" size={22} />
                </div>
                <strong>No projects yet</strong>
                <span>
                  Create your first project, or load sample data to explore the
                  platform.
                </span>
                <div className="empty-actions">
                  <Link className="primary-button" href="/projects/new">
                    <Icon name="plus" size={16} />
                    New Project
                  </Link>
                  <SeedButton />
                </div>
              </div>
            )}

            {projects.slice(0, 5).map((project) => (
              <Link
                className="project-row"
                href={`/projects/${project.id}`}
                key={project.id}
              >
                <div className="row-main">
                  <strong>{project.name}</strong>
                  <span>
                    {project.environment} · {project.region} ·{" "}
                    {project.module_count}{" "}
                    {project.module_count === 1 ? "module" : "modules"}
                  </span>
                </div>

                <StatusBadge status={project.status} />
              </Link>
            ))}
          </div>
        </section>

        <div>
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

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Projects by Environment</h2>
              </div>
            </div>

            <div style={{ padding: "10px 0" }}>
              {ENVIRONMENTS.map((environment) => {
                const count = projects.filter(
                  (project) => project.environment === environment
                ).length;
                const share = projects.length
                  ? (count / projects.length) * 100
                  : 0;

                return (
                  <div className="bar-row" key={environment}>
                    <span>{environment}</span>
                    <div className="bar">
                      <span style={{ width: `${share}%` }} />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Recent Activity</h2>
            <p>Changes made on the platform.</p>
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
