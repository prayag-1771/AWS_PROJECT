"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "../components/StatusBadge";
import { MODULE_STATUSES, MODULE_TYPES } from "@/lib/options";
import type { Module } from "@/lib/modules";

export default function ModulesBrowser({ modules }: { modules: Module[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const query = search.trim().toLowerCase();

  const visible = modules.filter(
    (item) =>
      (item.name.toLowerCase().includes(query) ||
        item.project_name.toLowerCase().includes(query)) &&
      (!type || item.type === type) &&
      (!status || item.status === status)
  );

  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search modules or projects..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="select"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="">All types</option>
          {MODULE_TYPES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <select
          className="select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {MODULE_STATUSES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="project-list">
        {visible.length === 0 && (
          <div className="empty-state">
            <span>No modules match your filters.</span>
          </div>
        )}

        {visible.map((item) => (
          <Link
            className="project-row"
            href={`/modules/${item.id}`}
            key={item.id}
          >
            <div className="row-main">
              <strong>{item.name}</strong>
              <span>
                {item.project_name} · {item.type} · {item.deployment}
              </span>
            </div>

            <div className="row-side">
              <span className="badge">
                {item.min_tasks === item.max_tasks
                  ? `${item.min_tasks} fixed`
                  : `${item.min_tasks}–${item.max_tasks} instances`}
              </span>
              <StatusBadge status={item.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
