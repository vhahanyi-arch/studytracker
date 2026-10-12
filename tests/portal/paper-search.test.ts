import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesPaperSearch } from "../../lib/paper-search";

const paper = { title: "0625/42 May/June", subject: "Physics", syllabus: "IGCSE 0625", class_name: "Year 10 Blue" };

test("an empty search shows every paper", () => {
  assert.equal(matchesPaperSearch(paper, ""), true);
  assert.equal(matchesPaperSearch(paper, "   "), true);
});

test("every word must appear in the title, subject, syllabus or class, in any case", () => {
  assert.equal(matchesPaperSearch(paper, "may"), true);
  assert.equal(matchesPaperSearch(paper, "PHYSICS blue"), true);
  assert.equal(matchesPaperSearch(paper, "igcse 0625"), true);
  assert.equal(matchesPaperSearch(paper, "physics red"), false);
  assert.equal(matchesPaperSearch(paper, "chemistry"), false);
});

test("a paper without a class still matches on its other fields", () => {
  assert.equal(matchesPaperSearch({ ...paper, class_name: null }, "physics"), true);
  assert.equal(matchesPaperSearch({ ...paper, class_name: undefined }, "blue"), false);
});
