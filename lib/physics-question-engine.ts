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
    // Check numeric lists BEFORE tidy removes commas: "1, 2" must not match "12".
    const sequence = (value: unknown): number[] | null => {
      const text = String(value ?? "").trim().replace(/[−–—]/g, "-");
      const number = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?";
      if (!new RegExp(`^${number}(?:\\s*[,;<]\\s*${number})+$`, "i").test(text)) return null;
      return text.split(/[,;<]/).map(Number);
    };
    const expectedSequence = sequence(expected);
    if (expectedSequence) {
      const actualSequence = sequence(input);
      return actualSequence !== null && actualSequence.length === expectedSequence.length &&
        actualSequence.every((value,index)=>Number.isFinite(value) && Math.abs(value-expectedSequence[index])<0.0001);
    }
    if(actual===clean)return true;
    const a=Number(actual),b=Number(clean);
    // Keep the promised 0.1% relative tolerance even for small values such as strain.
    // An absolute floor of 0.0001 incorrectly accepts zero for a strain of 0.0001.
    return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=Math.abs(b)*(0.001+Number.EPSILON);
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
  if (questions.length !== 6) throw new Error(`Expected 6 questions; received ${questions.length}.`);
  const prompts = new Set<string>();
  const templates = new Set<string>();
  for (const question of questions) {
    if (!question.templateId?.trim() || !question.objective?.trim() || question.difficulty !== difficulty ||
        !question.prompt.trim() || !question.hint.trim() || !question.solution.trim() ||
        !question.answers.length || question.answers.some(answer=>!answer.trim() || !answerMatches(answer,question.answers)))
      throw new Error(`${question.templateId} is incomplete.`);
    if (templates.has(question.templateId)) throw new Error(`${question.templateId} is duplicated.`);
    templates.add(question.templateId);
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

const HAZARDS = ["damaged insulation","overheating cables","damp conditions","overloading a socket"];
const HAZARD_SCENARIOS: Record<string,string> = {
  "damaged insulation": "A kettle's cable insulation has worn through, exposing bare wire.",
  "overheating cables": "An extension cable feels hot to the touch after running a heater for an hour.",
  "damp conditions": "Water has splashed onto a mains socket near a kitchen sink.",
  "overloading a socket": "Five appliances are plugged into a single multi-socket adaptor.",
};
const PARALLEL_PAIRS: [number,number,number][] = [[2,2,1],[3,6,2],[4,4,2],[6,6,3],[4,12,3],[6,3,2],[8,8,4],[9,18,6],[5,20,4],[10,10,5],[6,12,4],[8,24,6]];
const TRANSFORMER_RATIOS: [number,number][] = [[1,2],[1,3],[1,5],[2,1],[3,1],[5,1],[1,4],[4,1],[2,3],[3,2]];

const structuredMagnetism = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const poleA=["north","south"][r(0,1)];
    const useExamples=[["relay"],["electric bell"],["loudspeaker"],["electric motor"]];
    const usePick=useExamples[r(0,useExamples.length-1)];
    return validateUnitSet([
      sq("igcse-u14-f1","Predict force between like magnetic poles",difficulty,`Two ${poleA} poles are brought close together. What happens? (a) they attract (b) they repel (c) no force acts (d) they merge into one pole`,["b","repel"],"Like poles always repel each other.","The correct answer is (b) they repel."),
      sq("igcse-u14-f2","Evaluate a statement about magnet materials (true/false)",difficulty,"True or false: a permanent magnet is typically made of soft iron.","false","Permanent magnets are made of steel; soft iron is used for temporary magnets.","False — permanent magnets are typically made of steel."),
      sq("igcse-u14-f3","Name a temporary magnetic material (short answer)",difficulty,"What name is given to a magnetic material that loses its magnetism easily once removed from a magnetic field (used in electromagnets)?",["softiron","soft iron","temporary magnet"],"This material is used in electromagnets because it doesn't stay magnetised.","Soft iron loses its magnetism easily."),
      sq("igcse-u14-f4","Define magnetic field direction (multiple choice)",difficulty,"The direction of a magnetic field at a point is defined as the direction of the force on: (a) a north pole placed at that point (b) a south pole placed at that point (c) an electric current (d) the nearest magnet",["a","northpole","north pole"],"Field direction is defined using the force on a north pole.","The correct answer is (a) a north pole."),
      sq("igcse-u14-f5","Recall a method for showing field patterns (true/false)",difficulty,"True or false: iron filings can be used to show the pattern of a magnetic field.","true","Iron filings align along field lines when sprinkled near a magnet.","True — this is a standard method."),
      sq("igcse-u14-f6","Name a use of an electromagnet (short answer)",difficulty,"Name one device that makes use of an electromagnet.",usePick,"Electromagnets are used in devices that need a switchable magnetic force.",`A ${usePick[0]} uses an electromagnet.`),
    ], difficulty);
  }
  if (difficulty === "application") {
    const nonMagnetic=["copper","aluminium","wood","plastic"][r(0,3)];
    const magneticOptions=["nickel","cobalt"];
    const magPick=magneticOptions[r(0,magneticOptions.length-1)];
    const coreMaterial=r(0,1)===1?"soft iron":"steel";
    const isCorrectCore=coreMaterial==="soft iron";
    return validateUnitSet([
      sq("igcse-u14-a1","Interpret a compass reading",difficulty,"A compass needle at a certain point settles pointing in a particular direction. This shows the direction of: (a) the magnetic field at that point (b) the electric current nearby (c) gravity (d) the nearest star",["a","magneticfield","magnetic field"],"A compass aligns with the local magnetic field.","The correct answer is (a) the magnetic field."),
      sq("igcse-u14-a2","Identify a non-magnetic material",difficulty,`Which of these materials would NOT be attracted to a magnet? (a) ${magPick} (b) ${nonMagnetic} (c) iron (d) steel`,["b",nonMagnetic],"Iron, steel, nickel and cobalt are magnetic; most other materials are not.",`The correct answer is (b) ${nonMagnetic}.`),
      sq("igcse-u14-a3","Evaluate an electromagnet core choice",difficulty,`An electromagnet's core is made of ${coreMaterial}. Is this a correct choice for an electromagnet that needs to lose its magnetism quickly when switched off? Answer yes or no.`,isCorrectCore?"yes":"no","Soft iron loses magnetism quickly; steel retains it.",`${coreMaterial} is ${isCorrectCore?"a correct":"not the ideal"} choice for this purpose.`),
      sq("igcse-u14-a4","Evaluate a statement about field line spacing (true/false)",difficulty,"True or false: the closer together magnetic field lines are drawn, the stronger the magnetic field in that region.","true","Field line spacing represents field strength.","True — closer lines mean a stronger field."),
      sq("igcse-u14-a5","Explain the advantage of an electromagnet in context",difficulty,"A crane at a scrapyard uses an electromagnet to lift and then release scrap metal. Why is an electromagnet more useful here than a permanent magnet?",["itcanbeswitchedoff","can be switched off","it can be turned off"],"Unlike a permanent magnet, an electromagnet's field can be turned off.","An electromagnet can be switched off to release the metal."),
      sq("igcse-u14-a6","Evaluate a statement about induced magnetism (true/false)",difficulty,"True or false: an unmagnetised piece of iron placed near a strong magnet can become magnetised itself.","true","This is called induced magnetism.","True — this describes induced magnetism."),
    ], difficulty);
  }
  return validateUnitSet([
    sq("igcse-u14-r1","Reason about whether fields require two poles",difficulty,"A learner says a magnetic field can only exist between two magnetic poles. Is this statement correct? Answer yes or no.","no","A single magnet on its own still has a magnetic field around it.","No — a single magnet has its own surrounding field."),
    sq("igcse-u14-r2","Reason about induced magnetism in a nail",difficulty,"A steel nail is held near (but not touching) a strong bar magnet. Does the nail become magnetised? Answer yes or no.","yes","Being near a magnet's field can induce magnetism without contact.","Yes — this is induced magnetism."),
    sq("igcse-u14-r3","Recall field line direction convention",difficulty,"Outside a bar magnet, magnetic field lines point from the ___ pole to the ___ pole. Fill in both blanks in order, separated by a comma.",["north,south","north, south"],"Field lines always point away from north and toward south, outside the magnet.","Field lines run from north to south outside the magnet."),
    sq("igcse-u14-r4","Reason about current and field strength (true/false)",difficulty,"True or false: increasing the current in an electromagnet's coil increases the strength of its magnetic field.","true","More current means a stronger magnetic field.","True — increasing current strengthens the field."),
    sq("igcse-u14-r5","Evaluate a misconception about compasses",difficulty,"A learner claims that a compass works because it detects gravity. Is this correct? Answer yes or no.","no","A compass detects the Earth's magnetic field, not gravity.","No — a compass responds to magnetic fields, not gravity."),
    sq("igcse-u14-r6","Reason about detecting fields (true/false)",difficulty,"True or false: a magnetic field is only detectable using a compass, and no other method exists.","false","Iron filings, plotting compasses, and other methods can all detect fields.","False — other methods, like iron filings, can also detect fields."),
  ], difficulty);
};

const structuredElectricalQuantities = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const chargeSign1=r(0,1)===1?"positive":"negative";
    const time2=r(2,10),current2=r(2,9),charge2=time2*current2;
    const current3=r(2,9),resistance3=r(2,9),voltage3=current3*resistance3;
    const current4=r(2,9),voltage4=r(2,9),power4=current4*voltage4;
    return validateUnitSet([
      sq("igcse-u15-f1","Predict force between like charges",difficulty,`Two ${chargeSign1}ly charged objects are brought near each other. What happens? (a) they attract (b) they repel (c) no force acts (d) they become neutral`,["b","repel"],"Like charges always repel each other.","The correct answer is (b) they repel."),
      sq("igcse-u15-f2","Calculate charge from current and time",difficulty,`A current of ${current2} A flows for ${time2} s. Find the charge that passes, using Q = It.`,String(charge2),"Multiply current by time.",`${current2}×${time2}=${charge2} C.`),
      sq("igcse-u15-f3","Calculate resistance from voltage and current",difficulty,`A component has a current of ${current3} A flowing through it with a p.d. of ${voltage3} V across it. Find its resistance, using R = V/I.`,String(resistance3),"Divide voltage by current.",`${voltage3}÷${current3}=${resistance3} Ω.`),
      sq("igcse-u15-f4","Calculate power from current and voltage",difficulty,`A component has a current of ${current4} A and a p.d. of ${voltage4} V. Find the power, using P = IV.`,String(power4),"Multiply current by voltage.",`${current4}×${voltage4}=${power4} W.`),
      sq("igcse-u15-f5","Evaluate a statement about current direction (true/false)",difficulty,"True or false: conventional current flows from the negative terminal to the positive terminal of a cell.","false","Conventional current flows from positive to negative.","False — conventional current flows from positive to negative."),
      sq("igcse-u15-f6","Recall the SI unit of charge",difficulty,"What is the SI unit of electric charge?",["coulomb","coulombs","c"],"Recall the base SI unit for charge.","The SI unit of charge is the coulomb."),
    ], difficulty);
  }
  if (difficulty === "application") {
    const current1=r(2,9),voltage1=r(2,9),time1=r(2,8),energy1=current1*voltage1*time1;
    const power2=r(1,3),hours2=r(2,8),rate2=r(2,5),kwh2=power2*hours2,cost2=kwh2*rate2;
    const lengthCompare3=r(0,1)===1;
    const charge4=r(10,50),voltage4=r(2,9),workDone4=charge4*voltage4;
    const isConductor5=r(0,1)===1;
    const current6=r(2,9),time6=r(2,10),charge6=current6*time6;
    return validateUnitSet([
      sq("igcse-u15-a1","Calculate electrical energy transferred",difficulty,`A device has a current of ${current1} A and a p.d. of ${voltage1} V, and operates for ${time1} s. Find the electrical energy transferred, using E = IVt.`,String(energy1),"Multiply current, voltage and time together.",`${current1}×${voltage1}×${time1}=${energy1} J.`),
      sq("igcse-u15-a2","Calculate the cost of running an appliance",difficulty,`An appliance with a power rating of ${power2} kW runs for ${hours2} hours. Electricity costs R${rate2} per kWh. Find the total cost.`,String(cost2),"Multiply power (kW) by time (hours) to get kWh, then by the rate.",`${power2}×${hours2}×R${rate2}=R${cost2}.`),
      sq("igcse-u15-a3","Reason about wire length and resistance (true/false)",difficulty,`True or false: a longer wire (of the same material and cross-sectional area) has a ${lengthCompare3?"greater":"smaller"} resistance than a shorter one.`,lengthCompare3?"true":"false","A longer wire has more resistance, not less.",`${lengthCompare3?"True":"False"} — a longer wire has greater resistance.`),
      sq("igcse-u15-a4","Calculate work done from charge and p.d.",difficulty,`A charge of ${charge4} C passes through a component with a p.d. of ${voltage4} V across it. Find the work done, using W = QV.`,String(workDone4),"Multiply charge by p.d.",`${charge4}×${voltage4}=${workDone4} J.`),
      sq("igcse-u15-a5","Classify a material as conductor or insulator",difficulty,`A material allows electrons to move freely through it and is ${isConductor5?"":"not "}a good conductor. Is this material a conductor or an insulator?`,isConductor5?"conductor":"insulator","Free electron movement is characteristic of conductors.",`This material is a${isConductor5?"":"n"} ${isConductor5?"conductor":"insulator"}.`),
      sq("igcse-u15-a6","Calculate total charge delivered",difficulty,`A charging cable delivers a current of ${current6} A for ${time6} s. Find the total charge delivered, using Q = It.`,String(charge6),"Multiply current by time.",`${current6}×${time6}=${charge6} C.`),
    ], difficulty);
  }
  const areaCompare2=r(0,1)===1;
  const charge3=r(10,60),time3=r(2,10),wrongI3=charge3+time3,correctI3=charge3/time3;
  const power5=r(2,9),voltage5=r(2,9),current5=power5/voltage5;
  const power6=r(1,4),hours6=r(2,10),rate6=r(2,6);
  const currentReal1=r(2,9),resistReal1=r(2,9),voltageReal1=currentReal1*resistReal1;
  return validateUnitSet([
    sq("igcse-u15-r1","Correct a resistance-calculation error",difficulty,`A learner finds resistance by adding voltage and current instead of dividing, getting R = ${voltageReal1} + ${currentReal1} = ${voltageReal1+currentReal1} Ω for a component with ${voltageReal1} V and ${currentReal1} A. Enter the correct resistance.`,String(resistReal1),"Divide voltage by current, don't add them.",`${voltageReal1}÷${currentReal1}=${resistReal1} Ω.`),
    sq("igcse-u15-r2","Reason about wire thickness and resistance (true/false)",difficulty,`True or false: a thicker wire (larger cross-sectional area, same material and length) has a ${areaCompare2?"smaller":"greater"} resistance than a thinner wire.`,areaCompare2?"true":"false","A thicker wire has less resistance, since resistance is inversely proportional to cross-sectional area.",`${areaCompare2?"True":"False"} — a thicker wire has smaller resistance.`),
    sq("igcse-u15-r3","Correct a current-calculation error",difficulty,`A learner finds current by adding charge and time instead of dividing, getting I = ${charge3} + ${time3} = ${wrongI3} A for ${charge3} C passing in ${time3} s. Enter the correct current.`,String(correctI3),"Divide charge by time, don't add them.",`${charge3}÷${time3}=${correctI3} A.`),
    sq("igcse-u15-r4","Classify current type from a description",difficulty,"A power supply provides current that regularly reverses direction. Is this an example of direct current (d.c.) or alternating current (a.c.)?",["ac","alternatingcurrent","alternating current"],"Current that reverses direction is alternating current.","This is alternating current (a.c.)."),
    sq("igcse-u15-r5","Rearrange P = IV to find current",difficulty,`A device has a power rating of ${power5} W and operates at ${voltage5} V. Find the current it draws, rearranging P = IV.`,String(current5),"Divide power by voltage.",`${power5}÷${voltage5}=${current5} A.`),
    sq("igcse-u15-r6","Calculate a multi-day running cost",difficulty,`An appliance rated at ${power6} kW runs for ${hours6} hours each day. Electricity costs R${rate6} per kWh. Find the daily running cost.`,String(power6*hours6*rate6),"Multiply power, hours and rate together.",`${power6}×${hours6}×R${rate6}=R${power6*hours6*rate6}.`),
  ], difficulty);
};

const structuredElectricCircuits = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const r1a=r(2,9),r1b=r(2,9),r1c=r(2,9),seriesR1=r1a+r1b+r1c;
    const emfA=r(2,6),emfB=r(2,6),emfC=r(2,6),seriesEmf=emfA+emfB+emfC;
    const componentOptions=[
      { desc:"varies its resistance depending on light intensity", answer:["ldr","lightdependentresistor","light-dependent resistor","light dependent resistor"] },
      { desc:"varies its resistance depending on temperature", answer:["thermistor"] },
    ];
    const componentPick=componentOptions[r(0,componentOptions.length-1)];
    return validateUnitSet([
      sq("igcse-u16-f1","Calculate total resistance in series",difficulty,`Three resistors of ${r1a} Ω, ${r1b} Ω and ${r1c} Ω are connected in series. Find the total resistance.`,String(seriesR1),"Add the resistances together.",`${r1a}+${r1b}+${r1c}=${seriesR1} Ω.`),
      sq("igcse-u16-f2","Calculate combined e.m.f. in series",difficulty,`Three cells of e.m.f. ${emfA} V, ${emfB} V and ${emfC} V are connected in series. Find the combined e.m.f.`,String(seriesEmf),"Add the e.m.f.s together.",`${emfA}+${emfB}+${emfC}=${seriesEmf} V.`),
      sq("igcse-u16-f3","Recall current behaviour in series circuits (true/false)",difficulty,"True or false: the current is the same at every point in a series circuit.","true","Series circuits have only one path, so current is the same everywhere.","True — current is the same throughout a series circuit."),
      sq("igcse-u16-f4","Compare source and branch current in parallel",difficulty,"In a parallel circuit, how does the current from the source compare to the current in each branch? (a) it is smaller (b) it is larger (c) it is the same (d) there is no current from the source",["b","larger","itislarger"],"The source current splits among the branches.","The correct answer is (b) it is larger."),
      sq("igcse-u16-f5","Recall combined resistance in parallel (true/false)",difficulty,"True or false: the combined resistance of two resistors in parallel is greater than either resistor by itself.","false","Parallel combined resistance is always less than either individual resistor.","False — parallel resistance is always less than either resistor alone."),
      sq("igcse-u16-f6","Name a circuit component from its behaviour",difficulty,`Name the component that ${componentPick.desc}.`,componentPick.answer,"Match the description to a component that responds to its environment.",`This describes a ${componentPick.answer[0]}.`),
    ], difficulty);
  }
  if (difficulty === "application") {
    const seriesR1=r(2,9),seriesR2=r(2,9),totalR1=seriesR1+seriesR2,voltage1=r(2,9)*totalR1,current1=voltage1/totalR1;
    const [pr1,pr2,pcombined]=PARALLEL_PAIRS[r(0,PARALLEL_PAIRS.length-1)];
    const isAdvantage3=r(0,1)===1;
    const componentOptions=[
      { desc:"emits light when current flows through it in the forward direction", answer:["led","light-emittingdiode","light-emitting diode","light emitting diode"] },
      { desc:"only allows current to flow in one direction", answer:["diode"] },
    ];
    const componentPick4=componentOptions[r(0,componentOptions.length-1)];
    const branch1_5=r(2,9),branch2_5=r(2,9),sourceCurrent5=branch1_5+branch2_5;
    const pdA6=r(2,9),pdB6=r(2,9),totalPd6=pdA6+pdB6;
    return validateUnitSet([
      sq("igcse-u16-a1","Calculate current in a series circuit",difficulty,`Two resistors of ${seriesR1} Ω and ${seriesR2} Ω are connected in series across a ${voltage1} V supply. Find the current in the circuit.`,String(current1),"Add the resistances, then divide the voltage by the total.",`${voltage1}÷(${seriesR1}+${seriesR2})=${current1} A.`),
      sq("igcse-u16-a2","Calculate combined resistance in parallel",difficulty,`Two resistors of ${pr1} Ω and ${pr2} Ω are connected in parallel. Find the combined resistance.`,String(pcombined),"Use 1/R = 1/R1 + 1/R2.",`Combined resistance = ${pcombined} Ω.`),
      sq("igcse-u16-a3","Evaluate an advantage of parallel lighting circuits (true/false)",difficulty,`True or false: connecting lamps in parallel in a lighting circuit means each lamp can be switched on or off ${isAdvantage3?"independently":"only all together"}.`,isAdvantage3?"true":"false","Parallel lamps operate independently of each other.",`${isAdvantage3?"True":"False"} — parallel lamps can be controlled independently.`),
      sq("igcse-u16-a4","Name a circuit component from its behaviour",difficulty,`Name the component that ${componentPick4.desc}.`,componentPick4.answer,"Match the description to a specific circuit component.",`This describes a ${componentPick4.answer[0]}.`),
      sq("igcse-u16-a5","Apply the junction current rule",difficulty,`At a junction in a parallel circuit, two branches carry ${branch1_5} A and ${branch2_5} A. Find the current supplied by the source.`,String(sourceCurrent5),"Add the branch currents together.",`${branch1_5}+${branch2_5}=${sourceCurrent5} A.`),
      sq("igcse-u16-a6","Apply the series p.d. rule",difficulty,`In a series circuit, two components have p.d.s of ${pdA6} V and ${pdB6} V across them. Find the total p.d. across both components.`,String(totalPd6),"Add the individual p.d.s together.",`${pdA6}+${pdB6}=${totalPd6} V.`),
    ], difficulty);
  }
  const r1a=r(2,9),r1b=r(2,9),wrongTotal1=r1a*r1b,correctTotal1=r1a+r1b;
  const [pr1,pr2,pcombined]=PARALLEL_PAIRS[r(0,PARALLEL_PAIRS.length-1)];
  const isTrue3=r(0,1)===1;
  const dividerR1=r(2,9),dividerR2=r(2,9),dividerV1=r(2,9)*dividerR1,dividerV2=(dividerV1/dividerR1)*dividerR2;
  const emfA5=r(2,6),emfB5=r(2,6);
  const branchOut1_6=r(2,7),branchOut2_6=r(2,7),branchIn6=branchOut1_6+branchOut2_6;
  return validateUnitSet([
    sq("igcse-u16-r1","Correct a series-resistance error",difficulty,`A learner finds the total resistance of two series resistors (${r1a} Ω and ${r1b} Ω) by multiplying them, getting ${wrongTotal1} Ω. Enter the correct total resistance.`,String(correctTotal1),"Add series resistances, don't multiply them.",`${r1a}+${r1b}=${correctTotal1} Ω.`),
    sq("igcse-u16-r2","Find current from parallel resistance and voltage",difficulty,`Two resistors of ${pr1} Ω and ${pr2} Ω are connected in parallel across a battery, giving a combined resistance of ${pcombined} Ω. If the battery provides ${pcombined*3} V, find the total current from the battery.`,"3","Divide the voltage by the combined resistance.",`${pcombined*3}÷${pcombined}=3 A.`),
    sq("igcse-u16-r3","Evaluate a parallel circuit failure scenario (true/false)",difficulty,`True or false: one advantage of parallel lighting circuits is that if one lamp fails, the ${isTrue3?"others stay lit":"whole circuit goes off"}.`,isTrue3?"true":"false","In parallel circuits, other branches are unaffected if one lamp fails.",`${isTrue3?"True":"False"} — other lamps stay lit in a parallel circuit.`),
    sq("igcse-u16-r4","Apply the potential divider ratio",difficulty,`A potential divider has two resistors, ${dividerR1} Ω and ${dividerR2} Ω, in series. If the p.d. across the first resistor is ${dividerV1} V, find the p.d. across the second resistor, using V1/V2 = R1/R2.`,String(dividerV2),"Use the ratio of resistances to find the ratio of p.d.s.",`V2 = V1×R2/R1 = ${dividerV2} V.`),
    sq("igcse-u16-r5","Correct a combined-e.m.f. error",difficulty,`Two cells with e.m.f.s of ${emfA5} V and ${emfB5} V are connected in series, but a learner assumes only the larger cell's e.m.f. counts. Find the correct combined e.m.f.`,String(emfA5+emfB5),"Add both e.m.f.s together in series.",`${emfA5}+${emfB5}=${emfA5+emfB5} V.`),
    sq("igcse-u16-r6","Apply the junction current rule in reverse",difficulty,`A current of ${branchIn6} A enters a junction and splits into two branches. One branch carries ${branchOut1_6} A. Find the current in the other branch.`,String(branchOut2_6),"Subtract the known branch current from the total.",`${branchIn6}−${branchOut1_6}=${branchOut2_6} A.`),
  ], difficulty);
};

