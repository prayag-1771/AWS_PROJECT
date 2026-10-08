import Link from "next/link";

const projects = [
  {
    name: "E-Commerce Platform",
    environment: "Production",
    modules: 8,
    status: "Active",
  },
  {
    name: "Student Portal",
    environment: "Development",
    modules: 5,
    status: "Active",
  },
  {
    name: "Analytics Engine",
    environment: "Staging",
    modules: 11,
    status: "Deploying",
  },
];

export default function ProjectsPage() {
  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <span>CloudNativeHub</span>
        </div>

        <nav>
          <Link className="nav-link" href="/">
            Dashboard
          </Link>
          <Link className="nav-link active" href="/projects">
            Projects
          </Link>
          <Link className="nav-link" href="/modules">
            Modules
          </Link>
          <Link className="nav-link" href="/settings">
            Settings
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <span>● AWS Mumbai</span>
          <small>ap-south-1</small>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">APPLICATIONS</p>
            <h1>Projects</h1>
          </div>

          <Link className="primary-button" href="/projects/new">
            + New Project
          </Link>
        </header>

        <div className="panel">
          <div className="toolbar">
            <input className="search" placeholder="Search projects..." />

            <select className="select">
              <option>All environments</option>
              <option>Production</option>
              <option>Staging</option>
              <option>Development</option>
            </select>

            <select className="select">
              <option>All statuses</option>
              <option>Active</option>
              <option>Deploying</option>
            </select>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <div className="project-row" key={project.name}>
                <div>
                  <strong>{project.name}</strong>
                  <span>
                    {project.environment} · {project.modules} modules
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
        </div>
      </section>
    </main>
  );
}