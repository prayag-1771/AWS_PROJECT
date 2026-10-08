import { createModule } from "./modules";
import { createProject } from "./projects";
import type { ModuleInput, ProjectInput } from "./validate";

type SampleModule = Omit<ModuleInput, "project_id">;

const base: SampleModule = {
  name: "",
  description: "",
  type: "Microservice",
  status: "Running",
  deployment: "ECS Fargate",
  database_engine: "None",
  storage: "None",
  networking: "Internal (private subnet)",
  security: "IAM role + security group",
  min_tasks: 1,
  max_tasks: 4,
  monitoring: "CloudWatch logs + alarms",
  backup: "None",
  disaster_recovery: "Multi-AZ",
};

const samples: { project: ProjectInput; modules: SampleModule[] }[] = [
  {
    project: {
      name: "E-Commerce Platform",
      description:
        "Online store with a product catalogue, shopping cart and payments.",
      environment: "Production",
      architecture: "Microservices",
      region: "Asia Pacific (Mumbai)",
      status: "Active",
    },
    modules: [
      {
        ...base,
        name: "Storefront",
        description: "Customer-facing web application.",
        type: "Frontend",
        storage: "Amazon S3",
        networking: "Public (Application Load Balancer)",
        security: "IAM role + Cognito authentication",
        min_tasks: 2,
        max_tasks: 6,
      },
      {
        ...base,
        name: "Order Service",
        description: "Creates orders and tracks them through fulfilment.",
        database_engine: "RDS PostgreSQL",
        security: "IAM role + Secrets Manager",
        min_tasks: 2,
        max_tasks: 8,
        backup: "Point-in-time recovery",
        disaster_recovery: "Multi-AZ + cross-region",
      },
      {
        ...base,
        name: "Payment Service",
        description: "Takes payments through the payment gateway.",
        type: "API",
        deployment: "AWS Lambda",
        database_engine: "DynamoDB",
        security: "IAM role + Secrets Manager",
        max_tasks: 10,
        backup: "Point-in-time recovery",
      },
      {
        ...base,
        name: "Notification Worker",
        description: "Sends order e-mails and SMS messages from a queue.",
        type: "Worker",
        status: "Deploying",
        database_engine: "ElastiCache Redis",
        monitoring: "CloudWatch logs",
        disaster_recovery: "Single-AZ",
      },
    ],
  },
  {
    project: {
      name: "Student Portal",
      description: "Course registration, timetables and results for students.",
      environment: "Staging",
      architecture: "Monolith",
      region: "Asia Pacific (Mumbai)",
      status: "Deploying",
    },
    modules: [
      {
        ...base,
        name: "Portal Web App",
        description: "Server-rendered portal used by students and faculty.",
        type: "Frontend",
        database_engine: "RDS PostgreSQL",
        storage: "Amazon S3",
        networking: "Public (Application Load Balancer)",
        security: "IAM role + Cognito authentication",
        backup: "Daily snapshots",
      },
      {
        ...base,
        name: "Results Importer",
        description: "Nightly job that imports examination results.",
        type: "Scheduler",
        status: "Stopped",
        deployment: "AWS Lambda",
        database_engine: "RDS PostgreSQL",
        min_tasks: 0,
        max_tasks: 1,
        monitoring: "CloudWatch logs",
        disaster_recovery: "Single-AZ",
      },
    ],
  },
  {
    project: {
      name: "Analytics Engine",
      description: "Event ingestion and reporting for product analytics.",
      environment: "Development",
      architecture: "Serverless",
      region: "Asia Pacific (Singapore)",
      status: "Active",
    },
    modules: [
      {
        ...base,
        name: "Ingestion API",
        description: "Receives events from web and mobile clients.",
        type: "API",
        deployment: "AWS Lambda",
        database_engine: "DynamoDB",
        networking: "Public (Application Load Balancer)",
        max_tasks: 20,
        backup: "Point-in-time recovery",
      },
      {
        ...base,
        name: "Report Builder",
        description: "Aggregates events into daily reports.",
        type: "Worker",
        storage: "Amazon S3",
        monitoring: "CloudWatch logs",
        backup: "Daily snapshots",
        disaster_recovery: "Single-AZ",
      },
    ],
  },
];

export async function seedSampleData() {
  for (const sample of samples) {
    const project = await createProject(sample.project);

    for (const item of sample.modules) {
      await createModule({ ...item, project_id: project.id });
    }
  }
}
