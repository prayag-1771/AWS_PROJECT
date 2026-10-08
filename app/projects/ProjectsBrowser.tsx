"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { ENVIRONMENTS, PROJECT_STATUSES } from "@/lib/options";
import type { Project } from "@/lib/projects";

export default function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("");
  const [environment, setEnvironment] = useState("");
  const [status, setStatus] = useState("");

  const visible = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!environment || project.environment === environment) &&
      (!status || project.status === status)
  );

  if (projects.length === 0) {
    return (
      <div className="panel">
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="projects" size={22} />
          </div>
          <strong>No projects yet</strong>
          <span>Create a project to start designing its modules.</span>
          <div className="empty-actions">
            <Link className="primary-button" href="/projects/new">
              <Icon name="plus" size={16} />
              New Project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
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
          <option value="">All environments</option>
          {ENVIRONMENTS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <select
          className="select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="project-list">
        {visible.length === 0 && (
          <div className="empty-state">
            <span>No projects match your filters.</span>
          </div>
        )}

        {visible.map((project) => (
          <Link
            className="project-row"
            href={`/projects/${project.id}`}
            key={project.id}
          >
            <div className="row-main">
              <strong>{project.name}</strong>
              <span>
                {project.environment} · {project.architecture} ·{" "}
                {project.region}
              </span>
            </div>

            <div className="row-side">
              <span className="badge indigo">
                {project.module_count}{" "}
                {project.module_count === 1 ? "module" : "modules"}
              </span>
              <StatusBadge status={project.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
