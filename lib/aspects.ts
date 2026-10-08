import type { ModuleInput } from "./validate";

export type Aspect = {
  label: string;
  icon: string;
  color: string;
  value: string;
  detail: string;
};

const details: Record<string, string> = {
  // deployment
  "ECS Fargate":
    "Container image from Amazon ECR, run as serverless tasks with no servers to manage.",
  "AWS Lambda":
    "Event-driven functions that scale to zero and are billed per request.",
  "EC2 Auto Scaling":
    "Virtual machines in an Auto Scaling group behind a load balancer.",
  "S3 + CloudFront":
    "Static assets in Amazon S3, delivered from CloudFront edge locations.",
  // database
  "RDS PostgreSQL":
    "Managed PostgreSQL in private subnets with encryption at rest.",
  "Aurora PostgreSQL":
    "PostgreSQL-compatible cluster with storage replicated across three zones.",
  DynamoDB: "Serverless key-value tables with on-demand capacity.",
  "ElastiCache Redis": "In-memory cache for sessions and hot data.",
  // storage
  "Amazon S3":
    "Private bucket with versioning, default encryption and Block Public Access.",
  "Amazon EFS": "Shared file system mounted by every task.",
  // networking
  "Public (Application Load Balancer)":
    "Reached from the internet through an Application Load Balancer; tasks stay in private subnets.",
  "Internal (private subnet)":
    "Reachable only from inside the VPC; no route from the internet.",
  // security
  "IAM role + security group":
    "Least-privilege task role, with traffic limited by chained security groups.",
  "IAM role + Secrets Manager":
    "Least-privilege task role; credentials injected at start-up from Secrets Manager.",
  "IAM role + Cognito authentication":
    "Least-privilege task role; users sign in through Amazon Cognito.",
  // monitoring
  "CloudWatch logs + alarms":
    "Container logs and metrics in CloudWatch, with alarms sent through Amazon SNS.",
  "CloudWatch logs": "Container logs and metrics in CloudWatch.",
  // backup
  "Daily snapshots": "Automated daily snapshots kept for the retention period.",
  "Point-in-time recovery":
    "Continuous backups; restore to any second in the retention period.",
  // disaster recovery
  "Single-AZ":
    "Runs in one Availability Zone; failed tasks are replaced automatically.",
  "Multi-AZ":
    "Spread across two Availability Zones; survives the loss of one zone.",
  "Multi-AZ + cross-region":
    "Multi-AZ, with data replicated to a second Region for failover.",
};

const none: Record<string, string> = {
  Database: "This module does not own a database.",
  Storage: "This module does not store files.",
  Monitoring: "No logs or metrics are collected for this module.",
  Backup: "This module holds no data that needs a backup.",
};

type Design = Omit<ModuleInput, "project_id" | "name" | "description">;

// The nine architecture decisions that make up a module's design.
export function moduleAspects(design: Design): Aspect[] {
  const aspect = (
    label: string,
    icon: string,
    color: string,
    value: string
  ): Aspect => ({
    label,
    icon,
    color,
    value,
    detail: value === "None" ? none[label] : details[value],
  });

  return [
    aspect("Deployment model", "server", "", design.deployment),
    aspect("Database", "storage", "blue", design.database_engine),
    aspect("Storage", "file", "green", design.storage),
    aspect("Networking", "globe", "", design.networking),
    aspect("Security", "shield", "red", design.security),
    {
      label: "Scalability",
      icon: "scale",
      color: "amber",
      value:
        design.min_tasks === design.max_tasks
          ? `Fixed at ${design.min_tasks}`
          : `${design.min_tasks} to ${design.max_tasks} instances`,
      detail:
        design.min_tasks === design.max_tasks
          ? "Capacity is fixed; the module does not scale automatically."
          : "Scales horizontally between the minimum and maximum on CPU load.",
    },
    aspect("Monitoring", "activity", "blue", design.monitoring),
    aspect("Backup", "backup", "green", design.backup),
    aspect("Disaster recovery", "copy", "amber", design.disaster_recovery),
  ];
}
