import { get } from "@vercel/blob";
import type { PdfPageData } from "@/lib/cambridge-analysis";

export async function readPrivatePdf(url: string) {
  const blob = await get(url, { access: "private" });
  if (!blob || blob.statusCode !== 200) throw new Error("PDF_NOT_FOUND");
  return new Uint8Array(await new Response(blob.stream).arrayBuffer());
}

export async function extractPdfPages(data: Uint8Array): Promise<PdfPageData[]> {
  const runtime = globalThis as any;
  runtime.DOMMatrix ||= class DOMMatrix {};
  runtime.ImageData ||= class ImageData {};
  runtime.Path2D ||= class Path2D {};
  runtime.pdfjsWorker ||= await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: PdfPageData[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const items = content.items as Array<Record<string, unknown>>;
    const visibleItems = items.filter((item) => String(item.str || "").trim());
    const isRotatedItem = (item: Record<string, unknown>) => {
      const transform = (item.transform as number[] | undefined) || [];
      return (
        Math.abs(Number(transform[1] || 0)) >= 0.01 ||
        Math.abs(Number(transform[2] || 0)) >= 0.01
      );
    };
    // Some Cambridge mark schemes store a landscape table as 90-degree text
    // on a portrait PDF page. Treat the page as landscape when rotation is the
    // dominant orientation, while still excluding occasional rotated margin
    // labels from ordinary portrait question papers.
    const rotatedPage =
      visibleItems.length > 0 &&
      visibleItems.filter(isRotatedItem).length / visibleItems.length >= 0.6;
    pages.push({
      pageNumber,
      width: rotatedPage ? viewport.height : viewport.width,
      height: rotatedPage ? viewport.width : viewport.height,
      words: items
        .map((item) => {
          const transform = (item.transform as number[] | undefined) || [];
          const rotated = isRotatedItem(item);
          return {
            text: String(item.str || "").trim(),
            x: rotated ? Number(transform[5] || 0) : Number(transform[4] || 0),
            top: rotated
              ? Number(transform[4] || 0)
              : viewport.height - Number(transform[5] || 0),
            width: Number(item.width || 0),
            height: Number(item.height || 0),
            horizontal: rotatedPage ? rotated : !rotated,
          };
        })
        .filter((word) => word.text),
    });
  }
  return pages;
}

export async function pdfPageCount(data: Uint8Array) {
  const runtime = globalThis as any;
  runtime.DOMMatrix ||= class DOMMatrix {};
  runtime.ImageData ||= class ImageData {};
  runtime.Path2D ||= class Path2D {};
  runtime.pdfjsWorker ||= await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjs.getDocument({ data }).promise;
  return pdf.numPages;
}
