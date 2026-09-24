// Papers saved before question screenshots existed (2026-09-24) have no
// crops, so every question showed its whole page, which made answering hard.
// Their crops are worked out the first time the paper is loaded and saved,
// so it only happens once. Best effort: if the question paper cannot be read,
// the paper is served as before and the next load tries again.
import type { Paper } from "./physics-extraction-schema";

type Crops = NonNullable<Paper["crops"]>;

export async function addMissingScreenshots(
  papers: Paper[],
  find: (paper: Paper) => Promise<Crops | undefined>,
  save: (id: string, crops: Crops) => Promise<void>,
  log: (line: string) => void = console.warn,
): Promise<Paper[]> {
  return Promise.all(papers.map(async (paper) => {
    if (paper.crops) return paper;
    const crops = await find(paper);
    if (!crops) {
      log(`[screenshots] could not place the questions of paper ${paper.id}; showing whole pages`);
      return paper;
    }
    try {
      await save(paper.id, crops);
    } catch (error) {
      log(`[screenshots] placed but could not save for paper ${paper.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
    return { ...paper, crops };
  }));
}
