import { stageUnits } from "./lower-secondary/units";
import { makeSet, type Tier } from "./lower-secondary/engine";

export type MasteryQuestion = {
  templateId?: string;
  /** Framework objective codes the question assesses (Stage 8 and 9). */
  codes?: string[];
  objective?: string;
  difficulty?: "foundational" | "application" | "reasoning";
  answerFormat?: string;
  prompt: string;
  answers: string[];
  hint: string;
  solution: string;
  source?: { assignmentId:string; label:string; pageNumber:number; cropX:number; cropY:number; cropWidth:number; cropHeight:number; title:string };
};

const r = (min:number,max:number) => Math.floor(Math.random()*(max-min+1))+min;
const q = (prompt:string,answer:string|string[],hint:string,solution:string,meta?:Partial<Pick<MasteryQuestion,"templateId"|"objective"|"difficulty">>):MasteryQuestion => ({prompt,answers:Array.isArray(answer)?answer:[answer],hint,solution,...meta});
const sq = (templateId:string,objective:string,difficulty:"foundational"|"application"|"reasoning",prompt:string,answer:string|string[],hint:string,solution:string) => q(prompt,answer,hint,solution,{templateId,objective,difficulty});
const tidy = (value:unknown) => String(value??"").trim().toLowerCase().replace(/\s+/g,"").replace(/[−–—]/g,"-").replace(/[×·]/g,"*").replace(/÷/g,"/").replace(/[°]/g,"").replace(/,/g,"");

// A mixed number keeps its space: "2 1/3" and "21/3" are different numbers,
// but tidy() strips all whitespace, which made them compare equal. Marking
// the whole-number part off with "+" first keeps them apart.
const mixed = (value:unknown) => String(value??"").replace(/(\d+)\s+(\d+\/\d+)/g,"$1+$2");

// The answer box tells students they may include the unit shown in the
// question, but "37.7cm", "R45" and "25%" never compared equal to a numeric
// answer. A number with a known unit or currency sign is read as the number.
// Only these units are removed, so "2x" is still not taken for 2.
const UNIT=/^(?:r|\$|£)?(-?\d+(?:\.\d+)?)(?:mm|cm|km|m|mg|kg|g|ml|l|litres?|s|seconds?|mins?|minutes?|h|hours?|km\/h|m\/s|mph|miles?|(?:mm|cm|km|m)(?:²|³|\^2|\^3)|degrees?|%|rand)?$/;
const withoutUnit=(tidied:string)=>tidied.match(UNIT)?.[1]??tidied;

export function answerMatches(input:unknown,accepted:string[]) {
  const actual=tidy(mixed(input));
  if(!actual)return false;
  return accepted.some(expected=>{
    const clean=tidy(mixed(expected));
    if(actual===clean)return true;
    // Ordered lists and coordinates may be written with commas, semicolons,
    // spaces or inequality symbols. Compare their numeric entries in order.
    if (/[,<;]/.test(String(expected))) {
      const sequence = (value: unknown) => String(value ?? "")
        .replace(/[−–—]/g, "-")
        .match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      const actualSequence = sequence(input);
      const expectedSequence = sequence(expected);
      if (actualSequence.length >= 2 && actualSequence.length === expectedSequence.length &&
          actualSequence.every((value,index)=>Math.abs(value-expectedSequence[index])<0.0001)) return true;
    }
    const a=Number(withoutUnit(actual)),b=Number(clean);
    return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=Math.max(1e-9,Math.abs(b)*0.001);
  });
}

