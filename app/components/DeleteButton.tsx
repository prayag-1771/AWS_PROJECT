"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";

export default function DeleteButton({
  url,
  confirmText,
  redirectTo,
  onDeleted,
  label = "Delete",
  small = false,
}: {
  url: string;
  confirmText: string;
  redirectTo?: string;
  onDeleted?: () => void;
  label?: string;
  small?: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmText)) {
      return;
    }

    setDeleting(true);

    const response = await fetch(url, { method: "DELETE" });

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      setDeleting(false);
      alert(data?.error || "Failed to delete");
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
    }

    onDeleted?.();
    router.refresh();
    setDeleting(false);
  }

  return (
    <button
      className={small ? "danger-button button-sm" : "danger-button"}
      type="button"
      onClick={handleClick}
      disabled={deleting}
    >
      <Icon name="trash" size={small ? 14 : 16} />
      {deleting ? "Deleting..." : label}
    </button>
  );
}
