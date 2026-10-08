const colors: Record<string, string> = {
  Ongoing: "green",
  Completed: "indigo",
  Upcoming: "blue",
  "In progress": "amber",
  "Not started": "",
  Healthy: "green",
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
