"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ARCHITECTURES,
  ENVIRONMENTS,
  PROJECT_STATUSES,
  REGIONS,
} from "@/lib/options";
import type { Project } from "@/lib/projects";

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setSaving(true);
    setError("");

    const response = await fetch(
      project ? `/api/projects/${project.id}` : "/api/projects",
      {
        method: project ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(form)),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setSaving(false);
      setError(data?.error || "Failed to save project");
      return;
    }

    router.push(`/projects/${data.id}`);
    router.refresh();
  }

  return (
    <div className="form-panel">
      <form onSubmit={handleSubmit}>
        {error && <div className="notice error">{error}</div>}

        <label>
          Project Name
          <input
            required
            maxLength={150}
            name="name"
            defaultValue={project?.name}
            placeholder="e.g. E-Commerce Platform"
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            maxLength={1000}
            defaultValue={project?.description}
            placeholder="What does this application do?"
          />
        </label>

        <div className="form-grid">
          <label>
            Environment
            <select name="environment" defaultValue={project?.environment}>
              {ENVIRONMENTS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Architecture
            <select name="architecture" defaultValue={project?.architecture}>
              {ARCHITECTURES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            AWS Region
            <select name="region" defaultValue={project?.region}>
              {REGIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select name="status" defaultValue={project?.status || "Active"}>
              {PROJECT_STATUSES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : project
                ? "Save Changes"
                : "Create Project"}
          </button>

          <Link
            className="secondary-button"
            href={project ? `/projects/${project.id}` : "/projects"}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
