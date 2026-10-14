"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../components/Icon";
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
    <>
      <div className="toolbar bare">
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

      {visible.length === 0 && (
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="empty-state">
            <span>No courses match your filters.</span>
          </div>
        </div>
      )}

      <div className="course-grid">
        {visible.map((course) => (
          <Link
            className={`course-card tone-${course.id % 6}`}
            href={`/courses/${course.id}`}
            key={course.id}
          >
            <div className="course-top">
              <span className="course-code">
                <span className="course-icon">
                  <Icon name="courses" size={18} />
                </span>
                {course.code || "COURSE"}
              </span>
              <StatusBadge status={course.status} />
            </div>

            <div>
              <h3>{course.name}</h3>
              <p className="course-meta">
                {course.instructor || "No instructor set"} · {course.semester}
              </p>
            </div>

            <ProgressBar
              wide
              done={course.done_count}
              total={course.topic_count}
            />

            <div className="course-foot">
              <span className="badge">
                {course.module_count}{" "}
                {course.module_count === 1 ? "module" : "modules"}
              </span>
              <span className="badge">
                {course.done_count}/{course.topic_count} topics
              </span>
              <span className="badge">{course.credits} credits</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
