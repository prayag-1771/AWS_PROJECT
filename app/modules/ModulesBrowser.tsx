"use client";

import { useState } from "react";
import Link from "next/link";
import ProgressBar from "../components/ProgressBar";
import StatusBadge from "../components/StatusBadge";
import type { Module } from "@/lib/modules";
import { progressStatus } from "@/lib/progress";

const STATUSES = ["Not started", "In progress", "Completed"];

export default function ModulesBrowser({ modules }: { modules: Module[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const query = search.trim().toLowerCase();

  const visible = modules.filter(
    (item) =>
      (item.name.toLowerCase().includes(query) ||
        item.course_name.toLowerCase().includes(query)) &&
      (!status || progressStatus(item.done_count, item.topic_count) === status)
  );

  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search modules or courses..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All progress</option>
          {STATUSES.map((option) => (
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
              <strong>
                {item.position}. {item.name}
              </strong>
              <span>
                {item.course_name} · {item.done_count} of {item.topic_count}{" "}
                topics · {item.planned_hours} h planned
              </span>
            </div>

            <div className="row-side">
              <ProgressBar done={item.done_count} total={item.topic_count} />
              <StatusBadge
                status={progressStatus(item.done_count, item.topic_count)}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
