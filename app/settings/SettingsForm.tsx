"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Options = Record<string, string[]>;

const labels: Record<string, [string, string]> = {
  default_semester: [
    "Default Semester",
    "Pre-selected when a course is created.",
  ],
  default_credits: [
    "Default Credits",
    "Pre-filled when a course is created.",
  ],
  deadline_window: [
    "Deadline Window",
    "How far ahead the dashboard counts deadlines as due soon.",
  ],
};

export default function SettingsForm({
  settings,
  options,
}: {
  settings: Record<string, string>;
  options: Options;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: string; text: string } | null>(
    null
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setSaving(true);
    setNotice(null);

    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(form)),
    });

    const data = await response.json().catch(() => null);

    setSaving(false);

    if (response.ok) {
      setNotice({ type: "success", text: "Settings saved." });
      router.refresh();
    } else {
      setNotice({
        type: "error",
        text: data?.error || "Failed to save settings",
      });
    }
  }

  return (
    <div className="form-panel">
      <form onSubmit={handleSubmit}>
        {notice && <div className={`notice ${notice.type}`}>{notice.text}</div>}

        {Object.keys(options).map((key) => (
          <label key={key}>
            {labels[key][0]}
            <select name={key} defaultValue={settings[key]}>
              {options[key].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <span className="field-hint">{labels[key][1]}</span>
          </label>
        ))}

        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
