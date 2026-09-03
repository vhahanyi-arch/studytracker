export type CambridgeSubject = "Mathematics" | "Physics" | "Cambridge";
export type CambridgePaperMode = "structured" | "multiple_choice";

export type PdfWord = {
  text: string;
  x: number;
  top: number;
  width?: number;
  height?: number;
  horizontal?: boolean;
};

export type PdfPageData = {
  pageNumber: number;
  width: number;
  height: number;
  words: PdfWord[];
};

export type SchemePoint = {
  answer: string;
  marks: string;
  guidance: string;
};

export type SchemeRow = {
  label: string;
  answer: string;
  marks: number | null;
  guidance: string;
  points: SchemePoint[];
};

export type DetectedQuestion = {
  label: string;
  marks: number | null;
  page_number: number;
  crop_x: number;
  crop_y: number;
  crop_width: number;
  crop_height: number;
  response_type: "typed" | "drawing" | "multiple_choice";
  answer_slots: number;
  response_layout: "answer" | "working" | "formula";
  expected_answer: string | null;
  mark_scheme_notes: string | null;
  topic: string;
};

type TextRow = { top: number; words: PdfWord[] };
type Marker = {
  label: string;
  main: string;
  letter: string;
  roman: string;
  page: number;
  top: number;
  cropTop: number;
};

const romanPart = /^(?:i{1,3}|iv|v|vi{0,3}|ix|x)$/i;

