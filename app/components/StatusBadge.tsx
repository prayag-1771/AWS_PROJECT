const colors: Record<string, string> = {
  Active: "green",
  Running: "green",
  Healthy: "green",
  Deploying: "amber",
  Paused: "amber",
  Stopped: "",
  Archived: "",
  Failed: "red",
  Unavailable: "red",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${colors[status] ?? ""}`}>
      <i className="dot" />
      {status}
    </span>
  );
}