export function answerFormatFor(question: MasteryQuestion) {
  if (question.answerFormat) return question.answerFormat;
  const prompt = question.prompt.toLowerCase();
  if (/ascending|descending|order/.test(prompt))
    return "Enter every value in order. Separate values with commas; < or > signs are also accepted. Example: -4, 0, 3";
  if (/coordinate|reflect|translate|rotate/.test(prompt) && /\(|coordinate/.test(prompt))
    return "Enter the coordinate as (x, y). Example: (3, -2)";
  if (/three-figure bearing/.test(prompt))
    return "Enter exactly three digits. Example: 047";
  if (/simplify|expand|factorise|subject|write the .*expression|bracketed expression/.test(prompt))
    return "Enter the final algebraic expression. Spaces are optional.";
  if (/name|which average|which graph|which sampling|correlation|yes or no/.test(prompt))
    return "Enter the mathematical word, name, or yes/no answer requested.";
  if (/percentage|%/.test(prompt))
    return "Enter the final value. You may include the % sign when appropriate.";
  return "Enter the final answer only. You may include the unit shown in the question.";
}

function validateStructuredSet(questions: MasteryQuestion[], chapter: string, difficulty: string) {
  if (questions.length !== 6) throw new Error(`${chapter} ${difficulty} must generate exactly 6 questions.`);
  const prompts = new Set<string>();
  for (const question of questions) {
    if (!question.templateId || !question.objective || question.difficulty !== difficulty)
      throw new Error(`${chapter} ${difficulty} has incomplete template metadata.`);
    if (!question.prompt.trim() || !question.hint.trim() || !question.solution.trim() || !question.answers.some((answer) => String(answer).trim()))
      throw new Error(`${question.templateId} is incomplete.`);
    if (prompts.has(question.prompt)) throw new Error(`${question.templateId} generated a duplicate prompt.`);
    prompts.add(question.prompt);
  }
  return questions;
}

// Stage 7 integers, the only Stage 7 unit with practice so far. It kept the
// "s8-u1" ids of the generator it came from; its own ids stop its results
// being mixed up with the rebuilt Stage 8 unit.
const stage7Integers = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const a=r(8,24),b=r(3,12),negative=-r(3,15),factor=r(3,8);
    return [
      sq("s7-integers-f1","Add directed numbers",difficulty,`Calculate ${a} + (${negative}).`,String(a+negative),"Adding a negative is the same as subtracting its magnitude.",`${a}+(${negative})=${a+negative}.`),
      sq("s7-integers-f2","Subtract directed numbers",difficulty,`Calculate ${b} - (${negative}).`,String(b-negative),"Subtracting a negative becomes addition.",`${b}-(${negative})=${b-negative}.`),
      sq("s7-integers-f3","Multiply directed numbers",difficulty,`Calculate (${negative}) × ${factor}.`,String(negative*factor),"A negative multiplied by a positive is negative.",`${negative}×${factor}=${negative*factor}.`),
      sq("s7-integers-f4","Order directed numbers",difficulty,"Write −7, 3, −2 and 0 in ascending order.",["-7,-2,0,3","−7,−2,0,3"],"Start with the value furthest left on a number line.","−7 < −2 < 0 < 3."),
      sq("s7-integers-f5","Use factors and multiples",difficulty,"Find the highest common factor of 24 and 36.","12","List the factors common to both numbers.","The greatest shared factor is 12."),
      sq("s7-integers-f6","Use powers and roots",difficulty,"Evaluate 5² − √81.","16","Evaluate the power and root before subtracting.","5²−√81=25−9=16."),
    ];
  }
  if (difficulty === "application") {
    const start=r(-8,4),rise=r(6,14),debt=r(18,45),payment=r(5,17);
    return [
      sq("s7-integers-a1","Apply directed numbers to temperature",difficulty,`The temperature is ${start}°C and rises by ${rise}°C. Find the new temperature.`,String(start+rise),"Represent the rise with addition.",`${start}+${rise}=${start+rise}°C.`),
      sq("s7-integers-a2","Apply directed numbers to money",difficulty,`An account balance is −R${debt}. A deposit of R${payment} is made. Find the new balance in rand.`,String(-debt+payment),"A deposit moves the balance in the positive direction.",`−${debt}+${payment}=${-debt+payment}.`),
      sq("s7-integers-a3","Apply directed numbers to elevation",difficulty,"A diver is 18 m below sea level and descends another 7 m. What is the diver's elevation relative to sea level?",["-25","-25m"],"Below sea level is represented by a negative number.","−18−7=−25 m."),
      sq("s7-integers-a4","Apply order of operations",difficulty,"Evaluate 6 − 3 × (−4).","18","Complete multiplication before subtraction.","3×(−4)=−12, then 6−(−12)=18."),
      sq("s7-integers-a5","Use common multiples",difficulty,"Two lights flash every 6 seconds and every 8 seconds. After how many seconds will they next flash together?",["24","24seconds","24s"],"Find the lowest common multiple of 6 and 8.","LCM(6,8)=24, so they flash together after 24 seconds."),
      sq("s7-integers-a6","Use square numbers",difficulty,"A square contains 144 unit squares. How many unit squares lie along one side?","12","The side length is the square root of the area.","√144=12."),
    ];
  }
  const n=r(4,11),target=r(18,35);
  return [
    sq("s7-integers-r1","Reason with missing directed numbers",difficulty,`Complete the equation: □ + (−${n}) = ${target}.`,String(target+n),"Use the inverse operation to isolate the missing number.",`${target}−(−${n})=${target+n}.`),
    sq("s7-integers-r2","Explain directed-number errors",difficulty,"A learner says that −6 − 5 = 1. Enter the correct answer.","-11","Both movements are towards the negative side of the number line.","−6−5=−11."),
    sq("s7-integers-r3","Reason with consecutive integers",difficulty,"Three consecutive integers have a sum of 42. Find the middle integer.","14","The middle integer is the mean of three consecutive integers.","42÷3=14, so the integers are 13, 14 and 15."),
    sq("s7-integers-r4","Reason with factors",difficulty,"Find the greatest number that divides both 84 and 126 exactly.","42","This asks for the highest common factor.","HCF(84,126)=42."),
    sq("s7-integers-r5","Reason with powers",difficulty,"Find the missing exponent: 2^□ = 64.","6","Write successive powers of 2.","2⁶=64, so the exponent is 6."),
    sq("s7-integers-r6","Reason with operation order",difficulty,"Insert brackets into 8 − 3 × 2 so that the value is 10. Enter the bracketed expression.",["(8-3)*2","(8−3)×2","(8-3)x2"],"Make the subtraction happen before multiplication.","(8−3)×2=5×2=10."),
  ];
};

/** Whether a Stage 8 or 9 unit has practice. (Stage 7 integers is checked by the route.) */
export function supportsMasteryUnit(chapter:string){return Boolean(stageUnits[chapter]);}

/**
 * Six practice questions for a unit at one tier. Stage 8 and 9 units come from
 * lib/lower-secondary: pools of templates tagged with framework objectives,
 * from which each set draws six across as many objectives as it can.
 */
export function makeUnitQuestions(chapter:string,difficulty:string):MasteryQuestion[]{
  const level = (["foundational","application","reasoning"].includes(difficulty)
    ? difficulty
    : "foundational") as Tier;
  if (chapter === "s7-integers") return validateStructuredSet(stage7Integers(level), chapter, level);
  const templates = stageUnits[chapter];
  if (!templates) throw new Error(`${chapter} has no question engine`);
  return makeSet(chapter, templates, level).map(({ templateId, objective, difficulty, codes, prompt, answers, hint, solution, answerFormat }) =>
    ({ templateId, objective, difficulty, codes, prompt, answers, hint, solution, ...(answerFormat ? { answerFormat } : {}) }));
}