export function canonicalQuestionLabel(value: string): string {
  let compact = String(value || "")
    .toLowerCase()
    .replace(/[\[\{]/g, "(")
    .replace(/[\]\}]/g, ")")
    .replace(/\s+/g, "");
  compact = compact.replace(/^(?:question)?(\d{1,2})([a-z])(?=\(|$)/i, "$1($2)");
  const match = compact.match(/(?:question)?(\d{1,2})((?:\([a-z]+\)){0,2})/i);
  if (!match) return compact;
  let label = `${Number(match[1])}${match[2] || ""}`;
  label = label.replace(/^(\d{1,2})\(([a-hj-uwyz])\)\(\2\)$/i, "$1($2)");
  return label;
}

function labelParts(value: string) {
  const label = canonicalQuestionLabel(value);
  const main = label.match(/^\d{1,2}/)?.[0] || "";
  const parts = Array.from(label.matchAll(/\(([a-z]+)\)/gi), (match) =>
    match[1].toLowerCase(),
  );
  return {
    label,
    main,
    letter: parts[0] || "",
    roman: parts[1] || "",
  };
}

function groupRows(page: PdfPageData, tolerance = 5): TextRow[] {
  const rows: TextRow[] = [];
  page.words
    .filter((word) => word.text.trim())
    .sort((a, b) =>
      Math.abs(a.top - b.top) > tolerance ? a.top - b.top : a.x - b.x,
    )
    .forEach((word) => {
      const row = rows.find((candidate) =>
        Math.abs(candidate.top - word.top) <= tolerance,
      );
      if (row) row.words.push(word);
      else rows.push({ top: word.top, words: [word] });
    });
  return rows
    .map((row) => ({
      ...row,
      words: row.words.sort((a, b) => a.x - b.x),
    }))
    .sort((a, b) => a.top - b.top);
}

const rowText = (row: TextRow) =>
  row.words
    .map((word) => word.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

function findHeaderRows(rows: TextRow[]) {
  return rows.filter((row) => {
    const text = rowText(row).toLowerCase();
    return /^question\b/.test(text) && /\banswer\b/.test(text) && /\bmarks?\b/.test(text);
  });
}

function headerWord(row: TextRow, pattern: RegExp) {
  return row.words.find((word) => pattern.test(word.text));
}

function uniqueSchemePoints(points: SchemePoint[]) {
  return points.filter((point, index, all) => {
    const signature = [point.answer, point.marks, point.guidance]
      .map((value) => value.replace(/\s+/g, " ").trim().toLowerCase())
      .join("|");
    return (
      all.findIndex(
        (candidate) =>
          [candidate.answer, candidate.marks, candidate.guidance]
            .map((value) => value.replace(/\s+/g, " ").trim().toLowerCase())
            .join("|") === signature,
      ) === index
    );
  });
}

function inferMarks(inputPoints: SchemePoint[]): number | null {
  const points = uniqueSchemePoints(inputPoints);
  const firstNumeric = points
    // Lower Secondary tables place "Part Marks" directly beside "Marks".
    // PDF text extraction can join the numeric total to the first part-mark
    // phrase, so accept the leading total instead of requiring an isolated
    // one-character cell.
    .map((point) => point.marks.match(/^\s*([1-9])(?:\s|$)/)?.[1])
    .find(Boolean);
  if (firstNumeric) return Number(firstNumeric);
  const markCodes = points.flatMap((point) =>
    point.marks.match(/\b(?:M|A|B|C|P|SC)([1-9])\b/gi) || [],
  );
  const codes = markCodes.length
    ? markCodes
    : points.flatMap((point) =>
        point.guidance.match(/\b(?:M|A|B|C|P|SC)([1-9])\b/gi) || [],
      );
  if (!codes.length) return null;
  const values = codes.map((code) => Number(code.match(/([1-9])$/)?.[1] || 0));
  // IGCSE schemes use A3/C2/C1 as cumulative alternatives, while AS schemes
  // commonly use separate C1 + C1 + A1 points. A code above 1 therefore
  // supplies the total; otherwise each one-mark point is additive.
  return values.some((value) => value > 1)
    ? Math.max(...values)
    : values.reduce((total, value) => total + value, 0);
}

function cleanAnswer(value: string, paperMode: CambridgePaperMode) {
  let answer = value
    .replace(/\s+/g, " ")
    .replace(/\b(?:cao|oe|isw|nfww|soi)\b.*$/i, "")
    .replace(/\b(?:M|A|B|C|P|SC|FT)\d\b.*$/i, "")
    .trim();
  if (paperMode === "multiple_choice") {
    const choice = answer.match(/\b([A-D])\b/i)?.[1];
    return choice ? choice.toUpperCase() : "";
  }
  return answer;
}

function stackedMixedNumber(words: PdfWord[]) {
  const numbers = words.filter((word) => /^\d{1,3}$/.test(word.text));
  for (const numerator of numbers) {
    const denominator = numbers.find(
      (candidate) =>
        candidate !== numerator &&
        candidate.top > numerator.top + 5 &&
        candidate.top < numerator.top + 24 &&
        Math.abs(candidate.x - numerator.x) <= 9,
    );
    if (!denominator) continue;
    const whole = numbers.find(
      (candidate) =>
        candidate !== numerator &&
        candidate !== denominator &&
        candidate.x < numerator.x - 2 &&
        candidate.top > numerator.top &&
        candidate.top < denominator.top,
    );
    if (whole) return `${whole.text} ${numerator.text}/${denominator.text}`;
  }
  return "";
}

export function parseMarkScheme(
  pages: PdfPageData[],
  subject: CambridgeSubject,
  paperMode: CambridgePaperMode,
): SchemeRow[] {
  const resolved: SchemeRow[] = [];
  let carriedMain = "";
  let carriedLetter = "";

  for (const page of pages) {
    const pageText = page.words
      .map((word) => word.text)
      .join(" ")
      .replace(/\s+/g, " ");
    // Cambridge Lower Secondary mark schemes include a worked sample table in
    // the introductory marking guidance. It looks exactly like a real answer
    // row (often labelled Question 5), but must never seed the paper sequence.
    if (
      /general guidance on marking/i.test(pageText) &&
      /\bfor example\b/i.test(pageText)
    ) {
      continue;
    }
    const rows = groupRows(page);
    const headers = findHeaderRows(rows);
    if (!headers.length) continue;

    for (let headerIndex = 0; headerIndex < headers.length; headerIndex += 1) {
      const header = headers[headerIndex];
      const nextHeaderTop = headers[headerIndex + 1]?.top ?? page.height * 0.95;
      const questionHeader = headerWord(header, /^question$/i);
      const marksHeader = headerWord(header, /^marks?$/i);
      const guidanceHeader = headerWord(header, /^(?:partial|guidance|marking)$/i);
      const landscape = page.width > page.height;
      const answerStart = questionHeader
        ? questionHeader.x + page.width * (landscape ? 0.06 : 0.085)
        : page.width * (landscape ? 0.14 : 0.185);
      const marksStart = marksHeader
        ? marksHeader.x - page.width * (subject === "Physics" ? 0.04 : 0.02)
        : page.width * (subject === "Physics" ? 0.84 : 0.515);
      const guidanceStart = guidanceHeader
        ? guidanceHeader.x - page.width * 0.08
        : subject === "Mathematics"
          ? marksHeader
            ? marksHeader.x + page.width * 0.065
            : page.width * 0.59
          : page.width + 1;

      let active:
        | {
          label: string;
          points: SchemePoint[];
          answerWords: PdfWord[];
          }
        | undefined;
      const finishActive = () => {
        if (!active) return;
        const points = uniqueSchemePoints(
          active.points.filter((point) =>
            [point.answer, point.marks, point.guidance].some((value) => value.trim()),
          ),
        );
        if (!points.length) {
          active = undefined;
          return;
        }
        const finalPoint =
          points.find((point) => /\bA[1-9]\b/i.test(point.marks)) || points[0];
        const completeAnswer = points
          .map((point) => point.answer)
          .filter(Boolean)
          .join(" ")
          .slice(0, 1000);
        const splitMixedNumber = completeAnswer.match(
          /^\s*(\d+)\s+(\d+)\s+correct answer only\s+(\d+)\s*$/i,
        );
        const reconstructedNumber = splitMixedNumber
          ? `${splitMixedNumber[2]} ${splitMixedNumber[1]}/${splitMixedNumber[3]}`
          : stackedMixedNumber(active.answerWords);
        const codedScheme = points.some((point) =>
          /\b(?:M|A|B|C|P|SC|FT)[1-9]\b/i.test(point.marks),
        );
        // Numeric Lower Secondary schemes frequently wrap one accepted answer
        // over several visual lines (for example "1 and 49"). Preserve the
        // complete answer cell. Coded IGCSE/AS schemes still prefer the final
        // accuracy-mark line.
        const concise = cleanAnswer(
          reconstructedNumber && /correct answer only/i.test(completeAnswer)
            ? reconstructedNumber
            : codedScheme
              ? finalPoint?.answer || completeAnswer
              : completeAnswer,
          paperMode,
        );
        const guidance = points
          .map((point) =>
            [point.answer, point.marks, point.guidance]
              .filter(Boolean)
              .join(" | "),
          )
          .filter(Boolean)
          .join("\n")
          .slice(0, 3000);
        resolved.push({
          label: active.label,
          answer: concise || cleanAnswer(completeAnswer, paperMode),
          marks: inferMarks(points),
          guidance,
          points,
        });
        active = undefined;
      };

      rows
        .filter(
          (row) =>
            row.top > header.top + 3 &&
            row.top < nextHeaderTop - 3 &&
            row.top < page.height * 0.95,
        )
        .forEach((row) => {
          const text = rowText(row).toLowerCase();
          if (/^question\b/.test(text) && /\banswer\b/.test(text)) return;
          const join = (words: PdfWord[]) =>
            words
              .map((word) => word.text)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();
          const questionCell = join(row.words.filter((word) => word.x < answerStart));
          const point: SchemePoint = {
            answer: join(
              row.words.filter((word) => word.x >= answerStart && word.x < marksStart),
            ),
            marks: join(
              row.words.filter((word) => word.x >= marksStart && word.x < guidanceStart),
            ),
            guidance: join(row.words.filter((word) => word.x >= guidanceStart)),
          };
          const compactQuestion = questionCell.toLowerCase().replace(/\s+/g, "");
          const validQuestionCell =
            /^(?:\d{1,2}[a-z]?|\d{1,2})?(?:\([a-z]+\)){0,2}$/i.test(compactQuestion) &&
            /[\d(]/.test(compactQuestion);
          if (!validQuestionCell) {
            if (active) {
              active.points.push(point);
              active.answerWords.push(
                ...row.words.filter(
                  (word) => word.x >= answerStart && word.x < marksStart,
                ),
              );
            }
            return;
          }

          const main = compactQuestion.match(/^\d{1,2}/)?.[0] || "";
          const bareLetter = compactQuestion.match(/^\d{1,2}([a-z])(?=\(|$)/i)?.[1]?.toLowerCase() || "";
          const parts = Array.from(
            compactQuestion.matchAll(/\(([a-z]+)\)/gi),
            (match) => match[1].toLowerCase(),
          );
          if (main) {
            if (main !== carriedMain) carriedLetter = "";
            carriedMain = main;
          }
          let letter = "";
          let roman = "";
          if (bareLetter) {
            letter = bareLetter;
            roman = parts[0] || "";
          } else if (parts.length >= 2) [letter, roman] = parts;
          else if (parts.length === 1) {
            if (!main && carriedLetter && romanPart.test(parts[0])) roman = parts[0];
            else letter = parts[0];
          }
          if (letter) carriedLetter = letter;
          if (!carriedMain) return;
          finishActive();
          active = {
            label: canonicalQuestionLabel(
              `${carriedMain}${letter || carriedLetter ? `(${letter || carriedLetter})` : ""}${roman ? `(${roman})` : ""}`,
            ),
            points: [point],
            answerWords: row.words.filter(
              (word) => word.x >= answerStart && word.x < marksStart,
            ),
          };
        });
      finishActive();
    }
  }

  const merged: SchemeRow[] = [];
  resolved.forEach((row) => {
    const existing = merged.find((candidate) => candidate.label === row.label);
    if (!existing) {
      merged.push(row);
      return;
    }
    existing.points = uniqueSchemePoints([...existing.points, ...row.points]);
    existing.answer ||= row.answer;
    existing.marks = inferMarks(existing.points);
    existing.guidance = [existing.guidance, row.guidance]
      .filter(Boolean)
      .filter((value, index, all) => all.indexOf(value) === index)
      .join("\n")
      .slice(0, 3000);
  });
  return merged;
}

function extractPaperMarkers(
  pages: PdfPageData[],
  expectedRows: SchemeRow[],
  subject: CambridgeSubject,
): Marker[] {
  const expected = new Set(expectedRows.map((row) => row.label));
  const expectedMains = Array.from(
    new Set(expectedRows.map((row) => labelParts(row.label).main).filter(Boolean)),
  );
  const markers: Marker[] = [];
  let currentMain = "";
  let currentLetter = "";
  let mainTop: { page: number; top: number } | undefined;
  let letterTop: { page: number; top: number } | undefined;

  for (const page of pages) {
    const fullPageText = page.words
      .map((word) => word.text)
      .join(" ")
      .replace(/\s+/g, " ");
    // Cover pages contain values such as "1 hour" and paper codes such as
    // 3142/01 in the same left margin used by real question numbers. They are
    // metadata, not questions, and must not claim the first expected label.
    if (
      /\bINSTRUCTIONS\b/i.test(fullPageText) &&
      /\bINFORMATION\b/i.test(fullPageText) &&
      /\btotal mark\b/i.test(fullPageText)
    ) {
      continue;
    }
    const rows = groupRows(
      {
        ...page,
        words: page.words.filter((word) => word.horizontal !== false),
      },
      4,
    ).filter(
      (row) => row.top > page.height * 0.055 && row.top < page.height * 0.95,
    );
    for (const row of rows) {
      const ordered = row.words;
      const left = ordered.filter(
        (word) => word.x >= page.width * 0.02 && word.x < page.width * 0.24,
      );
      if (!left.length) continue;
      const first = left[0];
      const mainLimit = page.width * 0.115;
      // Roman subparts in some 0580 layouts begin at about 16.1% of the page.
      // The scheme-label allowlist protects this wider band from table values.
      const partLimit = page.width * (subject === "Physics" ? 0.22 : 0.18);
      if (first.x > partLimit) continue;
      const compact = left
        .map((word) => word.text)
        .join("")
        .toLowerCase()
        .replace(/\s+/g, "");
      const firstText = first.text.toLowerCase().replace(/\s+/g, "");
      const mainMatch =
        first.x < mainLimit ? firstText.match(/^(\d{1,2})(?![.\d])/) : null;
      const main = mainMatch?.[1] || "";
      if (main) {
        const expectedMainIndex = expectedMains.indexOf(currentMain);
        const nextMain = expectedMains[expectedMainIndex + 1] || expectedMains[0];
        if ((!currentMain && main !== expectedMains[0]) || (currentMain && main !== currentMain && main !== nextMain)) {
          continue;
        }
        if (main !== currentMain) {
          currentMain = main;
          currentLetter = "";
          mainTop = { page: page.pageNumber, top: row.top / page.height };
          letterTop = undefined;
        }
      }
      if (!currentMain) continue;
      const remainder = main ? compact.slice(main.length) : compact;
      const partPrefix =
        remainder.match(/^((?:\((?:[a-z]|i{1,3}|iv|v|vi{0,3}|ix|x)\)){1,2})/)?.[1] || "";
      const parts = Array.from(
        partPrefix.matchAll(/\(([a-z]|i{1,3}|iv|v|vi{0,3}|ix|x)\)/g),
        (match) => match[1].toLowerCase(),
      );
      let candidate = currentMain;
      let letter = currentLetter;
      let roman = "";
      if (parts.length >= 2) {
        [letter, roman] = parts;
        currentLetter = letter;
        letterTop = { page: page.pageNumber, top: row.top / page.height };
      } else if (parts.length === 1) {
        const part = parts[0];
        const nested = currentLetter && expected.has(`${currentMain}(${currentLetter})(${part})`);
        if (nested) roman = part;
        else {
          letter = part;
          currentLetter = part;
          letterTop = { page: page.pageNumber, top: row.top / page.height };
        }
      }
      if (letter) candidate += `(${letter})`;
      if (roman) candidate += `(${roman})`;
      candidate = canonicalQuestionLabel(candidate);
      if (!expected.has(candidate)) {
        if (main && expected.has(currentMain)) candidate = currentMain;
        else continue;
      }
      if (markers.some((marker) => marker.label === candidate)) continue;
      const partsOfCandidate = labelParts(candidate);
      let cropTop = row.top / page.height;
      const firstForMain = !markers.some((marker) => marker.main === partsOfCandidate.main);
      const firstForLetter =
        !!partsOfCandidate.letter &&
        !markers.some(
          (marker) =>
            marker.main === partsOfCandidate.main && marker.letter === partsOfCandidate.letter,
        );
      if (firstForMain && mainTop?.page === page.pageNumber) cropTop = mainTop.top;
      else if (firstForLetter && letterTop?.page === page.pageNumber) cropTop = letterTop.top;
      markers.push({
        label: candidate,
        main: partsOfCandidate.main,
        letter: partsOfCandidate.letter,
        roman: partsOfCandidate.roman,
        page: page.pageNumber,
        top: row.top / page.height,
        cropTop,
      });
    }
  }
  return markers;
}

function lowerSecondaryUnit(text: string, stage: number) {
  const stage8 = [
    ["s8-u13", /probability|chance|outcome|spinner|die|dice/i],
    ["s8-u6", /questionnaire|sample|survey|collect(?:ing)? data/i],
    ["s8-u16", /mean|median|mode|range|frequency|stem(?:-and-| and )leaf|data|chart|table/i],
    ["s8-u14", /translation|reflection|rotation|enlargement|transformation|symmetr|coordinate/i],
    ["s8-u15", /perimeter|area|volume|surface area|length|distance|capacity|cm|mm|metre/i],
    ["s8-u5", /angle|parallel|perpendicular|construct|bearing/i],
    ["s8-u8", /polygon|triangle|quadrilateral|shape|congruent/i],
    ["s8-u11", /graph|gradient|axis|axes|plot/i],
    ["s8-u9", /sequence|term|function|mapping|rule/i],
    ["s8-u2", /equation|inequalit|expression|formula|factoris|expand|simplif|substitut|algebra|\bx\b|\by\b/i],
    ["s8-u10", /percent/i],
    ["s8-u12", /ratio|proportion|rate|scale/i],
    ["s8-u7", /fraction|mixed number|numerator|denominator/i],
    ["s8-u4", /decimal/i],
    ["s8-u3", /round|place value|estimate|significant figure/i],
    ["s8-u1", /integer|prime|factor|multiple|square|cube|root|power|index|negative|positive/i],
  ] as const;
  const stage9 = [
    ["s9-u12", /probability|chance|outcome|spinner|die|dice/i],
    ["s9-u6", /questionnaire|sample|survey|collect(?:ing)? data/i],
    ["s9-u15", /mean|median|mode|range|frequency|stem(?:-and-| and )leaf|data|chart|table/i],
    ["s9-u13", /translation|reflection|rotation|enlargement|transformation|vector|coordinate/i],
    ["s9-u14", /volume|surface area|symmetr/i],
    ["s9-u7", /perimeter|area|length|distance|shape|polygon|triangle|quadrilateral|construct/i],
    ["s9-u5", /angle|parallel|perpendicular|bearing/i],
    ["s9-u10", /graph|gradient|axis|axes|plot/i],
    ["s9-u9", /sequence|term|function|mapping|rule/i],
    ["s9-u4", /equation|inequalit|solve/i],
    ["s9-u2", /expression|formula|factoris|expand|simplif|substitut|algebra|\bx\b|\by\b/i],
    ["s9-u3", /decimal|percent|round|estimate|significant figure/i],
    ["s9-u11", /ratio|proportion|rate|scale/i],
    ["s9-u8", /fraction|mixed number|numerator|denominator/i],
    ["s9-u1", /integer|prime|factor|multiple|square|cube|root|power|index|number/i],
  ] as const;
  const rules = stage === 8 ? stage8 : stage9;
  return rules.find(([, pattern]) => pattern.test(text))?.[0] || (stage === 8 ? "s8-u1" : "s9-u1");
}

function topicFor(subject: CambridgeSubject, text: string, lowerSecondaryStage?: number | null) {
  if (lowerSecondaryStage === 8 || lowerSecondaryStage === 9) {
    return lowerSecondaryUnit(text, lowerSecondaryStage);
  }
  const rules =
    subject === "Physics"
      ? ([
          ["Forces and motion", /speed|velocity|acceleration|force|momentum|distance|time|motion/i],
          ["Energy, work and power", /energy|work|power|efficiency/i],
          ["Thermal physics", /temperature|thermal|heat|evaporation|gas|pressure/i],
          ["Waves, light and sound", /wave|light|lens|reflection|refraction|sound|frequency|wavelength/i],
          ["Electricity and magnetism", /current|voltage|resistance|circuit|charge|magnet|transformer/i],
          ["Atomic and nuclear physics", /atom|nuclear|radioactive|radiation|half-life|isotope/i],
        ] as const)
      : ([
          ["Number", /number|fraction|decimal|percentage|ratio|standard form/i],
          ["Algebra", /equation|expression|factor|expand|sequence|function|algebra/i],
          ["Geometry and measure", /angle|shape|polygon|circle|length|area|volume|bearing/i],
          ["Graphs and coordinate geometry", /graph|coordinate|gradient|line|curve/i],
          ["Statistics and probability", /mean|median|mode|probability|frequency|histogram|data/i],
        ] as const);
  return rules.find(([, pattern]) => pattern.test(text))?.[0] || "General skills";
}

export function analysePaperWithMarkScheme(
  paperPages: PdfPageData[],
  schemeRows: SchemeRow[],
  subject: CambridgeSubject,
  paperMode: CambridgePaperMode,
  lowerSecondaryStage?: number | null,
) {
  const markers = extractPaperMarkers(paperPages, schemeRows, subject);
  const markerByLabel = new Map(markers.map((marker) => [marker.label, marker]));
  const missingLabels = schemeRows
    .map((row) => row.label)
    .filter((label) => !markerByLabel.has(label));
  const questions: DetectedQuestion[] = [];

  schemeRows.forEach((schemeRow) => {
    const marker = markerByLabel.get(schemeRow.label);
    if (!marker) return;
    const page = paperPages.find((candidate) => candidate.pageNumber === marker.page);
    if (!page) return;
    const later = schemeRows
      .slice(schemeRows.indexOf(schemeRow) + 1)
      .map((row) => markerByLabel.get(row.label))
      .find((candidate) => candidate?.page === marker.page);
    const bottom = later ? Math.max(marker.cropTop + 0.07, later.cropTop - 0.006) : 0.965;
    const words = page.words.filter((word) => {
      const top = word.top / page.height;
      return top >= marker.cropTop && top <= bottom;
    });
    const instruction = words.map((word) => word.text).join(" ");
    const answerLineRows = groupRows({ ...page, words }, 4);
    const dottedLines = answerLineRows.filter((row) => /\.{5,}|_{5,}/.test(rowText(row))).length;
    const drawing = /\b(draw|shade|sketch|plot|construct|complete (?:the )?(?:[a-z-]+ )*(?:graph|diagram|table|circuit|figure)|mark (?:on|the)|show on the (?:grid|diagram)|join|add (?:to|on)|label (?:the|on))\b/i.test(
      instruction,
    );
    const calculate = /\b(calculate|find the (?:value|magnitude)|show that)\b/i.test(instruction);
    questions.push({
      label: schemeRow.label,
      marks: schemeRow.marks,
      page_number: marker.page,
      crop_x: 0.025,
      crop_y: Math.max(0.02, marker.cropTop - 0.006),
      crop_width: 0.95,
      crop_height: Math.max(0.075, Math.min(0.95 - marker.cropTop, bottom - marker.cropTop)),
      response_type:
        paperMode === "multiple_choice" ? "multiple_choice" : drawing ? "drawing" : "typed",
      answer_slots: Math.max(1, Math.min(4, dottedLines || 1)),
      response_layout:
        subject === "Physics" && calculate ? "formula" : "answer",
      expected_answer: drawing
        ? "Diagram response - teacher review required"
        : schemeRow.answer || null,
      mark_scheme_notes:
        schemeRow.guidance ||
        (drawing
          ? "The accepted response is shown graphically in the mark scheme and must be checked by the teacher."
          : null),
      topic: topicFor(subject, instruction, lowerSecondaryStage),
    });
  });

  return {
    questions,
    expectedLabels: schemeRows.map((row) => row.label),
    detectedLabels: markers.map((marker) => marker.label),
    missingLabels,
  };
}
