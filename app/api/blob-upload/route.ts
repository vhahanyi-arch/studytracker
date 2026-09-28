import { currentViewer } from "@/lib/session";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        const session = await currentViewer();
        if (!session) throw new Error("Please sign in.");
        const { userId, user } = session;
        if (user.publicMetadata.role !== "teacher")
          throw new Error("Teacher access is required.");
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: 60_000_000,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload could not be authorised." },
      { status: 400 },
    );
  }
}
