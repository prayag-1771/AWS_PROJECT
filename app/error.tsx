"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <div className="empty-state">
        <strong>This page could not be loaded</strong>
        <span>
          The platform could not reach one of its services. Check the system
          status and try again.
        </span>
        <div className="empty-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => (retry ?? reset)?.()}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
