import { NextResponse } from "next/server";
import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { ApiError, handle } from "@/lib/api";
import { apiUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import s3, { folders, requireBucket, userPrefix } from "@/lib/s3";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const GET = handle(async () => {
  const prefix = userPrefix((await apiUser()).sub);
  const result = await s3.send(
    new ListObjectsV2Command({ Bucket: requireBucket(), Prefix: prefix })
  );

  const files = (result.Contents || [])
    .filter((object) => object.Key && !object.Key.endsWith("/"))
    .map((object) => {
      const [folder, name = ""] = object.Key!.slice(prefix.length).split("/");

      return {
        key: object.Key,
        folder,
        name: name.replace(/^\d+-/, ""),
        size: object.Size,
        lastModified: object.LastModified,
      };
    })
    .filter((file) => folders.includes(file.folder) && file.name)
    .sort(
      (a, b) =>
        new Date(b.lastModified || 0).getTime() -
        new Date(a.lastModified || 0).getTime()
    );

  return NextResponse.json(files);
});

export const POST = handle(async (request: Request) => {
  const user = await apiUser();
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
  const key = `${userPrefix(user.sub)}${folder}/${Date.now()}-${name}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
    })
  );

  await logActivity(user.sub, "uploaded", "file", `${folder}/${name}`);

  return NextResponse.json({ key, size: file.size }, { status: 201 });
});
