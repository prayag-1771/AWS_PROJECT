import { NextResponse } from "next/server";
import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { ApiError, handle } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import s3, { folders, requireBucket } from "@/lib/s3";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const GET = handle(async () => {
  const result = await s3.send(
    new ListObjectsV2Command({ Bucket: requireBucket() })
  );

  const files = (result.Contents || [])
    .filter((object) => object.Key && !object.Key.endsWith("/"))
    .map((object) => ({
      key: object.Key,
      size: object.Size,
      lastModified: object.LastModified,
    }))
    .sort(
      (a, b) =>
        new Date(b.lastModified || 0).getTime() -
        new Date(a.lastModified || 0).getTime()
    );

  return NextResponse.json(files);
});

export const POST = handle(async (request: Request) => {
  const bucket = requireBucket();
  const form = await request.formData().catch(() => null);

  const file = form?.get("file");
  const folder = String(form?.get("folder") || "");

  if (!(file instanceof File) || file.size === 0) {
    throw new ApiError("A file is required");
  }

  if (!folders.includes(folder)) {
    throw new ApiError("Unknown storage folder");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError("File is larger than 10 MB", 413);
  }

  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  const key = `${folder}/${Date.now()}-${name}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
    })
  );

  await logActivity("uploaded", "file", key);

  return NextResponse.json({ key, size: file.size }, { status: 201 });
});
