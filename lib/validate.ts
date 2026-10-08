import { ApiError } from "./api";
import {
  ARCHITECTURES,
  BACKUPS,
  DATABASES,
  DEPLOYMENTS,
  DISASTER_RECOVERY,
  ENVIRONMENTS,
  MODULE_STATUSES,
  MODULE_TYPES,
  MONITORING,
  NETWORKING,
  PROJECT_STATUSES,
  REGIONS,
  SECURITY,
  STORAGES,
} from "./options";

export type ProjectInput = {
  name: string;
  description: string;
  environment: string;
  architecture: string;
  region: string;
  status: string;
};

export type ModuleInput = {
  project_id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  deployment: string;
  database_engine: string;
  storage: string;
  networking: string;
  security: string;
  min_tasks: number;
  max_tasks: number;
  monitoring: string;
  backup: string;
  disaster_recovery: string;
};

type Body = Record<string, unknown>;

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

  if (!Number.isInteger(result) || result < min || result > max) {
    throw new ApiError(`${label} must be a whole number from ${min} to ${max}`);
  }

  return result;
}

export function parseProject(body: Body): ProjectInput {
  return {
    name: text(body.name, "Project name", 150),
    description: text(body.description, "Description", 1000, false),
    environment: oneOf(body.environment, ENVIRONMENTS, "Environment"),
    architecture: oneOf(body.architecture, ARCHITECTURES, "Architecture"),
    region: oneOf(body.region, REGIONS, "AWS Region"),
    status: oneOf(body.status ?? "Active", PROJECT_STATUSES, "Status"),
  };
}

export function parseModule(body: Body): ModuleInput {
  const min_tasks = integer(body.min_tasks, "Minimum tasks", 0, 100);
  const max_tasks = integer(body.max_tasks, "Maximum tasks", 1, 100);

  if (max_tasks < min_tasks) {
    throw new ApiError("Maximum tasks cannot be lower than minimum tasks");
  }

  return {
    project_id: integer(body.project_id, "Project", 1, 2147483647),
    name: text(body.name, "Module name", 150),
    description: text(body.description, "Description", 1000, false),
    type: oneOf(body.type, MODULE_TYPES, "Module type"),
    status: oneOf(body.status ?? "Running", MODULE_STATUSES, "Status"),
    deployment: oneOf(body.deployment, DEPLOYMENTS, "Deployment model"),
    database_engine: oneOf(body.database_engine, DATABASES, "Database"),
    storage: oneOf(body.storage, STORAGES, "Storage"),
    networking: oneOf(body.networking, NETWORKING, "Networking"),
    security: oneOf(body.security, SECURITY, "Security"),
    min_tasks,
    max_tasks,
    monitoring: oneOf(body.monitoring, MONITORING, "Monitoring"),
    backup: oneOf(body.backup, BACKUPS, "Backup"),
    disaster_recovery: oneOf(
      body.disaster_recovery,
      DISASTER_RECOVERY,
      "Disaster recovery"
    ),
  };
}
