// Runs once when a server instance starts, before it handles any request.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { repairBlobTokenEnv } = await import("./lib/blob-token");
    const { usePreviewBlobStore } = await import("./lib/preview-env");
    // A preview swaps in its own store's token first; the repair then cleans it.
    usePreviewBlobStore();
    repairBlobTokenEnv();
  }
}
