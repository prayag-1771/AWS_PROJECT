import { S3Client } from "@aws-sdk/client-s3";
import { ApiError } from "./api";

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

export function requireBucket() {
  if (!bucket) {
    throw new ApiError("Storage is not configured", 503);
  }

  return bucket;
}

// Object keys always live directly inside one of the known folders.
export function parseKey(value: string | null) {
  const [folder, name, ...rest] = (value || "").split("/");

  if (!folders.includes(folder) || !name || rest.length > 0) {
    throw new ApiError("Unknown file", 404);
  }

  return `${folder}/${name}`;
}

export default s3;