const structuredElectricalSafety = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    return validateUnitSet([
      sq("igcse-u17-f1","Identify the correct wire for a switch",difficulty,"Which wire in a mains circuit must a switch be connected to, so the circuit can be switched off safely? (a) neutral (b) earth (c) live (d) any of them",["c","live"],"A switch on the live wire ensures the circuit is fully isolated.","The correct answer is (c) live."),
      sq("igcse-u17-f2","Evaluate a statement about the earth wire (true/false)",difficulty,"True or false: the earth wire is designed to carry current continuously during normal operation of an appliance.","false","The earth wire only carries current if a fault occurs.","False — the earth wire is a safety path, not a normal current path."),
      sq("igcse-u17-f3","Name an electrical hazard",difficulty,"Name one hazard associated with using a mains electricity supply.",HAZARDS,"Think of common causes of electrical accidents.","This is one of several recognised mains electricity hazards."),
      sq("igcse-u17-f4","Explain the purpose of earthing",difficulty,"What is the purpose of earthing the metal casing of an appliance? (a) to make it heavier (b) to provide a safe path for current if the casing becomes live (c) to reduce its cost (d) to insulate it",["b","safepath","safe path"],"Earthing gives fault current a safe route to the ground.","The correct answer is (b)."),
      sq("igcse-u17-f5","Recall the function of a fuse (true/false)",difficulty,"True or false: a fuse is designed to melt and break the circuit if the current becomes too high.","true","A fuse protects a circuit by melting under excess current.","True — this is exactly how a fuse works."),
      sq("igcse-u17-f6","Name the term for a non-earthed safe appliance",difficulty,"What term describes an appliance with a non-conducting outer casing that does not need an earth wire?",["doubleinsulated","double-insulated","double insulated"],"This term describes appliances with fully insulating casings.","This is called double insulation."),
    ], difficulty);
  }
  if (difficulty === "application") {
    const STD_FUSES=[3,5,13];
    const power1=r(3,12)*100,voltage1=230,current1=Math.round((power1/voltage1)*100)/100;
    const correctFuse1=STD_FUSES.find(f=>f>=current1) || 13;
    const isDoubleInsulated2=r(0,1)===1;
    const overloadScenario3=r(0,1)===1;
    const hazardPick4=HAZARDS[r(0,HAZARDS.length-1)];
    const isTrip5=r(0,1)===1;
    return validateUnitSet([
      sq("igcse-u17-a1","Choose an appropriate fuse rating",difficulty,`An appliance rated at ${power1} W is used on a ${voltage1} V mains supply, drawing a current of ${current1} A. Which standard fuse rating (3 A, 5 A, or 13 A) should be used?`,String(correctFuse1),"Choose the smallest standard fuse rating that is still above the operating current.",`The correct fuse rating is ${correctFuse1} A.`),
      sq("igcse-u17-a2","Evaluate a statement about double insulation (true/false)",difficulty,`True or false: a ${isDoubleInsulated2?"double-insulated":"non-double-insulated, non-earthed"} appliance ${isDoubleInsulated2?"still requires":"is missing"} an earth wire connection, which is a safety concern.`,isDoubleInsulated2?"false":"true","Double-insulated appliances don't need earthing; non-earthed non-double-insulated ones are unsafe.",`${isDoubleInsulated2?"False":"True"} — ${isDoubleInsulated2?"double-insulated appliances don't need an earth wire":"this is a genuine safety concern"}.`),
      sq("igcse-u17-a3","Evaluate an overloading scenario",difficulty,`Plugging ${overloadScenario3?"too many appliances into one extension lead":"a single appliance into a wall socket"} can cause excess current and overheating. Is this an example of overloading? Answer yes or no.`,overloadScenario3?"yes":"no","Overloading happens when too many appliances draw more current than the circuit can safely handle.",`${overloadScenario3?"Yes":"No"} — ${overloadScenario3?"this is a classic overloading scenario":"a single appliance alone does not overload a socket"}.`),
      sq("igcse-u17-a4","Identify a hazard from a scenario",difficulty,`${HAZARD_SCENARIOS[hazardPick4]} Which electrical hazard does this describe?`,[hazardPick4],"Match the scenario to the correct hazard category.",`This describes ${hazardPick4}.`),
      sq("igcse-u17-a5","Distinguish a trip switch from a fuse (true/false)",difficulty,`True or false: ${isTrip5?"a trip switch can be reset after it activates, but a fuse must be replaced":"a fuse can be reset after it blows, in the same way a trip switch can"}.`,isTrip5?"true":"false","A trip switch is resettable; a fuse is a one-time device that must be replaced.",`${isTrip5?"True":"False"} — ${isTrip5?"trip switches are resettable, fuses are not":"a blown fuse must be replaced, unlike a trip switch"}.`),
      sq("igcse-u17-a6","Evaluate a fuse-rating mismatch (true/false)",difficulty,"True or false: a fuse rated much higher than the appliance's normal operating current will fail to protect the circuit effectively.","true","A fuse rated too high won't blow until currents far exceed safe levels.","True — an oversized fuse offers poor protection."),
    ], difficulty);
  }
  const STD_FUSES=[3,5,13];
  const power1=r(3,20)*100,voltage1=230,current1=Math.round((power1/voltage1)*100)/100;
  const correctFuse1=STD_FUSES.find(f=>f>=current1) || 13;
  const wrongPosition2=r(0,1)===1;
  const isDamp3=r(0,1)===1;
  const isTooLow4=r(0,1)===1;
  const power5=r(3,20)*100;
  const current5=Math.round((power5/230)*100)/100;
  const isEarthed6=r(0,1)===1;
  return validateUnitSet([
    sq("igcse-u17-r1","Choose a fuse rating in a reasoning context",difficulty,`An appliance rated at ${power1} W on a ${voltage1} V mains supply draws ${current1} A. A learner picks a 3 A fuse regardless of the current. Enter the correct standard fuse rating (3 A, 5 A, or 13 A) needed.`,String(correctFuse1),"Choose the smallest standard rating above the actual operating current.",`The correct rating is ${correctFuse1} A.`),
    sq("igcse-u17-r2","Evaluate correct switch wiring",difficulty,`A learner wires the switch on the ${wrongPosition2?"neutral":"live"} wire. Is this the correct, safe way to wire a switch? Answer yes or no.`,wrongPosition2?"no":"yes","A switch must be on the live wire to safely isolate the circuit.",`${wrongPosition2?"No":"Yes"} — the switch must be on the live wire.`),
    sq("igcse-u17-r3","Reason about damp conditions and shock risk",difficulty,`True or false: ${isDamp3?"damp conditions increase":"damp conditions have no effect on"} the risk of electric shock from mains equipment.`,isDamp3?"true":"false","Water conducts electricity, increasing shock risk in damp conditions.",`${isDamp3?"True":"False"} — damp conditions increase shock risk.`),
    sq("igcse-u17-r4","Reason about mismatched fuse ratings",difficulty,`A fuse rated ${isTooLow4?"lower than":"much higher than"} an appliance's normal operating current is used. Will this fuse ${isTooLow4?"blow unnecessarily during normal use":"protect the circuit effectively"}? Answer yes or no.`,isTooLow4?"yes":"no","A fuse rated too low blows during normal use; one rated too high fails to protect effectively.",`${isTooLow4?"Yes":"No"} — ${isTooLow4?"an undersized fuse blows unnecessarily":"an oversized fuse won't protect effectively"}.`),
    sq("igcse-u17-r5","Calculate current for fuse selection",difficulty,`An appliance rated at ${power5} W is used on a 230 V supply. Find the current it draws, then state whether a 3 A fuse would be suitable if the current exceeds 3 A. Give the calculated current only.`,String(current5),"Divide power by voltage.",`${power5}÷230=${current5} A.`),
    sq("igcse-u17-r6","Evaluate whether an appliance is safely protected",difficulty,`An appliance has a metal casing that is ${isEarthed6?"earthed":"not earthed and not double-insulated"}. Is this appliance safely protected against the casing becoming live? Answer yes or no.`,isEarthed6?"yes":"no","Earthing (or double insulation) protects against a live casing; lacking both is dangerous.",`${isEarthed6?"Yes":"No"} — ${isEarthed6?"earthing provides protection":"this appliance lacks proper protection"}.`),
  ], difficulty);
};

const structuredElectromagneticEffects = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const [ratioP1,ratioS1]=TRANSFORMER_RATIOS[r(0,TRANSFORMER_RATIOS.length-1)];
    const scale1=r(2,10)*10,Np1=ratioP1*scale1,Ns1=ratioS1*scale1,Vp1=ratioP1*r(2,20)*10,Vs1=Vp1*Ns1/Np1;
    return validateUnitSet([
      sq("igcse-u18-f1","Evaluate Lenz's law (true/false)",difficulty,"True or false: the direction of an induced e.m.f. always opposes the change that causes it.","true","This describes Lenz's law.","True — this is Lenz's law."),
      sq("igcse-u18-f2","Calculate transformer secondary voltage",difficulty,`A transformer has ${Np1} turns on the primary coil and ${Ns1} turns on the secondary coil. The primary voltage is ${Vp1} V. Find the secondary voltage, using Vp/Vs = Np/Ns.`,String(Vs1),"Multiply primary voltage by the turns ratio Ns/Np.",`${Vp1}×${Ns1}/${Np1}=${Vs1} V.`),
      sq("igcse-u18-f3","Classify a transformer as step-up or step-down",difficulty,"A transformer has more turns on its secondary coil than its primary coil. Is this a step-up or step-down transformer?",["stepup","step-up","step up"],"More secondary turns means the voltage increases.","This is a step-up transformer."),
      sq("igcse-u18-f4","Recall the field pattern of a straight wire (true/false)",difficulty,"True or false: the magnetic field around a straight current-carrying wire forms circular field lines around the wire.","true","This is the standard field pattern for a straight current-carrying wire.","True — the field lines form circles around the wire."),
      sq("igcse-u18-f5","Name a device using the motor effect",difficulty,"Name one device that uses the magnetic effect of a current (the motor effect) in its operation.",["relay","electricbell","electric bell","loudspeaker"],"These devices rely on a force acting on a current-carrying conductor in a field.","This device uses the motor effect."),
      sq("igcse-u18-f6","Identify what does not increase motor turning effect",difficulty,"Which of these would NOT increase the turning effect on a current-carrying coil in a magnetic field? (a) increasing the current (b) increasing the number of turns (c) increasing the field strength (d) reducing the current",["d","reducingthecurrent","reducing the current"],"Reducing current would decrease, not increase, the turning effect.","The correct answer is (d) reducing the current."),
    ], difficulty);
  }
  if (difficulty === "application") {
    const [ratioP1,ratioS1]=TRANSFORMER_RATIOS[r(0,TRANSFORMER_RATIOS.length-1)];
    const scale1=r(2,10)*10,Np1=ratioP1*scale1,Ns1=ratioS1*scale1,Vp1=ratioP1*r(2,20)*10,Vs1=Vp1*Ns1/Np1;
    const isFaster2=r(0,1)===1;
    const [ratioP3,ratioS3]=TRANSFORMER_RATIOS[r(0,TRANSFORMER_RATIOS.length-1)];
    const scale3=r(2,10)*10,Np3=ratioP3*scale3,Ns3=ratioS3*scale3,Vp3=ratioP3*r(2,20)*10,Vs3=Vp3*Ns3/Np3;
    const Ip3=ratioS3*r(2,6),Is3=Ip3*Vp3/Vs3;
    const isHighVoltage6=r(0,1)===1;
    return validateUnitSet([
      sq("igcse-u18-a1","Calculate a transformer's secondary voltage",difficulty,`A transformer has ${Np1} primary turns and ${Ns1} secondary turns. The primary voltage is ${Vp1} V. Find the secondary voltage.`,String(Vs1),"Use Vp/Vs = Np/Ns.",`${Vp1}×${Ns1}/${Np1}=${Vs1} V.`),
      sq("igcse-u18-a2","Reason about induction factors (true/false)",difficulty,`True or false: moving a magnet ${isFaster2?"faster":"more slowly"} through a coil induces a ${isFaster2?"greater":"smaller"} e.m.f.`,"true","Faster relative motion always induces a greater e.m.f., and slower motion a smaller one.","True — this matches the standard relationship."),
      sq("igcse-u18-a3","Calculate transformer secondary current",difficulty,`A transformer is 100% efficient, with primary voltage ${Vp3} V, secondary voltage ${Vs3} V, and primary current ${Ip3} A. Find the secondary current, using IpVp = IsVs.`,String(Is3),"Rearrange to Is = IpVp/Vs.",`${Ip3}×${Vp3}/${Vs3}=${Is3} A.`),
      sq("igcse-u18-a4","Identify a field pattern similar to a bar magnet",difficulty,"Which of these produces a magnetic field pattern similar to a bar magnet? (a) a single straight wire (b) a solenoid (coil of wire) (c) an unmagnetised iron bar (d) a battery on its own",["b","solenoid"],"A solenoid's field resembles a bar magnet's field.","The correct answer is (b) a solenoid."),
      sq("igcse-u18-a5","Name the commutator in a d.c. motor",difficulty,"Name the component in a d.c. motor that reverses the current direction every half turn, allowing continuous rotation.",["splitringcommutator","split-ring commutator","split ring commutator","commutator"],"This component reverses current direction to maintain rotation.","This is the split-ring commutator."),
      sq("igcse-u18-a6","Reason about high-voltage transmission (true/false)",difficulty,`True or false: transmitting electricity at ${isHighVoltage6?"high":"low"} voltage (for the same power) results in lower power loss in the cables.`,isHighVoltage6?"true":"false","High voltage transmission reduces current, and power loss depends on current squared.",`${isHighVoltage6?"True":"False"} — ${isHighVoltage6?"high voltage transmission reduces power loss":"low voltage transmission does not reduce power loss"}.`),
    ], difficulty);
  }
  const [ratioP1,ratioS1]=TRANSFORMER_RATIOS[r(0,TRANSFORMER_RATIOS.length-1)];
  const scale1=r(2,10)*10,Np1=ratioP1*scale1,Ns1=ratioS1*scale1,Vp1=ratioP1*r(2,20)*10,Vs1=Vp1*Ns1/Np1;
  const wrongVs1=Vp1*Np1/Ns1;
  const isReversed3=r(0,1)===1;
  const [ratioP5,ratioS5]=TRANSFORMER_RATIOS[r(0,TRANSFORMER_RATIOS.length-1)];
  const scale5=r(2,10)*10,Np5=ratioP5*scale5,Ns5=ratioS5*scale5,Vp5=ratioP5*r(2,20)*10,Vs5=Vp5*Ns5/Np5;
  const Ip5=ratioS5*r(2,6),Is5=Ip5*Vp5/Vs5;
  const isFastest6=r(0,1)===1;
  return validateUnitSet([
    sq("igcse-u18-r1","Correct a transformer-ratio error",difficulty,`A learner calculates a transformer's secondary voltage using Vs = Vp × Np/Ns (the wrong way round), getting ${wrongVs1} V, for a transformer with ${Np1} primary turns, ${Ns1} secondary turns, and primary voltage ${Vp1} V. Enter the correct secondary voltage.`,String(Vs1),"Vs = Vp × Ns/Np, not Np/Ns.",`${Vp1}×${Ns1}/${Np1}=${Vs1} V.`),
    sq("igcse-u18-r2","Reason about force direction reversal (true/false)",difficulty,"True or false: reversing either the current direction or the magnetic field direction reverses the direction of the force on a current-carrying conductor.","true","Reversing either factor reverses the resulting force direction.","True — reversing either one reverses the force direction."),
    sq("igcse-u18-r3","Evaluate high-voltage transmission reasoning",difficulty,`Electricity is transmitted at ${isReversed3?"very high":"low"} voltage over long distances specifically to keep the current ${isReversed3?"low":"high"}, since power loss depends on current squared (P = I²R). Is this approach effective at reducing power loss? Answer yes or no.`,isReversed3?"yes":"no","Lower current (via higher voltage) reduces I²R losses.",`${isReversed3?"Yes":"No"} — ${isReversed3?"keeping current low via high voltage reduces losses":"low voltage keeps current high, increasing losses"}.`),
    sq("igcse-u18-r4","Reason about generator e.m.f. and rotation speed",difficulty,"True or false: increasing the speed of rotation of a generator's coil increases the magnitude of the induced e.m.f.","true","Faster rotation means faster flux change, inducing a greater e.m.f.","True — faster rotation increases the induced e.m.f."),
    sq("igcse-u18-r5","Calculate secondary current in a multi-step transformer problem",difficulty,`A 100% efficient transformer has ${Np5} primary turns, ${Ns5} secondary turns, primary voltage ${Vp5} V, and primary current ${Ip5} A. Find the secondary current.`,String(Is5),"Find Vs first, then use IpVp = IsVs.",`Is = ${Ip5}×${Vp5}/${Vs5}=${Is5} A.`),
    sq("igcse-u18-r6","Reason about e.m.f. and coil orientation",difficulty,`In an a.c. generator, the induced e.m.f. is at its ${isFastest6?"maximum":"zero"} when the coil is moving ${isFastest6?"perpendicular":"parallel"} to the magnetic field lines. Is this statement correct? Answer yes or no.`,"yes","Maximum e.m.f. occurs when field lines are cut at the greatest rate.","Yes — this statement is correct."),
  ], difficulty);
};

