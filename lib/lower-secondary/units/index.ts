// Every Stage 8 and 9 practice unit, keyed by unit id. tests/lower-secondary
// checks each against the standard and the framework.
import type { Template } from "../engine";
import { s8u1 } from "./s8-u1";
import { s8u2 } from "./s8-u2";
import { s8u3 } from "./s8-u3";
import { s8u4 } from "./s8-u4";
import { s8u7 } from "./s8-u7";
import { s8u9 } from "./s8-u9";
import { s8u10 } from "./s8-u10";
import { s8u11 } from "./s8-u11";
import { s8u12 } from "./s8-u12";

export const stageUnits: Record<string, Template[]> = {
  "s8-u1": s8u1,
  "s8-u2": s8u2,
  "s8-u3": s8u3,
  "s8-u4": s8u4,
  "s8-u7": s8u7,
  "s8-u9": s8u9,
  "s8-u10": s8u10,
  "s8-u11": s8u11,
  "s8-u12": s8u12,
};
