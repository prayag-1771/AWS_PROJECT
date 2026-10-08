"use client";

import { useState } from "react";
import Link from "next/link";
import ProgressBar from "../components/ProgressBar";
import StatusBadge from "../components/StatusBadge";
import type { Course } from "@/lib/courses";
import { COURSE_STATUSES } from "@/lib/options";

export default function CoursesBrowser({ courses }: { courses: Course[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const query = search.trim().toLowerCase();

  const visible = courses.filter(
    (course) =>
      (course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query)) &&
      (!status || course.status === status)
  );

  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by name or code..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {COURSE_STATUSES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="project-list">
        {visible.length === 0 && (
          <div className="empty-state">
            <span>No courses match your filters.</span>
          </div>
        )}

        {visible.map((course) => (
          <Link
            className="project-row"
            href={`/courses/${course.id}`}
            key={course.id}
          >
            <div className="row-main">
              <strong>{course.name}</strong>
              <span>
                {[course.code, course.semester, `${course.credits} credits`]
                  .filter(Boolean)
                  .join(" · ")}{" "}
                · {course.module_count}{" "}
                {course.module_count === 1 ? "module" : "modules"}
              </span>
            </div>

            <div className="row-side">
              <ProgressBar done={course.done_count} total={course.topic_count} />
              <StatusBadge status={course.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
