"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BACKUPS,
  DATABASES,
  DEPLOYMENTS,
  DISASTER_RECOVERY,
  MODULE_STATUSES,
  MODULE_TYPES,
  MONITORING,
  NETWORKING,
  SECURITY,
  STORAGES,
} from "@/lib/options";
import type { Module } from "@/lib/modules";

type ProjectOption = { id: number; name: string };

function Choice({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: string[];
  value?: string;
}) {
  return (
    <label>
      {label}
      <select name={name} defaultValue={value}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default function ModuleForm({
  projects,
  current,
  projectId,
}: {
  projects: ProjectOption[];
  current?: Module;
  projectId?: number;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cancelHref = current
    ? `/modules/${current.id}`
    : projectId
      ? `/projects/${projectId}`
      : "/modules";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setSaving(true);
    setError("");

    const response = await fetch(
      current ? `/api/modules/${current.id}` : "/api/modules",
      {
        method: current ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(form)),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setSaving(false);
      setError(data?.error || "Failed to save module");
      return;
    }

    router.push(`/modules/${data.id}`);
    router.refresh();
  }

  return (
    <div className="form-panel wide">
      <form onSubmit={handleSubmit}>
        {error && <div className="notice error">{error}</div>}

        <div className="form-grid">
          <label>
            Module Name
            <input
              required
              maxLength={150}
              name="name"
              defaultValue={current?.name}
              placeholder="e.g. Payment Service"
            />
          </label>

          <label>
            Project
            <select
              name="project_id"
              defaultValue={current?.project_id ?? projectId}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <Choice
            label="Module Type"
            name="type"
            options={MODULE_TYPES}
            value={current?.type}
          />

          <Choice
            label="Status"
            name="status"
            options={MODULE_STATUSES}
            value={current?.status}
          />
        </div>

        <label>
          Description
          <textarea
            name="description"
            maxLength={1000}
            defaultValue={current?.description}
            placeholder="What is this module responsible for?"
          />
        </label>

        <div className="form-section">
          <h3>Compute and data</h3>
          <p>Where the module runs and what it stores.</p>

          <div className="form-grid">
            <Choice
              label="Deployment Model"
              name="deployment"
              options={DEPLOYMENTS}
              value={current?.deployment}
            />
            <Choice
              label="Database"
              name="database_engine"
              options={DATABASES}
              value={current?.database_engine}
            />
            <Choice
              label="Storage"
              name="storage"
              options={STORAGES}
              value={current?.storage}
            />
            <Choice
              label="Networking"
              name="networking"
              options={NETWORKING}
              value={current?.networking ?? NETWORKING[1]}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Security and scalability</h3>
          <p>How access is controlled and how far the module scales.</p>

          <div className="form-grid">
            <Choice
              label="Security"
              name="security"
              options={SECURITY}
              value={current?.security}
            />

            <div className="form-grid">
              <label>
                Minimum Instances
                <input
                  required
                  type="number"
                  name="min_tasks"
                  min={0}
                  max={100}
                  defaultValue={current?.min_tasks ?? 1}
                />
              </label>

              <label>
                Maximum Instances
                <input
                  required
                  type="number"
                  name="max_tasks"
                  min={1}
                  max={100}
                  defaultValue={current?.max_tasks ?? 4}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Operations</h3>
          <p>How the module is observed, backed up and recovered.</p>

          <div className="form-grid">
            <Choice
              label="Monitoring"
              name="monitoring"
              options={MONITORING}
              value={current?.monitoring}
            />
            <Choice
              label="Backup"
              name="backup"
              options={BACKUPS}
              value={current?.backup}
            />
            <Choice
              label="Disaster Recovery"
              name="disaster_recovery"
              options={DISASTER_RECOVERY}
              value={current?.disaster_recovery ?? DISASTER_RECOVERY[1]}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : current ? "Save Changes" : "Create Module"}
          </button>

          <Link className="secondary-button" href={cancelHref}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
