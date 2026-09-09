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

const structuredMotion = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const time1=r(2,10),speed1=r(2,20)*10,dist1=speed1*time1;
    const t1_2=r(2,6),t2_2=r(2,6),totalTime2=t1_2+t2_2,avgSpeed2=r(20,60)*10,totalDist2=avgSpeed2*totalTime2;
    const d1_2=r(10,totalDist2-10),d2_2=totalDist2-d1_2;
    const time4=r(2,10),grad4=r(10,80),dist4=grad4*time4;
    const gValue5=r(0,1)===1;
    const time6=r(2,8),accel6=r(2,10),v1_6=r(2,20),v2_6=v1_6+accel6*time6;
    return validateUnitSet([
      sq("igcse-u2-f1","Calculate speed from distance and time",difficulty,`A car travels ${dist1} m in ${time1} s. Find its speed, using v = s/t.`,String(speed1),"Divide distance by time.",`${dist1}÷${time1}=${speed1} m/s.`),
      sq("igcse-u2-f2","Calculate average speed over multiple stages",difficulty,`A journey covers ${d1_2} m in ${t1_2} s, then ${d2_2} m in ${t2_2} s. Find the average speed for the whole journey.`,String(avgSpeed2),"Divide total distance by total time.",`(${d1_2}+${d2_2})÷(${t1_2}+${t2_2})=${avgSpeed2} m/s.`),
      sq("igcse-u2-f3","Interpret a distance-time graph shape",difficulty,"A distance-time graph shows a straight, sloped line. Is the object moving at constant speed or accelerating?",["constant speed","constantspeed"],"A straight sloped line has a constant gradient.","A straight line means constant speed."),
      sq("igcse-u2-f4","Find speed from a distance-time graph gradient",difficulty,`A distance-time graph shows a straight line covering ${dist4} m in ${time4} s. Find the speed from the gradient.`,String(grad4),"The gradient of a distance-time graph is the speed.",`${dist4}÷${time4}=${grad4} m/s.`),
      sq("igcse-u2-f5","Recall the value of g",difficulty,`True or false: the acceleration of free fall, g, near the Earth's surface is approximately ${gValue5?"9.8":"5.8"} m/s².`,gValue5?"true":"false","Recall the standard value of g.",`g is approximately 9.8 m/s².`),
      sq("igcse-u2-f6","Calculate acceleration from a velocity change",difficulty,`An object's velocity changes from ${v1_6} m/s to ${v2_6} m/s over ${time6} s. Find its acceleration, using a = Δv/Δt.`,String(accel6),"Divide the change in velocity by the time taken.",`(${v2_6}−${v1_6})÷${time6}=${accel6} m/s².`),
    ], difficulty);
  }
  if (difficulty === "application") {
    const speed1=r(2,20)*5,time1=r(2,10),dist1=speed1*time1;
    const accel2=r(2,8),time2=r(2,8),vf2=accel2*time2,dist2=(accel2*time2*time2)/2;
    const isDecel3=r(0,1)===1;
    const isFaster4=r(0,1)===1;
    const speed5=r(2,20)*10,time5=r(2,8),dist5=speed5*time5;
    const hasResistance6=r(0,1)===1;
    return validateUnitSet([
      sq("igcse-u2-a1","Calculate distance from constant speed",difficulty,`A cyclist travels at a constant ${speed1} m/s for ${time1} s. Find the distance travelled.`,String(dist1),"Multiply speed by time.",`${speed1}×${time1}=${dist1} m.`),
      sq("igcse-u2-a2","Find distance from a speed-time graph area",difficulty,`A car starts from rest and accelerates uniformly at ${accel2} m/s² for ${time2} s, reaching ${vf2} m/s. Using the area under the speed-time graph, find the distance travelled.`,String(dist2),"The area under the graph (a triangle) is ½ × time × final speed.",`½×${time2}×${vf2}=${dist2} m.`),
      sq("igcse-u2-a3","Define deceleration",difficulty,`True or false: ${isDecel3?"a decrease":"an increase"} in speed over time is called a deceleration.`,isDecel3?"true":"false","A deceleration is a decrease in speed.",`${isDecel3?"True":"False"} — a deceleration is a decrease in speed.`),
      sq("igcse-u2-a4","Interpret gradient steepness on a distance-time graph",difficulty,`On a distance-time graph, a ${isFaster4?"steeper":"flatter"} line represents a ${isFaster4?"faster":"slower"} speed. Is this statement correct? Answer yes or no.`,"yes","A steeper gradient means greater speed.","Yes — steeper lines represent faster speeds."),
      sq("igcse-u2-a5","Calculate distance from speed and time",difficulty,`A train travels at ${speed5} m/s for ${time5} s. Find the distance covered.`,String(dist5),"Multiply speed by time.",`${speed5}×${time5}=${dist5} m.`),
      sq("igcse-u2-a6","Reason about terminal velocity",difficulty,`A skydiver falls ${hasResistance6?"with":"without"} air resistance. Will they reach a terminal (constant maximum) velocity? Answer yes or no.`,hasResistance6?"yes":"no","Terminal velocity occurs when resistance balances weight.",`${hasResistance6?"Yes":"No"} — ${hasResistance6?"resistance allows a terminal velocity to be reached":"without resistance, there is no terminal velocity"}.`),
    ], difficulty);
  }
  const accel1=r(2,8),time1=r(2,8),v0_1=r(2,10),vf1=v0_1+accel1*time1,wrongV1=v0_1+accel1;
  let speedA2,time2a,dist2a,speedB2,time2b,dist2b,correctAvg2;
  do {
    speedA2=r(20,60)*2; time2a=r(2,6); dist2a=speedA2*time2a;
    speedB2=r(20,60)*2; time2b=r(2,6); dist2b=speedB2*time2b;
    correctAvg2=(dist2a+dist2b)/(time2a+time2b);
  } while (!Number.isInteger(correctAvg2));
  const wrongAvg2=(speedA2+speedB2)/2;
  const accel3=r(2,6),time3a=r(2,6),time3b=r(2,6),dist3=(accel3*time3a*time3a)/2+accel3*time3a*time3b;
  const hasResistance4=r(0,1)===1;
  const accel5=r(2,8),time5=r(2,8),wrongSign5=r(0,1)===1;
  const time6a=r(2,6),time6b=r(2,6),totalTime6=time6a+time6b,avgSpeed6=r(10,80),dist6=avgSpeed6*totalTime6;
  return validateUnitSet([
    sq("igcse-u2-r1","Correct an equation-of-motion error",difficulty,`A learner calculates final velocity using v = u + a (forgetting to multiply by time) for an object starting at ${v0_1} m/s with acceleration ${accel1} m/s² over ${time1} s, getting ${wrongV1} m/s. Enter the correct final velocity.`,String(vf1),"v = u + at, don't forget to multiply acceleration by time.",`${v0_1}+${accel1}×${time1}=${vf1} m/s.`),
    sq("igcse-u2-r2","Correct an average-speed misconception",difficulty,`A learner averages two separate speeds (${speedA2} m/s and ${speedB2} m/s) to get ${wrongAvg2} m/s for a journey of ${dist2a} m in ${time2a} s then ${dist2b} m in ${time2b} s. Enter the correct average speed for the whole journey (using total distance ÷ total time).`,String(correctAvg2),"Average speed is total distance divided by total time, not the average of the two speeds.",`(${dist2a}+${dist2b})÷(${time2a}+${time2b})=${correctAvg2} m/s.`),
    sq("igcse-u2-r3","Combine acceleration and constant-speed phases",difficulty,`A car accelerates uniformly at ${accel3} m/s² from rest for ${time3a} s, then continues at constant speed for a further ${time3b} s. Find the total distance travelled.`,String(dist3),"Find the distance during acceleration, then add the constant-speed distance.",`½×${accel3}×${time3a}²+${accel3}×${time3a}×${time3b}=${dist3} m.`),
    sq("igcse-u2-r4","Reason about free fall with resistance",difficulty,`An object falls ${hasResistance4?"with":"without"} air resistance acting on it. Will its acceleration remain constant at g throughout the fall? Answer yes or no.`,hasResistance4?"no":"yes","Air resistance increases with speed, changing the acceleration.",`${hasResistance4?"No":"Yes"} — ${hasResistance4?"resistance changes the acceleration as speed increases":"without resistance, acceleration stays constant at g"}.`),
    sq("igcse-u2-r5","Identify acceleration vs deceleration from sign",difficulty,`An object has acceleration ${wrongSign5?"-":""}${accel5} m/s² for ${time5} s. Is the object ${wrongSign5?"decelerating":"accelerating"}? Answer yes or no.`,"yes","A negative acceleration is a deceleration; a positive one is an acceleration.",`Yes — this matches the sign of the acceleration given.`),
    sq("igcse-u2-r6","Calculate average speed from total distance",difficulty,`A journey covers ${dist6} m in total, taking ${time6a} s for the first half of the time and ${time6b} s for the second half. Find the average speed for the whole journey.`,String(avgSpeed6),"Divide total distance by total time.",`${dist6}÷(${time6a}+${time6b})=${avgSpeed6} m/s.`),
  ], difficulty);
};