const igcseTopics: Record<string,(difficulty:"foundational"|"application"|"reasoning")=>PhysicsQuestion[]> = {
  "igcse-u1": structuredIgcseMeasurement,
  "igcse-u14": structuredMagnetism,
  "igcse-u15": structuredElectricalQuantities,
  "igcse-u16": structuredElectricCircuits,
  "igcse-u17": structuredElectricalSafety,
  "igcse-u18": structuredElectromagneticEffects,
};



// BEGIN AS TOPIC 1
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, page 16.
// Objective IDs refer to lib/as-physics-syllabus.json (12 objectives, sections 1.1–1.4).
const structuredAsQuantities = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    // Rotate choices and the key together; the semantic answer must also vary.
    const offset = r(0, options.length - 1);
    const rotated = options.slice(offset).concat(options.slice(0, offset));
    const letter = String.fromCharCode(97 + (correct - offset + options.length) % options.length);
    return {...sq(id, objective, difficulty,
      `${prompt} ${rotated.map((option, i) => `(${String.fromCharCode(97+i)}) ${option}`).join(' ')}`,
      letter, hint, solution), answerFormat: 'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id, objective, difficulty, prompt, String(answer), hint, solution),
    answerFormat: 'Enter the number only, in the unit requested.'
  });
  if (difficulty === 'foundational') {
    const magnitude = r(2, 20);
    const quantity = r(0, 1) === 0 ? ['length', 'm'] : ['time', 's'];
    const estimate: [string, string[]] = r(0, 1) === 0
      ? ['the height of an adult', ['1.7 m', '0.017 m', '170 m', '1700 m']]
      : ['the mass of an adult', ['70 kg', '0.07 kg', '7000 kg', '70000 kg']];
    const base = [['mass', 'kg'], ['length', 'm'], ['time', 's'], ['current', 'A'], ['temperature', 'K']][r(0,4)];
    const derived = [['force', 'kg m s^-2'], ['energy', 'kg m^2 s^-2'], ['pressure', 'kg m^-1 s^-2'], ['power', 'kg m^2 s^-3']];
    const derivedIndex = r(0,3);
    const prefix: [string, string, number] = ([['pico','p',-12],['nano','n',-9],['micro','μ',-6],['milli','m',-3],['centi','c',-2],['deci','d',-1],['kilo','k',3],['mega','M',6],['giga','G',9],['tera','T',12]] as [string, string, number][])[r(0,9)];
    const scalar = r(0,1) === 0;
    const example = scalar ? ['mass','energy','speed'][r(0,2)] : ['force','velocity','momentum'][r(0,2)];
    return validateUnitSet([
      choice('as-u1-f1','1.1.1',`A ${quantity[0]} is recorded as ${magnitude} ${quantity[1]}. Which gives its numerical magnitude followed by its unit?`,
        [`${magnitude}; ${quantity[1]}`, `${quantity[1]}; ${magnitude}`, `${magnitude}; no unit`, `no magnitude; ${quantity[1]}`],0,
        'A measurement combines a number with a unit.',`The magnitude is ${magnitude} and the unit is ${quantity[1]}.`),
      choice('as-u1-f2','1.1.2',`Which is a reasonable estimate of ${estimate[0]}?`,estimate[1],0,
        'Compare each order of magnitude with an everyday adult.',`${estimate[1][0]} is a reasonable adult value.`),
      {...sq('as-u1-f3','1.2.1',difficulty,`Give the SI base unit for ${base[0]}. Write its name.`,
        ({kg:['kilogram','kilograms'],m:['metre','meter','metres','meters'],s:['second','seconds'],A:['ampere','amp','amperes','amps'],K:['kelvin','kelvins']} as Record<string,string[]>)[base[1]],
        'Recall the five base quantities required by this syllabus.',`The unit is ${base[1]}.`), answerFormat:'Enter the unit name.'},
      choice('as-u1-f4','1.2.2',`Which is the SI base-unit expression for ${derived[derivedIndex][0]}?`,derived.map(x=>x[1]),derivedIndex,
        'Use force = mass × acceleration, energy = force × distance, pressure = force / area, or power = energy / time.',`${derived[derivedIndex][0]} has units ${derived[derivedIndex][1]}.`),
      numeric('as-u1-f5','1.2.4',`The prefix ${prefix[0]} (${prefix[1]}) means multiplication by 10^n. Enter n.`,prefix[2],
        'Submultiples have negative powers; multiples have positive powers.',`${prefix[0]} means 10^${prefix[2]}.`),
      {...sq('as-u1-f6','1.4.1',difficulty,`Is ${example} a scalar or vector?`,scalar?'scalar':'vector',
        'A vector needs direction as well as magnitude.',`${example} is a ${scalar?'scalar: magnitude only':'vector: magnitude and direction'}.`),answerFormat:'Enter scalar or vector.'}
    ],difficulty);
  }
  if (difficulty === 'application') {
    const homogeneous = r(0,1) === 0;
    const trueMass = r(20,80), zero = r(1,5), high = r(0,1) === 0;
    const measured = trueMass + (high ? zero : -zero);
    const ua = r(1,4), ub = r(1,4);
    const east = 3*r(1,5), north = 4*(east/3), resultant = 5*(east/3);
    const component = r(2,10), horizontal = r(0,1) === 0;
    const accurate = r(0,1) === 0, centre = accurate ? 50 : 60;
    return validateUnitSet([
      {...sq('as-u1-a1','1.2.3',difficulty,`For speed v, acceleration a and time t, is v = ${homogeneous?'a t':'a t^2'} dimensionally homogeneous? Answer true or false.`,
        homogeneous?'true':'false','Compare the SI base units of both sides.',homogeneous?'True: (m s^-2) s = m s^-1.':'False: (m s^-2) s^2 = m, whereas speed has units m s^-1.'),answerFormat:'Enter true or false.'},
      numeric('as-u1-a2','1.3.1',`A balance reads ${zero} g ${high?'too high':'too low'} for every load. It displays ${measured} g. What is the corrected mass in g?`,trueMass,
        'Undo the consistent offset.',`${measured} ${high?'-':'+'} ${zero} = ${trueMass} g. This is a systematic zero error.`),
      numeric('as-u1-a3','1.3.3',`Lengths are A = 40 ± ${ua} mm and B = 20 ± ${ub} mm. Find the absolute uncertainty in A - B, in mm.`,ua+ub,
        'Add absolute uncertainties for both a sum and a difference.',`The absolute uncertainty is ${ua} + ${ub} = ${ua+ub} mm.`),
      numeric('as-u1-a4','1.4.2',`A displacement is ${east} m east followed by ${north} m north. Find the magnitude of the resultant displacement in m.`,resultant,
        'These perpendicular components form a right triangle.',`The magnitude is sqrt(${east}^2 + ${north}^2) = ${resultant} m.`),
      numeric('as-u1-a5','1.4.3',`A force of ${2*component} N acts at 60° above the horizontal. Find its ${horizontal?'horizontal':'vertical'} component in N. Use sin 60° = 0.866 and cos 60° = 0.5.`,horizontal?component:Number((component*1.732).toFixed(3)),
        'Horizontal uses cosine; vertical uses sine.',`${2*component} × ${horizontal?'0.5':'0.866'} = ${horizontal?component:Number((component*1.732).toFixed(3))} N, using the supplied trigonometric value.`),
      choice('as-u1-a6','1.3.2',`A reference length is 50.0 mm. Readings are ${centre-0.1}, ${centre.toFixed(1)} and ${centre+0.1} mm. Which description best fits?`,
        ['precise and accurate','precise but inaccurate','accurate but imprecise','neither precise nor accurate'],accurate?0:1,
        'Precision concerns spread; accuracy concerns closeness to the reference.',`The small spread means high precision; the readings are ${accurate?'close to':'far from'} the reference, so they are ${accurate?'accurate':'inaccurate'}.`)
    ],difficulty);
  }
  const area = r(2,20), mass = area*r(2,5);
  const random = r(0,1) === 0;
  const percentM = r(1,3), percentV = r(1,3), m = r(1,5), v = r(2,8)*10;
  const ax = r(2,8), ay = r(2,8), bx = r(2,8), by = r(2,8);
  const scale = r(1,5), resolveEast = r(0,1) === 0;
  const correctFormula = r(0,1) === 0;
  return validateUnitSet([
    choice('as-u1-r1','1.2.3',`A learner claims that checking dimensions proves E = ${correctFormula?'0.5':'2'} m v^2 is the correct kinetic-energy equation. Which evaluation is valid?`,
      ['The formula is correct, but dimensions alone cannot establish its coefficient.', 'The coefficient is wrong even though the units match energy.', 'The right side has units of force.', 'The right side has units of power.'],correctFormula?0:1,
      'Dimensions do not distinguish dimensionless coefficients.',`Both 0.5 m v^2 and 2 m v^2 have energy units kg m^2 s^-2; only 0.5 is the correct coefficient. The claim does not follow from dimensions.`),
    numeric('as-u1-r2','1.2.4',`A sheet has mass ${mass} g and area ${area} cm^2. A learner divides both numbers by 1000 to obtain SI values. Correct the conversions and calculate mass per area in kg/m^2.`,mass/area*10,
      'One gram is 0.001 kg; one square centimetre is 0.0001 square metre.',`The ratio is (${mass}/1000) / (${area}/10000) = ${mass/area*10} kg/m^2.`),
    choice('as-u1-r3','1.3.1',`A timer's error is ${random?'an unpredictable positive or negative variation between readings':'a fixed positive offset on every reading'}. A learner proposes averaging many repeats without recalibration. Which assessment is correct?`,
      ['Averaging reduces this random uncertainty, but does not make the result exact.', 'The fixed offset survives averaging; correct or recalibrate the timer.', 'Averaging always removes all measurement error.', 'Repeats make any measurement exact.'],random?0:1,
      'Separate random scatter from systematic bias.',random?'Averaging reduces the random uncertainty described, but cannot guarantee an exact result.':'The systematic offset remains after averaging; calibration or correction is needed.'),
    numeric('as-u1-r4','1.3.3',`Kinetic energy is E = 0.5 m v^2. Here m = ${m} kg with ${percentM}% uncertainty and v = ${v} m/s with ${percentV}% uncertainty. Using simple addition of percentage uncertainties, find the absolute uncertainty in E in J.`,(m*v*v/2)*(percentM+2*percentV)/100,
      'First find E; its percentage uncertainty is the mass percentage plus twice the speed percentage.',`E = ${m*v*v/2} J; percentage uncertainty = ${percentM} + 2 × ${percentV} = ${percentM+2*percentV}%. Absolute uncertainty = ${(m*v*v/2)*(percentM+2*percentV)/100} J.`),
    {...sq('as-u1-r5','1.4.2',difficulty,`Vectors A and B have (east, north) components (${ax}, ${ay}) m and (${bx}, ${by}) m. A learner adds components to find A - B. Correct the error: enter the east and north components of A - B, separated by a comma.`,
      `${ax-bx}, ${ay-by}`,'Subtract corresponding signed components; retain negative values.',`A - B = (${ax} - ${bx}, ${ay} - ${by}) = (${ax-bx}, ${ay-by}) m.`),answerFormat:'Enter east, north as two signed numbers separated by a comma.'},
    numeric('as-u1-r6','1.4.3',`A ${5*scale} N force points between east and north. Its east:north component ratio is 3:4. A learner splits it into two equal components. Find the correct ${resolveEast?'east':'north'} component in N.`,(resolveEast?3:4)*scale,
      'Write the components as 3k and 4k, so the magnitude is 5k.',`5k = ${5*scale}, hence k = ${scale}; the ${resolveEast?'east':'north'} component is ${(resolveEast?3:4)*scale} N.`)
  ],difficulty);
};
// END AS TOPIC 1

// BEGIN AS TOPIC 2
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, page 17.
// Nine objectives, 2.1.1–2.1.9, transcribed in lib/as-physics-syllabus.json.
const structuredAsKinematics = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    const offset = r(0, options.length - 1);
    const rotated = options.slice(offset).concat(options.slice(0, offset));
    const letter = String.fromCharCode(97 + (correct - offset + options.length) % options.length);
    return {...sq(id, objective, difficulty,
      `${prompt} ${rotated.map((option,i)=>`(${String.fromCharCode(97+i)}) ${option}`).join(' ')}`,
      letter, hint, solution), answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id, objective, difficulty, prompt, String(answer), hint, solution),
    answerFormat:'Enter the number only, in the unit requested. Retain a negative sign where appropriate.'
  });
  if (difficulty === 'foundational') {
    const definition = r(0,4);
    const definitions = ['total path length travelled','change in position with direction','distance travelled per unit time','rate of change of displacement','rate of change of velocity'];
    const names = ['distance','displacement','speed','velocity','acceleration'];
    const graph = r(0,4);
    const graphPrompts = [
      'An object moves with constant positive velocity. Which describes its displacement–time graph?',
      'An object moves with constant negative velocity. Which describes its distance-travelled–time graph?',
      'An object moves with constant negative velocity. Which describes its velocity–time graph?',
      'An object has constant positive acceleration. Which describes its acceleration–time graph?',
      'An object moves with constant negative velocity. Which describes its speed–time graph?'
    ];
    const graphOptions = ['a straight line with positive gradient','a horizontal line below zero','a horizontal line above zero','a straight line with negative gradient'];
    const velocity = r(1,8)*(r(0,1)===0?1:-1), duration = r(2,6);
    const slope = r(1,6)*(r(0,1)===0?1:-1), startTime = r(1,3), interval = r(2,6), startPosition = r(-10,10);
    const acceleration = r(1,4)*(r(0,1)===0?1:-1), graphTime = r(2,6), initial = r(5,10);
    const u = r(1,10), a = r(1,4), t = r(2,5);
    return validateUnitSet([
      {...sq('as-u2-f1','2.1.1',difficulty,`Which quantity is defined as ${definitions[definition]}? Enter distance, displacement, speed, velocity or acceleration.`,names[definition],
        'Distinguish total travel, directed change in position, and rates of change.',`${names[definition]} means ${definitions[definition]}.`),answerFormat:'Enter one of the five quantity names.'},
      choice('as-u2-f2','2.1.2',graphPrompts[graph],graphOptions,[0,0,1,2,2][graph],
        'The vertical-axis quantity determines whether constant motion gives a slope or a constant ordinate.',
        [ 'Constant positive velocity gives a constant positive displacement–time gradient.',
          'Distance travelled increases at a constant rate even when velocity is negative.',
          'A constant negative velocity is represented by a horizontal line below zero.',
          'Constant positive acceleration is represented by a horizontal line above zero.',
          'Speed is the magnitude of velocity, so constant negative velocity gives a constant positive speed.' ][graph]),
      numeric('as-u2-f3','2.1.3',`A velocity–time graph is horizontal at ${velocity} m/s from t = 0 s to t = ${duration} s. Find the signed displacement in m.`,velocity*duration,
        'Signed area under a velocity–time graph is displacement.',`${velocity} × ${duration} = ${velocity*duration} m.`),
      numeric('as-u2-f4','2.1.4',`A straight displacement–time graph joins (t = ${startTime} s, s = ${startPosition} m) to (t = ${startTime+interval} s, s = ${startPosition+slope*interval} m). Find the velocity in m/s.`,slope,
        'Find change in displacement divided by change in time.',`(${startPosition+slope*interval} - (${startPosition})) / (${startTime+interval} - ${startTime}) = ${slope} m/s.`),
      numeric('as-u2-f5','2.1.5',`A straight velocity–time graph joins (t = 0 s, v = ${initial} m/s) to (t = ${graphTime} s, v = ${initial+acceleration*graphTime} m/s). Find the acceleration in m/s^2.`,acceleration,
        'The gradient is change in velocity divided by elapsed time.',`(${initial+acceleration*graphTime} - ${initial}) / ${graphTime} = ${acceleration} m/s^2.`),
      numeric('as-u2-f6','2.1.7',`A trolley has initial velocity ${u} m/s and constant acceleration ${a} m/s^2 for ${t} s. Find its final velocity in m/s.`,u+a*t,
        'Use v = u + at.',`${u} + ${a} × ${t} = ${u+a*t} m/s.`)
    ],difficulty);
  }
  if (difficulty === 'application') {
    // Construct distances from the total time so both average quantities are exact.
    const legTime = r(2,5), outward = 2*legTime*r(2,6), backward = 2*legTime*r(1,5), speed = r(0,1)===0;
    const u = r(1,6), a = r(1,4), time = r(2,6), v = u+a*time;
    const step = r(0,1);
    // h_mm = g_tenths * t_tenths^2 / 2; integer arithmetic avoids decimal artefacts.
    const gTenths = [96,98,100][r(0,2)], tTenths = 2*r(1,3), heightMm = gTenths*tTenths*tTenths/2;
    const flightTime = r(1,3), horizontalSpeed = r(2,10), height = 5*flightTime*flightTime;
    const fallTime = r(1,4), fallHeight = 5*fallTime*fallTime;
    return validateUnitSet([
      numeric('as-u2-a1','2.1.1',`A runner travels ${outward} m east in ${legTime} s, then ${backward} m west in ${legTime} s. East is positive. Find the ${speed?'average speed':'average velocity'} for the whole journey in m/s.`,(outward+(speed?backward:-backward))/(2*legTime),
        speed?'Divide total distance by total elapsed time.':'Divide signed displacement by total elapsed time.',
        `(${outward} ${speed?'+':'-'} ${backward}) / ${2*legTime} = ${(outward+(speed?backward:-backward))/(2*legTime)} m/s.`),
      numeric('as-u2-a2','2.1.3',`A velocity–time graph is a straight line from (0 s, ${u} m/s) to (${time} s, ${v} m/s). Find the displacement over this interval in m.`,(u+v)*time/2,
        'Calculate the trapezium area, or use average velocity for constant acceleration.',`(${u} + ${v}) × ${time} / 2 = ${(u+v)*time/2} m.`),
      choice('as-u2-a3','2.1.6',step===0
        ? 'For constant acceleration, a = (v - u)/t gives v = u + at. Substituting this into s = (u + v)t/2 gives s = ut + which term?'
        : 'For constant acceleration, s = ut + 0.5at^2. Substitute u = v - at and simplify: s = vt + which term?',
        ['0.5at^2','-0.5at^2','at^2','-at^2'],step,
        'Substitute, expand the brackets and combine the acceleration terms.',step===0
          ? 's = (u + u + at)t/2 = ut + 0.5at^2.'
          : 's = (v - at)t + 0.5at^2 = vt - 0.5at^2.'),
      numeric('as-u2-a4','2.1.8',`In a free-fall experiment an electromagnet releases a ball from rest and starts an electronic timer; a contact plate stops it. The bottom of the ball falls ${heightMm} mm in ${tTenths*100} ms. Neglect air resistance and timing delay. Estimate g in m/s^2.`,gTenths/10,
        'Convert both measurements to SI units, then use h = 0.5gt^2.',`h = ${heightMm/1000} m and t = ${tTenths/10} s, so g = 2h/t^2 = ${gTenths/10} m/s^2.`),
      numeric('as-u2-a5','2.1.9',`A ball leaves a horizontal platform ${height} m above level ground at ${horizontalSpeed} m/s horizontally. Take g = 10 m/s^2 and neglect air resistance. Find its horizontal range before impact in m.`,horizontalSpeed*flightTime,
        'Use vertical free fall to find time, then horizontal distance = horizontal speed × time.',`t = sqrt(2 × ${height} / 10) = ${flightTime} s; range = ${horizontalSpeed} × ${flightTime} = ${horizontalSpeed*flightTime} m.`),
      numeric('as-u2-a6','2.1.7',`A stone is released from rest ${fallHeight} m above the ground. Take g = 10 m/s^2 and neglect air resistance. Find its speed immediately before impact in m/s.`,10*fallTime,
        'Eliminate time using v^2 = u^2 + 2as.',`v = sqrt(2 × 10 × ${fallHeight}) = ${10*fallTime} m/s.`)
    ],difficulty);
  }
  const accel = 2*r(1,3), positiveTime = r(1,5), negativeTime = r(1,5);
  const startV = accel*positiveTime, endV = -accel*negativeTime, distance = r(0,1)===0;
  const derivation = r(0,1);
  const braking = r(2,5), factor = r(1,3), speed = 2*braking*factor, reactionTenths = 5*r(1,3);
  const vx = 2*r(2,8), vy = 10*r(1,3);
  const early = r(0,1)===0;
  const totalTime = 2*r(2,4), upwardSpeed = 5*r(1,3), cliffHeight = 5*totalTime*totalTime-upwardSpeed*totalTime;
  return validateUnitSet([
    numeric('as-u2-r1','2.1.3',`A velocity–time graph is a straight line from (0 s, ${startV} m/s) to (${positiveTime+negativeTime} s, ${endV} m/s). A learner ignores the sign change. Find the correct ${distance?'total distance travelled':'signed displacement'} in m.`,(startV*positiveTime+(distance?-endV:endV)*negativeTime)/2,
      'Find the zero-velocity time and the areas of the two triangles. Distance adds their magnitudes; displacement adds signed areas.',
      `Velocity is zero at ${positiveTime} s. Areas have magnitudes ${startV*positiveTime/2} m and ${-endV*negativeTime/2} m. The answer is ${(startV*positiveTime+(distance?-endV:endV)*negativeTime)/2} m.`),
    choice('as-u2-r2','2.1.6',derivation===0
      ? 'For nonzero constant acceleration a, combine t = (v - u)/a with s = (u + v)t/2. Expanding 2as = (v - u)(v + u) gives 2as = which expression?'
      : 'For nonzero constant acceleration a, substitute t = (v - u)/a into s = (u + v)t/2 and expand the numerator. Which expression equals s?',
      ['v^2 - u^2','(v^2 - u^2)/(2a)','v^2 + u^2','(v - u)^2/(2a)'],derivation,
      'Use the difference of two squares after eliminating time.',derivation===0
        ? '(v - u)(v + u) = v^2 - u^2, hence v^2 = u^2 + 2as.'
        : 's = (u + v)(v - u)/(2a) = (v^2 - u^2)/(2a).'),
    numeric('as-u2-r3','2.1.7',`A car travels at ${speed} m/s during a reaction time of ${reactionTenths/10} s, then brakes with constant deceleration of magnitude ${braking} m/s^2 until rest. A learner treats it as moving at its initial speed during braking. Find the correct total stopping distance in m.`,speed*reactionTenths/10+speed*speed/(2*braking),
      'Add the constant-speed reaction distance to the uniformly decelerated braking distance.',`Reaction distance = ${speed*reactionTenths/10} m. Braking distance = ${speed}^2 / (2 × ${braking}) = ${speed*speed/(2*braking)} m. Total = ${speed*reactionTenths/10+speed*speed/(2*braking)} m.`),
    numeric('as-u2-r4','2.1.9',`A projectile leaves level ground with horizontal velocity ${vx} m/s and upward velocity ${vy} m/s. A learner uses the initial resultant speed as the horizontal speed. Take g = 10 m/s^2 and neglect air resistance. Find the correct horizontal range when it returns to its launch height, in m.`,vx*2*vy/10,
      'The vertical motion sets flight time; only the horizontal component determines range.',`Time to the top = ${vy/10} s, total time = ${2*vy/10} s. Range = ${vx} × ${2*vy/10} = ${vx*2*vy/10} m.`),
    choice('as-u2-r5','2.1.8',`A ball is released from rest above a contact plate. Its fall distance h is measured correctly and air resistance is negligible. The stop signal occurs at impact, but the timer starts ${early?'before release':'after release, while the ball is still falling'}. Using g = 2h/t^2, which explains the resulting bias?`,
      ['The measured time is too long, so g is underestimated.','The measured time is too short, so g is overestimated.','The measured time is too long, so g is overestimated.','The measured time is too short, so g is underestimated.'],early?0:1,
      'Consider how the start error changes t, then how t appears in the denominator.',early
        ? 'Starting before release includes extra time; the larger denominator makes the calculated g too small.'
        : 'Starting after release misses part of the fall; the smaller denominator makes the calculated g too large.'),
    numeric('as-u2-r6','2.1.7',`A ball is thrown vertically upwards at ${upwardSpeed} m/s from a cliff ${cliffHeight} m above the ground. Upward is positive. Take g = 10 m/s^2 and neglect air resistance. A learner chooses the positive square root for the impact velocity. Find the correct signed velocity at impact in m/s.`,upwardSpeed-10*totalTime,
      'Use signed displacement -h and acceleration -g; at impact the ball is moving downwards.',`v^2 = ${upwardSpeed}^2 + 2 × (-10) × (-${cliffHeight}) = ${(upwardSpeed-10*totalTime)**2}. The downward root is ${upwardSpeed-10*totalTime} m/s.`)
  ],difficulty);
};
// END AS TOPIC 2

