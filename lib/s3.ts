import { S3Client } from "@aws-sdk/client-s3";

export const bucket = process.env.S3_BUCKET;

export const folders = [
  "projects",
  "modules",
  "artifacts",
  "architecture",
  "backups",
];

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export default s3;