const structuredMassWeightDensity = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const isCorrect1=r(0,1)===1;
    const mass2=r(2,20),g2=10,weight2=mass2*g2;
    const mass3=r(2,20),g3=r(2,12),weight3=mass3*g3;
    const volume4=r(2,10),density4=r(2,12),mass4=density4*volume4;
    const objDensity5=r(0,1)===1;
    return validateUnitSet([
      sq("igcse-u3-f1","Distinguish mass from weight (true/false)",difficulty,`True or false: mass is a measure of the quantity of matter in an object, and ${isCorrect1?"does not change":"changes"} depending on location.`,isCorrect1?"true":"false","Mass stays constant regardless of location; weight changes with gravitational field strength.",`${isCorrect1?"True":"False"} — mass does not change with location.`),
      sq("igcse-u3-f2","Calculate weight from mass",difficulty,`An object has a mass of ${mass2} kg. Using g = ${g2} N/kg, find its weight, using W = mg.`,String(weight2),"Multiply mass by gravitational field strength.",`${mass2}×${g2}=${weight2} N.`),
      sq("igcse-u3-f3","Calculate gravitational field strength",difficulty,`An object of mass ${mass3} kg has a weight of ${weight3} N. Find the gravitational field strength, using g = W/m.`,String(g3),"Divide weight by mass.",`${weight3}÷${mass3}=${g3} N/kg.`),
      sq("igcse-u3-f4","Calculate density",difficulty,`An object has a mass of ${mass4} kg and a volume of ${volume4} m³. Find its density, using ρ = m/V.`,String(density4),"Divide mass by volume.",`${mass4}÷${volume4}=${density4} kg/m³.`),
      sq("igcse-u3-f5","Predict floating based on density",difficulty,`An object has a density ${objDensity5?"greater":"less"} than water. Will it float or sink in water?`,objDensity5?"sink":"float","An object denser than the liquid sinks; less dense floats.",`It will ${objDensity5?"sink":"float"}.`),
      sq("igcse-u3-f6","Name the method for finding irregular volume",difficulty,"What method is used to find the volume of an irregularly shaped solid that sinks in a liquid?",["displacement","volume by displacement","water displacement"],"This method uses the change in liquid level.","This is called volume by displacement."),
    ], difficulty);
  }
  if (difficulty === "application") {
    const mass1=r(2,20),g1=10,weight1=mass1*g1;
    const volume2=r(2,10),density2=r(2,12),mass2=density2*volume2;
    const objDensity3=r(0,1)===1;
    const beforeReading4=r(20,60),afterReading4=beforeReading4+r(5,20),volume4=afterReading4-beforeReading4,mass4=r(2,10)*volume4,density4=mass4/volume4;
    const liquidADensity6=r(2,10),liquidBDensity6=r(2,10);
    return validateUnitSet([
      sq("igcse-u3-a1","Calculate weight on Earth",difficulty,`An astronaut has a mass of ${mass1} kg on Earth, where g = ${g1} N/kg. Find their weight on Earth.`,String(weight1),"Multiply mass by g.",`${mass1}×${g1}=${weight1} N.`),
      sq("igcse-u3-a2","Calculate mass from density and volume",difficulty,`A block has a density of ${density2} g/cm³ and a volume of ${volume2} cm³. Find its mass.`,String(mass2),"Multiply density by volume.",`${density2}×${volume2}=${mass2} g.`),
      sq("igcse-u3-a3","Predict floating from a density comparison",difficulty,`An object has a density ${objDensity3?"less than":"greater than"} water. Will this object ${objDensity3?"float":"sink"}? Answer yes or no.`,"yes","Comparing object density to water density predicts floating or sinking.",`Yes — this matches the density comparison given.`),
      sq("igcse-u3-a4","Find density using volume by displacement",difficulty,`A measuring cylinder reads ${beforeReading4} cm³ before an irregular solid is submerged, and ${afterReading4} cm³ after. The solid has a mass of ${mass4} g. Find its density.`,String(density4),"Find the volume from the level change, then divide mass by volume.",`${mass4}÷(${afterReading4}−${beforeReading4})=${density4} g/cm³.`),
      sq("igcse-u3-a5","Recall the use of a balance (true/false)",difficulty,"True or false: a balance is used to compare the masses of two objects.","true","A balance compares masses directly.","True — this is the standard use of a balance."),
      sq("igcse-u3-a6","Predict which liquid floats",difficulty,`Liquid A has density ${liquidADensity6} g/cm³ and Liquid B has density ${liquidBDensity6} g/cm³. If they do not mix, will Liquid ${liquidADensity6<liquidBDensity6?"A":"B"} float on top? Answer yes or no.`,"yes","The less dense liquid floats on top.","Yes — the less dense liquid floats on top."),
    ], difficulty);
  }
  const mass1=r(2,20),g1=10,weight1=mass1*g1,wrongWeight1=mass1+g1;
  const isMoonGravity2=r(0,1)===1;
  const density3=r(2,8),volume3=r(2,10),mass3=density3*volume3;
  const beforeReading4=r(20,60),volume4=r(5,20),afterReading4=beforeReading4+volume4,densityTarget4=r(2,8),mass4=densityTarget4*volume4;
  const objDensity5=r(2,8),isFloat5=objDensity5<1;
  const totalVolume6=r(2,10),density6=r(2,10),totalMass6=density6*totalVolume6;
  return validateUnitSet([
    sq("igcse-u3-r1","Correct a weight-calculation error",difficulty,`A learner finds weight by adding mass and g instead of multiplying, getting ${wrongWeight1} N for a mass of ${mass1} kg with g=${g1} N/kg. Enter the correct weight.`,String(weight1),"Multiply mass by g, don't add them.",`${mass1}×${g1}=${weight1} N.`),
    sq("igcse-u3-r2","Reason about weight on the Moon",difficulty,`An astronaut has the same mass on the Moon as on Earth, but their weight is ${isMoonGravity2?"less":"the same"} on the Moon (where gravitational field strength is weaker). Is this correct? Answer yes or no.`,isMoonGravity2?"yes":"no","Weight depends on g, which is weaker on the Moon.",`${isMoonGravity2?"Yes":"No"} — weaker gravity means less weight for the same mass.`),
    sq("igcse-u3-r3","Calculate mass then reason about floating",difficulty,`A solid has density ${density3} g/cm³ and volume ${volume3} cm³. Find its mass, then state whether it would float in water (density 1 g/cm³). Give the mass only.`,String(mass3),"Multiply density by volume.",`${density3}×${volume3}=${mass3} g.`),
    sq("igcse-u3-r4","Calculate density from a displacement scenario",difficulty,`A measuring cylinder reads ${beforeReading4} cm³ before a solid of mass ${mass4} g is submerged, rising to ${afterReading4} cm³. Find the density of the solid.`,String(densityTarget4),"Find the volume from the level change, then divide mass by volume.",`${mass4}÷${volume4}=${densityTarget4} g/cm³.`),
    sq("igcse-u3-r5","Predict floating from density values",difficulty,`An object has density ${objDensity5} g/cm³. Water has density 1 g/cm³. Will the object float or sink?`,isFloat5?"float":"sink","Compare the object's density to water's density.",`It will ${isFloat5?"float":"sink"}.`),
    sq("igcse-u3-r6","Calculate density from mass and volume",difficulty,`A mixture has total mass ${totalMass6} kg and total volume ${totalVolume6} m³. A learner wants the density. Find it, using ρ = m/V.`,String(density6),"Divide mass by volume.",`${totalMass6}÷${totalVolume6}=${density6} kg/m³.`),
  ], difficulty);
};

