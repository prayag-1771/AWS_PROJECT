import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <div className="empty-state">
        <strong>Page not found</strong>
        <span>The page or record you are looking for does not exist.</span>
        <div className="empty-actions">
          <Link className="primary-button" href="/">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
