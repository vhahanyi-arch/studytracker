import { NextResponse } from "next/server";

// The JSON object a route expects as its body, or null when the body is not
// one: invalid JSON, empty, or a bare value such as `null` or a list.
// Unguarded, request.json() throws on invalid JSON and the route answers 500
// for what is the caller's mistake; routes answer unreadableBody() instead.
export async function readJsonObject(request: Request): Promise<Record<string, any> | null> {
  const body: unknown = await request.json().catch(() => null);
  return body !== null && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, any>) : null;
}

export const unreadableBody = () =>
  NextResponse.json({ error: "The request could not be read." }, { status: 400 });
