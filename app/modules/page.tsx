import { modules } from "@/lib/modules";

export default function ModulesPage() {
  return (
    <>
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

    </>
  );
}