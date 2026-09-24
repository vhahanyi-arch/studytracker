// Runs once when a server instance starts, before it handles any request.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { repairBlobTokenEnv } = await import("./lib/blob-token");
    repairBlobTokenEnv();
  }
}
