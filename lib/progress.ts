export function percent(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function progressStatus(done: number, total: number) {
  if (total > 0 && done === total) {
    return "Completed";
  }

  return done > 0 ? "In progress" : "Not started";
}

// Today's date where the students are, not where the server runs.
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.APP_TIMEZONE || "Asia/Kolkata",
  }).format(new Date());
}

export function daysUntil(date: string, from = today()) {
  return Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86400000
  );
}

export function dueLabel(days: number, done: boolean) {
  if (done) {
    return { text: "Done", color: "green" };
  }

  if (days < 0) {
    return { text: `${-days} d overdue`, color: "red" };
  }

  if (days === 0) {
    return { text: "Due today", color: "red" };
  }

  if (days === 1) {
    return { text: "Due tomorrow", color: "amber" };
  }

  return { text: `In ${days} days`, color: days <= 7 ? "amber" : "" };
}

export function formatDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export type DeadlineItem = {
  id: number;
  course_id: number;
  course_name: string;
  title: string;
  type: string;
  done: boolean;
  days: number;
  day: string;
  dueText: string;
  dueColor: string;
};

// Adds the display fields a deadline needs, worked out once on the server.
export function describeDeadline(deadline: {
  id: number;
  course_id: number;
  course_name: string;
  title: string;
  type: string;
  due_date: string;
  done: boolean;
}): DeadlineItem {
  const days = daysUntil(deadline.due_date);
  const label = dueLabel(days, deadline.done);

  return {
    id: deadline.id,
    course_id: deadline.course_id,
    course_name: deadline.course_name,
    title: deadline.title,
    type: deadline.type,
    done: deadline.done,
    days,
    day: formatDay(deadline.due_date),
    dueText: label.text,
    dueColor: label.color,
  };
}
