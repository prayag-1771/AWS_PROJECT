import { HeadBucketCommand } from "@aws-sdk/client-s3";
import pool from "./db";
import s3, { bucket } from "./s3";

export type Check = {
  name: string;
  service: string;
  healthy: boolean;
  detail: string;
};

async function timed(run: () => Promise<unknown>) {
  const started = Date.now();

  try {
    await run();

    return { healthy: true, detail: `${Date.now() - started} ms` };
  } catch (error) {
    console.error(error);

    return { healthy: false, detail: "Unreachable" };
  }
}

// Live checks of the services the application depends on.
export async function systemChecks(): Promise<Check[]> {
  const [database, storage] = await Promise.all([
    timed(() => pool.query("SELECT 1")),
    bucket
      ? timed(() => s3.send(new HeadBucketCommand({ Bucket: bucket })))
      : Promise.resolve({ healthy: false, detail: "Not configured" }),
  ]);

  return [
    {
      name: "Application",
      service: "Amazon ECS on Fargate",
      healthy: true,
      detail: "Serving requests",
    },
    { name: "Database", service: "Amazon RDS for PostgreSQL", ...database },
    { name: "Object storage", service: "Amazon S3", ...storage },
  ];
}
