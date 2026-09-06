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

const igcseTopics: Record<string,(difficulty:"foundational"|"application"|"reasoning")=>PhysicsQuestion[]> = {
  "igcse-u1": structuredIgcseMeasurement,
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
