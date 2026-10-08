import { NextResponse } from "next/server";
import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import s3, { bucket, folders } from "@/lib/s3";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function GET() {
  if (!bucket) {
    return NextResponse.json(
      { error: "Storage is not configured" },
      { status: 500 }
    );
  }

  try {
    const result = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket })
    );

    const files = (result.Contents || [])
      .filter((object) => object.Key && !object.Key.endsWith("/"))
      .map((object) => ({
        key: object.Key,
        size: object.Size,
        lastModified: object.LastModified,
      }));

    return NextResponse.json(files);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!bucket) {
    return NextResponse.json(
      { error: "Storage is not configured" },
      { status: 500 }
    );
  }

  try {
    const form = await request.formData();

    const file = form.get("file");
    const folder = String(form.get("folder") || "");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A file is required" },
        { status: 400 }
      );
    }

    if (!folders.includes(folder)) {
      return NextResponse.json(
        { error: "Unknown storage folder" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is larger than 10 MB" },
        { status: 413 }
      );
    }

    const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${folder}/${Date.now()}-${name}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || "application/octet-stream",
      })
    );

    return NextResponse.json({ key, size: file.size }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