// BEGIN AS TOPIC 3
// Cambridge 9702, user-supplied 664565-2025-2027-syllabus.pdf, version 1, pp. 17–18.
// Thirteen objectives, sections 3.1–3.3; provenance in lib/as-physics-syllabus.json.
const structuredAsDynamics = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    const letter=String.fromCharCode(97+(correct-offset+options.length)%options.length);
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((text,i)=>`(${String.fromCharCode(97+i)}) ${text}`).join(' ')}`,
      letter,hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),
    answerFormat:'Enter the number only, in the unit requested. Retain a negative sign where appropriate.'
  });
  if(difficulty==='foundational') {
    const light=r(1,4), heavy=light+r(1,4), aHeavier=r(0,1)===0;
    const mass=r(1,8), acceleration=r(1,5)*(r(0,1)===0?1:-1);
    const momentumMass=r(1,6), velocity=r(1,8)*(r(0,1)===0?1:-1);
    const weightMass=r(1,10), gTenths=[16,98,100][r(0,2)];
    const law=r(0,2);
    const lawStatements=[
      'With zero resultant force, an object continues moving with constant velocity.',
      'For a fixed mass, doubling the resultant force doubles the acceleration in the force direction.',
      'When cart A pushes cart B, cart B simultaneously exerts an equal and opposite force on cart A.'
    ];
    const resistanceCase=r(0,5), east=resistanceCase%2===0, friction=resistanceCase>=4, faster=resistanceCase<2;
    return validateUnitSet([
      choice('as-u3-f1','3.1.1',`Cart A has mass ${aHeavier?heavy:light} kg and cart B has mass ${aHeavier?light:heavy} kg. Which has greater inertia (resistance to a change in motion)?`,
        ['cart A','cart B','both have the same inertia','neither has inertia'],aHeavier?0:1,
        'Mass measures inertia.',`Cart ${aHeavier?'A':'B'} has the greater mass, so it has greater inertia.`),
      numeric('as-u3-f2','3.1.2',`A ${mass} kg object experiences a resultant horizontal force of ${mass*acceleration} N. Right is positive. Find its signed acceleration in m/s^2.`,acceleration,
        'Use a = F/m; acceleration has the same direction as the resultant force.',`${mass*acceleration} / ${mass} = ${acceleration} m/s^2.`),
      numeric('as-u3-f3','3.1.3',`An object of mass ${momentumMass} kg has velocity ${velocity} m/s, with east positive. Find its signed linear momentum in kg m/s.`,momentumMass*velocity,
        'Momentum is mass multiplied by velocity.',`${momentumMass} × ${velocity} = ${momentumMass*velocity} kg m/s.`),
      numeric('as-u3-f4','3.1.6',`An object has mass ${weightMass} kg where the acceleration of free fall is ${gTenths/10} m/s^2. Find the magnitude of its weight in N.`,weightMass*gTenths/10,
        'Weight is the gravitational force: W = mg.',`${weightMass} × ${gTenths/10} = ${weightMass*gTenths/10} N, directed downwards.`),
      {...sq('as-u3-f5','3.1.5',difficulty,`Which of Newton's laws is illustrated? ${lawStatements[law]} Enter first, second or third.`,
        [['first','1st','1'],['second','2nd','2'],['third','3rd','3']][law],
        'The first law concerns zero resultant force, the second links force to acceleration, and the third concerns interaction pairs.',
        `This is Newton's ${['first','second','third'][law]} law.`),answerFormat:'Enter first, second or third.'},
      choice('as-u3-f6','3.2.1',friction
        ? `A box slides ${east?'east':'west'} across a stationary horizontal floor. In which direction does the sliding friction from the floor act on the box?`
        : `An object moves ${east?'east':'west'} through a fluid (air or water) at rest and its speed ${faster?'increases':'decreases'}. Assume drag increases with speed. Which gives the drag direction and the change in its magnitude?`,
        friction?['east','west','vertically upwards','there is no friction']:['east; increases','east; decreases','west; increases','west; decreases'],friction?(east?1:0):(east?2:0)+(faster?0:1),
        friction?'Sliding friction opposes the relative sliding of the surfaces.':'Drag opposes motion relative to the fluid and grows with speed.',
        friction?`The box slides ${east?'east':'west'}, so sliding friction acts ${east?'west':'east'}.`:`Drag acts ${east?'west':'east'} and its magnitude ${faster?'increases':'decreases'}.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    // Construct mass as a multiple of contact time so the average force is exact.
    const timeTenths=r(1,5), forceScale=r(1,4), massTenths=timeTenths*forceScale, rebound=r(2,8), u=rebound+r(0,4);
    const weight=10*r(2,5), excess=5*r(1,2), greater=r(0,1)===0, drag=weight+(greater?excess:-excess);
    const zeroResultant=r(0,1)===0;
    const mA=r(1,4), mB=r(1,4), factor=r(1,3), initial=(mA+mB)*factor, final=mA*factor;
    const isolated=r(0,1)===0;
    const approachingA=r(1,8), approachingB=r(1,8);
    return validateUnitSet([
      numeric('as-u3-a1','3.1.4',`A ${massTenths/10} kg ball moving along a horizontal guide approaches a passive stationary wall at +${u} m/s and rebounds at -${rebound} m/s. The contact lasts ${timeTenths/10} s. Find the average horizontal resultant force on the ball during contact in N, taking its initial direction as positive.`,-(u+rebound)*forceScale,
        'Use average force = (final momentum - initial momentum) / contact time.',`F = (${massTenths/10} × (-${rebound}) - ${massTenths/10} × ${u}) / ${timeTenths/10} = ${-(u+rebound)*forceScale} N.`),
      choice('as-u3-a2','3.2.2',`An object is currently falling downwards. Its weight is ${weight} N downwards and its air resistance is ${drag} N upwards; these are the only forces. Which describes its acceleration and the immediate change in its speed?`,
        ['upwards; speed decreases','downwards; speed increases','upwards; speed increases','downwards; speed decreases'],greater?0:1,
        'Compare the opposing forces; acceleration need not point in the direction of velocity.',`The resultant is ${excess} N ${greater?'upwards':'downwards'}, so the falling object ${greater?'slows down':'speeds up'}.`),
      {...sq('as-u3-a3','3.2.3',difficulty,`A vehicle reaches a constant terminal speed on a level road while its engine continues to exert a nonzero driving force. True or false: ${zeroResultant?'the resultant horizontal force is zero':'the resistive force is zero'}.`,
        zeroResultant?'true':'false','At terminal speed the driving and resistive forces balance.',
        zeroResultant?'True: constant velocity means zero acceleration and zero resultant horizontal force.':'False: a nonzero resistive force balances the nonzero driving force.'),answerFormat:'Enter true or false.'},
      numeric('as-u3-a4','3.3.2',`Cart A of mass ${mA} kg moves at ${initial} m/s to the right and collides with stationary cart B of mass ${mB} kg. They stick together. External horizontal impulse is negligible. Find their common velocity in m/s, with right positive.`,final,
        'Conserve total horizontal momentum; include both masses after they stick.',`${mA} × ${initial} = (${mA} + ${mB})v, so v = ${final} m/s.`),
      choice('as-u3-a5','3.3.1',`Two carts interact over a finite time interval. For the system containing both carts, the net external horizontal force is ${isolated?'zero throughout':'constant and nonzero throughout'}. Which statement about total horizontal momentum is correct?`,
        ['It is conserved because the net external impulse is zero.','It changes because the net external impulse is nonzero.','It must change because the carts exert forces on each other.','It is always conserved even with a nonzero external impulse.'],isolated?0:1,
        'Internal interaction forces cancel for the combined system; external impulse changes total momentum.',isolated
          ? 'Zero external impulse means unchanged total horizontal momentum.'
          : 'A constant nonzero external force over a finite interval gives a nonzero external impulse and changes total horizontal momentum.'),
      numeric('as-u3-a6','3.3.3',`Two equal-mass carts approach each other on a straight track: A moves right at ${approachingA} m/s and B moves left at ${approachingB} m/s. Their collision is elastic and external impulse is negligible. Find their relative speed of separation in m/s.`,approachingA+approachingB,
        'For an elastic collision, relative speed of separation equals relative speed of approach.',`The approach speed is ${approachingA} + ${approachingB} = ${approachingA+approachingB} m/s; separation speed is the same. Total kinetic energy is also conserved.`)
    ],difficulty);
  }
  const earthPair=r(0,1)===0;
  const moreDrag=r(0,1)===0;
  const mass=r(1,4), u=2*r(1,5), speedB=2*r(1,5), common=(u-speedB)/2;
  const energyBefore=mass*(u*u+speedB*speedB)/2, energyAfter=mass*common*common;
  const eastFactor=r(2,6), northFactor=r(2,6);
  const largerA=r(0,1)===0, baseMass=1, k=r(1,5);
  const mA=baseMass*(largerA?2:1), mB=baseMass*(largerA?1:2), vA=largerA?k:-k, vB=largerA?4*k:2*k;
  // Equal-mass 2-D elastic collision: outgoing velocity vectors are perpendicular.
  // A: (9n/5, ±12n/5); B: (16n/5, ∓12n/5); speeds 3n and 4n, initial speed 5n.
  const n=r(1,5), above=r(0,1)===0, ax=9*n/5, ay=(above?12:-12)*n/5, bx=16*n/5, by=-ay;
  return validateUnitSet([
    choice('as-u3-r1','3.1.5',`A book rests on a table. Consider the ${earthPair?'downward gravitational force of Earth on the book':'upward contact force of the table on the book'}. Which force is its Newton's third-law partner, rather than another force acting on the same book?`,
      ['upward gravitational force of the book on Earth','downward contact force of the book on the table','upward contact force of the table on the book','downward gravitational force of Earth on the book'],earthPair?0:1,
      'The partner acts on the other interacting object and is the same kind of force.',earthPair
        ? 'The partner is the upward gravitational force exerted by the book on Earth. Weight and the table force on the book are not a third-law pair.'
        : 'The partner is the downward contact force exerted by the book on the table. Both forces act on different objects.'),
    choice('as-u3-r2','3.2.3',`An object is falling at terminal speed. Without changing its mass, a change in its shape ${moreDrag?'increases':'decreases'} drag at every given nonzero speed. Assume drag increases with speed and a new terminal speed is reached. Which gives its acceleration immediately after the change, its eventual terminal speed compared with before, and the drag at that new terminal speed?`,
      ['upwards; lower; equal to weight','downwards; higher; equal to weight','upwards; higher; zero','downwards; lower; zero'],moreDrag?0:1,
      'Velocity cannot change instantly. Compare drag and weight just after the shape change, then apply force balance at the new terminal speed.',moreDrag
        ? 'Initially drag exceeds weight, so acceleration is upwards. The object slows to a lower terminal speed where drag again equals weight.'
        : 'Initially drag is below weight, so acceleration is downwards. The object speeds up to a higher terminal speed where drag again equals weight.'),
    numeric('as-u3-r3','3.3.4',`Two carts each of mass ${mass} kg move towards each other at ${u} m/s rightwards and ${speedB} m/s leftwards. They stick together, with negligible external horizontal impulse. A learner claims momentum conservation also guarantees kinetic-energy conservation. Calculate the kinetic energy lost in J.`,energyBefore-energyAfter,
      'Find the common velocity from signed momentum, then subtract final kinetic energy from initial kinetic energy.',`Common velocity = (${u} - ${speedB})/2 = ${common} m/s (right is positive). Initial KE = ${energyBefore} J; final KE = ${energyAfter} J; loss = ${energyBefore-energyAfter} J. Momentum is conserved but kinetic energy decreases.`),
    {...sq('as-u3-r4','3.3.2',difficulty,`In a horizontal plane, a 2 kg puck moving east at ${3*eastFactor} m/s collides with a 1 kg puck moving north at ${3*northFactor} m/s. They stick together with negligible external horizontal impulse. Find the east and north components of their common velocity in m/s, in that order.`,
      `${2*eastFactor}, ${northFactor}`,'Conserve momentum separately in the east and north directions; divide each total by the combined mass.',
      `East: 2 × ${3*eastFactor} / 3 = ${2*eastFactor} m/s. North: 1 × ${3*northFactor} / 3 = ${northFactor} m/s.`),answerFormat:'Enter east, north as two numbers separated by a comma.'},
    {...sq('as-u3-r5','3.3.3',difficulty,`Cart A of mass ${mA} kg moves right at ${3*k} m/s into stationary cart B of mass ${mB} kg. The one-dimensional collision is elastic, with negligible external impulse. Find the final signed velocities of A and B in m/s, in that order, taking right as positive.`,
      `${vA}, ${vB}`,'Use both momentum conservation and relative speed of separation = relative speed of approach.',
      `Momentum: ${mA}vA + ${mB}vB = ${mA*3*k}. Elasticity: vB - vA = ${3*k}. Thus vA = ${vA} m/s and vB = ${vB} m/s. Both momentum and kinetic energy are conserved.`),answerFormat:'Enter vA, vB as two signed numbers separated by a comma.'},
    {...sq('as-u3-r6','3.3.2',difficulty,`Two 1 kg smooth pucks collide elastically in a horizontal plane with negligible external impulse. Initially A moves east at ${5*n} m/s and B is stationary. Afterwards A has (east, north) velocity components (${ax}, ${ay}) m/s. A learner ignores the north component when finding B's velocity. Find B's correct (east, north) velocity components in m/s.`,
      `${bx}, ${by}`,'Conserve both components of total momentum, including the initially zero north component.',
      `B has east component ${5*n} - ${ax} = ${bx} m/s and north component 0 - (${ay}) = ${by} m/s. Final speeds are ${3*n} and ${4*n} m/s, so final KE = ${(9+16)*n*n/2} J equals the initial KE.`),answerFormat:'Enter east, north as two signed numbers separated by a comma.'}
  ],difficulty);
};
// END AS TOPIC 3

