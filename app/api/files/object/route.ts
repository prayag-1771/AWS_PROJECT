import { NextResponse } from "next/server";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { ApiError, handle } from "@/lib/api";
import { apiUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import s3, { parseKey, requireBucket } from "@/lib/s3";

async function fileFrom(request: Request) {
  const user = await apiUser();

  return {
    owner: user.sub,
    ...parseKey(user.sub, new URL(request.url).searchParams.get("key")),
  };
}

// Streams the object through the application, so the bucket stays private.
export const GET = handle(async (request: Request) => {
  const { key, name } = await fileFrom(request);

  const object = await s3
    .send(new GetObjectCommand({ Bucket: requireBucket(), Key: key }))
    .catch((error) => {
      if (error?.name === "NoSuchKey") {
        throw new ApiError("Unknown file", 404);
      }

      throw error;
    });

  if (!object.Body) {
    throw new ApiError("Unknown file", 404);
  }

  const headers = new Headers({
    "Content-Type": object.ContentType || "application/octet-stream",
    "Content-Disposition": `attachment; filename="${name.replace(/^\d+-/, "")}"`,
    "Cache-Control": "no-store",
  });

  if (object.ContentLength !== undefined) {
    headers.set("Content-Length", String(object.ContentLength));
  }

  return new Response(object.Body.transformToWebStream(), { headers });
});

// The bucket is versioned, so a delete adds a delete marker and earlier
// versions stay recoverable.
export const DELETE = handle(async (request: Request) => {
  const { owner, key, folder, name } = await fileFrom(request);

  await s3.send(new DeleteObjectCommand({ Bucket: requireBucket(), Key: key }));
  await logActivity(owner, "deleted", "file", `${folder}/${name}`);

  return NextResponse.json({ deleted: true });
});
