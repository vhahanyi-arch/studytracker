// Calls a route handler as the browser would, signed in as `as`.
import { signIn } from "./fake-clerk";

// Each route types its own params ({ id } or none); the test passes the ones it needs.
type Handler = (request: Request, context: { params: Promise<any> }) => Promise<Response>;

export async function call(
  handler: Handler,
  options: { as?: string | null; json?: unknown; form?: Record<string, string | File | File[]>; params?: Record<string, string>; query?: string } = {},
) {
  signIn(options.as ?? null);
  const init: RequestInit = { method: "POST" };
  if (options.json !== undefined) {
    init.body = JSON.stringify(options.json);
    init.headers = { "content-type": "application/json" };
  } else if (options.form) {
    const form = new FormData();
    for (const [key, value] of Object.entries(options.form))
      for (const item of Array.isArray(value) ? value : [value]) form.append(key, item);
    init.body = form;
  } else init.method = "GET";
  const request = new Request(`http://localhost/api/test${options.query ? "?" + options.query : ""}`, init);
  const response = await handler(request, { params: Promise.resolve(options.params ?? {}) });
  const type = response.headers.get("content-type") ?? "";
  // Tests read whatever shape each route returns.
  const body: any = type.includes("json") ? await response.json() : await response.arrayBuffer();
  return { status: response.status, body };
}

export const pdf = (name: string) => new File([`%PDF-1.4 ${name}`], `${name}.pdf`, { type: "application/pdf" });
export const png = (name: string) => new File([new Uint8Array([137, 80, 78, 71, name.length])], `${name}.png`, { type: "image/png" });

export const accounts = [
  { id: "t1", username: "tess", firstName: "Tess", lastName: "Teacher", publicMetadata: { role: "teacher" } },
  { id: "s1", username: "sam", firstName: "Sam", lastName: "Student", publicMetadata: { role: "student", teacherId: "t1" } },
  { id: "s2", username: "sia", firstName: "Sia", lastName: null, publicMetadata: { role: "student", teacherId: "t1" } },
  { id: "s3", username: "sol", firstName: null, lastName: null, publicMetadata: { role: "student", teacherId: "t1" } },
  { id: "x", username: "nobody", firstName: null, lastName: null, publicMetadata: {} },
];
