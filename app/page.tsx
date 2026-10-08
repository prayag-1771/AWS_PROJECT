import Link from "next/link";
import { listProjects, Project } from "@/lib/projects";
import { modules } from "@/lib/modules";

export const dynamic = "force-dynamic";

async function loadProjects(): Promise<Project[] | null> {
  try {
    return await listProjects();
  } catch (error) {
    console.error(error);

    return null;
  }
}

export default async function Dashboard() {
  const projects = await loadProjects();

  const activeModules = modules.filter(
    ([, , status]) => status === "Running"
  ).length;

  const stats = [
    {
      label: "Projects",
      value: projects ? String(projects.length) : "–",
      icon: "◈",
    },
    { label: "Active Modules", value: String(activeModules), icon: "◆" },
    {
      label: "Environment",
      value: process.env.APP_ENV || "Development",
      icon: "▲",
    },
    {
      label: "System Status",
      value: projects ? "Healthy" : "Degraded",
      icon: "●",
    },
  ];

  const recent = (projects || []).slice(0, 5);

  return (
    <>
        <header className="topbar">
          <div>
            <p className="eyebrow">CLOUD PLATFORM</p>
            <h1>Dashboard</h1>
          </div>

          <Link className="primary-button" href="/projects/new">
            + New Project
          </Link>
        </header>

        <section className="stats">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-icon">{stat.icon}</div>
              <div>
                <p>{stat.label}</p>
                <h2>{stat.value}</h2>
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent Projects</h2>
              <p>Monitor your cloud applications.</p>
            </div>

            <Link href="/projects">View all →</Link>
          </div>

          <div className="project-list">
            {!projects && (
              <div className="project-row">
                <div>
                  <strong>Database unavailable</strong>
                  <span>Projects could not be loaded.</span>
                </div>
              </div>
            )}

            {projects && recent.length === 0 && (
              <div className="project-row">
                <div>
                  <strong>No projects yet</strong>
                  <span>Create your first project to get started.</span>
                </div>
              </div>
            )}

            {recent.map((project) => (
              <div className="project-row" key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <span>
                    {project.environment} · {project.region}
                  </span>
                </div>

                <span
                  className={
                    project.status === "Active"
                      ? "status active-status"
                      : "status deploy-status"
                  }
                >
                  ● {project.status}
                </span>
              </div>
            ))}
          </div>
        </section>
    </>
  );
}
