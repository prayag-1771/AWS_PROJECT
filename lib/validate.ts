import { ApiError } from "./api";
import { COURSE_STATUSES, DEADLINE_TYPES, SEMESTERS } from "./options";

export type CourseInput = {
  name: string;
  code: string;
  instructor: string;
  semester: string;
  credits: number;
  status: string;
  description: string;
};

export type ModuleInput = {
  course_id: number;
  position: number;
  name: string;
  description: string;
  planned_hours: number;
};

export type TopicInput = {
  module_id: number;
  title: string;
};

export type DeadlineInput = {
  course_id: number;
  title: string;
  type: string;
  due_date: string;
  done: boolean;
};

type Body = Record<string, unknown>;

const MAX_ID = 2147483647;

function text(value: unknown, label: string, max: number, required = true) {
  const result = typeof value === "string" ? value.trim() : "";

  if (required && !result) {
    throw new ApiError(`${label} is required`);
  }

  if (result.length > max) {
    throw new ApiError(`${label} must be ${max} characters or fewer`);
  }

  return result;
}

function oneOf(value: unknown, options: string[], label: string) {
  if (typeof value !== "string" || !options.includes(value)) {
    throw new ApiError(`${label} is not a valid option`);
  }

  return value;
}

function integer(value: unknown, label: string, min: number, max: number) {
  const result = Number(value);

  if (value === "" || !Number.isInteger(result) || result < min || result > max) {
    throw new ApiError(`${label} must be a whole number from ${min} to ${max}`);
  }

  return result;
}

function date(value: unknown, label: string) {
  const result = typeof value === "string" ? value : "";
  const parsed = new Date(`${result}T00:00:00Z`);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(result) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== result
  ) {
    throw new ApiError(`${label} must be a valid date`);
  }

  return result;
}

export function flag(value: unknown, label: string) {
  if (typeof value !== "boolean") {
    throw new ApiError(`${label} must be true or false`);
  }

  return value;
}

export function parseCourse(body: Body): CourseInput {
  return {
    name: text(body.name, "Course name", 150),
    code: text(body.code, "Course code", 20, false),
    instructor: text(body.instructor, "Instructor", 120, false),
    semester: oneOf(body.semester, SEMESTERS, "Semester"),
    credits: integer(body.credits, "Credits", 1, 10),
    status: oneOf(body.status ?? "Ongoing", COURSE_STATUSES, "Status"),
    description: text(body.description, "Description", 1000, false),
  };
}

export function parseModule(body: Body): ModuleInput {
  return {
    course_id: integer(body.course_id, "Course", 1, MAX_ID),
    position: integer(body.position, "Module number", 1, 50),
    name: text(body.name, "Module name", 150),
    description: text(body.description, "Description", 1000, false),
    planned_hours: integer(body.planned_hours, "Planned hours", 0, 200),
  };
}

export function parseTopic(body: Body): TopicInput {
  return {
    module_id: integer(body.module_id, "Module", 1, MAX_ID),
    title: text(body.title, "Topic", 200),
  };
}

export function parseDeadline(body: Body): DeadlineInput {
  return {
    course_id: integer(body.course_id, "Course", 1, MAX_ID),
    title: text(body.title, "Title", 200),
    type: oneOf(body.type, DEADLINE_TYPES, "Type"),
    due_date: date(body.due_date, "Due date"),
    done: flag(body.done ?? false, "Done"),
  };
}
