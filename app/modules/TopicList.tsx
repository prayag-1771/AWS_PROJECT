"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../components/Icon";
import type { Topic } from "@/lib/topics";

export default function TopicList({
  moduleId,
  topics,
}: {
  moduleId: number;
  topics: Topic[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Ticks show immediately; the server copy replaces them on refresh.
  const [ticked, setTicked] = useState<Record<number, boolean>>({});

  async function toggle(topic: Topic, done: boolean) {
    setTicked((current) => ({ ...current, [topic.id]: done }));

    const response = await fetch(`/api/topics/${topic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });

    if (!response.ok) {
      setTicked((current) => ({ ...current, [topic.id]: topic.done }));
      setError("Failed to update topic");
    }

    router.refresh();
  }

  async function remove(topic: Topic) {
    if (!window.confirm(`Delete the topic "${topic.title}"?`)) {
      return;
    }

    const response = await fetch(`/api/topics/${topic.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to delete topic");
    }

    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const title = new FormData(formElement).get("title");

    setSaving(true);
    setError("");

    const response = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: moduleId, title }),
    });

    setSaving(false);

    if (response.ok) {
      formElement.reset();
      router.refresh();
    } else {
      const data = await response.json().catch(() => null);

      setError(data?.error || "Failed to add topic");
    }
  }

  return (
    <>
      <form className="inline-form" onSubmit={handleSubmit}>
        {error && <div className="notice error">{error}</div>}

        <div className="inline-fields">
          <input
            className="grow"
            required
            maxLength={200}
            name="title"
            placeholder="Add a topic to study..."
            aria-label="Topic"
          />

          <button className="primary-button" type="submit" disabled={saving}>
            <Icon name="plus" size={16} />
            {saving ? "Adding..." : "Add Topic"}
          </button>
        </div>
      </form>

      {topics.length === 0 ? (
        <div className="empty-state">
          <span>No topics yet. Add the topics this module covers.</span>
        </div>
      ) : (
        <div className="checklist">
          {topics.map((topic) => {
            const done = ticked[topic.id] ?? topic.done;

            return (
              <label className={done ? "check-row done" : "check-row"} key={topic.id}>
                <input
                  type="checkbox"
                  checked={done}
                  onChange={(event) => toggle(topic, event.target.checked)}
                />

                <div className="row-main">
                  <strong>{topic.title}</strong>
                </div>

                <button
                  className="icon-button"
                  type="button"
                  aria-label={`Delete "${topic.title}"`}
                  onClick={(event) => {
                    event.preventDefault();
                    remove(topic);
                  }}
                >
                  <Icon name="trash" size={15} />
                </button>
              </label>
            );
          })}
        </div>
      )}
    </>
  );
}