const structuredForces = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const f1a=r(5,20),f1b=r(2,10),sameDir1=r(0,1)===1,resultant1=sameDir1?f1a+f1b:f1a-f1b;
    const force3=r(2,20),dist3=r(2,10),moment3=force3*dist3;
    const isEquilibrium4=r(0,1)===1;
    const frictionScenarios6=[
      { desc:"a swimmer moving through water", answer:["liquidfriction","drag","liquid drag","drag from a liquid"] },
      { desc:"a parachutist falling through the air", answer:["airresistance","air resistance","gas friction","drag from a gas"] },
      { desc:"a box being dragged across a rough floor", answer:["solidfriction","solid friction","friction"] },
    ];
    const scenario6=frictionScenarios6[r(0,frictionScenarios6.length-1)];
    return validateUnitSet([
      sq("igcse-u4-f1","Find the resultant of forces on a line",difficulty,`Two forces act on an object along the same line: ${f1a} N and ${f1b} N, acting in ${sameDir1?"the same":"opposite"} directions. Find the resultant force.`,String(resultant1),"Add forces in the same direction; subtract opposing forces.",`${f1a}${sameDir1?"+":"−"}${f1b}=${resultant1} N.`),
      sq("igcse-u4-f2","Recall Newton's first law (true/false)",difficulty,"True or false: an object at rest will remain at rest unless a resultant force acts on it.","true","This is Newton's first law.","True — this is Newton's first law."),
      sq("igcse-u4-f3","Calculate a moment",difficulty,`A force of ${force3} N acts at a perpendicular distance of ${dist3} m from a pivot. Find the moment, using moment = force × perpendicular distance.`,String(moment3),"Multiply force by perpendicular distance.",`${force3}×${dist3}=${moment3} N·m.`),
      sq("igcse-u4-f4","Recall the condition for equilibrium",difficulty,`An object has no resultant force and no resultant moment acting on it. Is it ${isEquilibrium4?"in equilibrium":"accelerating"}?`,isEquilibrium4?"yes":"no","No resultant force or moment means equilibrium, not acceleration.",`${isEquilibrium4?"Yes":"No"} — no resultant force or moment means equilibrium.`),
      sq("igcse-u4-f5","Name the force between touching surfaces",difficulty,"A force that impedes motion and produces heating between two touching surfaces is called what?",["solid friction","friction"],"This force acts between surfaces in contact.","This is solid friction."),
      sq("igcse-u4-f6","Identify the type of friction/drag in a scenario",difficulty,`Which type of friction acts on ${scenario6.desc}?`,scenario6.answer,"Consider whether the object moves through a solid surface, liquid, or gas.",`This describes drag/friction relevant to that medium.`),
    ], difficulty);
  }
  if (difficulty === "application") {
    const engineForce1=r(20,60),dragForce1=r(5,19),resultant1=engineForce1-dragForce1;
    const distA2=r(2,8),distB2=r(2,8),kFactor2=r(2,5),momentA2=distA2*distB2*kFactor2,forceA2=distB2*kFactor2,forceB2=distA2*kFactor2;
    const isWithinLimit3=r(0,1)===1;
    const mass4=r(2,10),accel4=r(2,10),force4=mass4*accel4;
    const isLower5=r(0,1)===1;
    const forceIncrease6=r(0,1)===1;
    return validateUnitSet([
      sq("igcse-u4-a1","Find the resultant of engine and drag forces",difficulty,`A car's engine provides a driving force of ${engineForce1} N, while drag/friction provides ${dragForce1} N in the opposite direction. Find the resultant force.`,String(resultant1),"Subtract the opposing force from the driving force.",`${engineForce1}−${dragForce1}=${resultant1} N.`),
      sq("igcse-u4-a2","Apply the principle of moments",difficulty,`A beam balances with a force of ${forceA2} N at a distance of ${distA2} m from the pivot on one side, and an unknown force at a distance of ${distB2} m on the other side. Find the unknown force, using the principle of moments.`,String(forceB2),"Set the two moments equal and solve for the unknown force.",`${forceA2}×${distA2}=${momentA2}; ${momentA2}÷${distB2}=${forceB2} N.`),
      sq("igcse-u4-a3","Reason about the limit of proportionality",difficulty,`A spring is stretched ${isWithinLimit3?"within":"beyond"} its limit of proportionality. Does the load-extension graph remain a straight line at this point? Answer yes or no.`,isWithinLimit3?"yes":"no","Beyond the limit of proportionality, the graph is no longer a straight line.",`${isWithinLimit3?"Yes":"No"} — ${isWithinLimit3?"within this limit, the graph is straight":"beyond this limit, the graph curves"}.`),
      sq("igcse-u4-a4","Calculate resultant force using F = ma",difficulty,`An object of mass ${mass4} kg accelerates at ${accel4} m/s². Find the resultant force acting on it, using F = ma.`,String(force4),"Multiply mass by acceleration.",`${mass4}×${accel4}=${force4} N.`),
      sq("igcse-u4-a5","Reason about centre of gravity and stability",difficulty,`A vehicle with a ${isLower5?"lower":"higher"} centre of gravity is generally ${isLower5?"more":"less"} stable. Is this statement correct? Answer yes or no.`,"yes","A lower centre of gravity generally increases stability.","Yes — this is correct."),
      sq("igcse-u4-a6","Reason about circular motion factors",difficulty,`An object moves in a circular path at constant mass and radius. If the force towards the centre ${forceIncrease6?"increases":"decreases"}, does the object's speed ${forceIncrease6?"increase":"decrease"}?`,"yes","At constant mass and radius, speed and centripetal force change together.",`Yes — this matches the relationship between force and speed here.`),
    ], difficulty);
  }
  const distA1=r(2,8),distB1=r(2,8),kFactor1=r(2,5),forceA1=distB1*kFactor1,forceB1=distA1*kFactor1,wrongForceB1=forceA1+distB1;
  let distA2,distB2,distC2,forceA2,forceB2,forceC2;
  do {
    distA2=r(2,8); distB2=r(2,8); distC2=r(2,8);
    forceA2=r(2,10); forceB2=r(2,10);
    forceC2=(forceA2*distA2+forceB2*distB2)/distC2;
  } while (!Number.isInteger(forceC2));
  const mass3=r(2,10),force3=r(2,10)*mass3,accel3=force3/mass3;
  const speedIncrease5=r(0,1)===1;
  const isBeyondLimit6=r(0,1)===1;
  return validateUnitSet([
    sq("igcse-u4-r1","Correct a moments error",difficulty,`A beam has a force of ${forceA1} N at ${distA1} m from the pivot on one side. A learner calculates the balancing force on the other side (at ${distB1} m) by adding instead of using moments, getting ${wrongForceB1} N. Enter the correct balancing force.`,String(forceB1),"Use moments (force × distance), not addition.",`(${forceA1}×${distA1})÷${distB1}=${forceB1} N.`),
    sq("igcse-u4-r2","Apply moments with two forces on one side",difficulty,`A beam has two forces on one side: ${forceA2} N at ${distA2} m, and ${forceB2} N at ${distB2} m from the pivot. Find the single balancing force needed at ${distC2} m on the other side.`,String(forceC2),"Add both moments on one side, then divide by the distance on the other.",`(${forceA2}×${distA2}+${forceB2}×${distB2})÷${distC2}=${forceC2} N.`),
    sq("igcse-u4-r3","Calculate acceleration from force and mass",difficulty,`An object of mass ${mass3} kg has a resultant force of ${force3} N acting on it. Find its acceleration, using F = ma.`,String(accel3),"Divide force by mass.",`${force3}÷${mass3}=${accel3} m/s².`),
    sq("igcse-u4-r4","Reason about friction and heating (true/false)",difficulty,"True or false: friction between two surfaces always produces heating, even when it is not the main effect being considered.","true","Friction converts kinetic energy to heat as a byproduct.","True — friction always produces some heating."),
    sq("igcse-u4-r5","Reason about mass and force in circular motion",difficulty,`In circular motion at constant force and radius, does ${speedIncrease5?"an increased mass require an increased force":"a decreased mass require a decreased force"} to maintain the same speed and radius?`,speedIncrease5?"yes":"no","A larger mass needs a larger force to maintain the same circular motion.",`${speedIncrease5?"Yes":"No"} — mass and required force are related this way.`),
    sq("igcse-u4-r6","Reason about the limit of proportionality",difficulty,`A spring is stretched ${isBeyondLimit6?"beyond":"within"} its limit of proportionality. Is the extension still directly proportional to the load at this point? Answer yes or no.`,isBeyondLimit6?"no":"yes","Beyond the limit of proportionality, extension is no longer proportional to load.",`${isBeyondLimit6?"No":"Yes"} — ${isBeyondLimit6?"proportionality no longer holds beyond this point":"proportionality holds within this limit"}.`),
  ], difficulty);
};

