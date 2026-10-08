"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { DEADLINE_TYPES } from "@/lib/options";

export default function DeadlineForm({
  courses,
  courseId,
}: {
  courses?: { id: number; name: string }[];
  courseId?: number;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setSaving(true);
    setError("");

    const response = await fetch("/api/deadlines", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ course_id: courseId, ...Object.fromEntries(form) }),
    });

    setSaving(false);

    if (response.ok) {
      formElement.reset();
      router.refresh();
    } else {
      const data = await response.json().catch(() => null);

      setError(data?.error || "Failed to add deadline");
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      {error && <div className="notice error">{error}</div>}

      <div className="inline-fields">
        <input
          className="grow"
          required
          maxLength={200}
          name="title"
          placeholder="e.g. Assignment 2 submission"
          aria-label="Deadline title"
        />

        {courses && (
          <select name="course_id" aria-label="Course">
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        )}

        <select name="type" aria-label="Type">
          {DEADLINE_TYPES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <input required type="date" name="due_date" aria-label="Due date" />

        <button className="primary-button" type="submit" disabled={saving}>
          <Icon name="plus" size={16} />
          {saving ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}