// BEGIN AS TOPIC 4
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, pp. 18–19.
// Thirteen objectives in 4.1–4.3; source hash and wording in as-physics-syllabus.json.
const structuredAsForces = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),
    answerFormat:'Enter the number only, in the unit requested. Retain a negative sign where appropriate.'
  });
  if(difficulty==='foundational') {
    const start=r(1,10), half=r(2,12), force=r(2,20), distanceTenths=r(1,9);
    const separated=r(0,1)===0, coupleForce=r(2,15), separationCm=5*r(1,10);
    const densityTenths=[8,12,25,78][r(0,3)], volume=10*r(1,10), areaHundredths=r(1,5), pressureHundreds=r(1,20);
    return validateUnitSet([
      numeric('as-u4-f1','4.1.1',`A uniform thin rod in a uniform gravitational field extends from x = ${start} cm to x = ${start+2*half} cm. At what x coordinate in cm may its whole weight be treated as acting?`,start+half,
        'The weight acts at the centre of gravity; a uniform rod has its centre at its midpoint.',`The centre of gravity is at (${start} + ${start+2*half})/2 = ${start+half} cm.`),
      numeric('as-u4-f2','4.1.2',`A force of ${force} N has a perpendicular distance of ${distanceTenths/10} m from a pivot to its line of action. Find the magnitude of its moment about the pivot in N m.`,force*distanceTenths/10,
        'Moment = force × perpendicular distance from the pivot.',`${force} × ${distanceTenths/10} = ${force*distanceTenths/10} N m.`),
      {...sq('as-u4-f3','4.1.3',difficulty,`True or false: two equal and opposite parallel forces acting on a rigid body along ${separated?'different lines of action form a couple':'the same line of action form a couple'}.`,separated?'true':'false',
        'A couple has zero resultant force but a nonzero turning effect.',separated?'True: the separated lines of action give a torque and no resultant force.':'False: on the same line, both the resultant force and resultant torque are zero.'),answerFormat:'Enter true or false.'},
      numeric('as-u4-f4','4.1.4',`A couple consists of two opposite forces, each ${coupleForce} N. The perpendicular separation of their lines of action is ${separationCm} cm. Find the torque magnitude in N m.`,coupleForce*separationCm/100,
        'Use one force multiplied by the full perpendicular separation.',`${coupleForce} × (${separationCm}/100) = ${coupleForce*separationCm/100} N m.`),
      numeric('as-u4-f5','4.3.1',`A sample has mass ${densityTenths*volume/10} g and volume ${volume} cm^3. Find its density in g/cm^3.`,densityTenths/10,
        'Density is mass per unit volume.',`${densityTenths*volume/10} / ${volume} = ${densityTenths/10} g/cm^3.`),
      numeric('as-u4-f6','4.3.2',`A normal force of ${pressureHundreds*areaHundredths} N acts uniformly over an area of ${areaHundredths/100} m^2. Find the pressure in Pa.`,100*pressureHundreds,
        'Pressure is normal force per unit area.',`${pressureHundreds*areaHundredths} / ${areaHundredths/100} = ${100*pressureHundreds} Pa.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    const leftTenths=r(1,5), rightTenths=r(1,5), factor=r(2,8), state=r(0,3), scale=r(1,6), deriveForce=r(0,1)===0;
    const rho=[800,1000,1200][r(0,2)], upperTenths=r(0,5), differenceTenths=r(1,10);
    const topDepthCm=r(10,30), blockHeightCm=2*r(1,10), areaCm2=10*r(1,5);
    return validateUnitSet([
      numeric('as-u4-a1','4.2.1',`A weightless horizontal beam is pivoted at O. A downward force of ${rightTenths*factor} N acts ${leftTenths/10} m to the left of O. What downward force in N must act ${rightTenths/10} m to the right of O for rotational equilibrium?`,leftTenths*factor,
        'Clockwise and anticlockwise moments must balance.',`${rightTenths*factor} × ${leftTenths/10} = F × ${rightTenths/10}, so F = ${leftTenths*factor} N.`),
      choice('as-u4-a2','4.2.2',`A rigid body moves in a plane and has ${state%2===0?'zero':'nonzero'} resultant force and ${state<2?'zero':'nonzero'} resultant torque about its centre of mass. Which describes its motion at that instant?`,
        ['neither linear nor angular acceleration: equilibrium','linear acceleration only','angular acceleration only','both linear and angular acceleration'],state,
        'Equilibrium requires both resultant force and resultant torque to be zero.',['Both resultants are zero, so the body is in equilibrium; it need not be at rest.','Nonzero resultant force causes linear acceleration, but the torque is zero.','Zero resultant force gives no linear acceleration, but nonzero torque causes angular acceleration.','Both resultants are nonzero, so there is both linear and angular acceleration.'][state]),
      {...sq('as-u4-a3','4.2.3',difficulty,`Three coplanar forces acting at one point keep a particle in equilibrium. Two forces are ${3*scale} N east and ${4*scale} N north. Complete their closed head-to-tail vector triangle: give the signed (east, north) components of the third force in N.`,
        `${-3*scale}, ${-4*scale}`,'The third vector must close the triangle, cancelling both known components.',`The third force is (${-3*scale}, ${-4*scale}) N, so both component sums are zero.`),answerFormat:'Enter east, north as two signed numbers separated by a comma.'},
      choice('as-u4-a4','4.3.3',deriveForce
        ? 'A stationary liquid column has area A, height Δh, density ρ and mass ρAΔh. In deriving hydrostatic pressure, the pressure-force difference balances its weight. Which expression is that force difference?'
        : 'A stationary liquid column has area A, height Δh and density ρ. Its pressure-force difference is ρAgΔh. Divide by A and simplify: which expression is the pressure difference?',
        ['ρAgΔh','ρgΔh','ρg/Δh','ρAΔh/g'],deriveForce?0:1,
        'Use mass = density × volume, weight = mg, then pressure = force / area.',deriveForce?'The weight is (ρAΔh)g = ρAgΔh.':'Δp = (ρAgΔh)/A = ρgΔh; the area cancels.'),
      numeric('as-u4-a5','4.3.4',`A liquid of density ${rho} kg/m^3 is at rest. Two points are ${upperTenths/10} m and ${(upperTenths+differenceTenths)/10} m below its surface. Take g = 10 m/s^2. Find the pressure at the deeper point minus that at the shallower point in Pa.`,rho*differenceTenths,
        'Use the depth difference, not the total depth: Δp = ρgΔh.',`Δh = ${differenceTenths/10} m; Δp = ${rho} × 10 × ${differenceTenths/10} = ${rho*differenceTenths} Pa.`),
      numeric('as-u4-a6','4.3.5',`A fully submerged rectangular block has horizontal top and bottom faces each of area ${areaCm2} cm^2. Liquid gauge pressure is ${100*topDepthCm} Pa at the top and ${100*(topDepthCm+blockHeightCm)} Pa at the bottom. Forces on opposite vertical faces cancel. Find the net upward force from the liquid in N.`,blockHeightCm*areaCm2/100,
        'Upthrust comes from the larger pressure at the bottom. Subtract the top-face force from the bottom-face force.',`F = (${100*(topDepthCm+blockHeightCm)} - ${100*topDepthCm}) × (${areaCm2}/10000) = ${blockHeightCm*areaCm2/100} N upwards.`)
    ],difficulty);
  }
  const length=2*r(1,4), beamWeight=2*r(5,20), loadFactor=r(2,6), load=length*loadFactor, x=r(1,length-1);
  const right=beamWeight/2+loadFactor*x, left=beamWeight+load-right;
  const forceHalf=r(5,20), armTenths=r(2,10), upward=r(0,1)===0;
  const coupleForce=10*r(1,8), separationCm=10*r(1,5), leftUp=r(0,1)===0, torque=(leftUp?-1:1)*coupleForce*separationCm/100;
  const scale=r(1,8), liquidRho=[800,1000][r(0,1)], totalCm3=100*r(2,10), percent=25*r(1,3);
  const objectRho=[2000,2500,3000][r(0,2)], litres=r(1,4), fluidRho=[800,1000][r(0,1)];
  return validateUnitSet([
    {...sq('as-u4-r1','4.2.1',difficulty,`A uniform horizontal beam of length ${length} m and weight ${beamWeight} N is supported at both ends. An extra downward load of ${load} N acts ${x} m from the left end. A learner ignores the beam's own weight. Find the correct upward reactions at the left and right supports in N, in that order.`,
      `${left}, ${right}`,'Take moments about one support, including the beam weight at its midpoint, then use vertical force balance.',`Right reaction × ${length} = ${beamWeight} × ${length/2} + ${load} × ${x}. Right = ${right} N. Left = ${beamWeight} + ${load} - ${right} = ${left} N.`),answerFormat:'Enter left, right as two numbers separated by a comma.'},
    numeric('as-u4-r2','4.1.2',`A light horizontal rod extends ${armTenths/10} m to the right of a pivot. A ${2*forceHalf} N force acts at its free end at 30° ${upward?'above':'below'} the horizontal. A learner uses the full force as perpendicular to the rod. Using sin 30° = 0.5, find the correct signed moment in N m, with anticlockwise positive.`,(upward?1:-1)*forceHalf*armTenths/10,
      'Use the perpendicular force component, then assign the rotation sign.',`Perpendicular force magnitude = ${forceHalf} N; moment = ${(upward?1:-1)*forceHalf*armTenths/10} N m (${upward?'anticlockwise':'clockwise'}).`),
    numeric('as-u4-r3','4.1.4',`Two vertical forces each of magnitude ${coupleForce} N form a couple on a horizontal bar. The force at x = 1 m acts ${leftUp?'upwards':'downwards'} and the force at x = ${(100+separationCm)/100} m acts ${leftUp?'downwards':'upwards'}. A learner adds their moment magnitudes about x = 0. Find the correct net torque in N m, with anticlockwise positive.`,torque,
      'The two moments have opposite signs. A couple torque is one force times the separation of the lines of action.',`The resultant force is zero. The separation is ${separationCm/100} m; signed torque = ${torque} N m.`),
    {...sq('as-u4-r4','4.2.3',difficulty,`A small ring is in equilibrium under a downward load of ${3*scale} N and tensions in two light cables. One cable pulls horizontally left; the other pulls up and right at angle θ to the horizontal, with sin θ = 0.6 and cos θ = 0.8. Use a closed force triangle to find the horizontal-cable and inclined-cable tensions in N, in that order.`,
      `${4*scale}, ${5*scale}`,'The inclined tension supplies the whole upward component; its horizontal component balances the other tension.',`Inclined tension = ${3*scale}/0.6 = ${5*scale} N; horizontal tension = 0.8 × ${5*scale} = ${4*scale} N. The force triangle closes.`),answerFormat:'Enter horizontal, inclined as two numbers separated by a comma.'},
    numeric('as-u4-r5','4.3.6',`A block of total volume ${totalCm3} cm^3 is held with ${percent}% of its volume immersed in a liquid of density ${liquidRho} kg/m^3. Take g = 10 m/s^2 and neglect air buoyancy. A learner uses the whole block volume in Archimedes' principle. Find the correct upthrust in N.`,liquidRho*totalCm3*percent/10000000,
      'Use only the displaced liquid volume, and convert cubic centimetres to cubic metres.',`Displaced volume = ${totalCm3*percent/100} cm^3. F = ${liquidRho} × 10 × (${totalCm3*percent/100}/1000000) = ${liquidRho*totalCm3*percent/10000000} N.`),
    numeric('as-u4-r6','4.3.6',`A solid of mass ${objectRho*litres/1000} kg and volume ${litres*1000} cm^3 is fully immersed in a liquid of density ${fluidRho} kg/m^3, suspended at rest from a vertical string. Take g = 10 m/s^2. A learner adds upthrust to weight to find the tension. Find the correct string tension in N.`,(objectRho-fluidRho)*litres/100,
      'At rest, tension plus upthrust balances weight. Use displaced volume for the upthrust.',`Weight = ${objectRho*litres/100} N; upthrust = ${fluidRho*litres/100} N; tension = ${(objectRho-fluidRho)*litres/100} N.`)
  ],difficulty);
};
// END AS TOPIC 4