const structuredMomentum = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const mass1=r(2,20),velocity1=r(2,20),momentum1=mass1*velocity1;
    const force2=r(2,20),time2=r(2,10),impulse2=force2*time2;
    const hasExternalForce3=r(0,1)===1;
    const deltaT4=r(2,10),force4=r(2,20),deltaP4=force4*deltaT4;
    let m1_5,v1_5,m2_5,totalM5,vCombined5;
    do {
      m1_5=r(2,10); v1_5=r(2,20); m2_5=r(2,10); totalM5=m1_5+m2_5;
      vCombined5=(m1_5*v1_5)/totalM5;
    } while (!Number.isInteger(vCombined5));
    return validateUnitSet([
      sq("igcse-u5-f1","Calculate momentum",difficulty,`An object has mass ${mass1} kg and velocity ${velocity1} m/s. Find its momentum, using p = mv.`,String(momentum1),"Multiply mass by velocity.",`${mass1}×${velocity1}=${momentum1} kg·m/s.`),
      sq("igcse-u5-f2","Calculate impulse",difficulty,`A force of ${force2} N acts for ${time2} s. Find the impulse, using impulse = FΔt.`,String(impulse2),"Multiply force by time.",`${force2}×${time2}=${impulse2} N·s.`),
      sq("igcse-u5-f3","Reason about momentum conservation (true/false)",difficulty,`True or false: in a system with ${hasExternalForce3?"a significant external force acting":"no external forces acting"}, total momentum is conserved.`,hasExternalForce3?"false":"true","Momentum is only conserved when there is no net external force.",`${hasExternalForce3?"False":"True"} — momentum is conserved only with no net external force.`),
      sq("igcse-u5-f4","Calculate force from a momentum change",difficulty,`An object's momentum changes by ${deltaP4} kg·m/s over ${deltaT4} s. Find the resultant force, using F = Δp/Δt.`,String(deltaP4/deltaT4),"Divide the change in momentum by the time taken.",`${deltaP4}÷${deltaT4}=${deltaP4/deltaT4} N.`),
      sq("igcse-u5-f5","Apply conservation of momentum to a collision",difficulty,`An object of mass ${m1_5} kg moving at ${v1_5} m/s collides and sticks to a stationary object of mass ${m2_5} kg. Using conservation of momentum, find their combined velocity after collision.`,String(vCombined5),"Total momentum before equals total momentum after.",`(${m1_5}×${v1_5})÷(${m1_5}+${m2_5})=${vCombined5} m/s.`),
      sq("igcse-u5-f6","Recall the SI unit of momentum",difficulty,"What is the SI unit of momentum?",["kgm/s","kg m/s","kgms-1","kg·m/s"],"Momentum's unit comes from mass × velocity.","The unit is kg·m/s."),
    ], difficulty);
  }
  if (difficulty === "application") {
    const mass1=r(500,2000),velocity1=r(2,30),momentum1=mass1*velocity1;
    const force2=r(200,2000),time2=r(1,5)/10,impulse2=Math.round(force2*time2*100)/100;
    let m1_3,v1_3,m2_3,totalM3,vCombined3;
    do {
      m1_3=r(500,1500); v1_3=r(2,20); m2_3=r(500,1500); totalM3=m1_3+m2_3;
      vCombined3=(m1_3*v1_3)/totalM3;
    } while (!Number.isInteger(vCombined3));
    const deltaT4=r(1,5)/10,force4=r(100,1000),deltaP4=Math.round(force4*deltaT4*100)/100;
    const isConserved5=r(0,1)===1;
    const mass6=r(500,2000),v1_6=r(2,20),v2_6=v1_6+r(2,15),deltaP6=mass6*(v2_6-v1_6);
    return validateUnitSet([
      sq("igcse-u5-a1","Calculate momentum in a real context",difficulty,`A car of mass ${mass1} kg travels at ${velocity1} m/s. Find its momentum.`,String(momentum1),"Multiply mass by velocity.",`${mass1}×${velocity1}=${momentum1} kg·m/s.`),
      sq("igcse-u5-a2","Calculate impulse in a collision",difficulty,`During a collision, a force of ${force2} N acts for ${time2} s. Find the impulse delivered.`,String(impulse2),"Multiply force by time.",`${force2}×${time2}=${impulse2} N·s.`),
      sq("igcse-u5-a3","Apply conservation of momentum in context",difficulty,`A trolley of mass ${m1_3} kg moving at ${v1_3} m/s collides and sticks to a stationary trolley of mass ${m2_3} kg. Find their combined velocity after the collision.`,String(vCombined3),"Total momentum before equals total momentum after.",`(${m1_3}×${v1_3})÷(${m1_3}+${m2_3})=${vCombined3} m/s.`),
      sq("igcse-u5-a4","Calculate momentum change from an airbag scenario",difficulty,`An airbag increases the time of impact to ${deltaT4} s for a force of ${force4} N. Find the change in momentum during this time.`,String(deltaP4),"Multiply force by time.",`${force4}×${deltaT4}=${deltaP4} kg·m/s.`),
      sq("igcse-u5-a5","Reason about momentum conservation in an explosion",difficulty,`True or false: a gun recoils backward when a bullet is fired forward, because momentum ${isConserved5?"is":"is not"} conserved in the explosion.`,isConserved5?"true":"false","Momentum conservation explains recoil.",`${isConserved5?"True":"False"} — this is due to conservation of momentum.`),
      sq("igcse-u5-a6","Calculate a change in momentum",difficulty,`A vehicle of mass ${mass6} kg speeds up from ${v1_6} m/s to ${v2_6} m/s. Find the change in momentum.`,String(deltaP6),"Multiply mass by the change in velocity.",`${mass6}×(${v2_6}−${v1_6})=${deltaP6} kg·m/s.`),
    ], difficulty);
  }
  const mass1=r(2,20),velocity1=r(2,20),wrongMomentum1=mass1+velocity1,correctMomentum1=mass1*velocity1;
  const deltaT2=r(1,5)/10,force2=r(100,1000),deltaP2=Math.round(force2*deltaT2*100)/100;
  let m1_3,v1_3,m2_3,totalM3,vCombined3;
  do {
    m1_3=r(500,1500); v1_3=r(2,20); m2_3=r(500,1500); totalM3=m1_3+m2_3;
    vCombined3=(m1_3*v1_3)/totalM3;
  } while (!Number.isInteger(vCombined3));
  const isLongerTime4=r(0,1)===1;
  const mass5=r(2,10),accel5=r(2,10),force5=mass5*accel5,time5=r(2,8),deltaP5=force5*time5;
  const isTrue6=r(0,1)===1;
  return validateUnitSet([
    sq("igcse-u5-r1","Correct a momentum-calculation error",difficulty,`A learner finds momentum by adding mass and velocity instead of multiplying, getting ${wrongMomentum1} for an object of mass ${mass1} kg and velocity ${velocity1} m/s. Enter the correct momentum.`,String(correctMomentum1),"Multiply mass by velocity, don't add them.",`${mass1}×${velocity1}=${correctMomentum1} kg·m/s.`),
    sq("igcse-u5-r2","Find momentum change from force and time",difficulty,`A force of ${force2} N acts for ${deltaT2} s. Find the change in momentum, then state the units of your answer (kg·m/s or N·s are equivalent). Give the numerical value only.`,String(deltaP2),"Multiply force by time.",`${force2}×${deltaT2}=${deltaP2}.`),
    sq("igcse-u5-r3","Correct a collision misconception",difficulty,`A trolley of mass ${m1_3} kg moving at ${v1_3} m/s collides and sticks to a stationary trolley of mass ${m2_3} kg. A learner assumes the final velocity is simply ${v1_3}/2. Use conservation of momentum to find the correct combined velocity.`,String(vCombined3),"Use conservation of momentum, weighted by mass, not a simple average.",`(${m1_3}×${v1_3})÷(${m1_3}+${m2_3})=${vCombined3} m/s.`),
    sq("igcse-u5-r4","Reason about force and collision time (true/false)",difficulty,`True or false: increasing the time over which a collision occurs (e.g. with an airbag or crumple zone), while keeping the change in momentum the same, ${isLongerTime4?"reduces":"increases"} the force experienced.`,isLongerTime4?"true":"false","F=Δp/Δt, so a longer time reduces the force for the same momentum change.",`${isLongerTime4?"True":"False"} — a longer collision time reduces the force.`),
    sq("igcse-u5-r5","Combine F=ma with momentum change",difficulty,`A resultant force is found using F = ma for an object of mass ${mass5} kg and acceleration ${accel5} m/s². Find the change in momentum produced over ${time5} s.`,String(deltaP5),"Find the force first, then multiply by time.",`${mass5}×${accel5}×${time5}=${deltaP5} kg·m/s.`),
    sq("igcse-u5-r6","Reason about momentum in an explosion",difficulty,`True or false: in an explosion where two initially stationary objects separate, the total momentum after the explosion is ${isTrue6?"zero, the same as before":"not necessarily zero"}.`,isTrue6?"true":"false","Momentum starts at zero and must remain zero, so the two momenta must cancel.",`${isTrue6?"True":"False"} — the total remains zero, matching the momentum before.`),
  ], difficulty);
};

