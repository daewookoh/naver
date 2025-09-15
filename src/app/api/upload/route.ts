import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "process";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_USE_LOCAL === "true" ? "http://127.0.0.1:4566" : undefined,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function POST(req: NextRequest) {
  const cdnBaseUrl = process.env.AWS_CDN_BASE_URL;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = `${uuidv4()}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `file/${fileName}`,
        Body: await file.arrayBuffer().then((buffer) => Buffer.from(buffer)),
        ContentType: file.type
      }
    });

    const result = await upload.done();

    return NextResponse.json({
      fileUrl: cdnBaseUrl ? `${cdnBaseUrl}/${result.Key}` : result.Location
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
