import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { systemChecks } from "@/lib/status";

export const dynamic = "force-dynamic";

const layers = [
  [
    "Deployment model",
    "Docker, Amazon ECR, Amazon ECS on AWS Fargate",
    "The application runs as a container on serverless tasks, released with rolling deployments and automatic rollback.",
  ],
  [
    "Database",
    "Amazon RDS for PostgreSQL",
    "Projects, modules, settings and activity are stored in a private, encrypted PostgreSQL instance.",
  ],
  [
    "Storage",
    "Amazon S3",
    "Files are kept in a private bucket with versioning, default encryption and Block Public Access.",
  ],
  [
    "Networking",
    "Amazon VPC, Application Load Balancer, NAT Gateway",
    "Public and private subnets in two Availability Zones; only the load balancer is reachable from the internet.",
  ],
  [
    "Security",
    "AWS IAM, security groups, Parameter Store",
    "Least-privilege task roles, chained security groups and the database password held as an encrypted parameter.",
  ],
  [
    "Scalability",
    "Application Auto Scaling",
    "The service scales between 1 and 4 tasks to hold average CPU at 70%.",
  ],
  [
    "Monitoring",
    "Amazon CloudWatch, Amazon SNS",
    "Container logs, metrics and five alarms, with e-mail notification.",
  ],
  [
    "Backup",
    "RDS automated backups, S3 versioning",
    "Daily database backups with point-in-time recovery; earlier versions of every file are kept.",
  ],
  [
    "Disaster recovery",
    "Multi-AZ design, cross-region strategy",
    "Failed tasks are replaced automatically; the design extends to a Multi-AZ database and a second Region.",
  ],
];

export default async function ArchitecturePage() {
  const checks = await systemChecks();

  return (
    <>
      <PageHeader
        eyebrow="AWS Cloud"
        title="Architecture"
        subtitle="How CloudNativeHub itself is deployed on AWS in the Mumbai Region."
      />

      <div className="panel" style={{ marginTop: 0 }}>
        <div className="panel-header">
          <div>
            <h2>Deployed Architecture</h2>
            <p>Region ap-south-1 · VPC 10.0.0.0/16 · two Availability Zones</p>
          </div>
        </div>
        <div className="panel-body">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="diagram"
            src="/architecture.svg"
            alt="CloudNativeHub AWS architecture diagram"
          />
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Live Service Status</h2>
            <p>Checked from the running application when this page loaded.</p>
          </div>
        </div>

        {checks.map((check) => (
          <div className="health-row" key={check.name}>
            <span>
              <i className={check.healthy ? "dot" : "dot red"} />
              <span>
                {check.name}
                <br />
                <small>{check.service}</small>
              </span>
            </span>
            <span className="row-side">
              <small>{check.detail}</small>
              <StatusBadge status={check.healthy ? "Healthy" : "Unavailable"} />
            </span>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Architecture Layers</h2>
            <p>The AWS service behind each part of the platform.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Layer</th>
                <th>AWS services</th>
                <th>How it is used</th>
              </tr>
            </thead>
            <tbody>
              {layers.map(([layer, services, usage]) => (
                <tr key={layer}>
                  <td>
                    <strong>{layer}</strong>
                  </td>
                  <td>{services}</td>
                  <td className="muted">{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
