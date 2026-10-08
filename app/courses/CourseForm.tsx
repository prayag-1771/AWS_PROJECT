"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/courses";
import { COURSE_STATUSES, SEMESTERS } from "@/lib/options";

export default function CourseForm({
  course,
  defaults,
}: {
  course?: Course;
  defaults?: { semester: string; credits: string };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setSaving(true);
    setError("");

    const response = await fetch(
      course ? `/api/courses/${course.id}` : "/api/courses",
      {
        method: course ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(form)),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setSaving(false);
      setError(data?.error || "Failed to save course");
      return;
    }

    router.push(`/courses/${data.id}`);
    router.refresh();
  }

  return (
    <div className="form-panel">
      <form onSubmit={handleSubmit}>
        {error && <div className="notice error">{error}</div>}

        <div className="form-grid">
          <label>
            Course Name
            <input
              required
              maxLength={150}
              name="name"
              defaultValue={course?.name}
              placeholder="e.g. Cloud Computing"
            />
          </label>

          <label>
            Course Code
            <input
              maxLength={20}
              name="code"
              defaultValue={course?.code}
              placeholder="e.g. CC-401"
            />
          </label>

          <label>
            Instructor
            <input
              maxLength={120}
              name="instructor"
              defaultValue={course?.instructor}
              placeholder="Who teaches it?"
            />
          </label>

          <label>
            Semester
            <select
              name="semester"
              defaultValue={course?.semester ?? defaults?.semester}
            >
              {SEMESTERS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Credits
            <input
              required
              type="number"
              name="credits"
              min={1}
              max={10}
              defaultValue={course?.credits ?? defaults?.credits ?? 3}
            />
          </label>

          <label>
            Status
            <select name="status" defaultValue={course?.status}>
              {COURSE_STATUSES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Description
          <textarea
            name="description"
            maxLength={1000}
            defaultValue={course?.description}
            placeholder="What is this course about?"
          />
        </label>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : course ? "Save Changes" : "Create Course"}
          </button>

          <Link
            className="secondary-button"
            href={course ? `/courses/${course.id}` : "/courses"}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
