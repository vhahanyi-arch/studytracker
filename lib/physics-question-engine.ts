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
const LENGTH_INSTRUMENTS = [
  { name:"ruler", answers:["ruler","a ruler","metrerule","metre rule"] },
  { name:"measuring tape", answers:["measuringtape","tape measure","a tape measure"] },
];
const VOLUME_INSTRUMENT = { name:"measuring cylinder", answers:["measuringcylinder","measuring cylinder","a measuring cylinder"] };
const SCALAR_QUANTITIES2 = ["distance","speed","time","mass","energy","temperature"];
const VECTOR_QUANTITIES2 = ["force","weight","velocity","acceleration","momentum"];
const FORCE_TRIPLES: [number,number,number][] = [[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15]];

const structuredIgcseMeasurement = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const wrongOpt1=LENGTH_INSTRUMENTS[r(0,1)].name;
    const lengthInstrument3=LENGTH_INSTRUMENTS[r(0,1)];
    let scalarPick4a=SCALAR_QUANTITIES2[r(0,SCALAR_QUANTITIES2.length-1)],scalarPick4b=SCALAR_QUANTITIES2[r(0,SCALAR_QUANTITIES2.length-1)];
    while(scalarPick4b===scalarPick4a){scalarPick4b=SCALAR_QUANTITIES2[r(0,SCALAR_QUANTITIES2.length-1)];}
    const vectorPick4=VECTOR_QUANTITIES2[r(0,VECTOR_QUANTITIES2.length-1)];
    const cm5=r(2,20)*10,m5=cm5/100;
    return validateUnitSet([
      sq("igcse-u1-f1","Identify a measuring instrument (multiple choice)",difficulty,`Which instrument would you use to measure the volume of a liquid? (a) ${wrongOpt1} (b) measuring cylinder (c) thermometer (d) ammeter`,["b",...VOLUME_INSTRUMENT.answers],"A measuring cylinder has a graduated scale for reading liquid volume.","The correct answer is (b) measuring cylinder."),
      sq("igcse-u1-f2","Evaluate a statement about scalars (true/false)",difficulty,"True or false: a scalar quantity has both magnitude and direction.","false","A scalar has magnitude only; a vector has both magnitude and direction.","False — that describes a vector, not a scalar."),
      sq("igcse-u1-f3","Name a measuring instrument (short answer)",difficulty,"Name one instrument that could be used to measure the length of a table.",lengthInstrument3.answers,"Think of a common tool for measuring length.",`A ${lengthInstrument3.name} would be suitable.`),
      sq("igcse-u1-f4","Identify a vector quantity (multiple choice)",difficulty,`Which of these is a vector quantity? (a) ${scalarPick4a} (b) ${scalarPick4b} (c) ${vectorPick4} (d) volume`,["c",vectorPick4],"A vector has both magnitude and direction.",`The correct answer is (c) ${vectorPick4}.`),
      sq("igcse-u1-f5","Convert centimetres to metres",difficulty,`Convert ${cm5} cm to metres.`,String(m5),"Divide by 100 to convert cm to m.",`${cm5}÷100=${m5} m.`),
      sq("igcse-u1-f6","Evaluate a statement about resultant forces (true/false)",difficulty,"True or false: two forces acting at right angles to each other can be combined into a single resultant force.","true","Perpendicular vectors can be combined using Pythagoras' theorem.","True — this gives a single resultant force."),
    ], difficulty);
  }
  if (difficulty === "application") {
    const t1=r(20,80)/10,t2=r(20,80)/10,t3=r(20,80)/10,avg1=Math.round(((t1+t2+t3)/3)*100)/100;
    const [forceA2,forceB2,resultant2]=FORCE_TRIPLES[r(0,FORCE_TRIPLES.length-1)];
    const massG3=r(2,20)*100,massKg3=massG3/1000;
    const swingCount5=r(10,30);
    return validateUnitSet([
      sq("igcse-u1-a1","Find an average from repeated readings",difficulty,`A student times a swinging pendulum three times: ${t1} s, ${t2} s, ${t3} s. Find the average time.`,String(avg1),"Add the readings, then divide by 3.",`(${t1}+${t2}+${t3})÷3=${avg1} s.`),
      sq("igcse-u1-a2","Find a resultant force at right angles",difficulty,`Two forces of ${forceA2} N and ${forceB2} N act at right angles to each other on an object. Find the magnitude of the resultant force.`,String(resultant2),"Use Pythagoras' theorem, since the forces are perpendicular.",`√(${forceA2}²+${forceB2}²)=${resultant2} N.`),
      sq("igcse-u1-a3","Convert a measured mass for use in a formula",difficulty,`An object has a mass of ${massG3} g. Convert this to kilograms for use in a formula.`,String(massKg3),"Divide by 1000 to convert g to kg.",`${massG3}÷1000=${massKg3} kg.`),
      sq("igcse-u1-a4","Evaluate a statement about averaging readings (true/false)",difficulty,`True or false: measuring the time for ${swingCount5} swings of a pendulum and dividing by ${swingCount5} gives a more accurate value for the period than timing just one swing.`,"true","Averaging over many swings reduces the effect of timing error.","True — this is a standard technique to improve accuracy."),
      sq("igcse-u1-a5","Choose the best instrument for a short time interval (multiple choice)",difficulty,"Which instrument would give the most precise reading of a short time interval, such as one swing of a pendulum? (a) sundial (b) calendar (c) digital timer (d) metre rule",["c","digitaltimer","digital timer"],"Consider which instrument can measure fractions of a second.","The correct answer is (c) digital timer."),
      sq("igcse-u1-a6","Evaluate a statement about weight as a vector (true/false)",difficulty,"True or false: weight is a scalar quantity because it only has a size, not a direction.","false","Weight is a force, and forces are vectors — it acts in a specific direction (downward).","False — weight is a vector quantity."),
    ], difficulty);
  }
  const cm1=r(2,20)*10,wrongM1=cm1/10,correctM1=cm1/100;
  const [forceA2,forceB2,resultant2]=FORCE_TRIPLES[r(0,FORCE_TRIPLES.length-1)];
  const readings3=[r(20,30)/10,r(20,30)/10,r(45,55)/10];
  const massKg5=r(2,20),badReading5=massKg5+0.5;
  return validateUnitSet([
    sq("igcse-u1-r1","Correct a unit conversion error",difficulty,`A learner converts ${cm1} cm to metres by dividing by 10, getting ${wrongM1}. Enter the correct value in metres.`,String(correctM1),"Converting cm to m requires dividing by 100, not 10.",`${cm1}÷100=${correctM1} m.`),
    sq("igcse-u1-r2","Correct a resultant-force error",difficulty,`A student says the resultant of two perpendicular forces of ${forceA2} N and ${forceB2} N is simply ${forceA2+forceB2} N (by adding them). Enter the correct resultant force.`,String(resultant2),"Perpendicular forces combine using Pythagoras' theorem, not simple addition.",`√(${forceA2}²+${forceB2}²)=${resultant2} N.`),
    sq("igcse-u1-r3","Identify an anomalous reading",difficulty,`A student takes three readings of a swinging pendulum: ${readings3[0]} s, ${readings3[1]} s, ${readings3[2]} s. Which reading should be treated with suspicion?`,String(readings3[2]),"Look for the reading that differs noticeably from the others.",`${readings3[2]} s stands out from the other two readings.`),
    sq("igcse-u1-r4","Evaluate a statement about reducing random error (true/false)",difficulty,"True or false: using an average of several repeated readings reduces the effect of random error.","true","Averaging cancels out some of the random variation between readings.","True — averaging reduces the impact of random error."),
    sq("igcse-u1-r5","Correct for a systematic zero error",difficulty,`A balance always reads ${badReading5-massKg5} kg too high due to a zero error. A student records a mass of ${badReading5} kg. Find the true mass.`,String(massKg5),"Subtract the zero error from the recorded reading.",`${badReading5}−${badReading5-massKg5}=${massKg5} kg.`),
    sq("igcse-u1-r6","Distinguish zero error from random error (true/false)",difficulty,"True or false: a zero error on an instrument is an example of random error.","false","A zero error is consistent every time — that makes it systematic, not random.","False — a zero error is a systematic error."),
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
