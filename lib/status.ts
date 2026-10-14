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
  const poolId = process.env.COGNITO_USER_POOL_ID;
  const region = process.env.AWS_REGION || "ap-south-1";

  const [database, storage, identity] = await Promise.all([
    timed(() => pool.query("SELECT 1")),
    bucket
      ? timed(() => s3.send(new HeadBucketCommand({ Bucket: bucket })))
      : Promise.resolve({ healthy: false, detail: "Not configured" }),
    // The user pool's public signing keys, which sessions are verified with.
    poolId
      ? timed(async () => {
          const response = await fetch(
            `https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`,
            { cache: "no-store" }
          );

          if (!response.ok) {
            throw new Error(`Cognito returned ${response.status}`);
          }
        })
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
    { name: "Authentication", service: "Amazon Cognito", ...identity },
  ];
}
