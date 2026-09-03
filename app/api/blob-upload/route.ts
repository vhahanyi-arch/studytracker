import { auth, clerkClient } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        const { userId } = await auth();
        if (!userId) throw new Error("Please sign in.");
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
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
