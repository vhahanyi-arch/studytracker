export type HomeworkChapter = {
  number: number;
  title: string;
  firstPage: number;
  lastPage: number;
  unitId: string;
};

// Complete Mathematics for Cambridge Secondary 1 Homework Book 2.
// Page 3 of the uploaded book contains this chapter catalogue. Keeping the
// catalogue here makes image-only pages useful even when the PDF has no text
// layer for the server to inspect.
export const stage8HomeworkBook2: HomeworkChapter[] = [
  { number: 1, title: "Number and calculation 1", firstPage: 5, lastPage: 12, unitId: "s8-u1" },
  { number: 2, title: "Expressions and functions", firstPage: 13, lastPage: 16, unitId: "s8-u2" },
  { number: 3, title: "Shapes and mathematical drawings", firstPage: 17, lastPage: 23, unitId: "s8-u5" },
  { number: 4, title: "Length, mass and capacity", firstPage: 24, lastPage: 27, unitId: "s8-u15" },
  { number: 5, title: "Number and calculation 2", firstPage: 28, lastPage: 32, unitId: "s8-u3" },
  { number: 6, title: "Planning, collecting and processing data", firstPage: 33, lastPage: 38, unitId: "s8-u6" },
  { number: 7, title: "Fractions", firstPage: 39, lastPage: 44, unitId: "s8-u7" },
  { number: 8, title: "Expressions, equations and formulae", firstPage: 45, lastPage: 51, unitId: "s8-u2" },
  { number: 9, title: "Geometry", firstPage: 52, lastPage: 55, unitId: "s8-u5" },
  { number: 10, title: "Fractions and decimals", firstPage: 56, lastPage: 61, unitId: "s8-u4" },
  { number: 11, title: "Time and rates of change", firstPage: 62, lastPage: 65, unitId: "s8-u11" },
  { number: 12, title: "Presenting data and interpreting results", firstPage: 66, lastPage: 72, unitId: "s8-u16" },
  { number: 13, title: "Fractions, decimals and percentages", firstPage: 73, lastPage: 76, unitId: "s8-u10" },
  { number: 14, title: "Sequences, functions and graphs", firstPage: 77, lastPage: 83, unitId: "s8-u9" },
  { number: 15, title: "Transformations", firstPage: 84, lastPage: 91, unitId: "s8-u14" },
  { number: 16, title: "Ratio and proportion", firstPage: 92, lastPage: 95, unitId: "s8-u12" },
  { number: 17, title: "Area, perimeter and volume", firstPage: 96, lastPage: 102, unitId: "s8-u15" },
  { number: 18, title: "Probability", firstPage: 103, lastPage: 106, unitId: "s8-u13" },
  { number: 19, title: "Vectors and matrices (extension)", firstPage: 107, lastPage: 112, unitId: "s8-u14" },
];

export function homeworkChapterForPage(stage: number, totalPages: number, page: number) {
  if (stage !== 8 || totalPages !== 114) return null;
  return stage8HomeworkBook2.find(
    (chapter) => page >= chapter.firstPage && page <= chapter.lastPage,
  ) || null;
}