// BEGIN AS TOPIC 5
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 19.
// Eleven objectives in 5.1–5.2; source hash and wording in as-physics-syllabus.json.
const structuredAsEnergy = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),
    answerFormat:'Enter the number only, in the unit requested. Retain a negative sign where appropriate.'
  });
  if(difficulty==='foundational') {
    const force=r(2,20), distance=r(1,8), direction=r(0,2), conserved=r(0,1)===0;
    const efficiency=25*r(1,3), input=4*r(5,20), quicker=r(0,1)===0;
    const mass=r(1,10), startHeight=10*r(1,3), heightChange=r(1,8)*(r(0,1)===0?1:-1);
    const kineticMass=r(1,5), speed=2*r(1,10);
    return validateUnitSet([
      numeric('as-u5-f1','5.1.1',`An object is displaced ${distance} m east while a constant force of ${force} N acts ${['east','west','north'][direction]}. Find the work done by this force in J.`,[force*distance,-force*distance,0][direction],
        'Only the force component along displacement does work; an opposing component does negative work.',`Work = ${[force*distance,-force*distance,0][direction]} J because the force is ${['along','opposite to','perpendicular to'][direction]} the displacement.`),
      {...sq('as-u5-f2','5.1.2',difficulty,`True or false: in an isolated system, friction converts some kinetic energy into internal energy, so ${conserved?'total energy remains constant':'some of the total energy is destroyed'}.`,conserved?'true':'false',
        'Energy can change form while total energy is conserved.',conserved?'True: internal energy is included in the conserved total.':'False: the energy is transferred to internal energy, not destroyed.'),answerFormat:'Enter true or false.'},
      numeric('as-u5-f3','5.1.3',`A device receives ${input} J of total input energy and delivers ${input*efficiency/100} J of useful output energy. Find its efficiency as a percentage.`,efficiency,
        'Efficiency = useful output energy / total input energy.',`(${input*efficiency/100} / ${input}) × 100 = ${efficiency}%.`),
      choice('as-u5-f4','5.1.5',`Machines A and B perform the same amount of work. A takes ${quicker?'less':'more'} time than B. Which has the greater average power?`,
        ['machine A','machine B','both have equal average power','not enough information'],quicker?0:1,
        'Power is work done per unit time.',`For equal work, the machine taking less time has greater average power: ${quicker?'A':'B'}.`),
      numeric('as-u5-f5','5.2.2',`A ${mass} kg object moves from height ${startHeight} m to height ${startHeight+heightChange} m in a uniform gravitational field. Take g = 10 m/s^2. Find its signed change in gravitational potential energy in J.`,10*mass*heightChange,
        'Use ΔE = mg × (final height - initial height).',`${mass} × 10 × (${startHeight+heightChange} - ${startHeight}) = ${10*mass*heightChange} J.`),
      numeric('as-u5-f6','5.2.4',`An object of mass ${kineticMass} kg moves at speed ${speed} m/s. Find its kinetic energy in J.`,kineticMass*speed*speed/2,
        'Kinetic energy = 0.5 × mass × speed squared.',`0.5 × ${kineticMass} × ${speed}^2 = ${kineticMass*speed*speed/2} J.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    const power=50*r(1,10), time=2*r(2,10), inputPower=100*r(2,15), efficiency=20*r(1,4), duration=r(2,10);
    const rearrange=r(0,1)===0, raising=r(0,1)===0, fromRest=r(0,1)===0;
    const finalSpeed=2*r(2,10), drop=finalSpeed*finalSpeed/20;
    return validateUnitSet([
      numeric('as-u5-a1','5.1.6',`A motor does ${power*time} J of mechanical work in ${time} s. Find its average mechanical output power in W.`,power,
        'Divide the work done by the elapsed time.',`${power*time} / ${time} = ${power} W.`),
      numeric('as-u5-a2','5.1.4',`A device receives constant input power ${inputPower} W and has efficiency ${efficiency}%. It operates for ${duration} s. Find the energy transferred to non-useful forms in J.`,inputPower*(100-efficiency)*duration/100,
        'Find total input energy, then multiply by the fraction that is not useful.',`Input energy = ${inputPower*duration} J; non-useful fraction = ${(100-efficiency)/100}. Non-useful energy = ${inputPower*(100-efficiency)*duration/100} J.`),
      choice('as-u5-a3','5.1.7',rearrange
        ? 'A constant nonzero force F acts along motion at constant speed v. From P = W/t, W = Fs and s/t = v, obtain P = Fv. Rearrange this to give v: which expression is correct?'
        : 'A constant nonzero force F acts along motion at constant speed v. Substitute W = Fs into P = W/t, then use s/t = v. Which expression equals P?',
        ['Fv','P/F','F/v','Pv'],rearrange?1:0,
        'Power = Fs/t = F(s/t).',rearrange?'P = Fv, so v = P/F.':'P = Fs/t = Fv.'),
      choice('as-u5-a4','5.2.1',raising
        ? 'A mass m is raised slowly through a height Δh in a uniform field g. The upward lifting force equals mg. Using W = Fs, which expression gives the gain in gravitational potential energy?'
        : 'A mass m is lowered slowly through a positive distance Δh in a uniform field g. Gravity does positive work mgΔh. Which expression gives the signed change in gravitational potential energy?',
        ['mgΔh','-mgΔh','mg/Δh','mΔh/g'],raising?0:1,
        'Potential-energy change is minus the work done by gravity; during slow lifting it equals the work supplied by the lifting force.',raising?'W = (mg)Δh, so ΔE_P = mgΔh.':'Gravity does W = (mg)Δh, so ΔE_P = -mgΔh.'),
      choice('as-u5-a5','5.2.3',fromRest
        ? 'A resultant force accelerates a mass m from rest to speed v. Using v^2 = 2as and W = Fs = mas, which expression is its final kinetic energy?'
        : 'A constant resultant force accelerates a mass m from speed u to speed v along a straight line. Substitute s = (v^2 - u^2)/(2a) into W = mas. Which expression is the work done?',
        fromRest?['0.5mv^2','mv^2','0.5mv','m/v^2']:['0.5m(v^2 - u^2)','0.5m(v - u)^2','m(v^2 - u^2)','m(v - u)'],0,
        'Eliminate a and s using the constant-acceleration equation.',fromRest?'W = ma × v^2/(2a) = 0.5mv^2, the kinetic energy gained from rest.':'W = ma × (v^2 - u^2)/(2a) = 0.5m(v^2 - u^2).'),
      numeric('as-u5-a6','5.1.2',`A particle starts from rest and slides down a fixed frictionless track through a vertical drop of ${drop} m. Take g = 10 m/s^2 and neglect air resistance. Find its speed after the drop in m/s.`,finalSpeed,
        'Loss of gravitational potential energy equals gain of kinetic energy.',`mg × ${drop} = 0.5mv^2, so v = sqrt(20 × ${drop}) = ${finalSpeed} m/s.`)
    ],difficulty);
  }
  const halfForce=r(5,30), distance=r(2,12), forward=r(0,1)===0;
  const firstEfficiency=[40,50,60,80][r(0,3)], secondEfficiency=25*r(1,3), inputEnergy=10000*r(1,10);
  // Construct a lift with useful speed 0.5 m/s: m = useful power / (g × speed).
  const powerFactor=r(1,8), efficiencyStep=r(1,3), liftTime=2*r(2,10), liftMass=5*powerFactor*efficiencyStep;
  const carMass=100*r(5,15), resistance=100*r(1,5), carSpeed=r(5,20);
  const speedAtHeight=2*r(1,10), launchSpeed=speedAtHeight+2*r(1,5), height=(launchSpeed*launchSpeed-speedAtHeight*speedAtHeight)/20, ascending=r(0,1)===0;
  const brakingMass=100*r(2,12), finalSpeed=r(2,10), brakingDistance=3*finalSpeed;
  return validateUnitSet([
    numeric('as-u5-r1','5.1.1',`An object is displaced ${distance} m horizontally to the right. A constant force of ${2*halfForce} N makes an angle of ${forward?60:120}° with that displacement. A learner uses W = Fs without considering the angle. Using cos ${forward?60:120}° = ${forward?'0.5':'-0.5'}, find the correct signed work done by this force in J.`,(forward?1:-1)*halfForce*distance,
      'Use the force component along the displacement: W = Fs cos θ.',`${2*halfForce} × ${distance} × ${forward?'0.5':'(-0.5)'} = ${(forward?1:-1)*halfForce*distance} J.`),
    numeric('as-u5-r2','5.1.4',`Two energy converters operate in sequence. The first has efficiency ${firstEfficiency}% and all of its useful output feeds a second converter of efficiency ${secondEfficiency}%. The first receives ${inputEnergy} J. A learner adds the efficiencies. Find the useful output energy from the second converter in J.`,inputEnergy*firstEfficiency*secondEfficiency/10000,
      'Multiply the efficiency fractions, because the second acts only on the useful output of the first.',`First useful output = ${inputEnergy*firstEfficiency/100} J; final useful output = ${inputEnergy*firstEfficiency*secondEfficiency/10000} J.`),
    numeric('as-u5-r3','5.1.6',`A motor draws constant electrical power ${100*powerFactor} W with efficiency ${25*efficiencyStep}%. Its useful output lifts a ${liftMass} kg load at constant speed through ${liftTime/2} m. Take g = 10 m/s^2. A learner treats the electrical input as entirely useful. Find the correct time in s.`,liftTime,
      'First calculate useful lifting power; then divide mgΔh by that power.',`Useful power = ${25*powerFactor*efficiencyStep} W; gravitational energy gain = ${liftMass*10*liftTime/2} J; time = ${liftTime} s.`),
    numeric('as-u5-r4','5.1.7',`A ${carMass} kg vehicle travels steadily up a slope at ${carSpeed} m/s. The slope has sin θ = 0.1 and resistive forces total ${resistance} N down the slope. Take g = 10 m/s^2. A learner uses only resistance in P = Fv. Find the correct mechanical driving power in W.`,(carMass+resistance)*carSpeed,
      'At steady speed the driving force balances resistance plus the component of weight down the slope.',`Down-slope weight component = ${carMass} N. Driving force = ${carMass+resistance} N, so P = ${carMass+resistance} × ${carSpeed} = ${(carMass+resistance)*carSpeed} W.`),
    numeric('as-u5-r5','5.2.2',`A particle is projected vertically upwards at ${launchSpeed} m/s. It later passes a point ${height} m above launch level while ${ascending?'ascending':'descending'}. Take g = 10 m/s^2 and neglect air resistance. A learner adds the potential-energy gain to the initial kinetic energy. Find the correct signed velocity at this point in m/s, with upward positive.`,(ascending?1:-1)*speedAtHeight,
      'Kinetic energy decreases by the potential-energy gain. Choose the velocity sign from the stated direction of motion.',`v^2 = ${launchSpeed}^2 - 20 × ${height} = ${speedAtHeight*speedAtHeight}; the ${ascending?'upward':'downward'} velocity is ${(ascending?1:-1)*speedAtHeight} m/s.`),
    numeric('as-u5-r6','5.2.4',`A ${brakingMass} kg vehicle on a level road slows from ${2*finalSpeed} m/s to ${finalSpeed} m/s over ${brakingDistance} m under a constant horizontal resultant braking force. A learner assumes halving speed halves kinetic energy. Find the signed braking force in N, taking the direction of travel as positive.`,-brakingMass*finalSpeed/2,
      'Use the change in kinetic energy, then W = Fs. The force opposes the displacement.',`ΔE_K = 0.5 × ${brakingMass} × (${finalSpeed}^2 - ${2*finalSpeed}^2) = ${-3*brakingMass*finalSpeed*finalSpeed/2} J. Force = ${-3*brakingMass*finalSpeed*finalSpeed/2} / ${brakingDistance} = ${-brakingMass*finalSpeed/2} N.`)
  ],difficulty);
};
// END AS TOPIC 5


// BEGIN AS TOPIC 6
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 20.
// Ten objectives in 6.1–6.2; source hash and wording in as-physics-syllabus.json.
const structuredAsDeformation = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested.'
  });
  if(difficulty==='foundational') {
    const pulling=r(0,1)===0, length=10*r(2,5), change=r(1,8), extending=r(0,1)===0;
    const k=100*r(1,8), cm=r(1,5), hookeK=50*r(1,8), hookeCm=2*r(1,5);
    const area=r(1,5), stress=10*r(1,8), elastic=r(0,1)===0;
    return validateUnitSet([
      choice('as-u6-f1','6.1.1',`Equal and opposite forces act at the ends of a rod along its length, ${pulling?'pulling the ends apart':'pushing the ends towards each other'}. What type of loading is this?`,
        ['tensile','compressive','a couple','no loading'],pulling?0:1,'Decide whether the forces tend to lengthen or shorten the rod.',pulling?'Pulling apart produces tensile loading.':'Pushing together produces compressive loading.'),
      numeric('as-u6-f2','6.1.2',`An unloaded specimen has length ${length} cm. Under load its length becomes ${length+(extending?change:-change)} cm. Find the magnitude of its ${extending?'extension':'compression'} in cm.`,change,
        'Compare the loaded and unloaded lengths.',`The ${extending?'extension':'compression'} is ${change} cm; it is not the total length.`),
      numeric('as-u6-f3','6.1.4',`A spring obeying Hooke's law extends by ${cm} cm under a force of ${k*cm/100} N. Find its spring constant in N/m.`,k,
        'Convert extension to metres, then use k = F/x.',`k = ${k*cm/100} / ${cm/100} = ${k} N/m.`),
      numeric('as-u6-f4','6.1.3',`A spring of constant ${hookeK} N/m is extended by ${hookeCm} cm within its limit of proportionality. Find the magnitude of the applied force in N.`,hookeK*hookeCm/100,
        "Hooke's law is F = kx within the limit of proportionality.",`F = ${hookeK} × ${hookeCm/100} = ${hookeK*hookeCm/100} N.`),
      numeric('as-u6-f5','6.1.5',`A wire of cross-sectional area ${area} mm^2 carries a tensile force of ${area*stress} N. Find its tensile stress in MPa.`,stress,
        'Stress is force divided by cross-sectional area. 1 N/mm^2 = 1 MPa.',`Stress = ${area*stress} / ${area} = ${stress} MPa.`),
      {...sq('as-u6-f6','6.2.1',difficulty,`True or false: a specimen returns completely to its original length when the load is removed, so the deformation is ${elastic?'elastic':'plastic'}.`,elastic?'true':'false',
        'Elastic deformation is fully reversed on unloading.',elastic?'True: there is no permanent deformation.':'False: plastic deformation leaves a permanent change in length.'),answerFormat:'Enter true or false.'}
    ],difficulty);
  }
  if(difficulty==='application') {
    const length=r(1,4), strainStep=r(1,8), extension=length*strainStep/10;
    const modulus=25*r(2,8), strainUnits=r(1,4), wireStress=modulus*strainUnits;
    const experimentStep=r(0,3), stepCm=r(1,5), middleForce=10*r(1,8), endForce=3*middleForce;
    const finalForce=10*r(1,10), endCm=r(1,8), energyK=200*r(1,10), energyCm=r(1,8);
    return validateUnitSet([
      numeric('as-u6-a1','6.1.5',`A wire has original length ${length} m and extension ${extension} mm. Calculate its tensile strain (dimensionless).`,strainStep/10000,
        'Strain is extension divided by original length, both in the same unit.',`Strain = ${extension} / ${length*1000} = ${strainStep/10000}.`),
      numeric('as-u6-a2','6.1.5',`Within the proportional region, a wire has tensile stress ${wireStress} MPa and tensile strain ${strainUnits/1000}. Find its Young modulus in GPa.`,modulus,
        'Young modulus is stress divided by strain. Convert MPa to GPa.',`E = ${wireStress} / ${strainUnits/1000} MPa = ${modulus} GPa.`),
      choice('as-u6-a3','6.1.6',`In a Young modulus experiment on a long thin wire, the original gauge length is L and cross-sectional area is A. Which method is suitable for ${['measuring the diameter accurately','measuring L','obtaining the modulus from a force-extension graph','collecting a series of force-extension readings'][experimentStep]}?`,
        ['use a micrometer at several positions and orientations, then average the diameters','use a metre rule along the wire between the gauge marks','plot force F against extension x in the proportional region and multiply the gradient by L/A','increase the load in small steps within the proportional region and measure each extension from the original length'],experimentStep,
        'Distinguish measuring the dimensions, collecting readings and processing the graph.',[
          'Repeated micrometer readings check variation in diameter; calculate cross-sectional area from the diameter.',
          'Measure the initial distance between the gauge marks with a metre rule; measure extension separately.',
          'The F-x gradient is F/x = EA/L, so multiply it by L/A to obtain E.',
          'Use a series of small loads and measure extension relative to the initial length; keep within the proportional region.'
        ][experimentStep]),
      numeric('as-u6-a4','6.2.2',`A force-extension graph consists of straight segments joining (0 cm, 0 N), (${stepCm} cm, ${middleForce} N) and (${2*stepCm} cm, ${endForce} N). Find the total work done in stretching the specimen from zero to ${2*stepCm} cm, in J.`,(2*middleForce+endForce)*stepCm/200,
        'Add the first triangular area and the second trapezium area; convert cm to m.',`Work = 0.5 × ${middleForce} × ${stepCm/100} + 0.5 × (${middleForce} + ${endForce}) × ${stepCm/100} = ${(2*middleForce+endForce)*stepCm/200} J.`),
      numeric('as-u6-a5','6.2.3',`A material is stretched within its limit of proportionality. Its force-extension graph is a straight line from (0 cm, 0 N) to (${endCm} cm, ${finalForce} N). Find the stored elastic potential energy in J.`,finalForce*endCm/200,
        'Stored energy is the triangular area under the force-extension graph.',`Energy = 0.5 × ${finalForce} × ${endCm/100} = ${finalForce*endCm/200} J.`),
      numeric('as-u6-a6','6.2.4',`A spring of constant ${energyK} N/m is stretched by ${energyCm} cm within its limit of proportionality. Find the elastic potential energy stored in J.`,energyK*energyCm*energyCm/20000,
        'Use E = 0.5kx^2 with x in metres.',`E = 0.5 × ${energyK} × (${energyCm/100})^2 = ${energyK*energyCm*energyCm/20000} J.`)
    ],difficulty);
  }
  const radiusFactor=r(2,3), lengthFactor=r(2,4), extensionStep=r(1,3);
  const oldExtension=radiusFactor*radiusFactor*extensionStep/10, newExtension=lengthFactor*extensionStep/10;
  const radiusMistake=r(0,1)===0, permanent=r(0,1)===0;
  const residual=r(1,4), recoverCm=r(2,6), peakForce=20*r(1,6), loss=peakForce*r(1,4)/100;
  const recovered=peakForce*recoverCm/200, loadingWork=(peakForce*recoverCm+loss*200)/200, askLost=r(0,1)===0;
  const limitK=200*r(1,8), limitCm=r(1,8), limitForce=limitK*limitCm/100;
  const energyK=800*r(1,5), startCm=5*r(1,4), stretchFactor=r(2,3), extraEnergy=energyK*startCm*startCm*(stretchFactor*stretchFactor-1)/20000;
  return validateUnitSet([
    numeric('as-u6-r1','6.1.5',`Wire A has original length 4 m and extends ${oldExtension} mm under a tensile force. Wire B is made of the same material, has ${lengthFactor} times A's original length and ${radiusFactor} times A's radius, and carries the same force. Both remain within the proportional region. A learner treats area as proportional to radius. Find B's correct extension in mm.`,newExtension,
      'From E = FL/(Ax), extension is proportional to L/A for the same force and material. Area is proportional to radius squared.',`Extension = ${oldExtension} × ${lengthFactor} / ${radiusFactor}^2 = ${newExtension} mm.`),
    choice('as-u6-r2','6.1.6',`A learner determines a wire's Young modulus using E = FL/(Ax). All measurements are correct, but when calculating A the learner ${radiusMistake?'substitutes the radius for d in A = πd^2/4':'substitutes the diameter for r in A = πr^2'}. How does the calculated modulus compare with the true modulus?`,
      ['four times the true modulus','one quarter of the true modulus','twice the true modulus','half the true modulus'],radiusMistake?0:1,
      'Track the factor error in area, then remember E is inversely proportional to area.',radiusMistake?'Area is one quarter of the true area, so the calculated modulus is four times the true value.':'Area is four times the true area, so the calculated modulus is one quarter of the true value.'),
    choice('as-u6-r3','6.2.1',permanent
      ? 'A specimen is loaded and then completely unloaded. It retains a permanent extension. Which conclusion follows?'
      : 'A specimen is loaded beyond the point where force is proportional to extension, then completely unloaded. It returns to its original length. Which conclusion follows?',
      ['the elastic limit was exceeded and plastic deformation occurred','the proportionality limit was exceeded but the deformation was elastic','no deformation occurred','force stayed proportional to extension throughout'],permanent?0:1,
      'The proportionality limit concerns a linear relation; the elastic limit concerns permanent deformation.',permanent?'Permanent extension demonstrates plastic deformation beyond the elastic limit.':'Returning to the original length demonstrates elastic deformation, despite a non-proportional loading relation.'),
    numeric('as-u6-r4','6.2.2',`A specimen takes ${loadingWork} J of work to load from zero extension to ${residual+recoverCm} cm at force ${peakForce} N. Its unloading graph is a straight line from this point to zero force at extension ${residual} cm. Assume all loading work not returned mechanically during unloading is converted to thermal energy. Find the ${askLost?'energy dissipated during this loading-unloading process':'energy returned as mechanical work during unloading'} in J.`,askLost?loss:recovered,
      'Returned work is the area under the unloading line down to its zero-force intercept. Dissipated energy is loading work minus returned work.',`Returned work = 0.5 × ${peakForce} × (${residual+recoverCm} - ${residual}) / 100 = ${recovered} J. Dissipated energy = ${loadingWork} - ${recovered} = ${loss} J.`),
    numeric('as-u6-r5','6.1.2',`A spring has constant ${limitK} N/m and a limit of proportionality at force ${limitForce} N. A proposed extension of ${2*limitCm} cm would exceed that limit. Find the greatest extension, in cm, for which the proportional force-extension model applies.`,limitCm,
      'Calculate the extension at the proportionality limit using x = F/k.',`At the limit, x = ${limitForce} / ${limitK} m = ${limitCm} cm. The proposed extension is twice this.`),
    numeric('as-u6-r6','6.2.4',`A spring of constant ${energyK} N/m is initially extended by ${startCm} cm. It is then stretched to ${stretchFactor*startCm} cm; all extensions remain within the limit of proportionality. A learner uses 0.5k(final extension - initial extension)^2. Find the correct additional work required in J.`,extraEnergy,
      'Subtract the two stored energies; the difference of squares is not the square of the difference.',`Extra work = 0.5 × ${energyK} × ((${stretchFactor*startCm/100})^2 - (${startCm/100})^2) = ${extraEnergy} J.`)
  ],difficulty);
};
// END AS TOPIC 6

// BEGIN AS TOPIC 7
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, pp. 20–21.
// Sixteen objectives in 7.1–7.5; source hash and wording in as-physics-syllabus.json.
const structuredAsWaves = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested.'
  });
  if(difficulty==='foundational') {
    const source=r(0,1)===0, term=r(0,3), area=r(1,8), intensity=5*r(1,20), transverse=r(0,1)===0;
    const correctEM=r(0,1)===0, visible=400+50*r(0,6);
    return validateUnitSet([
      choice('as-u7-f1','7.1.1',source
        ? 'A small marked section of rope carries a travelling transverse wave. Which describes the motion of the marked section?'
        : 'A marked coil of a spring carries a travelling longitudinal wave. Which describes the motion of the marked coil?',
        ['oscillates about equilibrium perpendicular to the direction the disturbance travels','oscillates about equilibrium parallel to the direction the disturbance travels','travels continuously with the disturbance','remains permanently at its equilibrium position'],source?0:1,
        'Distinguish the motion of the material from the motion of a disturbance.',source?'The marked section oscillates transversely; it does not travel along the rope with the wave.':'Neighbouring coils transmit the disturbance while oscillating along the spring about their equilibrium positions.'),
      choice('as-u7-f2','7.1.2',`Which term means ${['the greatest magnitude of displacement from equilibrium','the time for one complete oscillation','the number of complete oscillations per second','the distance between neighbouring points in phase on a wave'][term]}?`,
        ['amplitude','period','frequency','wavelength'],term,'Displacement is position relative to equilibrium; distinguish spatial and temporal wave quantities.',`${['Amplitude','Period','Frequency','Wavelength'][term]} has this definition.`),
      numeric('as-u7-f3','7.1.7',`A progressive wave carries power ${area*intensity} W uniformly through a perpendicular area of ${area} m^2. Find its intensity in W/m^2.`,intensity,
        'Intensity is power per unit area normal to propagation.',`I = ${area*intensity} / ${area} = ${intensity} W/m^2.`),
      choice('as-u7-f4','7.2.1',`A wave travels horizontally to the right. The particles of its medium oscillate ${transverse?'vertically up and down':'horizontally left and right'}. How is the wave classified?`,
        ['transverse','longitudinal','electromagnetic because it moves right','stationary because particles oscillate'],transverse?0:1,
        'Compare particle displacement with the propagation direction.',transverse?'The oscillations are perpendicular to propagation: transverse.':'The oscillations are parallel to propagation: longitudinal.'),
      {...sq('as-u7-f5','7.4.1',difficulty,`True or false: in free space, all electromagnetic waves ${correctEM?'are transverse and travel at the same speed c':'have the same frequency because they travel at the same speed c'}.`,correctEM?'true':'false',
        'The common free-space speed does not require equal frequencies or wavelengths.',correctEM?'True: all electromagnetic waves are transverse and share free-space speed c.':'False: different electromagnetic frequencies have different wavelengths, with c = fλ.'),answerFormat:'Enter true or false.'},
      choice('as-u7-f6','7.4.3','Which of these free-space wavelengths is in the visible range stated by the syllabus?',
        [`${visible} nm`,'100 nm','1000 nm','10000 nm'],0,'Recall the stated visible range, 400–700 nm.',`${visible} nm lies in the stated range 400–700 nm.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    const frequencyTask=r(0,1)===0, timeBase=[0.5,1,2][r(0,2)], periodDiv=[2,4,5,8][r(0,3)], gain=[0.5,1,2][r(0,2)], peakDiv=2*r(1,4);
    const wavelengthTask=r(0,1)===0, frequency=20*r(1,8), wavelengthCm=5*r(1,10);
    const first=r(1,4), separation=r(2,8), opposite=r(0,1)===0, approaching=r(0,1)===0, sourceFrequency=600*r(1,3);
    // Interior examples avoid disputed spectral boundaries; microwave is named separately from radio here.
    const band=r(0,6), bandNames=['radio waves (excluding microwaves)','microwaves','infrared','visible light','ultraviolet','X-rays','gamma rays'];
    const sampleWavelengths=['10 m','10 mm','10 micrometres','500 nm','100 nm','0.1 nm','0.001 nm'];
    return validateUnitSet([
      numeric('as-u7-a1','7.1.3',frequencyTask
        ? `A CRO time-base is set to ${timeBase} ms/div. One complete period spans ${periodDiv} horizontal divisions. Find the signal frequency in Hz.`
        : `A CRO y-gain is set to ${gain} V/div. The trace has a peak-to-peak height of ${peakDiv} vertical divisions. Find the voltage amplitude in V.`,frequencyTask?1000/(timeBase*periodDiv):gain*peakDiv/2,
        frequencyTask?'Period = horizontal divisions × time-base; convert ms to s, then use f = 1/T.':'Amplitude is half the peak-to-peak voltage.',frequencyTask?`T = ${timeBase*periodDiv} ms, so f = 1000 / ${timeBase*periodDiv} = ${1000/(timeBase*periodDiv)} Hz.`:`Amplitude = ${gain} × ${peakDiv} / 2 = ${gain*peakDiv/2} V.`),
      choice('as-u7-a2','7.1.4',wavelengthTask
        ? 'A wave moves one wavelength λ in one period T. Using v = λ/T and f = 1/T gives v = fλ. Which expression gives λ?'
        : 'A wave moves one wavelength λ in one period T. Starting from v = λ/T, substitute T = 1/f. Which expression gives v?',
        wavelengthTask?['v/f','vf','f/v','1/(vf)']:['fλ','λ/f','f/λ','1/(fλ)'],0,
        'Use distance per cycle and cycles per second.',wavelengthTask?'v = fλ, so λ = v/f.':'v = λ/(1/f) = fλ.'),
      numeric('as-u7-a3','7.1.5',`A wave on a rope has frequency ${frequency} Hz and wavelength ${wavelengthCm} cm. Find its propagation speed in m/s.`,frequency*wavelengthCm/100,
        'Convert the wavelength to metres and multiply by frequency.',`v = ${frequency} × ${wavelengthCm/100} = ${frequency*wavelengthCm/100} m/s.`),
      numeric('as-u7-a4','7.2.2',`At one instant, a displacement-position graph for a sinusoidal longitudinal wave has a positive displacement maximum at x = ${first} cm. The next ${opposite?'negative displacement minimum':'positive displacement maximum'} occurs at x = ${first+separation} cm. Find the wavelength in cm.`,separation*(opposite?2:1),
        'A displacement-position graph describes displacement along the propagation direction for this longitudinal wave. Adjacent opposite extrema are half a wavelength apart.',`The stated separation is ${opposite?'half a wavelength':'one wavelength'}, so λ = ${separation*(opposite?2:1)} cm.`),
      numeric('as-u7-a5','7.3.2',`A sound source emits at ${sourceFrequency} Hz while moving directly ${approaching?'towards':'away from'} a stationary observer at 30 m/s through still air. Sound speed is 330 m/s. Find the observed frequency in Hz.`,sourceFrequency*330/(approaching?300:360),
        'For a moving source and stationary observer, use f_o = f_s v/(v - v_s) for approach, or v + v_s in the denominator for recession.',`f_o = ${sourceFrequency} × 330 / ${approaching?300:360} = ${sourceFrequency*330/(approaching?300:360)} Hz.`),
      choice('as-u7-a6','7.4.2',`Which principal electromagnetic region contains a representative free-space wavelength of ${sampleWavelengths[band]}? Treat microwaves as a separate named region from radio waves; use the broad school-level regions, not overlapping specialised classifications.`,
        [bandNames[band],bandNames[(band+1)%7],bandNames[(band+3)%7],bandNames[(band+5)%7]],0,
        'Order the regions by decreasing wavelength: radio, microwave, infrared, visible, ultraviolet, X-ray, gamma.',`${sampleWavelengths[band]} is an interior example of ${bandNames[band]}; approximate boundaries are not needed for this example.`)
    ],difficulty);
  }
  const transportsEnergy=r(0,1)===0, approach=r(0,1)===0, polarises=r(0,1)===0;
  const angleIndex=r(0,4), relativeAngle=[0,30,45,60,90][angleIndex], transmission=[1,0.75,0.5,0.25,0][angleIndex];
  const inputIntensity=16*r(1,20), firstAngle=45, secondAngle=firstAngle+relativeAngle;
  const initialArea=r(1,6), finalArea=r(1,6), initialIntensity=5*r(1,20), amplitudeFactor=r(2,3);
  const quarterPeriod=2*r(1,6), phaseSteps=r(1,3), firstPeak=2*r(0,4);
  return validateUnitSet([
    {...sq('as-u7-r1','7.1.6',difficulty,`A floating marker oscillates as a small-amplitude progressive ripple passes it in a ripple tank. Neglect bulk flow. A learner says that because the marker has no net travel with the wave, ${transportsEnergy?'the wave can still transfer energy':'the wave cannot transfer energy'}. Is the learner's statement true or false?`,transportsEnergy?'true':'false',
      'Local oscillation can transfer energy to neighbouring regions without net transport of the medium.',transportsEnergy?'True: energy travels with the disturbance while the marker oscillates locally.':'False: progressive waves transfer energy even without net travel of the marker.'),answerFormat:'Enter true or false.'},
    choice('as-u7-r2','7.3.1',`A source moves directly ${approach?'towards':'away from'} a stationary observer through still air. A learner says the observed pitch changes because sound travels through the air at a different speed. Which correction is right?`,
      ['wavefront spacing decreases; sound speed is unchanged and observed frequency increases','wavefront spacing increases; sound speed is unchanged and observed frequency decreases','wavefront spacing stays fixed; sound speed increases','the source frequency must change'],approach?0:1,
      'The source changes the spacing of successive wavefronts in the air, not the sound speed of that air.',approach?'Wavefronts reaching the observer are closer together; with the same sound speed, more arrive per second.':'Wavefronts reaching the observer are farther apart; with the same sound speed, fewer arrive per second.'),
    choice('as-u7-r3','7.5.1',polarises
      ? 'A wave can be restricted to one direction of oscillation perpendicular to its travel by polarisation. What does this show about the wave?'
      : 'A sound wave in air is longitudinal. Why can it not be plane-polarised in the way light can?',
      ['it is transverse, with oscillations perpendicular to propagation','its oscillations are parallel to propagation, so there is no transverse oscillation direction to select','it must be a stationary wave','its frequency must be zero'],polarises?0:1,
      'Polarisation selects a transverse oscillation direction.',polarises?'Ability to polarise demonstrates transverse wave motion.':'Longitudinal sound in air has oscillations along propagation, not a choice of transverse directions.'),
    numeric('as-u7-r4','7.5.2',`Plane-polarised light of intensity ${inputIntensity} W/m^2 has its initial polarisation direction at 0°. It passes through ideal polarising filters whose transmission axes are at ${firstAngle}° and then ${secondAngle}° to the original direction. Use cos^2 45° = 0.5 and cos^2 ${relativeAngle}° = ${transmission}. A learner uses both angles relative to the original light in Malus's law. Find the correct final intensity in W/m^2.`,inputIntensity*transmission/2,
      'After the first filter, the transmitted polarisation is along its axis. Use the angle between successive axes for the second filter.',`After the first filter I = ${inputIntensity/2} W/m^2. The second relative angle is ${secondAngle} - ${firstAngle} = ${relativeAngle}°, so final I = ${inputIntensity/2} × ${transmission} = ${inputIntensity*transmission/2} W/m^2.`),
    numeric('as-u7-r5','7.1.7',`In the same medium at the same frequency, a progressive wave carries ${initialIntensity*initialArea} W uniformly through a perpendicular area of ${initialArea} m^2. In a second region its amplitude is ${amplitudeFactor} times as large. A learner assumes intensity changes by the same factor as amplitude. Find the power crossing a perpendicular area of ${finalArea} m^2 uniformly illuminated by the wave in the second region, in W.`,initialIntensity*amplitudeFactor*amplitudeFactor*finalArea,
      'First find initial intensity, scale it by the square of the amplitude ratio, then multiply by the final area.',`Initial intensity = ${initialIntensity} W/m^2; new intensity = ${initialIntensity*amplitudeFactor*amplitudeFactor} W/m^2. Power = ${initialIntensity*amplitudeFactor*amplitudeFactor*finalArea} W.`),
    numeric('as-u7-r6','7.1.2',`Two sinusoidal signals have the same period. On a displacement-time graph, signal A has consecutive positive maxima at ${firstPeak} ms and ${firstPeak+4*quarterPeriod} ms. Signal B's corresponding positive maximum is at ${firstPeak+phaseSteps*quarterPeriod} ms. A learner confuses the horizontal delay with an amplitude difference. Find the positive phase lag of B behind A in degrees, between 0° and 360°.`,phaseSteps*90,
      'Phase lag = 360° × time delay / period. Both time values may stay in ms in this ratio.',`Period = ${4*quarterPeriod} ms; delay = ${phaseSteps*quarterPeriod} ms. Phase lag = 360 × ${phaseSteps*quarterPeriod} / ${4*quarterPeriod} = ${phaseSteps*90}°.`)
  ],difficulty);
};
// END AS TOPIC 7


