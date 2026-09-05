export type PhysicsQuestion = {
  templateId?: string;
  objective?: string;
  difficulty?: "foundational" | "application" | "reasoning";
  answerFormat?: string;
  prompt: string;
  answers: string[];
  hint: string;
  solution: string;
};

const r = (min:number,max:number) => Math.floor(Math.random()*(max-min+1))+min;
const q = (prompt:string,answer:string|string[],hint:string,solution:string,meta?:Partial<Pick<PhysicsQuestion,"templateId"|"objective"|"difficulty">>):PhysicsQuestion => ({prompt,answers:Array.isArray(answer)?answer:[answer],hint,solution,...meta});
const sq = (templateId:string,objective:string,difficulty:"foundational"|"application"|"reasoning",prompt:string,answer:string|string[],hint:string,solution:string) => q(prompt,answer,hint,solution,{templateId,objective,difficulty});
const tidy = (value:unknown) => String(value??"").trim().toLowerCase().replace(/\s+/g,"").replace(/[−–—]/g,"-").replace(/[×·]/g,"*").replace(/÷/g,"/").replace(/[°]/g,"").replace(/,/g,"");

export function answerMatches(input:unknown,accepted:string[]) {
  const actual=tidy(input);
  if(!actual)return false;
  return accepted.some(expected=>{
    const clean=tidy(expected);
    if(actual===clean)return true;
    if (/[,<;]/.test(String(expected))) {
      const sequence = (value: unknown) => String(value ?? "")
        .replace(/[−–—]/g, "-")
        .match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      const actualSequence = sequence(input);
      const expectedSequence = sequence(expected);
      if (actualSequence.length >= 2 && actualSequence.length === expectedSequence.length &&
          actualSequence.every((value,index)=>Math.abs(value-expectedSequence[index])<0.0001)) return true;
    }
    const a=Number(actual),b=Number(clean);
    return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=Math.max(0.0001,Math.abs(b)*0.001);
  });
}

export function answerFormatFor(question: PhysicsQuestion) {
  if (question.answerFormat) return question.answerFormat;
  const prompt = question.prompt.toLowerCase();
  if (/scalar or vector|systematic or random/.test(prompt))
    return "Enter the single word requested.";
  if (/si unit|which instrument/.test(prompt))
    return "Enter the name of the unit or instrument requested.";
  return "Enter the final numeric answer only, including units where shown.";
}

function validateUnitSet(questions: PhysicsQuestion[], difficulty: string) {
  const prompts = new Set<string>();
  for (const question of questions) {
    if (!question.templateId || !question.objective || question.difficulty !== difficulty)
      throw new Error(`${question.templateId} is incomplete.`);
    if (prompts.has(question.prompt)) throw new Error(`${question.templateId} generated a duplicate prompt.`);
    prompts.add(question.prompt);
  }
  return questions;
}

// ---------- IGCSE Unit 1: Physical Quantities & Measurement ----------
const SI_UNITS = [
  { qty: "length", unit: ["metre","metres","m"] },
  { qty: "mass", unit: ["kilogram","kilograms","kg"] },
  { qty: "time", unit: ["second","seconds","s"] },
  { qty: "electric current", unit: ["ampere","amperes","amp","amps","a"] },
  { qty: "temperature", unit: ["kelvin","k"] },
];
const SCALAR_QUANTITIES = ["mass","time","temperature","energy","speed","distance","density"];
const VECTOR_QUANTITIES = ["force","velocity","displacement","acceleration","momentum","weight"];

