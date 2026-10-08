"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Module } from "@/lib/modules";

export default function ModuleForm({
  courses,
  current,
  courseId,
  nextPosition = 1,
}: {
  courses: { id: number; name: string }[];
  current?: Module;
  courseId?: number;
  nextPosition?: number;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cancelHref = current
    ? `/modules/${current.id}`
    : courseId
      ? `/courses/${courseId}`
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
    <div className="form-panel">
      <form onSubmit={handleSubmit}>
        {error && <div className="notice error">{error}</div>}

        <label>
          Module Name
          <input
            required
            maxLength={150}
            name="name"
            defaultValue={current?.name}
            placeholder="e.g. Virtualisation and Containers"
          />
        </label>

        <label>
          Course
          <select name="course_id" defaultValue={current?.course_id ?? courseId}>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>

        <div className="form-grid">
          <label>
            Module Number
            <input
              required
              type="number"
              name="position"
              min={1}
              max={50}
              defaultValue={current?.position ?? nextPosition}
            />
          </label>

          <label>
            Planned Study Hours
            <input
              required
              type="number"
              name="planned_hours"
              min={0}
              max={200}
              defaultValue={current?.planned_hours ?? 6}
            />
          </label>
        </div>

        <label>
          Description
          <textarea
            name="description"
            maxLength={1000}
            defaultValue={current?.description}
            placeholder="What does this module cover?"
          />
        </label>

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
