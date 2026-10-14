import { S3Client } from "@aws-sdk/client-s3";
import { ApiError } from "./api";

export const bucket = process.env.S3_BUCKET;

export const folders = ["notes", "slides", "assignments", "papers", "other"];

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export function requireBucket() {
  if (!bucket) {
    throw new ApiError("Storage is not configured", 503);
  }

  return bucket;
}

// Each student's files live under their own prefix in the bucket.
export function userPrefix(owner: string) {
  return `users/${owner}/`;
}

// Keys are always <prefix><folder>/<file name> inside the student's prefix.
export function parseKey(owner: string, value: string | null) {
  const prefix = userPrefix(owner);

  if (!value?.startsWith(prefix)) {
    throw new ApiError("Unknown file", 404);
  }

  const [folder, name, ...rest] = value.slice(prefix.length).split("/");

  if (!folders.includes(folder) || !name || rest.length > 0) {
    throw new ApiError("Unknown file", 404);
  }

  return { key: value, folder, name };
}

export default s3;