const ENERGY_STORES = ["kinetic","gravitational potential","chemical","elastic (strain)","nuclear","electrostatic","internal (thermal)"];
const structuredEnergyWorkPower = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const mass2=r(2,10)*2,velocity2=r(2,10),ke2=(mass2*velocity2*velocity2)/2;
    const mass3=r(2,20),g3=10,height3=r(2,20),ep3=mass3*g3*height3;
    const force4=r(2,20),dist4=r(2,20),work4=force4*dist4;
    const time5=r(2,10),power5=r(20,60),work5=power5*time5;
    const wordingCorrect6=r(0,1)===1;
    return validateUnitSet([
      sq("igcse-u6-f1","Identify a non-existent energy store",difficulty,`Which of these is NOT a recognised energy store? (a) kinetic (b) gravitational potential (c) motion energy (d) internal (thermal)`,["c","motionenergy","motion energy"],"The seven recognised stores are kinetic, gravitational potential, chemical, elastic, nuclear, electrostatic, and internal (thermal).","The correct answer is (c) motion energy — not a recognised store name."),
      sq("igcse-u6-f2","Calculate kinetic energy",difficulty,`An object of mass ${mass2} kg moves at ${velocity2} m/s. Find its kinetic energy, using Ek = ½mv².`,String(ke2),"Square the velocity, multiply by mass, then halve.",`½×${mass2}×${velocity2}²=${ke2} J.`),
      sq("igcse-u6-f3","Calculate gravitational potential energy",difficulty,`An object of mass ${mass3} kg is raised ${height3} m. Using g=${g3} N/kg, find the change in gravitational potential energy, using ΔEp = mgΔh.`,String(ep3),"Multiply mass, g, and height together.",`${mass3}×${g3}×${height3}=${ep3} J.`),
      sq("igcse-u6-f4","Calculate work done",difficulty,`A force of ${force4} N moves an object ${dist4} m in the direction of the force. Find the work done, using W = Fd.`,String(work4),"Multiply force by distance.",`${force4}×${dist4}=${work4} J.`),
      sq("igcse-u6-f5","Calculate power",difficulty,`${work5} J of work is done in ${time5} s. Find the power, using P = W/t.`,String(power5),"Divide work by time.",`${work5}÷${time5}=${power5} W.`),
      sq("igcse-u6-f6","Evaluate a statement about energy conservation (true/false)",difficulty,`True or false: energy ${wordingCorrect6?"cannot be created or destroyed, only transferred between stores":"can sometimes be created or destroyed during a transfer"}.`,wordingCorrect6?"true":"false","Energy is always conserved — never created or destroyed, only transferred.",`${wordingCorrect6?"True":"False"} — energy is conserved, only ever transferred between stores.`),
    ], difficulty);
  }
  if (difficulty === "application") {
    const mass1=r(2,10)*2,velocity1=r(2,10),ke1=(mass1*velocity1*velocity1)/2;
    const mass2=r(2,20),g2=10,height2=r(2,20),ep2=mass2*g2*height2;
    let time3,power3,work3,dist3,force3;
    do {
      time3=r(2,10); power3=r(20,60); work3=power3*time3; dist3=r(2,10);
      force3=work3/dist3;
    } while (!Number.isInteger(force3));
    const resourceOptions=[
      { name:"solar power", answer:["renewable"] },
      { name:"coal", answer:["nonrenewable","non-renewable"] },
      { name:"wind power", answer:["renewable"] },
      { name:"natural gas", answer:["nonrenewable","non-renewable"] },
    ];
    const resourcePick=resourceOptions[r(0,resourceOptions.length-1)];
    const EFFICIENCY_RATIOS:[number,number][]=[[1,2],[1,4],[1,5],[3,4],[1,10],[3,5]];
    const [effNum5,effDen5]=EFFICIENCY_RATIOS[r(0,EFFICIENCY_RATIOS.length-1)];
    const totalIn5=r(2,10)*effDen5*10,usefulOut5=totalIn5*effNum5/effDen5,efficiency5=(usefulOut5/totalIn5)*100;
    const isFusion6=r(0,1)===1;
    return validateUnitSet([
      sq("igcse-u6-a1","Calculate kinetic energy in context",difficulty,`A ball of mass ${mass1} kg travels at ${velocity1} m/s. Find its kinetic energy.`,String(ke1),"Square the velocity, multiply by mass, then halve.",`½×${mass1}×${velocity1}²=${ke1} J.`),
      sq("igcse-u6-a2","Calculate GPE in context",difficulty,`A crane lifts a mass of ${mass2} kg to a height of ${height2} m. Using g=${g2} N/kg, find the increase in gravitational potential energy.`,String(ep2),"Multiply mass, g, and height together.",`${mass2}×${g2}×${height2}=${ep2} J.`),
      sq("igcse-u6-a3","Calculate power from force, distance and time",difficulty,`A force of ${force3} N pushes an object ${dist3} m in ${time3} s. Find the power developed.`,String(power3),"Find the work done, then divide by time.",`(${force3}×${dist3})÷${time3}=${power3} W.`),
      sq("igcse-u6-a4","Classify an energy resource",difficulty,`Is ${resourcePick.name} a renewable or non-renewable energy resource?`,resourcePick.answer,"Consider whether the resource replenishes naturally on a human timescale.",`${resourcePick.name} is ${resourcePick.answer[0]}.`),
      sq("igcse-u6-a5","Calculate efficiency",difficulty,`A machine has a useful energy output of ${usefulOut5} J for a total energy input of ${totalIn5} J. Find its efficiency as a percentage.`,String(efficiency5),"Divide useful output by total input, then multiply by 100%.",`(${usefulOut5}÷${totalIn5})×100=${efficiency5}%.`),
      sq("igcse-u6-a6","Recall the Sun's energy source (true/false)",difficulty,`True or false: the Sun's energy is produced by nuclear ${isFusion6?"fusion":"fission"}.`,isFusion6?"true":"false","The Sun is powered by nuclear fusion of hydrogen into helium.",`${isFusion6?"True":"False"} — the Sun's energy comes from nuclear fusion.`),
    ], difficulty);
  }
  const mass1=r(2,10)*2,velocity1=r(2,10),wrongKe1=mass1*velocity1,correctKe1=(mass1*velocity1*velocity1)/2;
  let workSum2a,workSum2b,time2,power2;
  do {
    workSum2a=r(20,100); workSum2b=r(20,100); time2=r(2,10);
    power2=(workSum2a+workSum2b)/time2;
  } while (!Number.isInteger(power2));
  const mass3=r(2,10)*2,height3=r(2,20),g3=10,ep3=mass3*g3*height3;
  const EFF_RATIOS:[number,number][]=[[1,2],[1,4],[1,5],[3,4],[1,10],[3,5]];
  const [effNum4,effDen4]=EFF_RATIOS[r(0,EFF_RATIOS.length-1)];
  const totalIn4=r(2,10)*effDen4*10,usefulOut4=totalIn4*effNum4/effDen4,efficiency4=(usefulOut4/totalIn4)*100,wastedEnergy4=totalIn4-usefulOut4;
  const isFusion5=r(0,1)===1;
  let force6,dist6,time6,work6,power6;
  do {
    force6=r(20,100); dist6=r(2,10); work6=force6*dist6; time6=r(2,10);
    power6=work6/time6;
  } while (!Number.isInteger(power6));
  return validateUnitSet([
    sq("igcse-u6-r1","Correct a kinetic-energy error",difficulty,`A learner finds kinetic energy using Ek = mv (forgetting to square v and halve), getting ${wrongKe1} J for a mass of ${mass1} kg at ${velocity1} m/s. Enter the correct kinetic energy.`,String(correctKe1),"Ek = ½mv² — don't forget to square v and halve the result.",`½×${mass1}×${velocity1}²=${correctKe1} J.`),
    sq("igcse-u6-r2","Calculate average power over multiple stages",difficulty,`Two stages of a process do ${workSum2a} J and ${workSum2b} J of work respectively, taking a total of ${time2} s. Find the average power over the whole process.`,String(power2),"Add the total work, then divide by total time.",`(${workSum2a}+${workSum2b})÷${time2}=${power2} W.`),
    sq("igcse-u6-r3","Calculate GPE and identify the energy store",difficulty,`An object of mass ${mass3} kg is raised ${height3} m. Using g=${g3} N/kg, find the gain in gravitational potential energy, then state which energy store this represents.`,String(ep3),"Multiply mass, g, and height together.",`${mass3}×${g3}×${height3}=${ep3} J.`),
    sq("igcse-u6-r4","Calculate efficiency from wasted energy",difficulty,`A machine has a total energy input of ${totalIn4} J and wastes ${wastedEnergy4} J. Find its efficiency as a percentage.`,String(efficiency4),"Find the useful output first, then divide by total input.",`(${totalIn4}−${wastedEnergy4})÷${totalIn4}×100=${efficiency4}%.`),
    sq("igcse-u6-r5","Reason about the source of Earth's energy resources",difficulty,`True or false: the energy released by nuclear ${isFusion5?"fusion":"fission"} in the Sun is the source of most of Earth's energy resources.`,isFusion5?"true":"false","The Sun's fusion reactions power most Earth energy resources except geothermal, nuclear and tidal.",`${isFusion5?"True":"False"} — this is the source for most (not all) energy resources.`),
    sq("igcse-u6-r6","Combine W=Fd and P=W/t",difficulty,`A force of ${force6} N moves an object ${dist6} m in ${time6} s. Find the power developed, combining W=Fd and P=W/t.`,String(power6),"Find the work done first, then divide by time.",`(${force6}×${dist6})÷${time6}=${power6} W.`),
  ], difficulty);
};