// BEGIN AS TOPIC 8
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 22.
// Twelve objectives in 8.1–8.4; source hash and wording in as-physics-syllabus.json.
const structuredAsSuperposition = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested. Retain a negative sign where appropriate.'
  });
  if(difficulty==='foundational') {
    const first=r(1,8),second=r(1,8)*(r(0,1)===0?1:-1),node=r(0,1)===0;
    const distance=r(2,12),adjacentNode=r(0,1)===0,diffraction=r(0,1)===0,coherent=r(0,1)===0;
    const density=[100,200,250,400,500][r(0,4)];
    return validateUnitSet([
      numeric('as-u8-f1','8.1.1',`At one point, two overlapping waves produce displacements of +${first} mm and ${second} mm along the same axis at the same instant. Find the signed resultant displacement in mm.`,first+second,
        'Add the individual displacements algebraically, keeping their signs.',`${first} + (${second}) = ${first+second} mm.`),
      choice('as-u8-f2','8.1.3',`In a stationary wave, what is a point where ${node?'the displacement remains zero at all times':'the oscillation amplitude is greatest'} called?`,['a node','an antinode','a wavefront','a source'],node?0:1,
        'A node stays at rest; an antinode has maximum oscillation amplitude.',node?'The point is a node, not merely a point crossing equilibrium at one instant.':'The point is an antinode; its instantaneous displacement can still be zero.'),
      numeric('as-u8-f3','8.1.4',`In a stationary wave, the distance from a node to the ${adjacentNode?'next node':'nearest antinode'} is ${distance} cm. Find the wavelength in cm.`,distance*(adjacentNode?2:4),
        'Adjacent nodes are half a wavelength apart; a node and nearest antinode are a quarter wavelength apart.',`λ = ${distance} × ${adjacentNode?2:4} = ${distance*(adjacentNode?2:4)} cm.`),
      choice('as-u8-f4','8.2.1',diffraction?'Water waves spread into the region behind a narrow gap. Which phenomenon describes this spreading?':'Two overlapping coherent water waves produce alternating regions of reinforcement and cancellation. Which phenomenon describes this pattern?',
        ['diffraction','interference','absorption','a change in wave frequency'],diffraction?0:1,
        'Distinguish spreading at an aperture from the pattern produced by overlapping waves.',diffraction?'Diffraction is spreading at a gap or around an obstacle.':'The reinforcement and cancellation pattern is interference.'),
      {...sq('as-u8-f5','8.3.1',difficulty,`True or false: two sources with the same frequency are coherent if their phase difference ${coherent?'remains constant':'varies randomly with time'}.`,coherent?'true':'false',
        'Coherence requires a constant phase difference as well as equal frequency.',coherent?'True: the phase difference may be nonzero, but must remain constant.':'False: equal frequency alone is insufficient if relative phase changes randomly.'),answerFormat:'Enter true or false.'},
      numeric('as-u8-f6','8.4.1',`A diffraction grating has ${density} equally spaced lines per mm. Find the grating spacing in micrometres.`,1000/density,
        'The spacing is the reciprocal of line density. There are 1000 micrometres in a millimetre.',`d = 1000 / ${density} = ${1000/density} micrometres.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    const experiment=r(0,2),narrow=r(0,1)===0,medium=r(0,3);
    const wavelength=50*r(8,14),screen=r(1,3),slitTenths=[5,10][r(0,1)],fringe=wavelength*screen/(100*slitTenths);
    const gratingWavelength=100*r(4,7),order=r(1,2),angleMethod=r(0,1)===0;
    return validateUnitSet([
      choice('as-u8-a1','8.1.2',`Which method demonstrates stationary waves using ${['microwaves','a stretched string','an air column'][experiment]}?`,
        ['reflect a transmitted beam from a metal sheet and move a detector to locate alternating maxima and minima','drive one end periodically and adjust frequency until fixed nodes and large oscillating loops form','vary the length of a tube closed at one end while a fixed-frequency sound source drives it, finding resonances','use two unrelated sources whose relative phase continually changes'],experiment,
        'Incident and reflected waves of the same frequency can superpose to form a stationary pattern.',['The incident and reflected microwaves produce fixed positions of minimum and maximum detector response.','Reflection and periodic driving create a stationary string pattern with nodes and antinodes.','Resonance in the tube reveals a stationary wave in the air column.'][experiment]),
      choice('as-u8-a2','8.2.2',`In a ripple tank, wavelength is held fixed. A gap changes from ${narrow?'ten wavelengths wide to one wavelength wide':'one wavelength wide to ten wavelengths wide'}. How does the spreading of the transmitted waves change?`,
        ['spreading becomes more pronounced','spreading becomes less pronounced','frequency doubles','wavelength becomes zero'],narrow?0:1,
        'Compare gap width with wavelength; a gap comparable to wavelength produces pronounced spreading.',narrow?'The narrower gap is comparable to the wavelength, so diffraction becomes more pronounced.':'The gap is now much wider than the wavelength, so diffraction becomes less pronounced.'),
      choice('as-u8-a3','8.3.2',`Which arrangement is suitable for demonstrating two-source interference with ${['water waves','sound','light','microwaves'][medium]}?`,
        ['drive two ripple-tank dippers from the same vibrator','drive two loudspeakers from the same signal generator and move a microphone across their overlap region','illuminate two narrow slits with one coherent monochromatic source and observe the overlapping light on a screen','illuminate two apertures from one transmitter and scan their overlapping beams with a receiver'],medium,
        'Use two mutually coherent waves and a suitable way to detect their overlap.',['The linked dippers produce a stable relative phase in overlapping ripples.','The common signal generator provides coherence; the microphone detects maxima and minima.','The two slits illuminated from one source provide coherent secondary waves.','The apertures fed by one transmitter provide coherent microwave paths.'][medium]),
      numeric('as-u8-a4','8.3.4',`In a double-slit experiment, slit separation is ${slitTenths/10} mm and screen distance is ${screen} m. Adjacent bright fringe centres are ${fringe} mm apart. The small-angle approximation applies. Find the light wavelength in nm.`,wavelength,
        'Use λ = ax/D, converting both slit separation and fringe spacing from mm to m.',`λ = (${slitTenths/10} × ${fringe} / ${screen}) × 1000 = ${wavelength} nm.`),
      numeric('as-u8-a5','8.4.1',`Monochromatic light is incident normally on a grating of spacing ${2*order*gratingWavelength} nm. The order n = ${order} maximum is at 30° to the central direction. Use sin 30° = 0.5. Find the wavelength in nm.`,gratingWavelength,
        'Rearrange d sin θ = nλ to λ = d sin θ/n.',`λ = ${2*order*gratingWavelength} × 0.5 / ${order} = ${gratingWavelength} nm.`),
      choice('as-u8-a6','8.4.2',angleMethod
        ? 'Light is normally incident on a diffraction grating. The angular separation between matching maxima of the same nonzero order on opposite sides of the central maximum is measured. What angle should be used as θ in d sin θ = nλ?'
        : 'A grating is illuminated normally with monochromatic light. A learner measures θ from the central maximum to a bright maximum but has not identified its order. What must be established before calculating wavelength from d sin θ = nλ?',
        ['half the measured angular separation','the order n of the measured maximum, with the central maximum as n = 0','the full measured angular separation','the mass of the grating'],angleMethod?0:1,
        'θ is measured from the central direction to one identified-order maximum.',angleMethod?'Matching maxima are at -θ and +θ, so their separation is 2θ.':'Identify the order by counting maxima from the central n = 0 maximum; use known grating spacing and the measured angle.')
    ],difficulty);
  }
  const stable=r(0,1)===0,swap=r(0,1)===0,amplitude=r(1,6);
  const wavelength=50*r(8,14),screen=r(1,3),fringeCount=r(3,8),span=wavelength*screen*(fringeCount-1)/500;
  const largestOrder=r(2,4),gratingWavelength=100*r(4,7),spacing=(2*largestOrder+1)*gratingWavelength/2,total=r(0,1)===0;
  const destructive=r(0,1)===0,pathWavelength=2*r(1,5),pathDifference=pathWavelength*(r(1,3)+(destructive?.5:0));
  const airWavelength=[20,40,50,80,100][r(0,4)],soundSpeed=320+10*r(0,4),frequency=soundSpeed*100/airWavelength;
  return validateUnitSet([
    choice('as-u8-r1','8.3.3',stable
      ? 'Two overlapping light waves have the same frequency, fixed relative phase and the same polarisation. Their amplitudes are unequal but both nonzero. What is the correct conclusion about an interference pattern on a resolving screen?'
      : 'Two overlapping light waves have the same frequency and the same polarisation, but their relative phase changes randomly many times during the observation. A learner expects fixed fringes merely because the frequencies match. What is the correct conclusion?',
      ['a stable pattern can form, but its minima need not be completely dark','no stable fringe pattern is resolved because the changing relative phase washes it out','unequal amplitudes always prevent any interference','equal frequency alone guarantees fixed dark fringes'],stable?0:1,
      'Constant relative phase fixes the pattern; equal amplitudes are needed for complete cancellation, not for all interference.',stable?'Coherence allows a stable pattern. Unequal amplitudes leave a nonzero minimum intensity.':'The moving phase-dependent pattern averages out, so equal frequency alone is insufficient.'),
    choice('as-u8-r2','8.1.3',`Two sinusoidal waves of equal amplitude ${amplitude} mm and frequency travel in opposite directions. Their displacement profiles are sampled at t = 0, T/4, T/2 and 3T/4. At point ${swap?'Q':'P'}, their pairs of displacements in mm are (${amplitude}, -${amplitude}), (0, 0), (-${amplitude}, ${amplitude}), (0, 0). At point ${swap?'P':'Q'}, the pairs are (0, 0), (${amplitude}, ${amplitude}), (0, 0), (-${amplitude}, -${amplitude}). Which identifies these points in the resultant stationary wave?`,
      ['P is a node and Q is an antinode','Q is a node and P is an antinode','both are nodes because both reach zero displacement','both are antinodes because each travelling wave moves'],swap?1:0,
      'Add the profiles point by point. Distinguish zero displacement at an instant from zero amplitude throughout the cycle.',`${swap?'Q':'P'} has cancelling displacements throughout the cycle and is a node. ${swap?'P':'Q'} oscillates between +${2*amplitude} and -${2*amplitude} mm and is an antinode.`),
    numeric('as-u8-r3','8.3.4',`A double-slit screen is ${screen} m from slits separated by 0.5 mm. The distance from the first to the last of ${fringeCount} consecutive bright fringe centres is ${span} mm. A learner divides this distance by ${fringeCount}. Assuming small angles, find the correct wavelength in nm.`,wavelength,
      'There is one fewer interval than fringe centres. Find adjacent fringe spacing before using λ = ax/D.',`There are ${fringeCount-1} intervals, so x = ${span} / ${fringeCount-1} = ${wavelength*screen/500} mm. λ = 0.5 × ${wavelength*screen/500} × 1000 / ${screen} = ${wavelength} nm.`),
    numeric('as-u8-r4','8.4.1',`Light of wavelength ${gratingWavelength} nm is incident normally on an ideal grating with spacing ${spacing} nm and no missing orders. A learner allows orders requiring sin θ greater than 1. Find the ${total?'total number of principal maxima, including both sides and the central maximum':'greatest possible order number on one side'}.`,total?2*largestOrder+1:largestOrder,
      'Require nλ/d ≤ 1. Count the central maximum once if a total is requested.',`d/λ = ${spacing/gratingWavelength}, so the largest integer order is ${largestOrder}. ${total?`There are 2 × ${largestOrder} + 1 = ${2*largestOrder+1} maxima.`:`No higher order is possible.`}`),
    choice('as-u8-r5','8.3.1',`Two coherent sources emit in phase with wavelength ${pathWavelength} cm. At an observation point their waves have equal amplitude, the same polarisation, and path difference ${pathDifference} cm. Ignore attenuation differences. What occurs at that point?`,
      ['constructive interference with maximum resultant amplitude','destructive interference with zero resultant amplitude','no superposition because the paths differ','the wave frequency doubles'],destructive?1:0,
      'For in-phase sources, integer-wavelength path differences reinforce; half-integer differences cancel when amplitudes are equal.',`The path difference is ${pathDifference/pathWavelength} wavelengths, giving ${destructive?'opposite phases and complete cancellation':'equal phases and maximum resultant amplitude'}.`),
    numeric('as-u8-r6','8.1.2',`A tube is closed at one end and open at the other. With a sound source of frequency ${frequency} Hz, successive resonance lengths are ${airWavelength/4} cm and ${3*airWavelength/4} cm. Neglect end corrections. A learner treats their difference as a full wavelength. Find the correct sound speed in m/s.`,soundSpeed,
      'Successive resonances of this tube differ in length by half a wavelength; then use v = fλ.',`Length difference = ${airWavelength/2} cm, so λ = ${airWavelength/100} m. v = ${frequency} × ${airWavelength/100} = ${soundSpeed} m/s.`)
  ],difficulty);
};
// END AS TOPIC 8

// BEGIN AS TOPIC 9
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 23.
// Fifteen objectives in 9.1–9.3; source hash and wording in as-physics-syllabus.json.
const structuredAsElectricity = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested.'
  });
  if(difficulty==='foundational') {
    const metal=r(0,1)===0,electrons=r(2,20),current=r(1,10)/2,time=10*r(1,6);
    const pd=r(2,12),charge=r(2,10),resistance=5*r(1,10),resistorCurrent=r(1,5),ohmic=r(0,1)===0;
    return validateUnitSet([
      choice('as-u9-f1','9.1.1',`Which mobile charge carriers produce an electric current in ${metal?'a metal wire':'an electrolyte containing mobile positive and negative ions'}?`,
        ['conduction electrons','positive and negative ions','uncharged atoms only','energy packets with no charge'],metal?0:1,
        'Current is a flow of charge; the moving carriers depend on the material.',metal?'Conduction electrons drift in a metal; conventional current is opposite to their drift.':'Positive and negative ions transport charge in the electrolyte.'),
      numeric('as-u9-f2','9.1.2',`A packet consists only of electrons and has charge magnitude ${16*electrons/10} × 10^-19 C. Take the magnitude of electron charge as 1.6 × 10^-19 C. How many electrons are in the packet?`,electrons,
        'Electron charge comes in whole-electron amounts: divide charge magnitude by e.',`Number = ${16*electrons/10} / 1.6 = ${electrons} electrons.`),
      numeric('as-u9-f3','9.1.3',`A constant current of ${current} A flows for ${time} s. Find the charge passing a point in C.`,current*time,
        'Use Q = It.',`Q = ${current} × ${time} = ${current*time} C.`),
      numeric('as-u9-f4','9.2.1',`A component transfers ${pd} J of energy for every coulomb of charge passing through it. Find the energy transferred when ${charge} C passes, in J.`,pd*charge,
        'Potential difference is energy transferred per unit charge.',`The potential difference is ${pd} V. Energy = ${pd} × ${charge} = ${pd*charge} J.`),
      numeric('as-u9-f5','9.3.1',`At an operating point a component has potential difference ${resistance*resistorCurrent} V and current ${resistorCurrent} A. Find its resistance in ohms.`,resistance,
        'Resistance is defined as potential difference divided by current.',`R = ${resistance*resistorCurrent} / ${resistorCurrent} = ${resistance} ohms.`),
      {...sq('as-u9-f6','9.3.5',difficulty,`True or false: Ohm's law states that current is proportional to potential difference for a conductor ${ohmic?'provided temperature and other physical conditions remain constant':'even when its temperature and other physical conditions change'}.`,ohmic?'true':'false',
        "Ohm's law includes a constant-physical-conditions requirement.",ohmic?'True: constant temperature and other physical conditions are essential.':'False: changing physical conditions can change resistance, so proportionality is not guaranteed.'),answerFormat:'Enter true or false.'}
    ],difficulty);
  }
  if(difficulty==='application') {
    const area=r(1,4),drift=r(1,5),pd=r(2,24),charge=r(2,12),powerMode=r(0,2),current=r(1,5),resistance=r(2,20);
    const milliCurrent=20*r(1,10),wireR=50*r(1,10),component=r(0,2),areaStep=r(1,5),lengthStep=r(1,5);
    return validateUnitSet([
      numeric('as-u9-a1','9.1.4',`A conductor has cross-sectional area ${area} mm^2, carrier number density 5 × 10^28 m^-3, drift speed ${drift} × 10^-4 m/s and carrier charge magnitude 1.6 × 10^-19 C. Find its current in A.`,8*area*drift/10,
        'Use I = Anvq. Convert mm^2 to m^2, not just mm to m.',`I = (${area} × 10^-6) × (5 × 10^28) × (${drift} × 10^-4) × (1.6 × 10^-19) = ${8*area*drift/10} A.`),
      numeric('as-u9-a2','9.2.2',`A component transfers ${pd*charge} J of energy while ${charge} C passes through it. Find the potential difference in V.`,pd,
        'Use V = W/Q.',`V = ${pd*charge} / ${charge} = ${pd} V.`),
      numeric('as-u9-a3','9.2.3',`A resistor operates steadily with ${[
        `potential difference ${current*resistance} V and current ${current} A`,
        `current ${current} A and resistance ${resistance} ohms`,
        `potential difference ${current*resistance} V and resistance ${resistance} ohms`
      ][powerMode]}. Find its electrical power in W.`,current*current*resistance,
        'Use P = VI, P = I^2R, or P = V^2/R according to the given quantities.',`${['P = VI','P = I^2R','P = V^2/R'][powerMode]} gives ${current*current*resistance} W.`),
      numeric('as-u9-a4','9.3.2',`A current of ${milliCurrent} mA passes through a ${wireR} ohm resistor. Find the potential difference across it in V.`,milliCurrent*wireR/1000,
        'Convert mA to A before using V = IR.',`V = (${milliCurrent}/1000) × ${wireR} = ${milliCurrent*wireR/1000} V.`),
      choice('as-u9-a5','9.3.3',`Current is plotted vertically against potential difference horizontally. Which I-V characteristic describes ${['a metallic conductor held at constant temperature','a filament lamp whose temperature rises as the magnitude of the current increases','a semiconductor diode, with forward bias plotted at positive voltage and reverse breakdown excluded'][component]}?`,
        ['a straight line through the origin with constant positive gradient','a curve through the origin in both polarities that becomes less steep at larger voltage magnitudes','negligible reverse current and a steep rise in forward current after the turn-on region','a horizontal line with nonzero current at zero voltage'],component,
        'Read which variable is on each axis and consider whether resistance changes.',[
          'Constant resistance gives I = V/R, a straight line through the origin.',
          'Heating increases filament resistance, so current rises less rapidly as voltage magnitude increases.',
          'The diode conducts strongly in forward bias and very little in reverse bias before breakdown.'
        ][component]),
      numeric('as-u9-a6','9.3.6',`A uniform wire has resistivity 5 × 10^-7 ohm m, length ${lengthStep*areaStep} m and cross-sectional area ${areaStep/10} mm^2. Find its resistance in ohms.`,5*lengthStep,
        'Use R = ρL/A and convert square millimetres to square metres.',`R = (5 × 10^-7) × ${lengthStep*areaStep} / (${areaStep/10} × 10^-6) = ${5*lengthStep} ohms.`)
    ],difficulty);
  }
  const heating=r(0,1)===0,brighter=r(0,1)===0,warmer=r(0,1)===0;
  const currentStep=r(1,5),timeStep=r(1,8),radiusFactor=r(2,3),currentFactor=r(2,4),driftStep=r(1,3);
  const originalR=r(2,12),lengthFactor=r(2,3);
  return validateUnitSet([
    choice('as-u9-r1','9.3.4',`The magnitude of the current through a filament lamp is ${heating?'increased':'decreased'}, and it reaches a new thermal steady state. A learner assumes its resistance stays constant. Which explanation is correct?`,
      ['the filament gets hotter and its resistance increases','the filament gets cooler and its resistance decreases','the filament resistance is always independent of temperature','the resistance becomes zero whenever the lamp is lit'],heating?0:1,
      'The filament is metallic and its resistance depends on its temperature.',heating?'The increased heating raises the filament temperature and resistance.':'Reduced heating lowers the filament temperature and resistance.'),
    choice('as-u9-r2','9.3.7',`An LDR is held at a fixed positive potential difference. Its light intensity is ${brighter?'increased':'decreased'} while temperature is controlled. A learner predicts the wrong direction of current change. Which pair of changes is correct?`,
      ['resistance decreases and current increases','resistance increases and current decreases','resistance and current both increase','resistance and current both decrease'],brighter?0:1,
      'More light lowers LDR resistance; at fixed voltage, I = V/R.',brighter?'More light lowers resistance, so the current increases.':'Less light raises resistance, so the current decreases.'),
    choice('as-u9-r3','9.3.8',`An NTC thermistor is maintained at a ${warmer?'higher':'lower'} temperature by its surroundings while a fixed positive potential difference is maintained across it. Which describes the changes in its resistance and electrical power?`,
      ['resistance decreases and power increases','resistance increases and power decreases','resistance and power both increase','resistance and power both decrease'],warmer?0:1,
      'An NTC thermistor has lower resistance when hotter. With fixed voltage, P = V^2/R.',warmer?'Heating lowers resistance, increasing electrical power at fixed voltage.':'Cooling raises resistance, decreasing electrical power at fixed voltage.'),
    numeric('as-u9-r4','9.1.2',`A steady electron current of ${16*currentStep} microamperes flows for ${timeStep/10} s. Take e = 1.6 × 10^-19 C. A learner divides current by e without accounting for time. Write the number of electrons passing as N × 10^13. Find N.`,currentStep*timeStep,
      'First find transferred charge Q = It, then divide its magnitude by e.',`Q = ${16*currentStep*timeStep/10} × 10^-6 C. Number = ${currentStep*timeStep} × 10^13 electrons, so N = ${currentStep*timeStep}.`),
    numeric('as-u9-r5','9.1.4',`Wire A has electron drift speed ${radiusFactor*radiusFactor*driftStep} × 10^-4 m/s. Wire B has the same carrier number density and charge magnitude, ${radiusFactor} times A's radius, and carries ${currentFactor} times A's current. A learner scales area directly with radius. Write B's drift speed as v × 10^-4 m/s. Find v.`,currentFactor*driftStep,
      'From I = Anvq, drift speed is proportional to I/A when n and q are unchanged. Area is proportional to radius squared.',`Drift-speed coefficient = ${radiusFactor*radiusFactor*driftStep} × ${currentFactor} / ${radiusFactor}^2 = ${currentFactor*driftStep}.`),
    numeric('as-u9-r6','9.3.6',`A uniform wire of resistance ${originalR} ohms is drawn into a new uniform wire of ${lengthFactor} times its original length. Its volume and resistivity remain unchanged. A learner multiplies resistance by the length factor only. Find the new resistance in ohms.`,originalR*lengthFactor*lengthFactor,
      'Constant volume means cross-sectional area falls by the length factor. Apply both changes in R = ρL/A.',`Length multiplies by ${lengthFactor} and area divides by ${lengthFactor}, so R becomes ${originalR} × ${lengthFactor}^2 = ${originalR*lengthFactor*lengthFactor} ohms.`)
  ],difficulty);
};
// END AS TOPIC 9

