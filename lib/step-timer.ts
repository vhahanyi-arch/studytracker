// Times the steps of a long request and gives each its own deadline, so a
// step that hangs fails with its own name instead of the whole function being
// killed silently at the platform's limit. Every step is logged, which is what
// the production logs are read for when an upload is slow.

export class StepTimeout extends Error {}

export function stepTimer(label: string, log: (line: string) => void = console.info) {
  const started = Date.now();
  return {
    async step<T>(name: string, work: Promise<T> | (() => Promise<T>), limitMs: number): Promise<T> {
      const begun = Date.now();
      let timer: ReturnType<typeof setTimeout> | undefined;
      const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new StepTimeout(`${name} took longer than ${Math.round(limitMs / 1000)} seconds. Try again in a moment.`)), limitMs);
      });
      try {
        const result = await Promise.race([typeof work === "function" ? work() : work, deadline]);
        log(`[${label}] ${name}: ${Date.now() - begun} ms`);
        return result;
      } catch (error) {
        log(`[${label}] ${name}: FAILED after ${Date.now() - begun} ms (${error instanceof Error ? error.message : String(error)})`);
        throw error;
      } finally {
        clearTimeout(timer);
      }
    },
    done() {
      log(`[${label}] total: ${Date.now() - started} ms`);
    },
  };
}