const structuredPressure = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    let force1,area1,pressure1;
    do { force1=r(20,100); area1=r(2,10); pressure1=force1/area1; } while (!Number.isInteger(pressure1));
    const pressure2=r(2,20),area2=r(2,10),force2=pressure2*area2;
    let pressure3,force3,area3;
    do { pressure3=r(2,20); force3=r(20,100); area3=force3/pressure3; } while (!Number.isInteger(area3));
    const isDeeper4=r(0,1)===1;
    const density6=r(2,10)*100,g6=10,height6=r(2,10),deltaP6=density6*g6*height6;
    return validateUnitSet([
      sq("igcse-u7-f1","Calculate pressure",difficulty,`A force of ${force1} N acts on an area of ${area1} m². Find the pressure, using p = F/A.`,String(pressure1),"Divide force by area.",`${force1}÷${area1}=${pressure1} Pa.`),
      sq("igcse-u7-f2","Calculate force from pressure and area",difficulty,`A pressure of ${pressure2} Pa acts on an area of ${area2} m². Find the force, rearranging p = F/A.`,String(force2),"Multiply pressure by area.",`${pressure2}×${area2}=${force2} N.`),
      sq("igcse-u7-f3","Calculate area from pressure and force",difficulty,`A force of ${force3} N produces a pressure of ${pressure3} Pa. Find the area, rearranging p = F/A.`,String(area3),"Divide force by pressure.",`${force3}÷${pressure3}=${area3} m².`),
      sq("igcse-u7-f4","Recall how liquid pressure varies with depth (true/false)",difficulty,`True or false: pressure beneath the surface of a liquid ${isDeeper4?"increases":"decreases"} with increasing depth.`,isDeeper4?"true":"false","Liquid pressure increases with depth.",`${isDeeper4?"True":"False"} — pressure increases with depth.`),
      sq("igcse-u7-f5","Recall how liquid pressure varies with density (true/false)",difficulty,"True or false: at the same depth, a less dense liquid produces a smaller pressure.","true","Liquid pressure depends on density as well as depth.","True — lower density means lower pressure at the same depth."),
      sq("igcse-u7-f6","Calculate a pressure change with depth",difficulty,`Find the pressure change at a depth of ${height6} m in a liquid of density ${density6} kg/m³. Using g=${g6} N/kg, use Δp = ρgΔh.`,String(deltaP6),"Multiply density, g, and depth together.",`${density6}×${g6}×${height6}=${deltaP6} Pa.`),
    ], difficulty);
  }
  if (difficulty === "application") {
    let weight1,area1,pressure1;
    do { weight1=r(400,900); area1=r(2,10); pressure1=weight1/area1; } while (!Number.isInteger(pressure1));
    const isSmaller2=r(0,1)===1;
    const density3=r(2,10)*100,g3=10,height3=r(2,10),deltaP3=density3*g3*height3;
    let pressure4,force4,area4;
    do { pressure4=r(2,20); force4=r(20,200); area4=force4/pressure4; } while (!Number.isInteger(area4));
    const isWider5=r(0,1)===1;
    const densityA6=r(2,10),densityB6=r(2,10);
    return validateUnitSet([
      sq("igcse-u7-a1","Calculate pressure in a real context",difficulty,`A person's weight is ${weight1} N, spread over a foot area of ${area1} m² (exaggerated for calculation). Find the pressure exerted.`,String(pressure1),"Divide weight by area.",`${weight1}÷${area1}=${pressure1} Pa.`),
      sq("igcse-u7-a2","Reason about area and pressure (true/false)",difficulty,`True or false: a sharp knife cuts more easily than a blunt one because its ${isSmaller2?"smaller":"larger"} blade area produces a ${isSmaller2?"greater":"smaller"} pressure for the same force.`,isSmaller2?"true":"false","A smaller area concentrates the same force into a greater pressure.",`${isSmaller2?"True":"False"} — a smaller area gives greater pressure for the same force.`),
      sq("igcse-u7-a3","Calculate pressure at a diving depth",difficulty,`A swimmer dives to a depth of ${height3} m in water of density ${density3} kg/m³. Using g=${g3} N/kg, find the pressure increase due to the water.`,String(deltaP3),"Multiply density, g, and depth together.",`${density3}×${g3}×${height3}=${deltaP3} Pa.`),
      sq("igcse-u7-a4","Calculate area from a hydraulic press",difficulty,`A hydraulic press exerts a pressure of ${pressure4} Pa and a force of ${force4} N. Find the area over which the force acts.`,String(area4),"Divide force by pressure.",`${force4}÷${pressure4}=${area4} m².`),
      sq("igcse-u7-a5","Reason about tyre width and ground pressure (true/false)",difficulty,`True or false: wider tyres on a vehicle ${isWider5?"reduce":"increase"} the pressure on the ground for the same vehicle weight.`,isWider5?"true":"false","A wider tyre spreads the same weight over a larger area, reducing pressure.",`${isWider5?"True":"False"} — wider tyres reduce ground pressure.`),
      sq("igcse-u7-a6","Compare pressures of two liquids",difficulty,`Liquid A has density ${densityA6} g/cm³ and Liquid B has density ${densityB6} g/cm³. At the same depth, which liquid produces the greater pressure, A or B?`,densityA6>densityB6?"a":"b","The denser liquid produces the greater pressure at the same depth.",`Liquid ${densityA6>densityB6?"A":"B"} is denser, so it produces the greater pressure.`),
    ], difficulty);
  }
  let force1,area1,wrongPressure1,correctPressure1;
  do { force1=r(20,100); area1=r(2,10); correctPressure1=force1/area1; } while (!Number.isInteger(correctPressure1));
  wrongPressure1=force1*area1;
  const density2=r(2,10)*100,g2=10,height2=r(2,10),deltaP2=density2*g2*height2;
  const isDifferentDensity3=r(0,1)===1;
  const pressure4=r(2,20),area4=r(2,10),force4=pressure4*area4,wrongArea4=force4+pressure4;
  const isTaller5=r(0,1)===1;
  const densityA6=r(2,10)*100,heightA6=r(2,8),pA6=densityA6*10*heightA6;
  const densityB6=r(2,10)*100,heightB6=r(2,8),pB6=densityB6*10*heightB6;
  return validateUnitSet([
    sq("igcse-u7-r1","Correct a pressure-calculation error",difficulty,`A learner finds pressure by multiplying force and area instead of dividing, getting ${wrongPressure1} for a force of ${force1} N on an area of ${area1} m². Enter the correct pressure.`,String(correctPressure1),"Divide force by area, don't multiply.",`${force1}÷${area1}=${correctPressure1} Pa.`),
    sq("igcse-u7-r2","Calculate a pressure increase with depth",difficulty,`A tank of liquid has density ${density2} kg/m³. Using g=${g2} N/kg, find the pressure increase between the surface and a depth of ${height2} m.`,String(deltaP2),"Multiply density, g, and depth together.",`${density2}×${g2}×${height2}=${deltaP2} Pa.`),
    sq("igcse-u7-r3","Reason about density and pressure at the same depth",difficulty,`True or false: two liquids with ${isDifferentDensity3?"different densities":"the same density"}, at the same depth, always produce the same pressure.`,isDifferentDensity3?"false":"true","Pressure at a given depth depends on the liquid's density.",`${isDifferentDensity3?"False":"True"} — pressure depends on density as well as depth.`),
    sq("igcse-u7-r4","Correct an area-calculation error",difficulty,`A learner finds area by adding force and pressure instead of dividing, getting ${wrongArea4} for a force of ${force4} N and pressure of ${pressure4} Pa. Enter the correct area.`,String(area4),"Divide force by pressure, don't add them.",`${force4}÷${pressure4}=${area4} m².`),
    sq("igcse-u7-r5","Reason about liquid column height and pressure",difficulty,`Two identical liquid columns have the same density, but column A is ${isTaller5?"taller":"shorter"} than column B. Does column A produce a ${isTaller5?"greater":"smaller"} pressure at its base?`,"yes","Taller columns of the same liquid produce greater pressure at the base.","Yes — this matches the relationship between height and pressure."),
    sq("igcse-u7-r6","Compare two liquid pressures from density and depth",difficulty,`Liquid A (density ${densityA6} kg/m³) at depth ${heightA6} m produces pressure ${pA6} Pa. Liquid B (density ${densityB6} kg/m³) at depth ${heightB6} m produces pressure ${pB6} Pa. Which produces the greater pressure, A or B?`,pA6>pB6?"a":"b","Compare the two calculated pressures directly.",`Liquid ${pA6>pB6?"A":"B"} produces the greater pressure.`),
  ], difficulty);
};

const igcseTopics: Record<string,(difficulty:"foundational"|"application"|"reasoning")=>PhysicsQuestion[]> = {
  "igcse-u1": structuredIgcseMeasurement,
  "igcse-u2": structuredMotion,
  "igcse-u3": structuredMassWeightDensity,
  "igcse-u4": structuredForces,
  "igcse-u5": structuredMomentum,
  "igcse-u6": structuredEnergyWorkPower,
  "igcse-u7": structuredPressure,
  "igcse-u14": structuredMagnetism,
  "igcse-u15": structuredElectricalQuantities,
  "igcse-u16": structuredElectricCircuits,
  "igcse-u17": structuredElectricalSafety,
  "igcse-u18": structuredElectromagneticEffects,
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
