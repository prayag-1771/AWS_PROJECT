# CloudNativeHub

A cloud-native platform for designing, deploying and managing application
modules, built to run on AWS.

Each **project** is an application. Each project is made of **modules**
(services), and every module carries its own architecture design across nine
aspects: deployment model, database, storage, networking, security,
scalability, monitoring, backup and disaster recovery. The platform draws the
project's architecture from those designs.

## Features

- **Dashboard** with live counts, platform health checks and an activity feed
- **Projects**: create, search, filter, edit and delete
- **Modules**: a nine-aspect architecture design per module, with a generated
  architecture diagram per project
- **Storage**: upload, download and delete files in a private Amazon S3 bucket
- **Architecture**: how the platform itself is deployed, with live service status
- **Settings** stored in the database and used as defaults for new projects

## Stack

Next.js 16 (App Router), React 19, TypeScript, PostgreSQL (`pg`) and the AWS SDK
for JavaScript v3. The application is packaged as a Docker image using the
Next.js standalone output.

## AWS architecture

| Layer | Service |
| --- | --- |
| Deployment | Docker image in Amazon ECR, run on Amazon ECS with AWS Fargate |
| Database | Amazon RDS for PostgreSQL in private subnets |
| Storage | Private, versioned, encrypted Amazon S3 bucket |
| Networking | VPC with public and private subnets in two Availability Zones, Application Load Balancer, NAT Gateway |
| Security | Chained security groups, least-privilege IAM task roles, database password in SSM Parameter Store |
| Scalability | ECS Service Auto Scaling, 1 to 4 tasks on CPU |
| Monitoring | Amazon CloudWatch logs and alarms, Amazon SNS notifications |
| Backup | RDS automated backups, S3 versioning |

## Configuration

The application is configured through environment variables.

| Variable | Purpose |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `DB_SSL` | Set to `false` only for a local database without TLS |
| `S3_BUCKET` | Bucket used by the Storage page |
| `AWS_REGION` | Region of the bucket (default `ap-south-1`) |
| `APP_ENV` | Environment name shown on the dashboard |

On AWS the task role supplies S3 credentials; no access keys are configured.
The database tables are created automatically on first use.

## Run locally

```bash
docker run -d --name cnh-pg -e POSTGRES_PASSWORD=localdev -p 5433:5432 postgres:16-alpine
npm install
```

Create `.env.local`:

```
DB_HOST=localhost
DB_PORT=5433
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=localdev
DB_SSL=false
```

Then start the development server and open http://localhost:3000.

```bash
npm run dev
```

## Deploy

```bash
docker build -t cloudnativehub:latest .
docker tag cloudnativehub:latest <account>.dkr.ecr.ap-south-1.amazonaws.com/cloudnativehub:<version>
docker push <account>.dkr.ecr.ap-south-1.amazonaws.com/cloudnativehub:<version>
```

Register a new revision of the `cloudnativehub-task` task definition that points
at the pushed image, then update `cloudnativehub-service` to that revision. ECS
replaces the running task with a rolling deployment and rolls back automatically
if the new task fails its health check.

## API

| Route | Methods |
| --- | --- |
| `/api/health` | `GET` (load balancer health check) |
| `/api/status` | `GET` (database and storage checks) |
| `/api/projects`, `/api/projects/:id` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/api/modules`, `/api/modules/:id` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/api/files`, `/api/files/object?key=` | `GET`, `POST`, `DELETE` |
| `/api/settings` | `GET`, `PUT` |
