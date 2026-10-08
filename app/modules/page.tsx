import Link from "next/link";
import { modules } from "@/lib/modules";
import StoragePanel from "./StoragePanel";

export default function ModulesPage() {
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
          <Link className="nav-link" href="/projects">
            Projects
          </Link>
          <Link className="nav-link active" href="/modules">
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
            <p className="eyebrow">SERVICES</p>
            <h1>Modules</h1>
          </div>
        </header>

        <div className="panel">
          <div className="toolbar">
            <input className="search" placeholder="Search modules..." />

            <select className="select">
              <option>All types</option>
              <option>API</option>
              <option>Microservice</option>
              <option>Worker</option>
            </select>

            <select className="select">
              <option>All statuses</option>
              <option>Running</option>
              <option>Stopped</option>
            </select>
          </div>

          <div className="project-list">
            {modules.map(([name, type, status]) => (
              <div className="project-row" key={name}>
                <div>
                  <strong>{name}</strong>
                  <span>{type}</span>
                </div>

                <span
                  className={
                    status === "Running"
                      ? "status active-status"
                      : "status deploy-status"
                  }
                >
                  ● {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <StoragePanel />
      </section>
    </main>
  );
}