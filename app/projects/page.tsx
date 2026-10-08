"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/projects";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [environment, setEnvironment] = useState("All environments");
  const [status, setStatus] = useState("All statuses");

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        return response.json();
      })
      .then(setProjects)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const visible = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (environment === "All environments" ||
        project.environment === environment) &&
      (status === "All statuses" || project.status === status)
  );

  let message = "";

  if (loading) {
    message = "Loading projects...";
  } else if (failed) {
    message = "Failed to load projects.";
  } else if (projects.length === 0) {
    message = "No projects yet. Create your first project.";
  } else if (visible.length === 0) {
    message = "No projects match your filters.";
  }

  return (
    <>
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
            <input
              className="search"
              placeholder="Search projects..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="select"
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
            >
              <option>All environments</option>
              <option>Production</option>
              <option>Staging</option>
              <option>Development</option>
            </select>

            <select
              className="select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Deploying</option>
            </select>
          </div>

          <div className="project-list">
            {message && (
              <div className="project-row">
                <div>
                  <span>{message}</span>
                </div>
              </div>
            )}

            {visible.map((project) => (
              <div className="project-row" key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <span>
                    {project.environment} · {project.architecture} ·{" "}
                    {project.region}
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
    </>
  );
}