// BEGIN AS TOPIC 10
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 24;
// circuit symbols visually checked on pp. 61–62. Sixteen objectives in 10.1–10.3.
const structuredAsCircuits = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] => {
  const choice = (id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested.'
  });
  if(difficulty==='foundational') {
    const symbols=[
      ['one long and one short parallel plate','cell'],
      ['several alternating long and short parallel plates','battery of cells'],
      ['two open terminal circles on horizontal leads, with no alternating-wave mark between them','power supply'],
      ['two terminal circles with an alternating-wave mark between them','a.c. power supply'],
      ['a filled dot where three conducting lines meet','junction of conductors'],
      ['a circle containing a cross','lamp'],
      ['a plain rectangle with two end leads','fixed resistor'],
      ['a resistor rectangle crossed by a diagonal arrow','variable resistor'],
      ['a resistor rectangle crossed by a sloping line with a short bent end, without an arrowhead','thermistor'],
      ['a resistor rectangle with two arrows pointing towards it','light-dependent resistor'],
      ['a rectangle split into narrow vertical sections with leads at its ends','heater'],
      ['a gap between two conductors with a sloping movable contact','switch'],
      ['a conductor ending in three horizontal bars of decreasing length','earth'],
      ['an upward dome over a horizontal base, with two downward connection lines','electric bell'],
      ['a downward-facing semicircular bowl below a horizontal line, with two downward connections','buzzer'],
      ['a circle touching a vertical line on its left, with two leads on its right','microphone'],
      ['a rectangle joined to a flared cone outline, with two leads on the left','loudspeaker'],
      ['a circle containing an underlined M','motor'],
      ['a rectangle containing G','generator'],
      ['a circle containing A','ammeter'],
      ['a circle containing V','voltmeter'],
      ['a circle containing an upward-pointing pointer arrow','galvanometer'],
      ['a resistor rectangle with two end leads and a third lead ending in a slider arrow touching its top','potentiometer'],
      ['a triangle pointing towards a bar, with one lead at each end and no light arrows','diode'],
      ['a diode symbol with two arrows pointing away from it','light-emitting diode'],
      ['a circle containing the short rising-and-falling trace mark shown in the syllabus','oscilloscope'],
      ['two equal parallel plates separated by a gap, with one lead on each side','capacitor']
    ];
    const symbol=r(0,symbols.length-1),ammeter=r(0,1)===0,emf=r(2,12),charge=r(2,10),sourceEnergy=r(0,1)===0;
    const outgoing=r(1,8),unknown=r(1,8),drop1=r(1,8),drop2=r(1,8);
    return validateUnitSet([
      choice('as-u10-f1','10.1.1',`In the syllabus circuit-symbol sheet, which component or connection is represented by ${symbols[symbol][0]}?`,
        [symbols[symbol][1],symbols[(symbol+1)%symbols.length][1],symbols[(symbol+7)%symbols.length][1],symbols[(symbol+13)%symbols.length][1]],0,
        'Match the shape and identifying marks to the syllabus symbol sheet, pages 61–62.',`This is the symbol for ${symbols[symbol][1]}.`),
      choice('as-u10-f2','10.1.2',`In a circuit diagram, resistor R is connected between nodes P and Q. To measure ${ammeter?'the current through R with an ideal ammeter':'the potential difference across R with an ideal voltmeter'}, which connection is correct?`,
        ['insert the meter in series in the branch containing R','connect the meter directly between P and Q in parallel with R','replace R by an ideal wire','leave both meter terminals unconnected'],ammeter?0:1,
        'An ammeter carries the branch current; a voltmeter compares two node potentials.',ammeter?'The ideal ammeter is inserted in series so the current through R passes through it.':'The ideal voltmeter connects across P and Q; it draws no current in this ideal model.'),
      numeric('as-u10-f3','10.1.3',`A source transfers ${emf*charge} J from its chemical store to electrical energy while driving ${charge} C around a complete circuit. Find its e.m.f. in V.`,emf,
        'E.m.f. is source energy transferred per unit charge.',`E = ${emf*charge} / ${charge} = ${emf} V.`),
      {...sq('as-u10-f4','10.1.4',difficulty,`True or false: e.m.f. describes ${sourceEnergy?'energy supplied by a source per unit charge, whereas p.d. across a resistor describes energy transferred from electrical to other forms per unit charge':'a mechanical force on charge measured in newtons, whereas p.d. is energy per unit charge'}.`,sourceEnergy?'true':'false',
        'Despite its name, electromotive force is measured in volts, not newtons.',sourceEnergy?'True: both are energy per charge, but describe different energy transfers.':'False: e.m.f. is energy supplied per unit charge and has unit volt.'),answerFormat:'Enter true or false.'},
      numeric('as-u10-f5','10.2.1',`At a junction, ${outgoing+unknown} A enters and ${outgoing} A leaves through one branch. There is just one other branch. Find the current leaving through it in A.`,unknown,
        "Kirchhoff's first law follows from conservation of charge: total current in equals total current out.",`${outgoing+unknown} = ${outgoing} + I, so I = ${unknown} A.`),
      numeric('as-u10-f6','10.2.2',`A single loop contains an ideal ${drop1+drop2} V source and two resistors. In the direction of current, the first resistor has a ${drop1} V drop. Find the drop across the second resistor in V.`,drop2,
        "Kirchhoff's second law expresses conservation of energy per unit charge around a loop.",`Source rise = sum of drops: ${drop1+drop2} = ${drop1} + V, so V = ${drop2} V.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    const current=r(1,4),load=r(3,12),internal=r(1,3),three=r(0,1)===0;
    const r1=r(2,20),r2=r(2,20),r3=r(2,20),reciprocal=r(0,1)===0,base=r(1,10),unequal=r(0,1)===0;
    const upper=r(1,5),lower=r(1,5),voltageStep=r(1,3);
    return validateUnitSet([
      numeric('as-u10-a1','10.1.5',`A cell has e.m.f. ${current*(load+internal)} V and internal resistance ${internal} ohms. It supplies a single ${load} ohm external load. Find its terminal p.d. in V.`,current*load,
        'First use the total series resistance to find current; terminal voltage is the voltage across the external load.',`I = ${current*(load+internal)} / (${load} + ${internal}) = ${current} A. Terminal V = I R = ${current*load} V.`),
      choice('as-u10-a2','10.2.3',`The same nonzero current I flows through ${three?'three series resistors R1, R2 and R3':'two series resistors R1 and R2'}. Kirchhoff's loop law gives IR_total = ${three?'IR1 + IR2 + IR3':'IR1 + IR2'}. Dividing by I, which expression is R_total?`,
        three?['R1 + R2 + R3','1/(R1 + R2 + R3)','R1R2R3','R1 - R2 - R3']:['R1 + R2','R1R2/(R1 + R2)','1/(R1 + R2)','R1 - R2'],0,
        'In series, potential differences add while the current is common.',three?'Dividing every term by I gives R_total = R1 + R2 + R3.':'Dividing every term by I gives R_total = R1 + R2.'),
      numeric('as-u10-a3','10.2.4',`Resistors of ${r1} ohms, ${r2} ohms and ${r3} ohms are connected in series. Find their combined resistance in ohms.`,r1+r2+r3,
        'Add all series resistances.',`R_total = ${r1} + ${r2} + ${r3} = ${r1+r2+r3} ohms.`),
      choice('as-u10-a4','10.2.5',`Two parallel resistors R1 and R2 have the same nonzero p.d. V. Kirchhoff's junction law gives V/R_total = V/R1 + V/R2. ${reciprocal?'Divide by V: which expression equals 1/R_total?':'Divide by V and rearrange: which expression equals R_total?'}`,
        reciprocal?['1/R1 + 1/R2','R1 + R2','1/(R1 + R2)','R1R2']:['R1R2/(R1 + R2)','R1 + R2','1/R1 + 1/R2','R1R2'],0,
        'Parallel branch currents add, and the branch voltage is common.',reciprocal?'Dividing by V gives 1/R_total = 1/R1 + 1/R2.':'The reciprocal sum is (R1 + R2)/(R1R2), so R_total = R1R2/(R1 + R2).'),
      numeric('as-u10-a5','10.2.6',`Two resistors of ${unequal?3*base:2*base} ohms and ${unequal?6*base:2*base} ohms are connected in parallel. Find their combined resistance in ohms.`,unequal?2*base:base,
        'Use the reciprocal sum or R1R2/(R1 + R2); the result must be less than either resistance.',`R_total = ${unequal?2*base:base} ohms from the reciprocal sum.`),
      numeric('as-u10-a6','10.3.1',`An unloaded potential divider connects an upper ${upper} kilohm resistor from +${(upper+lower)*voltageStep} V to junction J and a lower ${lower} kilohm resistor from J to 0 V. Find the p.d. of J relative to 0 V in V.`,lower*voltageStep,
        'Both resistors carry the same current. The output across the lower resistor is its fraction of the total resistance times supply voltage.',`V_out = ${(upper+lower)*voltageStep} × ${lower}/(${upper} + ${lower}) = ${lower*voltageStep} V.`)
    ],difficulty);
  }
  const base=r(1,3),branchCurrent=r(1,2),internal=r(1,4),current=r(1,4),terminal=current*internal+4*r(1,5);
  const reference=r(1,4),referenceLength=20*r(1,2),unknownLength=10*r(1,9),nullCurrent=r(0,1)===0;
  const ldr=r(0,1)===0,increasing=r(0,1)===0,sensorUpper=r(0,1)===0,upper=r(1,2),output=2*r(1,5);
  const sensorDecreases=increasing,outputRises=sensorUpper===sensorDecreases;
  return validateUnitSet([
    numeric('as-u10-r1','10.2.7',`An ideal ${9*base*branchCurrent} V source feeds a ${base} ohm resistor in series with a parallel pair of ${3*base} ohms and ${6*base} ohms. A learner assumes the total current flows in both parallel branches. Find the current in the ${3*base} ohm branch in A.`,2*branchCurrent,
      'Use the common voltage across the parallel pair and conserve current at the junction.',`The parallel resistance is ${2*base} ohms, so total current is ${3*branchCurrent} A. The series drop is ${3*base*branchCurrent} V and branch p.d. is ${6*base*branchCurrent} V. Branch current = ${2*branchCurrent} A.`),
    numeric('as-u10-r2','10.1.5',`A cell has open-circuit terminal voltage ${terminal+current*internal} V. When supplying ${current} A its terminal voltage is ${terminal} V. Assume constant e.m.f. and internal resistance. A learner uses terminal V/I for internal resistance. Find the correct internal resistance in ohms.`,internal,
      'At open circuit, I = 0 so terminal voltage equals e.m.f.; the loaded voltage deficit is Ir.',`Lost voltage = ${terminal+current*internal} - ${terminal} = ${current*internal} V. Internal r = ${current*internal}/${current} = ${internal} ohms.`),
    numeric('as-u10-r3','10.3.2',`A uniform potentiometer wire is supplied by a steady driver current. A reference p.d. of ${reference} V balances at ${referenceLength} cm from the zero end. An unknown p.d. balances at ${unknownLength} cm with the same wire current. Both are null measurements. Find the unknown p.d. in V.`,reference*unknownLength/referenceLength,
      'For the same potential gradient, the ratio of p.d.s equals the ratio of balance lengths.',`V_unknown = ${reference} × ${unknownLength}/${referenceLength} = ${reference*unknownLength/referenceLength} V.`),
    choice('as-u10-r4','10.3.3',nullCurrent
      ? 'A cell is compared with a section of a current-carrying potentiometer wire. At balance the galvanometer shows null. Which current statement is correct?'
      : 'A cell is connected in opposition to a section of a current-carrying potentiometer wire. At galvanometer null, which voltage statement is correct?',
      ['the galvanometer comparison branch carries zero current while the driver wire can still carry current','the driver wire must carry zero current','the cell voltage must equal the voltage across the entire driver wire','the cell voltage equals the p.d. across the selected balance length'],nullCurrent?0:3,
      'A null means no current through the comparison branch, not no current anywhere in the circuit.',nullCurrent?'There is no comparison current at balance; the separate driver circuit still establishes a potential gradient.':'No galvanometer current flows when the opposed p.d.s across the selected section and cell are equal.'),
    choice('as-u10-r5','10.3.4',`An unloaded divider has a ${ldr?'light-dependent resistor (LDR)':'negative-temperature-coefficient thermistor'} as the ${sensorUpper?'upper resistor from +V_s to junction J':'lower resistor from junction J to 0 V'}, and a fixed resistor in the other position. The supply stays fixed. The ${ldr?'light intensity':'temperature'} is ${increasing?'increased':'decreased'}. What happens to sensor resistance and the output p.d. of J relative to 0 V?`,
      ['sensor resistance decreases and output rises','sensor resistance decreases and output falls','sensor resistance increases and output rises','sensor resistance increases and output falls'],sensorDecreases?(outputRises?0:1):(outputRises?2:3),
      'First find how the sensor resistance changes, then apply the divider ratio to the resistor connected below J.',`Sensor resistance ${sensorDecreases?'decreases':'increases'}. With the sensor in the ${sensorUpper?'upper':'lower'} position, the lower-resistor fraction ${outputRises?'increases':'decreases'}, so output ${outputRises?'rises':'falls'}.`),
    numeric('as-u10-r6','10.3.1',`An ideal ${(2*upper+1)*output} V supply feeds an upper ${upper} kilohm resistor and a lower 1 kilohm resistor as a divider. A 1 kilohm load is then connected in parallel with the lower resistor. A learner still uses the unloaded divider ratio. Find the actual p.d. across the load in V.`,output,
      'Combine the lower resistor and load in parallel before calculating the divider output.',`The lower equivalent resistance is 0.5 kilohms. V_out = ${(2*upper+1)*output} × 0.5/(${upper} + 0.5) = ${output} V.`)
  ],difficulty);
};
// END AS TOPIC 10

const asTopics: Record<string,(difficulty:"foundational"|"application"|"reasoning")=>PhysicsQuestion[]> = {
  "as-u1": structuredAsQuantities,
  "as-u2": structuredAsKinematics,
  "as-u3": structuredAsDynamics,
  "as-u4": structuredAsForces,
  "as-u5": structuredAsEnergy,
  "as-u6": structuredAsDeformation,
  "as-u7": structuredAsWaves,
  "as-u8": structuredAsSuperposition,
  "as-u9": structuredAsElectricity,
  "as-u10": structuredAsCircuits,
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
