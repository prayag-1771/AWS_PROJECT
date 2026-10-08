"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeedButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    const response = await fetch("/api/seed", { method: "POST" });

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      alert(data?.error || "Failed to load sample data");
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <button
      className="secondary-button"
      type="button"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Loading..." : "Load Sample Data"}
    </button>
  );
}
