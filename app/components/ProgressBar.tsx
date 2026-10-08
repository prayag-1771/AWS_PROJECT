import { percent } from "@/lib/progress";

export default function ProgressBar({
  done,
  total,
  wide = false,
}: {
  done: number;
  total: number;
  wide?: boolean;
}) {
  const value = percent(done, total);

  return (
    <div
      className={wide ? "progress wide" : "progress"}
      title={`${done} of ${total} topics`}
    >
      <div className="bar">
        <span
          className={value === 100 ? "complete" : undefined}
          style={{ width: `${value}%` }}
        />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}
