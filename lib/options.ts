export const ENVIRONMENTS = ["Development", "Staging", "Production"];

export const ARCHITECTURES = ["Microservices", "Monolith", "Serverless"];

export const REGIONS = [
  "Asia Pacific (Mumbai)",
  "Asia Pacific (Singapore)",
  "US East (N. Virginia)",
  "Europe (Frankfurt)",
];

export const PROJECT_STATUSES = ["Active", "Deploying", "Paused", "Archived"];

export const MODULE_TYPES = [
  "API",
  "Microservice",
  "Frontend",
  "Worker",
  "Scheduler",
  "Database",
];

export const MODULE_STATUSES = ["Running", "Deploying", "Stopped", "Failed"];

export const DEPLOYMENTS = [
  "ECS Fargate",
  "AWS Lambda",
  "EC2 Auto Scaling",
  "S3 + CloudFront",
];

export const DATABASES = [
  "None",
  "RDS PostgreSQL",
  "Aurora PostgreSQL",
  "DynamoDB",
  "ElastiCache Redis",
];

export const STORAGES = ["None", "Amazon S3", "Amazon EFS"];

export const NETWORKING = [
  "Public (Application Load Balancer)",
  "Internal (private subnet)",
];

export const SECURITY = [
  "IAM role + security group",
  "IAM role + Secrets Manager",
  "IAM role + Cognito authentication",
];

export const MONITORING = [
  "CloudWatch logs + alarms",
  "CloudWatch logs",
  "None",
];

export const BACKUPS = ["None", "Daily snapshots", "Point-in-time recovery"];

export const DISASTER_RECOVERY = [
  "Single-AZ",
  "Multi-AZ",
  "Multi-AZ + cross-region",
];