const structuredIgcseMeasurement = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const cm1=r(2,20)*10,m1=cm1/100;
    const g2=r(2,20)*100,kg2=g2/1000;
    const ms3=r(2,20)*100,s3=ms3/1000;
    const ml4=r(2,20)*100,l4=ml4/1000;
    const siPick=SI_UNITS[r(0,SI_UNITS.length-1)];
    const isVector=r(0,1)===1,pool=isVector?VECTOR_QUANTITIES:SCALAR_QUANTITIES,quantityPick=pool[r(0,pool.length-1)];
    return validateUnitSet([
      sq("igcse-u1-f1","Convert centimetres to metres",difficulty,`Convert ${cm1} cm to metres.`,String(m1),"Divide by 100 to convert cm to m.",`${cm1}÷100=${m1} m.`),
      sq("igcse-u1-f2","Convert grams to kilograms",difficulty,`Convert ${g2} g to kilograms.`,String(kg2),"Divide by 1000 to convert g to kg.",`${g2}÷1000=${kg2} kg.`),
      sq("igcse-u1-f3","Convert milliseconds to seconds",difficulty,`Convert ${ms3} ms to seconds.`,String(s3),"Divide by 1000 to convert ms to s.",`${ms3}÷1000=${s3} s.`),
      sq("igcse-u1-f4","Convert millilitres to litres",difficulty,`Convert ${ml4} ml to litres.`,String(l4),"Divide by 1000 to convert ml to l.",`${ml4}÷1000=${l4} l.`),
      sq("igcse-u1-f5","Identify an SI unit",difficulty,`What is the SI unit for ${siPick.qty}?`,siPick.unit,"Recall the base SI unit for this quantity.",`The SI unit for ${siPick.qty} is the ${siPick.unit[0]}.`),
      sq("igcse-u1-f6","Classify a quantity as scalar or vector",difficulty,`Is ${quantityPick} a scalar or vector quantity?`,isVector?"vector":"scalar","A vector has direction; a scalar does not.",`${quantityPick} is a ${isVector?"vector":"scalar"} quantity.`),
    ], difficulty);
  }
  if (difficulty === "application") {
    const t1=r(20,80)/10,t2=r(20,80)/10,t3=r(20,80)/10,avg1=Math.round(((t1+t2+t3)/3)*100)/100;
    const massG2=r(2,20)*100,massKg2=massG2/1000;
    const instrumentOptions=[
      { desc:"the diameter of a thin wire", answer:["micrometer","micrometerscrewgauge","micrometer screw gauge"] },
      { desc:"the length of a metre-long table", answer:["metrerule","metre rule","ruler"] },
      { desc:"the external diameter of a test tube", answer:["vernier","verniercalipers","vernier calipers"] },
    ];
    const instrumentPick=instrumentOptions[r(0,instrumentOptions.length-1)];
    const microReading4Raw=r(1000,9999),microReading4Rounded=Math.round(microReading4Raw/10)/100;
    const errorTypeOptions=[
      { desc:"a badly calibrated instrument that reads 2 g too high every time", answer:["systematic"] },
      { desc:"a student's reaction time varying slightly each time they press a stopwatch", answer:["random"] },
    ];
    const errorPick=errorTypeOptions[r(0,errorTypeOptions.length-1)];
    const distanceKm6=r(2,20),distanceM6=distanceKm6*1000;
    return validateUnitSet([
      sq("igcse-u1-a1","Find an average from repeated readings",difficulty,`A student times a swinging pendulum three times: ${t1} s, ${t2} s, ${t3} s. Find the average time.`,String(avg1),"Add the readings, then divide by 3.",`(${t1}+${t2}+${t3})÷3=${avg1} s.`),
      sq("igcse-u1-a2","Convert a measured mass for use in a formula",difficulty,`An object has a mass of ${massG2} g. Convert this to kilograms for use in a formula.`,String(massKg2),"Divide by 1000 to convert g to kg.",`${massG2}÷1000=${massKg2} kg.`),
      sq("igcse-u1-a3","Choose an appropriate measuring instrument",difficulty,`Which instrument is best for measuring ${instrumentPick.desc}?`,instrumentPick.answer,"Match the instrument's precision to the size of the object.",`The most suitable instrument is a ${instrumentPick.answer[2]}.`),
      sq("igcse-u1-a4","Round a reading to an instrument's precision",difficulty,`A micrometer screw gauge measures to the nearest 0.01 mm. A raw reading shows ${(microReading4Raw/1000).toFixed(3)} mm. State this to the correct precision (2 decimal places).`,microReading4Rounded.toFixed(2),"Round to 2 decimal places, matching the instrument's precision.",`${(microReading4Raw/1000).toFixed(3)} rounds to ${microReading4Rounded.toFixed(2)} mm.`),
      sq("igcse-u1-a5","Classify a source of measurement error",difficulty,`A measurement error is caused by ${errorPick.desc}. Is this a systematic or random error?`,errorPick.answer,"Systematic errors are consistent; random errors vary unpredictably.",`This is a ${errorPick.answer[0]} error.`),
      sq("igcse-u1-a6","Convert kilometres to metres",difficulty,`A journey is ${distanceKm6} km long. Convert this distance to metres.`,String(distanceM6),"Multiply by 1000 to convert km to m.",`${distanceKm6}×1000=${distanceM6} m.`),
    ], difficulty);
  }
  const cm1=r(2,20)*10,m2Ans1=(cm1*cm1)/10000;
  const cm2=r(2,15)*10,m3Ans2=(cm2*cm2*cm2)/1000000;
  const cm3=r(2,20)*10,wrongM3=cm3/10,correctM3=cm3/100;
  const readings4=[r(20,30)/10,r(20,30)/10,r(45,55)/10];
  const massKg5=r(2,20),badZeroReading5=massKg5+0.5;
  const cm6=r(2,20)*10,mm6=cm6*10;
  return validateUnitSet([
    sq("igcse-u1-r1","Convert area units correctly",difficulty,`A square has sides of ${cm1} cm. Find its area in m² (remember: area units scale by the square of the length conversion).`,String(m2Ans1),"Convert the side length to metres first, then square it.",`(${cm1}÷100)²=${m2Ans1} m².`),
    sq("igcse-u1-r2","Convert volume units correctly",difficulty,`A cube has sides of ${cm2} cm. Find its volume in m³ (remember: volume units scale by the cube of the length conversion).`,String(m3Ans2),"Convert the side length to metres first, then cube it.",`(${cm2}÷100)³=${m3Ans2} m³.`),
    sq("igcse-u1-r3","Correct a unit conversion error",difficulty,`A learner converts ${cm3} cm to metres by dividing by 10, getting ${wrongM3}. Enter the correct value in metres.`,String(correctM3),"Converting cm to m requires dividing by 100, not 10.",`${cm3}÷100=${correctM3} m.`),
    sq("igcse-u1-r4","Identify an anomalous reading",difficulty,`A student takes three readings of a swinging pendulum: ${readings4[0]} s, ${readings4[1]} s, ${readings4[2]} s. One reading looks anomalous. Which reading should be treated with suspicion (state its value)?`,String(readings4[2]),"Look for the reading that differs noticeably from the others.",`${readings4[2]} s stands out from the other two readings.`),
    sq("igcse-u1-r5","Correct for a systematic zero error",difficulty,`A balance always reads ${badZeroReading5-massKg5} kg too high due to a zero error. A student records a mass of ${badZeroReading5} kg. Find the true mass.`,String(massKg5),"Subtract the zero error from the recorded reading.",`${badZeroReading5}−${badZeroReading5-massKg5}=${massKg5} kg.`),
    sq("igcse-u1-r6","Convert centimetres to millimetres",difficulty,`Convert ${cm6} cm to millimetres.`,String(mm6),"Multiply by 10 to convert cm to mm.",`${cm6}×10=${mm6} mm.`),
  ], difficulty);
};

const igcseTopics: Record<string,(difficulty:"foundational"|"application"|"reasoning")=>PhysicsQuestion[]> = {
  "igcse-u1": structuredIgcseMeasurement,
};

const asTopics: Record<string,(difficulty:"foundational"|"application"|"reasoning")=>PhysicsQuestion[]> = {
};

export function supportsPhysicsUnit(level: string, chapter: string) {
  return level === "igcse" ? Object.prototype.hasOwnProperty.call(igcseTopics, chapter)
    : level === "as" ? Object.prototype.hasOwnProperty.call(asTopics, chapter)
    : false;
}

export function makePhysicsQuestions(level: string, chapter: string, difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] {
  const table = level === "igcse" ? igcseTopics : level === "as" ? asTopics : null;
  const generator = table?.[chapter];
  if (!generator) throw new Error(`No question engine for ${level}/${chapter}.`);
  return generator(difficulty);
}
