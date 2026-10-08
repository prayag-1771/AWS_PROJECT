"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import type { DeadlineItem } from "@/lib/progress";

export default function DeadlineList({
  items,
  showCourse = false,
  emptyText = "No deadlines yet.",
}: {
  items: DeadlineItem[];
  showCourse?: boolean;
  emptyText?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  async function send(id: number, init: RequestInit) {
    setBusy(id);

    const response = await fetch(`/api/deadlines/${id}`, init);

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      alert(data?.error || "Failed to update deadline");
    }

    router.refresh();
    setBusy(null);
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span>{emptyText}</span>
      </div>
    );
  }

  return (
    <div className="checklist">
      {items.map((item) => (
        <div className={item.done ? "check-row done" : "check-row"} key={item.id}>
          <input
            type="checkbox"
            aria-label={`Mark "${item.title}" as done`}
            checked={item.done}
            disabled={busy === item.id}
            onChange={(event) =>
              send(item.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ done: event.target.checked }),
              })
            }
          />

          <div className="row-main">
            <strong>{item.title}</strong>
            <span>
              {item.type} · {item.day}
              {showCourse && (
                <>
                  {" · "}
                  <Link href={`/courses/${item.course_id}`}>
                    {item.course_name}
                  </Link>
                </>
              )}
            </span>
          </div>

          <span className={`badge ${item.dueColor}`}>{item.dueText}</span>

          <button
            className="icon-button"
            type="button"
            aria-label={`Delete "${item.title}"`}
            disabled={busy === item.id}
            onClick={() => {
              if (window.confirm(`Delete the deadline "${item.title}"?`)) {
                send(item.id, { method: "DELETE" });
              }
            }}
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
