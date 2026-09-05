export type MasteryQuestion = {
  templateId?: string;
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

export function answerMatches(input:unknown,accepted:string[]) {
  const actual=tidy(input);
  if(!actual)return false;
  return accepted.some(expected=>{
    const clean=tidy(expected);
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
    const a=Number(actual),b=Number(clean);
    return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=Math.max(0.0001,Math.abs(b)*0.001);
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

const structuredIntegers = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const a=r(8,24),b=r(3,12),negative=-r(3,15),factor=r(3,8);
    return [
      sq("s8-u1-f1","Add directed numbers",difficulty,`Calculate ${a} + (${negative}).`,String(a+negative),"Adding a negative is the same as subtracting its magnitude.",`${a}+(${negative})=${a+negative}.`),
      sq("s8-u1-f2","Subtract directed numbers",difficulty,`Calculate ${b} - (${negative}).`,String(b-negative),"Subtracting a negative becomes addition.",`${b}-(${negative})=${b-negative}.`),
      sq("s8-u1-f3","Multiply directed numbers",difficulty,`Calculate (${negative}) × ${factor}.`,String(negative*factor),"A negative multiplied by a positive is negative.",`${negative}×${factor}=${negative*factor}.`),
      sq("s8-u1-f4","Order directed numbers",difficulty,"Write −7, 3, −2 and 0 in ascending order.",["-7,-2,0,3","−7,−2,0,3"],"Start with the value furthest left on a number line.","−7 < −2 < 0 < 3."),
      sq("s8-u1-f5","Use factors and multiples",difficulty,"Find the highest common factor of 24 and 36.","12","List the factors common to both numbers.","The greatest shared factor is 12."),
      sq("s8-u1-f6","Use powers and roots",difficulty,"Evaluate 5² − √81.","16","Evaluate the power and root before subtracting.","5²−√81=25−9=16."),
    ];
  }
  if (difficulty === "application") {
    const start=r(-8,4),rise=r(6,14),debt=r(18,45),payment=r(5,17);
    return [
      sq("s8-u1-a1","Apply directed numbers to temperature",difficulty,`The temperature is ${start}°C and rises by ${rise}°C. Find the new temperature.`,String(start+rise),"Represent the rise with addition.",`${start}+${rise}=${start+rise}°C.`),
      sq("s8-u1-a2","Apply directed numbers to money",difficulty,`An account balance is −R${debt}. A deposit of R${payment} is made. Find the new balance in rand.`,String(-debt+payment),"A deposit moves the balance in the positive direction.",`−${debt}+${payment}=${-debt+payment}.`),
      sq("s8-u1-a3","Apply directed numbers to elevation",difficulty,"A diver is 18 m below sea level and descends another 7 m. What is the diver's elevation relative to sea level?",["-25","-25m"],"Below sea level is represented by a negative number.","−18−7=−25 m."),
      sq("s8-u1-a4","Apply order of operations",difficulty,"Evaluate 6 − 3 × (−4).","18","Complete multiplication before subtraction.","3×(−4)=−12, then 6−(−12)=18."),
      sq("s8-u1-a5","Use common multiples",difficulty,"Two lights flash every 6 seconds and every 8 seconds. After how many seconds will they next flash together?",["24","24seconds","24s"],"Find the lowest common multiple of 6 and 8.","LCM(6,8)=24, so they flash together after 24 seconds."),
      sq("s8-u1-a6","Use square numbers",difficulty,"A square contains 144 unit squares. How many unit squares lie along one side?","12","The side length is the square root of the area.","√144=12."),
    ];
  }
  const n=r(4,11),target=r(18,35);
  return [
    sq("s8-u1-r1","Reason with missing directed numbers",difficulty,`Complete the equation: □ + (−${n}) = ${target}.`,String(target+n),"Use the inverse operation to isolate the missing number.",`${target}−(−${n})=${target+n}.`),
    sq("s8-u1-r2","Explain directed-number errors",difficulty,"A learner says that −6 − 5 = 1. Enter the correct answer.","-11","Both movements are towards the negative side of the number line.","−6−5=−11."),
    sq("s8-u1-r3","Reason with consecutive integers",difficulty,"Three consecutive integers have a sum of 42. Find the middle integer.","14","The middle integer is the mean of three consecutive integers.","42÷3=14, so the integers are 13, 14 and 15."),
    sq("s8-u1-r4","Reason with factors",difficulty,"Find the greatest number that divides both 84 and 126 exactly.","42","This asks for the highest common factor.","HCF(84,126)=42."),
    sq("s8-u1-r5","Reason with powers",difficulty,"Find the missing exponent: 2^□ = 64.","6","Write successive powers of 2.","2⁶=64, so the exponent is 6."),
    sq("s8-u1-r6","Reason with operation order",difficulty,"Insert brackets into 8 − 3 × 2 so that the value is 10. Enter the bracketed expression.",["(8-3)*2","(8−3)×2","(8-3)x2"],"Make the subtraction happen before multiplication.","(8−3)×2=5×2=10."),
  ];
};

const structuredExpressions = (difficulty:"foundational"|"application"|"reasoning") => {
  const a=r(2,7),b=r(3,9),value=r(2,8);
  if (difficulty === "foundational") return [
    sq("s8-u2-f1","Collect like terms",difficulty,`Simplify ${a}x + ${b}x.`,`${a+b}x`,"Add the coefficients; keep x.",`${a}x+${b}x=${a+b}x.`),
    sq("s8-u2-f2","Substitute into expressions",difficulty,`Evaluate 4n − 3 when n = ${value}.`,String(4*value-3),"Replace n with the given value.",`4(${value})−3=${4*value-3}.`),
    sq("s8-u2-f3","Expand a single bracket",difficulty,"Expand 5(x + 4).",["5x+20","20+5x"],"Multiply both terms inside the bracket by 5.","5(x+4)=5x+20."),
    sq("s8-u2-f4","Factorise using a common factor",difficulty,"Factorise 8x + 24.","8(x+3)","Take out the greatest common factor.","8x+24=8(x+3)."),
    sq("s8-u2-f5","Use formulae",difficulty,"Use A = lw to find A when l = 9 and w = 6.","54","Substitute both values into the formula.","A=9×6=54."),
    sq("s8-u2-f6","Identify algebraic features",difficulty,"What is the coefficient of x in 7x − 4?","7","The coefficient is the number multiplying x.","In 7x−4, x is multiplied by 7."),
  ];
  if (difficulty === "application") return [
    sq("s8-u2-a1","Form expressions from contexts",difficulty,"A taxi charges R12 plus R5 per kilometre. Write the cost for k kilometres.",["5k+12","12+5k"],"Combine the fixed charge and the charge per kilometre.","Cost=12+5k."),
    sq("s8-u2-a2","Use perimeter expressions",difficulty,"A rectangle has length x + 3 and width x. Write its perimeter in simplest form.",["4x+6","6+4x"],"Perimeter is twice the length plus twice the width.","2(x+3)+2x=4x+6."),
    sq("s8-u2-a3","Solve a one-step context equation",difficulty,"Five identical notebooks cost R60. Let n be the cost of one notebook. Solve 5n = 60.","12","Divide both sides by 5.","n=60÷5=12."),
    sq("s8-u2-a4","Change the subject of a formula",difficulty,"Make x the subject of y = x + 9.",["x=y-9","y-9"],"Undo the addition of 9.","Subtract 9 from both sides: x=y−9."),
    sq("s8-u2-a5","Substitute negative values",difficulty,"Evaluate 3p + 8 when p = −4.","-4","Use brackets around the negative value.","3(−4)+8=−12+8=−4."),
    sq("s8-u2-a6","Use a formula in context",difficulty,"The formula C = 2πr gives a circumference. Use π = 3.14 and r = 5. Find C.","31.4","Substitute the given values.","C=2×3.14×5=31.4."),
  ];
  return [
    sq("s8-u2-r1","Test equivalent expressions",difficulty,"Which value of x makes 3x + 5 equal to 20?","5","Form and solve 3x+5=20.","3x=15, so x=5."),
    sq("s8-u2-r2","Reason about coefficients",difficulty,"The expressions 4x + 7x and kx are equivalent. Find k.","11","Collect the x terms.","4x+7x=11x, so k=11."),
    sq("s8-u2-r3","Reverse substitution",difficulty,"The value of 2n + 3 is 17. Find n.","7","Subtract 3, then divide by 2.","2n=14, so n=7."),
    sq("s8-u2-r4","Reason with formulae",difficulty,"For A = lw, the area is 48 and l = 8. Find w.","6","Substitute known values, then divide.","48=8w, so w=6."),
    sq("s8-u2-r5","Identify non-equivalent algebra",difficulty,"A learner expands 3(x + 4) as 3x + 4. Enter the correct expanded expression.",["3x+12","12+3x"],"Multiply every term in the bracket by 3.","3(x+4)=3x+12."),
    sq("s8-u2-r6","Form and solve an equation",difficulty,"A number is multiplied by 4 and then 6 is added. The result is 34. Find the number.","7","Let the number be x and solve 4x+6=34.","4x=28, so x=7."),
  ];
};

const structuredAngles = (difficulty:"foundational"|"application"|"reasoning") => {
  const angle=r(35,78);
  if (difficulty === "foundational") return [
    sq("s8-u5-f1","Use angles on a straight line",difficulty,`Angles on a straight line are ${angle}° and x°. Find x.`,String(180-angle),"Angles on a straight line total 180°.",`x=180−${angle}=${180-angle}°.`),
    sq("s8-u5-f2","Use vertically opposite angles",difficulty,"Two vertically opposite angles are 64° and x°. Find x.","64","Vertically opposite angles are equal.","x=64°."),
    sq("s8-u5-f3","Use angles in a triangle",difficulty,"Two angles of a triangle are 48° and 67°. Find the third angle.","65","Triangle angles total 180°.","180−48−67=65°."),
    sq("s8-u5-f4","Classify angles",difficulty,"Name the type of angle measuring 125°.",["obtuse","obtuseangle"],"Compare it with 90° and 180°.","125° is greater than 90° and less than 180°, so it is obtuse."),
    sq("s8-u5-f5","Recall a complete turn",difficulty,"How many degrees are in a complete turn?","360","Recall the full-turn angle fact.","A complete turn is 360°."),
    sq("s8-u5-f6","Use angles around a point",difficulty,"Angles around a point are 90°, 110° and x°. Find x.","160","Angles around a point total 360°.","x=360−90−110=160°."),
  ];
  if (difficulty === "application") return [
    sq("s8-u5-a1","Apply triangle angle facts",difficulty,"An isosceles triangle has two equal angles of 72°. Find the third angle.","36","Subtract both equal angles from 180°.","180−72−72=36°."),
    sq("s8-u5-a2","Apply quadrilateral angle facts",difficulty,"Three angles of a quadrilateral are 85°, 110° and 74°. Find the fourth angle.","91","Quadrilateral angles total 360°.","360−85−110−74=91°."),
    sq("s8-u5-a3","Apply parallel-line facts",difficulty,"Two alternate angles between parallel lines are labelled 58° and x°. Find x.","58","Alternate angles between parallel lines are equal.","x=58°."),
    sq("s8-u5-a4","Use exterior angles",difficulty,"Find each exterior angle of a regular octagon.","45","Exterior angles of a polygon total 360°.","360÷8=45°."),
    sq("s8-u5-a5","Use compass bearings",difficulty,"Write the three-figure bearing for 47° clockwise from north.","047","Bearings use three digits.","47° is written as 047°."),
    sq("s8-u5-a6","Apply regular polygon facts",difficulty,"Find each interior angle of a regular hexagon.","120","Use (n−2)×180÷n.","(6−2)×180÷6=120°."),
  ];
  return [
    sq("s8-u5-r1","Reason with linked angle facts",difficulty,"A triangle has one angle of 40°. The other two angles are equal. Find each equal angle.","70","Subtract 40° and share the remainder equally.","(180−40)÷2=70°."),
    sq("s8-u5-r2","Reason with algebraic angles",difficulty,"Angles on a straight line are 3x° and 60°. Find x.","40","Their sum is 180°.","3x+60=180, so 3x=120 and x=40."),
    sq("s8-u5-r3","Reason with quadrilateral angles",difficulty,"The angles of a quadrilateral are x°, x°, 80° and 120°. Find x.","80","Their total is 360°.","2x+200=360, so 2x=160 and x=80."),
    sq("s8-u5-r4","Evaluate an angle claim",difficulty,"A learner says every quadrilateral has four right angles. Enter the name of one quadrilateral that disproves the claim.",["parallelogram","trapezium","kite","rhombus"],"Choose a quadrilateral that need not contain a right angle.","For example, a general parallelogram does not have four right angles."),
    sq("s8-u5-r5","Reason with exterior angles",difficulty,"A regular polygon has exterior angle 30°. How many sides does it have?","12","Divide 360° by one exterior angle.","360÷30=12 sides."),
    sq("s8-u5-r6","Reason with bearings",difficulty,"The bearing of B from A is 065°. Find the bearing of A from B.","245","Reverse bearings differ by 180°.","065+180=245°."),
  ];
};

const structuredRounding = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const n1=r(1200,9800),raw=r(1005,9895),raw2=r(105,995),n4=r(120,895),n5=r(10234,98765),a6=r(110,490),b6=r(11,89);
    const roundedA6=Math.round(a6/100)*100,roundedB6=Math.round(b6/10)*10;
    return [
      sq("s8-u3-f1","Round to the nearest hundred",difficulty,`Round ${n1} to the nearest hundred.`,String(Math.round(n1/100)*100),"Look at the tens digit.",`${n1} rounds to ${Math.round(n1/100)*100}.`),
      sq("s8-u3-f2","Round decimals",difficulty,`Round ${(raw/1000).toFixed(3)} to 2 decimal places.`,(Math.round(raw/10)/100).toFixed(2),"Look at the third decimal place.",`${(raw/1000).toFixed(3)} rounds to ${(Math.round(raw/10)/100).toFixed(2)}.`),
      sq("s8-u3-f3","Round to the nearest whole number",difficulty,`Round ${(raw2/10).toFixed(1)} to the nearest whole number.`,String(Math.round(raw2/10)),"Look at the first decimal digit.",`${(raw2/10).toFixed(1)} rounds to ${Math.round(raw2/10)}.`),
      sq("s8-u3-f4","Round to 1 significant figure",difficulty,`Round ${n4} to 1 significant figure.`,String(Math.round(n4/100)*100),"Only the first digit is kept; the rest become zeros.",`${n4} rounds to ${Math.round(n4/100)*100}.`),
      sq("s8-u3-f5","Identify place value",difficulty,`What is the value of the first digit in ${n5}?`,String(Math.floor(n5/10000)*10000),"Multiply the digit by its place value.",`The first digit is worth ${Math.floor(n5/10000)*10000}.`),
      sq("s8-u3-f6","Estimate using rounding",difficulty,`Estimate ${a6} × ${b6} by rounding each number to 1 significant figure.`,String(roundedA6*roundedB6),"Round each number before multiplying.",`${a6}≈${roundedA6} and ${b6}≈${roundedB6}; ${roundedA6}×${roundedB6}=${roundedA6*roundedB6}.`),
    ];
  }
  if (difficulty === "application") {
    const raw1=r(1250,9875),value1=raw1/100,p1=r(11,489),p2=r(11,489),p3=r(11,489);
    const rp1=Math.round(p1/10)*10,rp2=Math.round(p2/10)*10,rp3=Math.round(p3/10)*10;
    const d=r(120,4890),pop=r(12500,987500),rawMass=r(305,895),massValue=rawMass/100000,speed=r(23,117);
    return [
      sq("s8-u3-a1","Round money to the nearest unit",difficulty,`A textbook costs R${value1.toFixed(2)}. Round the cost to the nearest rand.`,String(Math.round(value1)),"Look at the cents to decide whether to round up or down.",`R${value1.toFixed(2)} rounds to R${Math.round(value1)}.`),
      sq("s8-u3-a2","Estimate a total cost",difficulty,`Estimate the total cost of items priced R${p1}, R${p2} and R${p3} by rounding each price to the nearest R10.`,String(rp1+rp2+rp3),"Round each price first, then add.",`${rp1}+${rp2}+${rp3}=${rp1+rp2+rp3}.`),
      sq("s8-u3-a3","Round a measurement",difficulty,`A hiking trail is ${d} m long. Round the distance to the nearest 100 m.`,String(Math.round(d/100)*100),"Look at the tens and units digits.",`${d} m rounds to ${Math.round(d/100)*100} m.`),
      sq("s8-u3-a4","Round a large quantity",difficulty,`A town has a population of ${pop}. Round the population to the nearest thousand.`,String(Math.round(pop/1000)*1000),"Look at the hundreds digit.",`${pop} rounds to ${Math.round(pop/1000)*1000}.`),
      sq("s8-u3-a5","Use significant figures in context",difficulty,`A chemical sample has a mass of ${massValue.toFixed(5)} kg. Round the mass to 2 significant figures.`,Number(massValue.toPrecision(2)).toString(),"Count significant figures from the first non-zero digit.",`${massValue.toFixed(5)} kg rounds to ${Number(massValue.toPrecision(2))} kg (2 s.f.).`),
      sq("s8-u3-a6","Round to a given interval",difficulty,`A speed camera reads ${speed} km/h. Round the reading to the nearest 5 km/h.`,String(Math.round(speed/5)*5),"Find the nearest multiple of 5.",`${speed} rounds to ${Math.round(speed/5)*5}.`),
    ];
  }
  const n1=r(2,98)*10,lower=n1-5,n3=r(2,97)*100,upper=n3+49;
  const exact=r(150,950),roundedEstimate=Math.round(exact/10)*10,error=Math.abs(exact-roundedEstimate);
  const thousandsDigit=r(1,9),tensDigit=r(1,9),placeValueAns=thousandsDigit*1000+tensDigit*10;
  return [
    sq("s8-u3-r1","Reason about rounding bounds",difficulty,`A length is recorded as ${n1} cm, rounded to the nearest 10 cm. Find the smallest value the exact length could be.`,String(lower),"Subtract half the rounding interval.",`${n1}−5=${lower} cm is the lower bound.`),
    sq("s8-u3-r2","Correct a rounding error",difficulty,"A learner rounds 3.65 to 1 decimal place and writes 3.6. Enter the correct rounded value.","3.7","Look at the digit after the rounding place; 5 rounds up.","The second decimal is 5, so 3.65 rounds up to 3.7."),
    sq("s8-u3-r3","Reason about rounding bounds",difficulty,`A number rounds to ${n3} when rounded to the nearest 100. Find the largest value the number could have been.`,String(upper),"The number can be up to just under halfway to the next hundred.",`${n3}+49=${upper} is the largest whole number that still rounds to ${n3}.`),
    sq("s8-u3-r4","Apply rounding in two stages",difficulty,"Round 0.06784 to 2 significant figures, then round that answer to 1 significant figure. Enter the final answer.","0.07","Round in two stages, using the result of the first rounding.","0.06784 rounds to 0.068 (2 s.f.), which rounds to 0.07 (1 s.f.)."),
    sq("s8-u3-r5","Evaluate estimation error",difficulty,`The exact total of two prices is R${exact}. It is estimated as R${roundedEstimate} after rounding to the nearest R10. Find the error between the estimate and the exact total.`,String(error),"Subtract the smaller value from the larger.",`|${exact}−${roundedEstimate}|=${error}.`),
    sq("s8-u3-r6","Reason with place value",difficulty,`A number has the digit ${thousandsDigit} in the thousands place and the digit ${tensDigit} in the tens place. Every other digit is 0. Write the number.`,String(placeValueAns),"Multiply each digit by its place value and add.",`${thousandsDigit}×1000+${tensDigit}×10=${placeValueAns}.`),
  ];
};

const structuredDecimals = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const ai=r(15,95),bi=r(15,95),a=ai/10,b=bi/10,sum=(ai+bi)/10;
    const ci=r(60,95),di=r(100,ci*10-105),cVal=ci/10,dVal=di/100,diff=(ci*10-di)/100;
    const ei=r(12,48),fi=r(14,96),gi=r(15,95),hi=r(2,9);
    return [
      sq("s8-u4-f1","Add decimals",difficulty,`Calculate ${a.toFixed(1)} + ${b.toFixed(1)}.`,sum.toFixed(1),"Align the decimal points.",`${a.toFixed(1)}+${b.toFixed(1)}=${sum.toFixed(1)}.`),
      sq("s8-u4-f2","Subtract decimals",difficulty,`Calculate ${cVal.toFixed(1)} − ${dVal.toFixed(2)}.`,diff.toFixed(2),"Write both numbers with the same number of decimal places.",`${cVal.toFixed(1)}−${dVal.toFixed(2)}=${diff.toFixed(2)}.`),
      sq("s8-u4-f3","Multiply by 10",difficulty,`Calculate ${(ei/10).toFixed(1)} × 10.`,String(ei),"Multiplying by 10 moves the digits one place left.",`${(ei/10).toFixed(1)}×10=${ei}.`),
      sq("s8-u4-f4","Divide by 10",difficulty,`Calculate ${fi} ÷ 10.`,(fi/10).toFixed(1),"Dividing by 10 moves the digits one place right.",`${fi}÷10=${(fi/10).toFixed(1)}.`),
      sq("s8-u4-f5","Multiply decimals",difficulty,`Calculate ${(gi/10).toFixed(1)} × 0.5.`,(gi/20).toFixed(2),"Multiplying by 0.5 means finding one half.",`Half of ${(gi/10).toFixed(1)} is ${(gi/20).toFixed(2)}.`),
      sq("s8-u4-f6","Divide decimals",difficulty,`Calculate ${hi}.4 ÷ 0.2.`,String((hi*10+4)/2),"Multiply both numbers by 10 first, then divide.",`${hi*10+4}÷2=${(hi*10+4)/2}.`),
    ];
  }
  if (difficulty === "application") {
    const price=r(275,985)/100,qty=r(3,8),total=Math.round(price*qty*100)/100;
    const fuel=r(415,985)/100,litres=r(10,45);
    const speed=r(120,480)/10,time=r(2,8)/2;
    const bill=r(1250,9850)/100,split=r(2,5);
    const rain=[r(2,18)/10,r(2,18)/10,r(2,18)/10],rainTotal=Math.round((rain[0]+rain[1]+rain[2])*100)/100;
    const spent=r(50,400)/100,change=spent+r(500,2000)/100,changeGiven=Math.round((change-spent)*100)/100;
    return [
      sq("s8-u4-a1","Apply decimals to unit cost",difficulty,`A pen costs R${price.toFixed(2)}. Find the cost of ${qty} pens.`,total.toFixed(2),"Multiply the unit cost by the quantity.",`R${price.toFixed(2)}×${qty}=R${total.toFixed(2)}.`),
      sq("s8-u4-a2","Apply decimals to unit rate",difficulty,`Petrol costs R${fuel.toFixed(2)} per litre. Find the cost of ${litres} litres.`,(Math.round(fuel*litres*100)/100).toFixed(2),"Multiply the price per litre by the number of litres.",`R${fuel.toFixed(2)}×${litres}=R${(Math.round(fuel*litres*100)/100).toFixed(2)}.`),
      sq("s8-u4-a3","Apply decimals to speed, distance and time",difficulty,`A car travels at ${speed.toFixed(1)} km/h for ${time} hours. Find the distance travelled in km.`,(Math.round(speed*time*100)/100).toFixed(2),"Multiply speed by time.",`${speed.toFixed(1)}×${time}=${(Math.round(speed*time*100)/100).toFixed(2)} km.`),
      sq("s8-u4-a4","Divide money equally",difficulty,`A bill of R${bill.toFixed(2)} is shared equally between ${split} friends. Find the amount each friend pays.`,(Math.round((bill/split)*100)/100).toFixed(2),"Divide the total by the number of people.",`R${bill.toFixed(2)}÷${split}=R${(Math.round((bill/split)*100)/100).toFixed(2)}.`),
      sq("s8-u4-a5","Add decimals in context",difficulty,`Rainfall over three days was ${rain[0].toFixed(1)} cm, ${rain[1].toFixed(1)} cm and ${rain[2].toFixed(1)} cm. Find the total rainfall.`,rainTotal.toFixed(1),"Add all three amounts.",`${rain[0].toFixed(1)}+${rain[1].toFixed(1)}+${rain[2].toFixed(1)}=${rainTotal.toFixed(1)} cm.`),
      sq("s8-u4-a6","Subtract decimals in context",difficulty,`You pay with a R${change.toFixed(2)} note for an item costing R${spent.toFixed(2)}. Find the change given.`,changeGiven.toFixed(2),"Subtract the price from the amount paid.",`R${change.toFixed(2)}−R${spent.toFixed(2)}=R${changeGiven.toFixed(2)}.`),
    ];
  }
  return [
    sq("s8-u4-r1","Correct a decimal-multiplication error",difficulty,"A learner calculates 4.2 × 0.1 and writes 42. Enter the correct answer.","0.42","Multiplying by 0.1 makes a number ten times smaller.","4.2×0.1=0.42."),
    sq("s8-u4-r2","Reason about decimal order",difficulty,"Find the decimal exactly halfway between 3.4 and 3.5.","3.45","Add the two values and divide by 2.","(3.4+3.5)÷2=3.45."),
    sq("s8-u4-r3","Reason with squared decimals",difficulty,"The product of two identical decimals is 0.36. Find the decimal.","0.6","Think of a decimal that multiplied by itself gives 0.36.","0.6×0.6=0.36."),
    sq("s8-u4-r4","Reverse a decimal division",difficulty,"A number divided by 0.1 gives 47. Find the number.","4.7","Dividing by 0.1 is the same as multiplying by 10, so reverse it by dividing by 10.","47÷10=4.7."),
    sq("s8-u4-r5","Order decimals",difficulty,"Put 0.6, 0.55 and 0.601 in descending order.",["0.601,0.6,0.55","0.601 0.6 0.55"],"Compare digit by digit after the decimal point.","0.601 > 0.6 > 0.55."),
    sq("s8-u4-r6","Reason about place value in decimals",difficulty,"A learner says 0.3 + 0.3 = 0.6, so concludes 0.03 + 0.03 = 0.6 too. Enter the correct value of 0.03 + 0.03.","0.06","Each digit is ten times smaller than in the first sum.","0.03+0.03=0.06."),
  ];
};

const structuredData = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const vals=Array.from({length:6},()=>r(1,20)).sort((a,b)=>a-b).slice(0,5);
    const mean=vals.reduce((s,v)=>s+v,0);
    const dup=r(1,9);
    return [
      sq("s8-u6-f1","Find the mean",difficulty,`Find the mean of ${vals.join(", ")}.`,(mean/5).toString(),"Add all the values, then divide by how many there are.",`(${vals.join("+")})÷5=${mean/5}.`),
      sq("s8-u6-f2","Find the median",difficulty,`Find the median of ${vals.join(", ")}.`,String(vals[2]),"The values are already in order; choose the middle one.",`The middle value is ${vals[2]}.`),
      sq("s8-u6-f3","Find the range",difficulty,`Find the range of ${vals.join(", ")}.`,String(vals[4]-vals[0]),"Subtract the smallest value from the largest.",`${vals[4]}−${vals[0]}=${vals[4]-vals[0]}.`),
      sq("s8-u6-f4","Find the mode",difficulty,`A data set is ${dup}, ${dup}, ${dup+1}, ${dup+2}, ${dup+3}. Find the mode.`,String(dup),"Find the value occurring most often.",`${dup} occurs twice, more than any other value.`),
      sq("s8-u6-f5","Recall properties of averages",difficulty,"Which average is affected most by an extreme value (outlier)?","mean","Think about which average uses every value in its calculation.","The mean uses every value, so an outlier changes it the most."),
      sq("s8-u6-f6","Identify data types",difficulty,"What type of data is collected by counting how many students choose each favourite sport?",["categorical","categoricaldata"],"This data sorts students into named groups rather than measuring a quantity.","Favourite sport is a category, so this is categorical data."),
    ];
  }
  if (difficulty === "application") {
    const scores=Array.from({length:6},()=>r(40,95)),total=scores.reduce((s,v)=>s+v,0),mean=Math.round((total/6)*10)/10;
    return [
      sq("s8-u6-a1","Apply the mean in context",difficulty,`A class of 6 students scored ${scores.join(", ")} in a test. Find the mean score, correct to 1 decimal place.`,mean.toFixed(1),"Add all six scores, then divide by 6.",`(${scores.join("+")})÷6=${mean.toFixed(1)}.`),
      sq("s8-u6-a2","Evaluate sampling bias",difficulty,"A survey only asks people leaving a gym about exercise habits. Is this sample likely biased?","yes","Consider whether gym-goers represent everyone.","Yes. People leaving a gym are more likely to exercise than the general population."),
      sq("s8-u6-a3","Identify sampling methods",difficulty,"Which sampling method involves selecting every 5th name from an alphabetical list?","systematic","This method picks items at a fixed, regular interval.","Selecting at a fixed interval is called systematic sampling."),
      sq("s8-u6-a4","Reason about sample size",difficulty,"A company wants to survey customer satisfaction. Which is the better sample size: 20 customers or 2000 customers?","2000","A larger sample generally represents the population more reliably.","2000 customers gives a more reliable and representative sample."),
      sq("s8-u6-a5","Interpret correlation",difficulty,"A scatter graph shows more study hours linked to higher test scores. Name this type of correlation.",["positive","positivecorrelation"],"As one variable increases, the other tends to increase too.","This is positive correlation."),
      sq("s8-u6-a6","Choose an appropriate graph",difficulty,"Which graph type is best for showing the proportions of a whole, such as percentages of a budget?",["piechart","pie"],"Think about which chart shows parts of a whole.","A pie chart shows how a whole is divided into proportions."),
    ];
  }
  return [
    sq("s8-u6-r1","Reason backward from the mean",difficulty,"A data set of 5 values has mean 20. Four of the values are 15, 18, 22 and 24. Find the fifth value.","21","Multiply the mean by 5 to find the total, then subtract the known values.","5×20=100; 100−15−18−22−24=21."),
    sq("s8-u6-r2","Compare consistency using range",difficulty,"Set A has range 8 and Set B has range 15, with equal medians. Which set is more consistent?",["seta","set a"],"A smaller range means the data is more tightly grouped.","Set A is more consistent because its range is smaller."),
    sq("s8-u6-r3","Reason about a changing mean",difficulty,"The mean of 4 numbers is 12. A fifth number, 27, is added. Find the new mean.","15","Find the original total, add the new number, then divide by 5.","4×12=48; 48+27=75; 75÷5=15."),
    sq("s8-u6-r4","Evaluate sample bias",difficulty,"A survey of only football fans is used to decide the school's new sports equipment. Is this sample biased or unbiased?","biased","Consider whether the group represents everyone affected by the decision.","Biased. Football fans do not represent students who prefer other activities."),
    sq("s8-u6-r5","Compare consistency between classes",difficulty,"Two classes have the same mean score, but Class X has a smaller range than Class Y. Which class has more consistent scores?",["classx","class x"],"A smaller range means less spread in the results.","Class X has more consistent scores because its range is smaller."),
    sq("s8-u6-r6","Reason backward to find a total",difficulty,"A total of 40 pieces of data has mean 8. Find the sum of all the data values.","320","Multiply the mean by the number of values.","40×8=320."),
  ];
};

const structuredFractions = (difficulty:"foundational"|"application"|"reasoning") => {
  const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);
  const frac=(n:number,d:number)=>{if(d<0){n=-n;d=-d;}const g=gcd(Math.abs(n),d)||1;return{n:n/g,d:d/g};};
  const fadd=(a:{n:number,d:number},b:{n:number,d:number})=>frac(a.n*b.d+b.n*a.d,a.d*b.d);
  const fsub=(a:{n:number,d:number},b:{n:number,d:number})=>frac(a.n*b.d-b.n*a.d,a.d*b.d);
  const fmul=(a:{n:number,d:number},b:{n:number,d:number})=>frac(a.n*b.n,a.d*b.d);
  const fdiv=(a:{n:number,d:number},b:{n:number,d:number})=>frac(a.n*b.d,a.d*b.n);
  const fstr=(f:{n:number,d:number})=>f.d===1?String(f.n):`${f.n}/${f.d}`;
  const fdec=(f:{n:number,d:number})=>Number((f.n/f.d).toFixed(10)).toString();
  if (difficulty === "foundational") {
    const baseD=r(2,6),mult=r(2,5),n1=r(1,baseD-1)*mult,d1=baseD*mult,simplified1=frac(n1,d1);
    const d2a=r(2,6),d2b=r(2,6),a2=frac(r(1,d2a-1),d2a),b2=frac(r(1,d2b-1),d2b),sum2=fadd(a2,b2);
    const d3=r(3,8),a3=frac(r(2,d3-1),d3),b3=frac(r(1,a3.n-1),d3),diff3=fsub(a3,b3);
    const a4=frac(r(1,5),r(2,7)),b4=frac(r(1,5),r(2,7)),prod4=fmul(a4,b4);
    const a5=frac(r(1,5),r(2,7)),b5=frac(r(1,5),r(2,7)),quot5=fdiv(a5,b5);
    const decimals=[{text:"0.5",f:frac(1,2)},{text:"0.25",f:frac(1,4)},{text:"0.75",f:frac(3,4)},{text:"0.2",f:frac(1,5)},{text:"0.125",f:frac(1,8)},{text:"0.4",f:frac(2,5)}][r(0,5)];
    return [
      sq("s8-u7-f1","Simplify a fraction",difficulty,`Simplify ${n1}/${d1}.`,[fstr(simplified1),fdec(simplified1)],"Divide numerator and denominator by their highest common factor.",`${n1}/${d1} simplifies to ${fstr(simplified1)}.`),
      sq("s8-u7-f2","Add fractions",difficulty,`Calculate ${fstr(a2)} + ${fstr(b2)}.`,[fstr(sum2),fdec(sum2)],"Find a common denominator first.",`${fstr(a2)}+${fstr(b2)}=${fstr(sum2)}.`),
      sq("s8-u7-f3","Subtract fractions",difficulty,`Calculate ${fstr(a3)} − ${fstr(b3)}.`,[fstr(diff3),fdec(diff3)],"Write both fractions with the same denominator.",`${fstr(a3)}−${fstr(b3)}=${fstr(diff3)}.`),
      sq("s8-u7-f4","Multiply fractions",difficulty,`Calculate ${fstr(a4)} × ${fstr(b4)}.`,[fstr(prod4),fdec(prod4)],"Multiply numerators together and denominators together.",`${fstr(a4)}×${fstr(b4)}=${fstr(prod4)}.`),
      sq("s8-u7-f5","Divide fractions",difficulty,`Calculate ${fstr(a5)} ÷ ${fstr(b5)}.`,[fstr(quot5),fdec(quot5)],"Multiply by the reciprocal of the second fraction.",`${fstr(a5)}÷${fstr(b5)}=${fstr(quot5)}.`),
      sq("s8-u7-f6","Convert a decimal to a fraction",difficulty,`Write ${decimals.text} as a fraction in simplest form.`,[fstr(decimals.f)],"Write the decimal over a power of 10, then simplify.",`${decimals.text} simplifies to ${fstr(decimals.f)}.`),
    ];
  }
  if (difficulty === "application") {
    const dQ=[2,3,4,5,6][r(0,4)],nQ=r(1,dQ-1),qty=dQ*r(3,10),portion=frac(nQ,dQ),portionValue=(qty*portion.n)/portion.d;
    const recipeServe=r(2,6),scaleTo=r(8,20),ingredient=frac(r(1,3),[2,3,4][r(0,2)]),scaled=fmul(ingredient,frac(scaleTo,recipeServe));
    const shareD=[2,3,4,5][r(0,3)],shareN=r(1,shareD-1),money=shareD*r(10,40),shareValue=(money*shareN)/shareD;
    const hourFracD=[2,3,4,5,6][r(0,4)],hourFracN=r(1,hourFracD-1),minutes=(60*hourFracN)/hourFracD;
    const usedD=[3,4,5,6][r(0,3)],usedN=r(1,usedD-2),remaining=fsub(frac(1,1),frac(usedN,usedD));
    return [
      sq("s8-u7-a1","Find a fraction of a quantity",difficulty,`A packet has ${qty} sweets. ${nQ}/${dQ} of them are red. How many are red?`,String(portionValue),"Divide by the denominator, then multiply by the numerator.",`${qty}÷${dQ}×${nQ}=${portionValue}.`),
      sq("s8-u7-a2","Scale a recipe using fractions",difficulty,`A recipe for ${recipeServe} people needs ${fstr(ingredient)} cup of sugar. How much sugar is needed for ${scaleTo} people?`,[fstr(scaled),fdec(scaled)],"Multiply the amount by the scale factor.",`${fstr(ingredient)}×${scaleTo}/${recipeServe}=${fstr(scaled)}.`),
      sq("s8-u7-a3","Find a fractional share of money",difficulty,`R${money} is shared so that one person gets ${shareN}/${shareD} of it. How much do they get?`,String(shareValue),"Divide by the denominator, then multiply by the numerator.",`R${money}÷${shareD}×${shareN}=R${shareValue}.`),
      sq("s8-u7-a4","Convert a fraction of an hour to minutes",difficulty,`A lesson lasts ${hourFracN}/${hourFracD} of an hour. How many minutes is that?`,String(minutes),"Multiply the fraction by 60.",`60×${hourFracN}/${hourFracD}=${minutes} minutes.`),
      sq("s8-u7-a5","Find the remaining fraction",difficulty,`A tank is ${usedN}/${usedD} empty after use. What fraction is still full?`,[fstr(remaining),fdec(remaining)],"Subtract the empty fraction from 1.",`1−${usedN}/${usedD}=${fstr(remaining)}.`),
      sq("s8-u7-a6","Find the remaining amount after spending a fraction",difficulty,`A charity raised R${money}. They spent ${shareN}/${shareD} of it on costs. How much is left?`,String(money-shareValue),"Find the amount spent, then subtract it from the total.",`R${money}−R${shareValue}=R${money-shareValue}.`),
    ];
  }
  const total=(()=>{const dR=[3,4,5,6][r(0,3)];return {dR,total:dR*r(4,20)};})();
  const dR=total.dR,nR=r(1,dR-1),tot=total.total,part=(tot*nR)/dR;
  return [
    sq("s8-u7-r1","Reason backward from a fraction",difficulty,`${nR}/${dR} of a number is ${part}. Find the number.`,String(tot),"Divide by the numerator, then multiply by the denominator.",`${part}÷${nR}×${dR}=${tot}.`),
    sq("s8-u7-r2","Correct a simplification error",difficulty,"A learner simplifies 8/12 to 2/6. Enter the fully simplified fraction.",["2/3","0.6666666667"],"2/6 can still be simplified further.","8/12 fully simplifies to 2/3."),
    sq("s8-u7-r3","Find an equivalent fraction",difficulty,"Find the missing numerator: 3/4 = ?/20.","15","Find what 4 was multiplied by to get 20, then apply it to the numerator.","4×5=20, so 3×5=15."),
    sq("s8-u7-r4","Compare fractions",difficulty,"Which is larger, 5/8 or 3/5? Enter the larger fraction.",["5/8","0.625"],"Convert both to decimals or a common denominator to compare.","5/8=0.625 and 3/5=0.6, so 5/8 is larger."),
    sq("s8-u7-r5","Combine fractions in a multi-step problem",difficulty,"A tank is 1/3 full. Another 1/4 of the tank is then filled. What fraction of the tank is now full?",["7/12","0.5833333333"],"Add the two fractions using a common denominator.","1/3+1/4=4/12+3/12=7/12."),
    sq("s8-u7-r6","Solve a two-step fraction word problem",difficulty,"A student answers 5/8 of the questions correctly on a 40-question test. How many questions did they get wrong?","15","Find how many were correct, then subtract from the total.","40×5/8=25 correct, so 40−25=15 wrong."),
  ];
};

const structuredShapes = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const sidesPoly=[3,4,5,6,8][r(0,4)];
    const nameMap:Record<number,string>={3:"triangle",4:"quadrilateral",5:"pentagon",6:"hexagon",8:"octagon"};
    const angleSumMap:Record<number,number>={3:180,4:360,5:540,6:720,8:1080};
    const facesShape=[{n:"cube",faces:6},{n:"cuboid",faces:6},{n:"triangular prism",faces:5},{n:"square-based pyramid",faces:5}][r(0,3)];
    const symShapes=[{n:"square",lines:4},{n:"rectangle (non-square)",lines:2},{n:"equilateral triangle",lines:3},{n:"regular pentagon",lines:5},{n:"regular hexagon",lines:6}][r(0,4)];
    const angleA=r(20,150),angleB=180-angleA;
    const triA=r(30,100),triB=r(20,160-triA),triC=180-triA-triB;
    const areaW=r(4,15),areaH=r(4,15);
    return [
      sq("s8-u8-f1","Find the sum of interior angles",difficulty,`Find the sum of interior angles of a ${nameMap[sidesPoly]} (${sidesPoly} sides).`,String(angleSumMap[sidesPoly]),"Use (n−2)×180° where n is the number of sides.",`(${sidesPoly}−2)×180=${angleSumMap[sidesPoly]}°.`),
      sq("s8-u8-f2","Count faces of a 3D shape",difficulty,`How many faces does a ${facesShape.n} have?`,String(facesShape.faces),"Count each flat surface.",`A ${facesShape.n} has ${facesShape.faces} faces.`),
      sq("s8-u8-f3","Count lines of symmetry",difficulty,`How many lines of symmetry does a ${symShapes.n} have?`,String(symShapes.lines),"Count how many ways the shape can be folded onto itself.",`A ${symShapes.n} has ${symShapes.lines} lines of symmetry.`),
      sq("s8-u8-f4","Angles on a straight line",difficulty,`Two angles lie on a straight line. One is ${angleA}°. Find the other.`,String(angleB),"Angles on a straight line sum to 180°.",`180−${angleA}=${angleB}°.`),
      sq("s8-u8-f5","Angles in a triangle",difficulty,`A triangle has angles of ${triA}° and ${triB}°. Find the third angle.`,String(triC),"Angles in a triangle sum to 180°.",`180−${triA}−${triB}=${triC}°.`),
      sq("s8-u8-f6","Find the area of a rectangle",difficulty,`Find the area of a rectangle ${areaW} cm by ${areaH} cm.`,String(areaW*areaH),"Multiply length by width.",`${areaW}×${areaH}=${areaW*areaH} cm².`),
    ];
  }
  if (difficulty === "application") {
    const roomW=r(3,9),roomH=r(3,9);
    const gardenW=r(4,20),gardenH=r(4,20);
    const cubeSide=r(2,9);
    const angleReflex=r(200,340),angleAroundPoint=360-angleReflex;
    const baseAngle=r(30,60);
    const fenceW=r(4,20),fenceH=r(4,20);
    return [
      sq("s8-u8-a1","Find the area of a room",difficulty,`A rectangular room is ${roomW} m by ${roomH} m. Find its area in square metres.`,String(roomW*roomH),"Multiply length by width.",`${roomW}×${roomH}=${roomW*roomH} m².`),
      sq("s8-u8-a2","Find the perimeter of a garden",difficulty,`A rectangular garden is ${gardenW} m by ${gardenH} m. Find the perimeter needed to fence around it.`,String(2*(gardenW+gardenH)),"Add all four sides, or use 2×(length+width).",`2×(${gardenW}+${gardenH})=${2*(gardenW+gardenH)} m.`),
      sq("s8-u8-a3","Find the volume of a cube",difficulty,`A cube-shaped box has side length ${cubeSide} cm. Find its volume.`,String(cubeSide**3),"Cube the side length.",`${cubeSide}³=${cubeSide**3} cm³.`),
      sq("s8-u8-a4","Angles around a point",difficulty,`Two angles meet at a point. One is a reflex angle of ${angleReflex}°. Find the other angle needed to complete the full turn.`,String(angleAroundPoint),"Angles around a point sum to 360°.",`360−${angleReflex}=${angleAroundPoint}°.`),
      sq("s8-u8-a5","Classify an angle in context",difficulty,`A ladder leans against a wall making a right angle with the ground and wall. If one angle at the base is ${baseAngle}°, is the angle at the top of the ladder acute, right or obtuse?`,"acute","The three angles in the triangle must sum to 180°, and one is already 90°.","90+" + baseAngle + " is less than 180, so the top angle is under 90° — acute."),
      sq("s8-u8-a6","Find the perimeter of a field",difficulty,`A path fence is built around a rectangular field ${fenceW} m by ${fenceH} m. Find the total length of fencing.`,String(2*(fenceW+fenceH)),"Add all four sides, or use 2×(length+width).",`2×(${fenceW}+${fenceH})=${2*(fenceW+fenceH)} m.`),
    ];
  }
  const p1=r(40,90),p2=r(20,160-p1),p3=180-p1-p2;
  return [
    sq("s8-u8-r1","Classify a missing triangle angle",difficulty,`A triangle has angles ${p1}° and ${p2}°. Is the third angle acute, right or obtuse?`,p3<90?"acute":p3===90?"right":"obtuse","Find the third angle first, then classify it.",`180−${p1}−${p2}=${p3}°, which is ${p3<90?"acute":p3===90?"right":"obtuse"}.`),
    sq("s8-u8-r2","Name a shape from its properties",difficulty,"A shape has 4 equal sides and 4 right angles. What is the mathematical name for this shape?","square","Think about which quadrilateral has both equal sides and right angles.","This describes a square."),
    sq("s8-u8-r3","Name a quadrilateral from its properties",difficulty,"A quadrilateral has exactly one pair of parallel sides and no right angles. What is it called?",["trapezium","trapezoid"],"Recall which quadrilateral has only one pair of parallel sides.","This describes a trapezium."),
    sq("s8-u8-r4","Evaluate a geometric statement",difficulty,"A learner says a rhombus is always a square. Is this statement true or false?","false","Think about whether a rhombus must have right angles.","False — a rhombus only needs equal sides, not right angles."),
    sq("s8-u8-r5","Reason backward from an angle sum",difficulty,"The interior angles of a polygon sum to 900°. How many sides does it have?","7","Use (n−2)×180=900 and solve for n.","900÷180=5, so n−2=5, meaning n=7."),
    sq("s8-u8-r6","Solve a two-step angle problem",difficulty,"Two angles are supplementary. One is three times the other. Find the smaller angle.","45","Let the smaller angle be x; then x+3x=180.","4x=180, so x=45°."),
  ];
};

const structuredSequences = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const start=r(2,9),d=r(3,7),terms=[start,start+d,start+2*d,start+3*d];
    const mCoef=r(2,6),cConst=r(1,8),nthN=r(6,15);
    const ntermA=r(2,7),ntermB=r(1,9);
    const ratio=r(2,3),gStart=r(1,4);
    const fx_m=r(2,6),fx_c=r(1,8),fx_x=r(2,9);
    const ruleSub=r(2,6),ruleStart=r(30,60);
    return [
      sq("s8-u9-f1","Find the next term in a linear sequence",difficulty,`Find the next term: ${terms.join(", ")}, ...`,String(start+4*d),"Find the constant difference between terms.",`Add ${d}, giving ${start+4*d}.`),
      sq("s8-u9-f2","Evaluate the nth term of a sequence",difficulty,`Find the ${nthN}th term of the sequence with nth term ${mCoef}n + ${cConst}.`,String(mCoef*nthN+cConst),"Substitute the term number for n.",`${mCoef}(${nthN})+${cConst}=${mCoef*nthN+cConst}.`),
      sq("s8-u9-f3","Write the nth term of a sequence",difficulty,`Write the nth term of the sequence ${ntermA+ntermB}, ${ntermA*2+ntermB}, ${ntermA*3+ntermB}, ${ntermA*4+ntermB}, ...`,[`${ntermA}n+${ntermB}`,`${ntermB}+${ntermA}n`],"The common difference is the coefficient of n.",`The difference is ${ntermA}, and the nth term is ${ntermA}n+${ntermB}.`),
      sq("s8-u9-f4","Find a term in a geometric sequence",difficulty,`A sequence starts at ${gStart} and each term is multiplied by ${ratio} to get the next. Find the 4th term.`,String(gStart*ratio**3),"Multiply by the ratio three times from the first term.",`${gStart}×${ratio}×${ratio}×${ratio}=${gStart*ratio**3}.`),
      sq("s8-u9-f5","Evaluate a linear function",difficulty,`For f(x) = ${fx_m}x − ${fx_c}, find f(${fx_x}).`,String(fx_m*fx_x-fx_c),"Substitute the given value for x.",`${fx_m}(${fx_x})−${fx_c}=${fx_m*fx_x-fx_c}.`),
      sq("s8-u9-f6","Apply a term-to-term rule",difficulty,`The term-to-term rule is subtract ${ruleSub}. The first term is ${ruleStart}. Find the third term.`,String(ruleStart-2*ruleSub),"Apply the rule twice from the first term.",`${ruleStart}−${ruleSub}−${ruleSub}=${ruleStart-2*ruleSub}.`),
    ];
  }
  if (difficulty === "application") {
    const rentBase=r(200,500),rentInc=r(20,60),yearN=r(3,8);
    const savingsStart=r(50,200),savingsAdd=r(10,50),weekN=r(4,10);
    const seatsRow1=r(10,20),seatsInc=r(2,6),rowN=r(5,12);
    const priceStart=r(10,20),priceGrow=r(2,3);
    const tempStart=r(-5,5),tempChange=r(2,5),dayN=r(3,7);
    const clubStart=r(15,40),clubJoin=r(3,10),monthN=r(3,8);
    return [
      sq("s8-u9-a1","Apply a linear sequence to rent",difficulty,`Annual rent starts at R${rentBase} and increases by R${rentInc} each year. Find the rent in year ${yearN}.`,String(rentBase+(yearN-1)*rentInc),"The first year needs no increase; each year after adds one increase.",`R${rentBase}+${yearN-1}×R${rentInc}=R${rentBase+(yearN-1)*rentInc}.`),
      sq("s8-u9-a2","Apply a linear sequence to savings",difficulty,`A savings account starts with R${savingsStart} and R${savingsAdd} is added each week. Find the balance after ${weekN} weeks.`,String(savingsStart+weekN*savingsAdd),"Multiply the weekly amount by the number of weeks, then add the start.",`R${savingsStart}+${weekN}×R${savingsAdd}=R${savingsStart+weekN*savingsAdd}.`),
      sq("s8-u9-a3","Apply a linear sequence to seating",difficulty,`A theatre's front row has ${seatsRow1} seats. Each row behind has ${seatsInc} more seats than the row in front. Find the number of seats in row ${rowN}.`,String(seatsRow1+(rowN-1)*seatsInc),"Row 1 needs no increase; each row after adds one increase.",`${seatsRow1}+${rowN-1}×${seatsInc}=${seatsRow1+(rowN-1)*seatsInc}.`),
      sq("s8-u9-a4","Apply a geometric sequence in context",difficulty,`A car's resale value is modelled as a geometric sequence: R${priceStart} thousand initially, multiplied by ${priceGrow} at each stage. Find the value at stage 3 (in thousands of rand).`,String(priceStart*priceGrow**2),"Multiply by the growth factor twice from the initial value.",`R${priceStart}×${priceGrow}×${priceGrow}=R${priceStart*priceGrow**2} thousand.`),
      sq("s8-u9-a5","Apply a linear sequence to temperature",difficulty,`The temperature is ${tempStart}°C and rises by ${tempChange}°C each hour. Find the temperature after ${dayN} hours.`,String(tempStart+dayN*tempChange),"Multiply the hourly rise by the number of hours, then add the start.",`${tempStart}+${dayN}×${tempChange}=${tempStart+dayN*tempChange}°C.`),
      sq("s8-u9-a6","Apply a linear sequence to membership growth",difficulty,`A club has ${clubStart} members. ${clubJoin} new members join each month. Find the number of members after ${monthN} months.`,String(clubStart+monthN*clubJoin),"Multiply the monthly joiners by the number of months, then add the start.",`${clubStart}+${monthN}×${clubJoin}=${clubStart+monthN*clubJoin}.`),
    ];
  }
  const mCoef=r(3,7),cConst=r(1,9),target=mCoef*r(8,20)+cConst;
  const a1=r(3,10),d1=r(2,6);
  return [
    sq("s8-u9-r1","Test membership in a sequence",difficulty,`Is ${target} a term of the sequence with nth term ${mCoef}n + ${cConst}? Answer yes or no.`,"yes","Solve for n and check it's a positive whole number.",`n=${(target-cConst)/mCoef}, a whole number, so yes.`),
    sq("s8-u9-r2","Test non-membership in a sequence",difficulty,`Is ${target+1} a term of the sequence with nth term ${mCoef}n + ${cConst}? Answer yes or no.`,"no","Solve for n and check whether it's a whole number.","Solving for n gives a non-whole number, so no."),
    sq("s8-u9-r3","Correct a substitution error",difficulty,"A sequence has nth term 5n − 3. A learner says the 100th term is 500. Enter the correct 100th term.","497","Substitute n=100 into the formula.","5(100)−3=497."),
    sq("s8-u9-r4","Evaluate a quadratic sequence term",difficulty,"The nth term of a sequence is 2n² + 1. Find the 4th term.","33","Substitute n=4 and remember to square first.","2(4²)+1=2(16)+1=33."),
    sq("s8-u9-r5","Reason about an increasing sequence",difficulty,`A sequence begins ${a1}, ${a1+d1}, ${a1+2*d1}, ... and increases forever. Will it ever contain a negative number? Answer yes or no.`,"no","Think about what happens to the terms as the sequence continues.","Since the sequence only increases from a positive start, it never becomes negative."),
    sq("s8-u9-r6","Solve for where two sequences meet",difficulty,"Two sequences have nth terms 3n + 1 and 2n + 5. Find the value of n where they are equal.","4","Set the two expressions equal and solve for n.","3n+1=2n+5 gives n=4."),
  ];
};

const PCT_OPTIONS = [{p:5,m:20},{p:10,m:10},{p:15,m:20},{p:20,m:5},{p:25,m:4},{p:50,m:2},{p:75,m:4}];
const structuredPercentages = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const o1=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],base1=o1.m*r(2,15),val1=base1*o1.p/100;
    const o2=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],base2=o2.m*r(2,15),inc2=base2*o2.p/100,result2=base2+inc2;
    const o3=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],base3=o3.m*r(2,15),dec3=base3*o3.p/100,result3=base3-dec3;
    const o4=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],base4=o4.m*r(2,15),part4=base4*o4.p/100;
    const o5=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],base5=o5.m*r(2,15),newVal5=base5+base5*o5.p/100;
    const o6=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],orig6=o6.m*r(2,15),final6=orig6-orig6*o6.p/100;
    return [
      sq("s8-u10-f1","Find a percentage of an amount",difficulty,`Find ${o1.p}% of ${base1}.`,String(val1),"Find 10% or 1% first, then scale up.",`${o1.p}% of ${base1}=${val1}.`),
      sq("s8-u10-f2","Increase by a percentage",difficulty,`Increase ${base2} by ${o2.p}%.`,String(result2),"Find the increase, then add it to the original.",`${base2}+${o2.p}% of ${base2}=${result2}.`),
      sq("s8-u10-f3","Decrease by a percentage",difficulty,`Decrease ${base3} by ${o3.p}%.`,String(result3),"Find the decrease, then subtract it from the original.",`${base3}−${o3.p}% of ${base3}=${result3}.`),
      sq("s8-u10-f4","Express one quantity as a percentage of another",difficulty,`Express ${part4} as a percentage of ${base4}.`,[String(o4.p),`${o4.p}%`],"Divide, then multiply by 100.",`${part4}÷${base4}×100=${o4.p}%.`),
      sq("s8-u10-f5","Apply a percentage increase",difficulty,`A quantity of ${base5} increases by ${o5.p}%. Find the new value.`,String(newVal5),"Add the percentage increase to the original.",`${base5}+${o5.p}% of ${base5}=${newVal5}.`),
      sq("s8-u10-f6","Reverse a percentage decrease",difficulty,`After a ${o6.p}% decrease, a value is ${final6}. Find the original value.`,String(orig6),"The final value represents (100−p)% of the original.",`${final6}÷${(100-o6.p)/100}=${orig6}.`),
    ];
  }
  if (difficulty === "application") {
    const o1=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],price1=o1.m*r(3,20),newPrice1=price1+price1*o1.p/100;
    const o2=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],price2=o2.m*r(3,20),discounted2=price2-price2*o2.p/100;
    const vatBase=[4,25][r(0,1)]===4?{p:25,m:4}:{p:15,m:20},price3=vatBase.m*r(3,20),withVat3=price3+price3*vatBase.p/100;
    const o4=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],bill4=o4.m*r(3,20),tip4=bill4*o4.p/100;
    const popBase=[4,5,20][r(0,2)],o5=PCT_OPTIONS.find(x=>x.m===popBase)||PCT_OPTIONS[3],pop5=o5.m*r(10,60),growth5=pop5+pop5*o5.p/100;
    const score6=r(30,95);
    return [
      sq("s8-u10-a1","Apply a percentage price increase",difficulty,`A shop increases the price of an item from R${price1} by ${o1.p}%. Find the new price.`,String(newPrice1),"Add the percentage increase to the price.",`R${price1}+${o1.p}%=R${newPrice1}.`),
      sq("s8-u10-a2","Apply a percentage discount",difficulty,`An item priced R${price2} is discounted by ${o2.p}%. Find the sale price.`,String(discounted2),"Subtract the percentage discount from the price.",`R${price2}−${o2.p}%=R${discounted2}.`),
      sq("s8-u10-a3","Apply VAT",difficulty,`A service costs R${price3} before VAT. VAT is charged at ${vatBase.p}%. Find the total cost including VAT.`,String(withVat3),"Add the VAT amount to the original price.",`R${price3}+${vatBase.p}%=R${withVat3}.`),
      sq("s8-u10-a4","Calculate a tip",difficulty,`A restaurant bill is R${bill4}. Find a ${o4.p}% tip.`,String(tip4),"Find the given percentage of the bill.",`${o4.p}% of R${bill4}=R${tip4}.`),
      sq("s8-u10-a5","Apply percentage population growth",difficulty,`A town's population of ${pop5} grows by ${o5.p}%. Find the new population.`,String(growth5),"Add the percentage growth to the original population.",`${pop5}+${o5.p}%=${growth5}.`),
      sq("s8-u10-a6","Find a percentage test score",difficulty,`A student scores ${score6} out of 100 on a test. Find their percentage score.`,String(score6),"A score out of 100 is already a percentage.",`${score6}/100=${score6}%.`),
    ];
  }
  const o1=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],orig1=o1.m*r(3,20),final1=orig1*(100+o1.p)/100;
  const afterInc2=30*r(2,10),origX2=afterInc2*5/6,afterDec2=afterInc2*4/5;
  const X3=100*r(2,10),priceA3=X3*4/5,priceB3=X3*81/100;
  const orig4=100*r(1,5),final4=orig4*11/10,wrongGuess4=final4*9/10;
  const o5=PCT_OPTIONS[r(0,PCT_OPTIONS.length-1)],totalA5=o5.m*r(2,8),scoreA5=totalA5*o5.p/100,totalB5=o5.m*r(2,8),scoreB5=totalB5*o5.p/100;
  return [
    sq("s8-u10-r1","Reverse a percentage increase",difficulty,`After a ${o1.p}% increase, an item costs R${final1}. Find the original price.`,String(orig1),"Divide by (100+p)% expressed as a decimal.",`R${final1}÷${(100+o1.p)/100}=R${orig1}.`),
    sq("s8-u10-r2","Reason about successive percentage changes",difficulty,`A price of R${origX2} increases by 20%, then the new price decreases by 20%. Find the final price.`,String(afterDec2),"Apply each percentage change in turn to the running total.",`R${origX2}→R${afterInc2}→R${afterDec2}.`),
    sq("s8-u10-r3","Compare successive vs single percentage changes",difficulty,`Shop A discounts R${X3} by 20% in one step. Shop B applies two 10% discounts in a row. Which shop gives the cheaper final price, A or B?`,["a","shopa","shop a"],"Work out both final prices and compare.",`Shop A: R${priceA3}. Shop B: R${priceB3}. Shop A is cheaper.`),
    sq("s8-u10-r4","Correct a reverse-percentage error",difficulty,`A price of R${orig4} increases by 10% to R${final4}. A learner then says the original price must be R${wrongGuess4} (by decreasing the new price by 10%). Enter the actual original price.`,String(orig4),"Reversing a percentage increase is not the same as applying the opposite decrease.",`R${final4}÷1.1=R${orig4}, not R${wrongGuess4}.`),
    sq("s8-u10-r5","Reason about equivalent percentages",difficulty,`A student scores ${scoreA5} out of ${totalA5} on one test. On another test worth ${totalB5} marks, they score the same percentage. How many marks did they score?`,String(scoreB5),"Find the percentage from the first test, then apply it to the second total.",`${scoreA5}/${totalA5}=${o5.p}%; ${o5.p}% of ${totalB5}=${scoreB5}.`),
    sq("s8-u10-r6","Reason about combined percentage change",difficulty,"A price increases by 50% then is halved. Is the final price higher than, lower than, or equal to the original?",["lower","lower than"],"Apply each change to a sample value and compare to the start.","Increasing by 50% then halving gives 75% of the original — lower."),
  ];
};

const structuredGraphs = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const x1=r(-8,8),y1=r(-8,8);
    const gradSlope2=r(-3,3)||1,x2a=r(-5,5),y2a=r(-5,5),deltaX2=r(1,6),x2b=x2a+deltaX2,y2b=y2a+gradSlope2*deltaX2;
    const mCoef=r(2,6),cConst=r(-8,8),xVal=r(2,8);
    const cLine=r(-10,10);
    const x5=r(-6,6),y5=r(-6,6);
    const mCoef6=r(2,5),cConst6=r(1,8),xTest6=r(2,7),yTest6=mCoef6*xTest6+cConst6;
    return [
      sq("s8-u11-f1","Read a coordinate",difficulty,`A point has coordinates (${x1}, ${y1}). What is its x-coordinate?`,String(x1),"The x-coordinate is written first.",`The x-coordinate is ${x1}.`),
      sq("s8-u11-f2","Find the gradient between two points",difficulty,`Find the gradient between (${x2a},${y2a}) and (${x2b},${y2b}).`,String(gradSlope2),"Divide the change in y by the change in x.",`(${y2b}−${y2a})÷(${x2b}−${x2a})=${gradSlope2}.`),
      sq("s8-u11-f3","Evaluate a linear equation",difficulty,`For y=${mCoef}x${cConst>=0?'+':''}${cConst}, find y when x=${xVal}.`,String(mCoef*xVal+cConst),"Substitute the given x value.",`${mCoef}(${xVal})${cConst>=0?'+':''}${cConst}=${mCoef*xVal+cConst}.`),
      sq("s8-u11-f4","Find the y-intercept",difficulty,`What is the y-intercept of y=${mCoef}x${cLine>=0?'+':''}${cLine}?`,String(cLine),"Compare with y=mx+c.",`c=${cLine}, so the y-intercept is ${cLine}.`),
      sq("s8-u11-f5","Identify the gradient of a horizontal line",difficulty,`A horizontal line passes through (${x5},${y5}). What is its gradient?`,"0","A horizontal line has no vertical change.","Rise=0, so gradient=0."),
      sq("s8-u11-f6","Check if a point lies on a line",difficulty,`Does the point (${xTest6},${yTest6}) lie on y=${mCoef6}x+${cConst6}?`,["yes","y"],"Substitute the x-coordinate and check the result.",`${mCoef6}(${xTest6})+${cConst6}=${yTest6}, so yes.`),
    ];
  }
  if (difficulty === "application") {
    const rate1=r(2,8),fixed1=r(5,30),hours1=r(2,10);
    const rate2=r(3,10),fixed2=r(10,50),targetY2=fixed2+rate2*r(2,8);
    const gradSpeed3=r(2,15),x3a=r(0,5),deltaX3=r(2,8),x3b=x3a+deltaX3,y3a=r(10,50),y3b=y3a+gradSpeed3*deltaX3;
    const speed4=r(40,120),time4=r(1,6);
    const startTemp5=r(-5,15),coolRate5=r(1,4),timeH5=r(1,8);
    const conv6=r(2,5),dist6=r(3,12);
    return [
      sq("s8-u11-a1","Apply a linear cost model",difficulty,`A taxi charges a fixed R${fixed1} plus R${rate1} per hour. Find the cost for ${hours1} hours.`,String(fixed1+rate1*hours1),"Multiply the rate by the hours, then add the fixed charge.",`R${fixed1}+${hours1}×R${rate1}=R${fixed1+rate1*hours1}.`),
      sq("s8-u11-a2","Reverse a linear cost model",difficulty,`A phone plan costs R${fixed2} plus R${rate2} per GB used. If the bill is R${targetY2}, how many GB were used?`,String((targetY2-fixed2)/rate2),"Subtract the fixed charge, then divide by the rate.",`(R${targetY2}−R${fixed2})÷R${rate2}=${(targetY2-fixed2)/rate2} GB.`),
      sq("s8-u11-a3","Find speed from a distance-time graph",difficulty,`A graph shows distance (km) over time (hours). At (${x3a},${y3a}) and (${x3b},${y3b}), find the gradient (in km/h).`,String(gradSpeed3),"Divide the change in distance by the change in time.",`(${y3b}−${y3a})÷(${x3b}−${x3a})=${gradSpeed3} km/h.`),
      sq("s8-u11-a4","Apply constant speed",difficulty,`A car travels at a constant ${speed4} km/h for ${time4} hours. Find the distance travelled.`,String(speed4*time4),"Multiply speed by time.",`${speed4}×${time4}=${speed4*time4} km.`),
      sq("s8-u11-a5","Apply a linear cooling model",difficulty,`A drink starts at ${startTemp5}°C and cools by ${coolRate5}°C per hour. Find its temperature after ${timeH5} hours.`,String(startTemp5-coolRate5*timeH5),"Multiply the cooling rate by the hours, then subtract from the start.",`${startTemp5}−${timeH5}×${coolRate5}=${startTemp5-coolRate5*timeH5}°C.`),
      sq("s8-u11-a6","Find speed from a graph through the origin",difficulty,`A distance-time graph has a straight line through the origin. After ${dist6} hours, the distance is ${dist6*conv6} km. Find the speed in km/h.`,String(conv6),"Divide distance by time.",`${dist6*conv6}÷${dist6}=${conv6} km/h.`),
    ];
  }
  const m1=r(2,6),pt1x=r(2,8),pt1y=m1*pt1x+r(1,9),c1=pt1y-m1*pt1x;
  const x2a=r(1,4),y2a=r(1,10),y2b=y2a+r(2,8);
  return [
    sq("s8-u11-r1","Find the y-intercept from a gradient and point",difficulty,`A line has gradient ${m1} and passes through (${pt1x},${pt1y}). Find its y-intercept.`,String(c1),"Substitute the point into y=mx+c and solve for c.",`${pt1y}=${m1}(${pt1x})+c, so c=${c1}.`),
    sq("s8-u11-r2","Reason about a vertical line's gradient",difficulty,`Two points (${x2a},${y2a}) and (${x2a},${y2b}) have the same x-coordinate. What is the gradient of the line through them?`,["undefined","infinite"],"The change in x is zero, and division by zero is undefined.","The gradient is undefined, since the line is vertical."),
    sq("s8-u11-r3","Reason about gradient magnitude",difficulty,"Line A passes through (2,7) and (15,33). A learner claims a steeper-looking line always has a larger gradient than a flatter one. Is this generally true? Answer yes or no.","yes","Compare the magnitude of the gradients directly.","Yes — a steeper line always has a gradient of greater magnitude."),
    sq("s8-u11-r4","Find a parallel line's equation",difficulty,"A line has equation y=4x-3. A parallel line passes through (0,5). Write the equation of the parallel line.",["y=4x+5","4x+5"],"Parallel lines share the same gradient.","The new line has gradient 4 and y-intercept 5: y=4x+5."),
    sq("s8-u11-r5","Reason about parallel lines",difficulty,"Two lines y=2x+1 and y=2x-3 are drawn. Will they ever intersect? Answer yes or no.","no","Compare the gradients of the two lines.","No — parallel lines with different intercepts never meet."),
    sq("s8-u11-r6","Write the equation of a horizontal line",difficulty,"A line has gradient 0 and passes through (3,7). Write its equation.",["y=7"],"A gradient of 0 means y never changes.","The line is y=7."),
  ];
};

const structuredRatio = (difficulty:"foundational"|"application"|"reasoning") => {
  const gcdR=(a:number,b:number):number=>b===0?a:gcdR(b,a%b);
  if (difficulty === "foundational") {
    let aPart=r(2,6),bPart=r(2,6); while(gcdR(aPart,bPart)!==1){aPart=r(2,6);bPart=r(2,6);}
    const mult=r(2,7),a1=aPart*mult,b1=bPart*mult;
    const totalParts2=r(3,10),share2=r(2,5),total2=totalParts2*r(4,20),larger2=(total2/totalParts2)*(totalParts2-share2>share2?totalParts2-share2:share2);
    const unitQty3=r(2,6),unitCost3=r(5,20),newQty3=r(2,10);
    const cm4=[2,4,5,8,10][r(0,4)],kmResult4=r(1,20),scale4=(kmResult4*100000)/cm4;
    const ratioK5=r(2,6),xVal5=r(2,10);
    const msVal6=5*r(1,6),kmh6=msVal6*3.6;
    return [
      sq("s8-u12-f1","Simplify a ratio",difficulty,`Simplify the ratio ${a1}:${b1}.`,`${aPart}:${bPart}`,"Divide both parts by their highest common factor.",`${a1}:${b1} simplifies to ${aPart}:${bPart}.`),
      sq("s8-u12-f2","Share an amount in a ratio",difficulty,`Share ${total2} in the ratio ${share2}:${totalParts2-share2}. Give the larger share.`,String(larger2),"Divide by the total number of parts, then multiply by the larger share.",`${total2}÷${totalParts2}×${totalParts2-share2>share2?totalParts2-share2:share2}=${larger2}.`),
      sq("s8-u12-f3","Scale a quantity using a unit rate",difficulty,`If ${unitQty3} items cost R${unitQty3*unitCost3}, find the cost of ${newQty3} items.`,String(newQty3*unitCost3),"Find the cost of one item first.",`R${unitQty3*unitCost3}÷${unitQty3}×${newQty3}=R${newQty3*unitCost3}.`),
      sq("s8-u12-f4","Use a map scale",difficulty,`A map scale is 1:${scale4}. What real distance in km is represented by ${cm4} cm?`,String(kmResult4),"Multiply by the scale factor, then convert to km.",`${cm4}×${scale4}÷100000=${kmResult4} km.`),
      sq("s8-u12-f5","Apply direct proportion",difficulty,`y is directly proportional to x. If y=${ratioK5*3} when x=3, find y when x=${xVal5}.`,String(ratioK5*xVal5),"Find the constant of proportionality first.",`k=${ratioK5}, so y=${ratioK5}×${xVal5}=${ratioK5*xVal5}.`),
      sq("s8-u12-f6","Convert units of speed",difficulty,`Convert ${kmh6} km/h to m/s.`,String(msVal6),"Divide by 3.6.",`${kmh6}÷3.6=${msVal6} m/s.`),
    ];
  }
  if (difficulty === "application") {
    const paintBlue=r(2,5),paintWhite=r(2,5),totalPaint=r(3,10)*(paintBlue+paintWhite),bluePart=totalPaint*paintBlue/(paintBlue+paintWhite);
    const recipeA=r(2,4),recipeB=r(3,6),scaleFactor=r(2,5);
    const speed2=r(40,100),time2h=r(1,6);
    const examP=r(2,5),examQ=r(3,7),examTotal=r(2,8)*(examP+examQ),largerExam=examTotal*(examP>examQ?examP:examQ)/(examP+examQ);
    const modelScale=r(20,100),realLen=r(2,15);
    const costUnit=r(3,15),qty=r(2,10);
    return [
      sq("s8-u12-a1","Find a part of a mixture ratio",difficulty,`Paint is mixed in the ratio ${paintBlue}:${paintWhite} (blue:white). For ${totalPaint} litres total, how many litres are blue?`,String(bluePart),"Divide by the total parts, then multiply by the blue part.",`${totalPaint}÷${paintBlue+paintWhite}×${paintBlue}=${bluePart} litres.`),
      sq("s8-u12-a2","Scale a recipe ratio",difficulty,`A recipe uses flour and sugar in the ratio ${recipeA}:${recipeB}. If the recipe is scaled up by a factor of ${scaleFactor}, find the new amount of flour (in the original units).`,String(recipeA*scaleFactor),"Multiply the original amount by the scale factor.",`${recipeA}×${scaleFactor}=${recipeA*scaleFactor}.`),
      sq("s8-u12-a3","Apply constant speed",difficulty,`A car travels at ${speed2} km/h for ${time2h} hours. Find the distance travelled.`,String(speed2*time2h),"Multiply speed by time.",`${speed2}×${time2h}=${speed2*time2h} km.`),
      sq("s8-u12-a4","Find the larger share in a ratio",difficulty,`In an exam, the ratio of pass to fail is ${examP}:${examQ}, out of ${examTotal} students total. Find the number in the larger group.`,String(largerExam),"Divide by the total parts, then multiply by the larger part.",`${examTotal}÷${examP+examQ}×${examP>examQ?examP:examQ}=${largerExam}.`),
      sq("s8-u12-a5","Use a model scale",difficulty,`A model is built at a scale of 1:${modelScale}. Find the model length (in cm) for a real length of ${realLen*modelScale} cm.`,String(realLen),"Divide the real length by the scale factor.",`${realLen*modelScale}÷${modelScale}=${realLen} cm.`),
      sq("s8-u12-a6","Find a unit cost",difficulty,`If ${qty} items cost R${qty*costUnit}, find the cost of 1 item.`,String(costUnit),"Divide the total cost by the number of items.",`R${qty*costUnit}÷${qty}=R${costUnit}.`),
    ];
  }
  const totalR1=(()=>{const dR=[3,4,5,6][r(0,3)];return dR*r(3,15);})(),partsA1=r(2,5),partsB1=r(2,5);
  const kR2=r(2,6),xR2=r(2,8),yR2=kR2*xR2;
  return [
    sq("s8-u12-r1","Find the smaller share in a ratio",difficulty,`A total of ${totalR1} is shared in the ratio ${partsA1}:${partsB1}. Find the smaller share.`,String(Math.min(totalR1*partsA1/(partsA1+partsB1),totalR1*partsB1/(partsA1+partsB1))),"Find both shares, then pick the smaller.",`Divide by the total parts, multiply by each part, and compare.`),
    sq("s8-u12-r2","Reason about doubling in direct proportion",difficulty,`y is directly proportional to x. When x=${xR2}, y=${yR2}. Find y when x is doubled.`,String(yR2*2),"In direct proportion, doubling x doubles y.",`Doubling x doubles y: ${yR2}×2=${yR2*2}.`),
    sq("s8-u12-r3","Evaluate a ratio claim",difficulty,"A recipe ratio of flour to butter is 3:1. A learner uses 12 cups of flour and 3 cups of butter. Is this in the correct ratio? Answer yes or no.","no","Simplify the learner's amounts to a ratio and compare.","12:3 simplifies to 4:1, not 3:1, so no."),
    sq("s8-u12-r4","Solve for a share given a ratio and a sum",difficulty,"Two numbers are in the ratio 2:3. Their sum is 45. Find the larger number.","27","Divide the sum by the total parts, then multiply by the larger part.","45÷5×3=27."),
    sq("s8-u12-r5","Scale a rate proportionally",difficulty,"A car uses 8 litres of fuel to travel 100 km. At the same rate, how many litres are needed for 250 km?","20","Find the fuel used per km, then scale up.","8÷100×250=20 litres."),
    sq("s8-u12-r6","Convert a map scale to real distance",difficulty,"A map has scale 1:25000. Two towns are 20 cm apart on the map. Find the real distance in km.","5","Multiply by the scale factor, then convert to km.","20×25000÷100000=5 km."),
  ];
};

const structuredProbability = (difficulty:"foundational"|"application"|"reasoning") => {
  const gcdP=(a:number,b:number):number=>b===0?a:gcdP(b,a%b);
  const fracP=(n:number,d:number)=>{const g=gcdP(Math.abs(n),d)||1;return{n:n/g,d:d/g};};
  const fstrP=(f:{n:number,d:number})=>f.d===1?String(f.n):`${f.n}/${f.d}`;
  const fdecP=(f:{n:number,d:number})=>Number((f.n/f.d).toFixed(10)).toString();
  if (difficulty === "foundational") {
    const redN=r(1,8),totalN=r(redN+2,15),pRed=fracP(redN,totalN);
    const pRain=r(5,85)/100,pNoRain=Math.round((100-pRain*100))/100;
    const trials6=r(2,20)*10,freq6=r(1,trials6-1),pExp6=fracP(freq6,trials6);
    return [
      sq("s8-u13-f1","Find a basic probability",difficulty,"A fair die is rolled. Find the probability of rolling a 6.",["1/6","0.1666666667"],"There is one favourable outcome out of six.","P(6)=1/6."),
      sq("s8-u13-f2","Find probability from a ratio of outcomes",difficulty,`A bag has ${redN} red and ${totalN-redN} blue counters. Find P(red).`,[fstrP(pRed),fdecP(pRed)],"Divide favourable outcomes by total outcomes.",`${redN}÷${totalN}=${fstrP(pRed)}.`),
      sq("s8-u13-f3","Find a complementary probability",difficulty,`If P(rain)=${pRain.toFixed(2)}, find P(no rain).`,pNoRain.toFixed(2),"Complementary probabilities sum to 1.",`1−${pRain.toFixed(2)}=${pNoRain.toFixed(2)}.`),
      sq("s8-u13-f4","Find the probability of a combined event",difficulty,"Two fair coins are tossed. Find P(two heads).",["1/4","0.25"],"List all outcomes: HH, HT, TH, TT.","Only HH works, so P=1/4."),
      sq("s8-u13-f5","Recall the probability scale",difficulty,"A certain event has what probability?","1","Use the probability scale from impossible to certain.","A certain event has probability 1."),
      sq("s8-u13-f6","Find experimental probability",difficulty,`In ${trials6} trials, an event occurs ${freq6} times. Find its experimental probability.`,[fstrP(pExp6),fdecP(pExp6)],"Divide the frequency by the number of trials.",`${freq6}÷${trials6}=${fstrP(pExp6)}.`),
    ];
  }
  if (difficulty === "application") {
    const spinnerSections=r(4,8),redSections=r(1,spinnerSections-1),pSpin=fracP(redSections,spinnerSections);
    const heartN=13,deckN=52,pHeart=fracP(heartN,deckN);
    const pFrac4=fracP(r(1,5),[4,5,10][r(0,2)]),trialsA4=pFrac4.d*r(4,20),expectedA4=trialsA4*pFrac4.n/pFrac4.d;
    const totalA5=r(2,9),failA5=r(1,totalA5-1),pFailA5=fracP(failA5,totalA5),pPassA5=fracP(totalA5-failA5,totalA5);
    const tableTotalA6=r(2,20)*10,tableFreqA6=r(1,tableTotalA6-1),pTableA6=fracP(tableFreqA6,tableTotalA6);
    return [
      sq("s8-u13-a1","Find probability on a spinner",difficulty,`A spinner has ${spinnerSections} equal sections, ${redSections} of which are red. Find the probability of landing on red.`,[fstrP(pSpin),fdecP(pSpin)],"Divide the red sections by the total sections.",`${redSections}÷${spinnerSections}=${fstrP(pSpin)}.`),
      sq("s8-u13-a2","Find probability from a deck of cards",difficulty,"A card is drawn from a standard 52-card deck. Find the probability it is a heart.",[fstrP(pHeart),fdecP(pHeart)],"A deck has 13 hearts out of 52 cards.",`13÷52=${fstrP(pHeart)}.`),
      sq("s8-u13-a3","Find an expected frequency",difficulty,`The probability of winning a game is ${fstrP(pFrac4)}. In ${trialsA4} games, how many wins would you expect?`,String(expectedA4),"Multiply the probability by the number of trials.",`${fstrP(pFrac4)}×${trialsA4}=${expectedA4}.`),
      sq("s8-u13-a4","Find a complementary probability in context",difficulty,`The probability a bus is late is ${fstrP(pFailA5)}. Find the probability it is on time.`,[fstrP(pPassA5),fdecP(pPassA5)],"Subtract from 1.",`1−${fstrP(pFailA5)}=${fstrP(pPassA5)}.`),
      sq("s8-u13-a5","Find experimental probability from a survey",difficulty,`A survey of ${tableTotalA6} people found ${tableFreqA6} preferred tea. Find the experimental probability a person prefers tea.`,[fstrP(pTableA6),fdecP(pTableA6)],"Divide the frequency by the sample size.",`${tableFreqA6}÷${tableTotalA6}=${fstrP(pTableA6)}.`),
      sq("s8-u13-a6","Convert a percentage to a probability fraction",difficulty,"A weather forecast gives a 30% chance of rain. Express this as a fraction in simplest form.",["3/10","0.3"],"Write the percentage over 100, then simplify.","30/100 simplifies to 3/10."),
    ];
  }
  const pA=fracP(r(1,3),[2,3,4][r(0,2)]),pB=fracP(r(1,3),[2,3,4][r(0,2)]),pBoth=fracP(pA.n*pB.n,pA.d*pB.d);
  return [
    sq("s8-u13-r1","Combine independent probabilities",difficulty,`Two independent events have probabilities ${fstrP(pA)} and ${fstrP(pB)}. Find the probability both occur.`,[fstrP(pBoth),fdecP(pBoth)],"Multiply the two probabilities together.",`${fstrP(pA)}×${fstrP(pB)}=${fstrP(pBoth)}.`),
    sq("s8-u13-r2","Correct a probability-sum error",difficulty,"A learner says the probabilities of an event's outcomes sum to 150%. Explain why this must be wrong, then enter the correct total probability (as a decimal).","1","All possible outcomes' probabilities must sum to exactly 1.","Probabilities always total 1 (100%), never more."),
    sq("s8-u13-r3","Find the probability neither event occurs",difficulty,"An event has probability 0.7. Another mutually exclusive event has probability 0.2. Find the probability that neither occurs.","0.1","Subtract both probabilities from 1.","1−0.7−0.2=0.1."),
    sq("s8-u13-r4","Evaluate a probability claim",difficulty,"A bag has more red counters than blue. A learner says P(blue) > P(red). Is this correct? Answer yes or no.","no","More red counters means a higher probability of drawing red.","No — more red counters means P(red) is higher."),
    sq("s8-u13-r5","Simplify an experimental probability",difficulty,"An event occurred 18 times out of 60 trials. Find its experimental probability in simplest fraction form.",["3/10","0.3"],"Write as a fraction, then simplify.","18/60 simplifies to 3/10."),
    sq("s8-u13-r6","Combine mutually exclusive probabilities",difficulty,"P(rain)=0.4 and P(snow)=0.15 are mutually exclusive. Find P(rain or snow).","0.55","Add the probabilities of mutually exclusive events.","0.4+0.15=0.55."),
  ];
};

const structuredTransformations = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const px1=r(-8,8),py1=r(-8,8),vx1=r(-6,6),vy1=r(-6,6);
    const px2=r(-8,8),py2=r(-8,8);
    const px3=r(-8,8),py3=r(-8,8);
    const px4=r(-6,6),py4=r(-6,6);
    const scale5=r(2,5),side5=r(2,10);
    return [
      sq("s8-u14-f1","Apply a translation",difficulty,`Translate (${px1},${py1}) by the vector (${vx1},${vy1}). Give the new coordinate.`,[`(${px1+vx1},${py1+vy1})`,`${px1+vx1},${py1+vy1}`],"Add corresponding coordinates.",`(${px1}+${vx1},${py1}+${vy1})=(${px1+vx1},${py1+vy1}).`),
      sq("s8-u14-f2","Reflect in the x-axis",difficulty,`Reflect (${px2},${py2}) in the x-axis.`,[`(${px2},${-py2})`,`${px2},${-py2}`],"The x-coordinate stays; the y-sign changes.",`(${px2},${py2}) maps to (${px2},${-py2}).`),
      sq("s8-u14-f3","Reflect in the y-axis",difficulty,`Reflect (${px3},${py3}) in the y-axis.`,[`(${-px3},${py3})`,`${-px3},${py3}`],"The y-coordinate stays; the x-sign changes.",`(${px3},${py3}) maps to (${-px3},${py3}).`),
      sq("s8-u14-f4","Rotate a point about the origin",difficulty,`Rotate (${px4},${py4}) 90° anticlockwise about the origin.`,[`(${-py4},${px4})`,`${-py4},${px4}`],"Use the rule (x,y) → (−y,x).",`(${px4},${py4}) maps to (${-py4},${px4}).`),
      sq("s8-u14-f5","Apply an enlargement",difficulty,`An enlargement has scale factor ${scale5}. A side is ${side5} cm. Find the image side.`,String(scale5*side5),"Multiply the side by the scale factor.",`${side5}×${scale5}=${scale5*side5} cm.`),
      sq("s8-u14-f6","Name a transformation",difficulty,"What single transformation turns a shape about a fixed centre?","rotation","Recall the four transformation types.","A rotation turns a shape about a centre."),
    ];
  }
  if (difficulty === "application") {
    const px1=r(-6,6),py1=r(-6,6),vx1=r(-5,5),vy1=r(-5,5);
    const px2=r(-6,6),py2=r(-6,6);
    const scale3=r(2,5),imageSide3=scale3*r(2,10),origSide3=imageSide3/scale3;
    const px4=r(-6,6),py4=r(-6,6);
    const origLen5=r(2,10),newLen5=origLen5*r(2,5);
    const px6=r(-6,6),py6=r(-6,6),vx6=r(-4,4),vy6=r(-4,4);
    return [
      sq("s8-u14-a1","Apply a translation in context",difficulty,`A game piece at (${px1},${py1}) moves by the vector (${vx1},${vy1}). Find its new position.`,[`(${px1+vx1},${py1+vy1})`,`${px1+vx1},${py1+vy1}`],"Add corresponding coordinates.",`(${px1+vx1},${py1+vy1}).`),
      sq("s8-u14-a2","Reflect a shape's corner",difficulty,`A shape's corner at (${px2},${py2}) is reflected in the x-axis. Find the new coordinate.`,[`(${px2},${-py2})`,`${px2},${-py2}`],"The y-sign changes; the x-coordinate stays.",`(${px2},${-py2}).`),
      sq("s8-u14-a3","Reverse an enlargement",difficulty,`A photo is enlarged by scale factor ${scale3}. The image side is ${imageSide3} cm. Find the original side length.`,String(origSide3),"Divide the image length by the scale factor.",`${imageSide3}÷${scale3}=${origSide3} cm.`),
      sq("s8-u14-a4","Apply a 180° rotation",difficulty,`A point at (${px4},${py4}) is rotated 180° about the origin. Find its new position.`,[`(${-px4},${-py4})`,`${-px4},${-py4}`],"Both coordinates change sign.",`(${-px4},${-py4}).`),
      sq("s8-u14-a5","Find a scale factor from lengths",difficulty,`A model's length is scaled from ${origLen5} cm to ${newLen5} cm. Find the scale factor.`,String(newLen5/origLen5),"Divide the new length by the original.",`${newLen5}÷${origLen5}=${newLen5/origLen5}.`),
      sq("s8-u14-a6","Apply a translation vector",difficulty,`A point at (${px6},${py6}) is translated by (${vx6},${vy6}). Find its new position.`,[`(${px6+vx6},${py6+vy6})`,`${px6+vx6},${py6+vy6}`],"Add corresponding coordinates.",`(${px6+vx6},${py6+vy6}).`),
    ];
  }
  const imgX1=r(-6,6),imgY1=r(-6,6),vx1=r(-5,5),vy1=r(-5,5);
  const scaleA=r(2,4),scaleB=r(2,4),combined=scaleA*scaleB;
  const lenScale5=r(2,5);
  return [
    sq("s8-u14-r1","Reverse a translation",difficulty,`A point is translated by the vector (${vx1},${vy1}) to reach (${imgX1},${imgY1}). Find the original point.`,[`(${imgX1-vx1},${imgY1-vy1})`,`${imgX1-vx1},${imgY1-vy1}`],"Subtract the vector from the image point.",`(${imgX1-vx1},${imgY1-vy1}).`),
    sq("s8-u14-r2","Combine two enlargements",difficulty,`A shape is enlarged by scale factor ${scaleA}, then enlarged again by scale factor ${scaleB}. Find the overall scale factor.`,String(combined),"Multiply the two scale factors together.",`${scaleA}×${scaleB}=${combined}.`),
    sq("s8-u14-r3","Correct a reflection error",difficulty,"A learner reflects (5,-3) in the x-axis and writes (-5,-3). Enter the correct reflected point.",["(5,3)","5,3"],"Only the y-sign should change; the x-coordinate stays.","(5,-3) reflects to (5,3)."),
    sq("s8-u14-r4","Identify a transformation from coordinate changes",difficulty,"A shape's coordinates all have their signs flipped (both x and y). What single transformation could cause this?",["rotation180","rotation of 180","180rotation"],"Think about which transformation reverses both coordinates.","A 180° rotation about the origin flips both signs."),
    sq("s8-u14-r5","Reason about combined rotations",difficulty,"A shape is rotated 90° clockwise, then 90° anticlockwise, about the same centre. What is the overall effect?",["nochange","no change","none"],"The two rotations cancel each other out.","The shape ends up back where it started."),
    sq("s8-u14-r6","Find the effect of enlargement on area",difficulty,`A shape is enlarged by scale factor ${lenScale5}. If the original area is 10 cm², find the new area.`,String(10*lenScale5*lenScale5),"Area scales by the square of the length scale factor.",`10×${lenScale5}²=${10*lenScale5*lenScale5} cm².`),
  ];
};

const structuredMeasures = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const w1=r(4,20),h1=r(4,20);
    const base2=r(4,20),height2=r(4,20),area2=(base2*height2)/2;
    const radius3=[5,10,15,20][r(0,3)],area3=Math.round(3.14*radius3*radius3*100)/100;
    const l4=r(2,10),w4=r(2,10),h4=r(2,10);
    const m5=r(1,20)+r(1,9)/10;
    const side6=r(2,12);
    return [
      sq("s8-u15-f1","Find the perimeter of a rectangle",difficulty,`Find the perimeter of a rectangle ${w1} cm by ${h1} cm.`,String(2*(w1+h1)),"Add all four sides.",`2×(${w1}+${h1})=${2*(w1+h1)} cm.`),
      sq("s8-u15-f2","Find the area of a triangle",difficulty,`Find the area of a triangle with base ${base2} cm and height ${height2} cm.`,String(area2),"Use half × base × height.",`½×${base2}×${height2}=${area2} cm².`),
      sq("s8-u15-f3","Find the area of a circle",difficulty,`Find the area of a circle of radius ${radius3} cm using π=3.14.`,String(area3),"Use A=πr².",`3.14×${radius3}²=${area3} cm².`),
      sq("s8-u15-f4","Find the volume of a cuboid",difficulty,`Find the volume of a cuboid ${l4} cm by ${w4} cm by ${h4} cm.`,String(l4*w4*h4),"Multiply length, width and height.",`${l4}×${w4}×${h4}=${l4*w4*h4} cm³.`),
      sq("s8-u15-f5","Convert metres to centimetres",difficulty,`Convert ${m5.toFixed(1)} m to centimetres.`,String(Math.round(m5*100)),"Multiply metres by 100.",`${m5.toFixed(1)}×100=${Math.round(m5*100)} cm.`),
      sq("s8-u15-f6","Find the surface area of a cube",difficulty,`Find the surface area of a cube with side ${side6} cm.`,String(6*side6*side6),"A cube has six equal square faces.",`6×${side6}²=${6*side6*side6} cm².`),
    ];
  }
  if (difficulty === "application") {
    const fenceW=r(4,20),fenceH=r(4,20);
    const wallW=r(2,10),wallH=r(2,10),coveragePerTin=r(2,5),tinsNeeded=Math.ceil((wallW*wallH)/coveragePerTin);
    const tankL=r(2,8),tankW=r(2,8),tankH=r(2,8),volCm3=tankL*tankW*tankH,volLitres=volCm3/1000;
    const km1=r(2,15);
    const poolRadius=[5,10][r(0,1)],poolArea=Math.round(3.14*poolRadius*poolRadius*100)/100;
    const rectL=r(4,10),rectW=r(4,10),rectL2=r(2,6),rectW2=r(2,6),compositeArea=rectL*rectW+rectL2*rectW2;
    return [
      sq("s8-u15-a1","Find fencing length for a garden",difficulty,`A rectangular garden ${fenceW} m by ${fenceH} m needs fencing all the way around. Find the total length of fencing.`,String(2*(fenceW+fenceH)),"Add all four sides.",`2×(${fenceW}+${fenceH})=${2*(fenceW+fenceH)} m.`),
      sq("s8-u15-a2","Find how many tins of paint are needed",difficulty,`A wall is ${wallW} m by ${wallH} m. One tin of paint covers ${coveragePerTin} m². How many tins are needed (round up to a whole tin)?`,String(tinsNeeded),"Divide the wall area by the coverage, then round up.",`${wallW}×${wallH}÷${coveragePerTin}=${(wallW*wallH/coveragePerTin).toFixed(2)}, round up to ${tinsNeeded}.`),
      sq("s8-u15-a3","Convert volume to capacity",difficulty,`A tank measures ${tankL} cm by ${tankW} cm by ${tankH} cm. Find its capacity in litres (1 litre = 1000 cm³).`,String(volLitres),"Find the volume, then divide by 1000.",`${tankL}×${tankW}×${tankH}÷1000=${volLitres} litres.`),
      sq("s8-u15-a4","Convert kilometres to metres",difficulty,`Convert ${km1} km to metres.`,String(km1*1000),"Multiply kilometres by 1000.",`${km1}×1000=${km1*1000} m.`),
      sq("s8-u15-a5","Find the area of a circular pool",difficulty,`A circular pool has radius ${poolRadius} m. Find its area using π=3.14.`,String(poolArea),"Use A=πr².",`3.14×${poolRadius}²=${poolArea} m².`),
      sq("s8-u15-a6","Find the area of a composite shape",difficulty,`An L-shaped room is made of a ${rectL} m by ${rectW} m rectangle and a ${rectL2} m by ${rectW2} m rectangle. Find the total floor area.`,String(compositeArea),"Add the areas of both rectangles.",`${rectL}×${rectW}+${rectL2}×${rectW2}=${compositeArea} m².`),
    ];
  }
  const widthR1=r(2,15),lengthR1=r(2,15)+widthR1+1,perimR1=2*(lengthR1+widthR1);
  const radiusR2=[5,10,15][r(0,2)],areaR2=Math.round(3.14*radiusR2*radiusR2*100)/100;
  const l1R3=r(2,8),w1R3=r(2,8),h1R3=r(2,8),vol1R3=l1R3*w1R3*h1R3;
  const l2R3=r(2,8),w2R3=r(2,8),h2R3=r(2,8),vol2R3=l2R3*w2R3*h2R3;
  const sideR4=r(2,8),doubledAreaR4=(sideR4*2)*(sideR4*2);
  const volR6=r(2,10)*r(2,10)*r(2,10);
  return [
    sq("s8-u15-r1","Reverse a perimeter calculation",difficulty,`A rectangle has perimeter ${perimR1} cm and width ${widthR1} cm. Find its length.`,String(lengthR1),"Halve the perimeter, then subtract the width.",`${perimR1}÷2−${widthR1}=${lengthR1} cm.`),
    sq("s8-u15-r2","Reverse a circle area calculation",difficulty,`A circle has area ${areaR2} cm² (using π=3.14). State its radius.`,String(radiusR2),"Divide by π, then find the square root.",`${areaR2}÷3.14=${radiusR2*radiusR2}, √${radiusR2*radiusR2}=${radiusR2}.`),
    sq("s8-u15-r3","Compare two volumes",difficulty,`Cuboid A measures ${l1R3} by ${w1R3} by ${h1R3} cm. Cuboid B measures ${l2R3} by ${w2R3} by ${h2R3} cm. Which has the larger volume, A or B?`,[vol1R3>vol2R3?"a":"b",vol1R3>vol2R3?"cuboid a":"cuboid b"],"Calculate both volumes, then compare.",`Cuboid A=${vol1R3} cm³, Cuboid B=${vol2R3} cm³.`),
    sq("s8-u15-r4","Reason about area scaling",difficulty,`A square has side ${sideR4} cm. If the side length is doubled, find the new area.`,String(doubledAreaR4),"Doubling the side means the area is multiplied by 4.",`(2×${sideR4})²=${doubledAreaR4} cm².`),
    sq("s8-u15-r5","Correct a unit conversion error",difficulty,"A learner converts 3.5 m to 35 cm. Enter the correct value in cm.","350","Multiply metres by 100, not 10.","3.5×100=350 cm."),
    sq("s8-u15-r6","Convert volume to litres",difficulty,`A cuboid has volume ${volR6} cm³. Convert this to litres.`,String(volR6/1000),"Divide by 1000.",`${volR6}÷1000=${volR6/1000} litres.`),
  ];
};

const structuredInvestigations = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const meanA=r(50,90),meanB=r(50,90);
    const rangeX=r(2,20),rangeY=r(2,20);
    return [
      sq("s8-u16-f1","Choose a graph for time-based data",difficulty,"Which graph is most suitable for showing change over time?",["linegraph","line"],"Time is continuous and ordered.","A line graph shows trends over time."),
      sq("s8-u16-f2","Choose a graph for categorical data",difficulty,"Which graph is suitable for categorical frequency data?",["bargraph","barchart","bar"],"Categories need separate, unconnected bars.","A bar chart is suitable."),
      sq("s8-u16-f3","Identify correlation direction",difficulty,"A scatter graph slopes upward from left to right. Name the correlation.",["positive","positivecorrelation"],"As one variable rises, the other tends to rise too.","This is positive correlation."),
      sq("s8-u16-f4","Recall correlation vs causation",difficulty,"Does correlation always prove causation?",["no","n"],"Another variable may affect both quantities.","No — correlation alone does not prove cause."),
      sq("s8-u16-f5","Compare two means",difficulty,`Class A has mean ${meanA} and Class B has mean ${meanB}. Which has the higher mean?`,[meanA>meanB?"classa":"classb",meanA>meanB?"a":"b"],"Compare the two mean values directly.",`${meanA>meanB?"Class A":"Class B"} has the higher mean.`),
      sq("s8-u16-f6","Compare consistency using range",difficulty,`Two sets have the same median. Set X has range ${rangeX} and Set Y has range ${rangeY}. Which is more consistent?`,[rangeX<rangeY?"setx":"sety",rangeX<rangeY?"x":"y"],"A smaller range means the data is more tightly grouped.",`Set ${rangeX<rangeY?"X":"Y"} is more consistent because its range is smaller.`),
    ];
  }
  if (difficulty === "application") {
    return [
      sq("s8-u16-a1","Identify sampling bias",difficulty,"A researcher only surveys people at a gym about exercise habits. Which sampling issue does this cause?",["bias","biased"],"Gym-goers don't represent the whole population.","This causes sampling bias."),
      sq("s8-u16-a2","Identify a sampling method",difficulty,"A sample is chosen by picking every 10th name from an alphabetical list. What is this method called?",["systematic","systematicsampling"],"This method selects at a fixed, regular interval.","This is systematic sampling."),
      sq("s8-u16-a3","Choose the best average for outlier data",difficulty,"A data set has one extremely high outlier. Which average is least affected by it: mean or median?","median","The mean is pulled toward extreme values; the median is not.","The median is least affected by outliers."),
      sq("s8-u16-a4","Choose a diagram for proportions",difficulty,"Which diagram is best for showing how a budget is split into categories as proportions of a whole?",["piechart","pie"],"Think about which chart shows parts of a whole.","A pie chart is best for this."),
      sq("s8-u16-a5","Describe a trend",difficulty,"A company's sales rise steadily each month for a year. What trend does this show?",["increasing","upward","positivetrend"],"Consider the overall direction of change.","This shows an increasing (upward) trend."),
      sq("s8-u16-a6","Count categories in survey data",difficulty,"A survey has 5 possible responses: strongly agree, agree, neutral, disagree, strongly disagree. How many categories are there?","5","Count each distinct response option.","There are 5 categories."),
    ];
  }
  const meanSame=r(40,80),rangeSmall=r(2,10),rangeLarge=rangeSmall+r(3,15);
  return [
    sq("s8-u16-r1","Evaluate whether a sample is representative",difficulty,"A school wants a representative sample of all students. Is surveying only the chess club members representative? Answer yes or no.","no","Consider whether chess club members represent all students.","No — chess club members are not representative of the whole school."),
    sq("s8-u16-r2","Reason about the effect of an outlier",difficulty,"A data set gains one very large outlier. Explain in one word which average changes the most: mean or median.","mean","The mean is calculated using every value; the median is not.","The mean changes the most."),
    sq("s8-u16-r3","Judge correlation strength",difficulty,"A scatter graph shows points loosely scattered near an upward line, with much variation. Is this a strong or weak positive correlation?","weak","Consider how closely the points follow the line.","This is a weak positive correlation."),
    sq("s8-u16-r4","Reason about extrapolation",difficulty,"A trend is observed for x-values between 0 and 10. Is it reliable to extrapolate the trend to predict x=1000? Answer yes or no.","no","Trends observed within a range may not hold far outside it.","No — extrapolating far beyond the data is unreliable."),
    sq("s8-u16-r5","Compare consistency with equal means",difficulty,`Two classes both have mean score ${meanSame}. Class P has range ${rangeSmall} and Class Q has range ${rangeLarge}. Which class is more consistent?`,["classp","p"],"A smaller range means more consistent results.","Class P is more consistent because its range is smaller."),
    sq("s8-u16-r6","Reason about spurious correlation",difficulty,"A scatter graph for ice-cream sales vs temperature shows a positive correlation. Would you expect umbrella sales vs temperature to show a similar or different type of correlation?","different","Think about how umbrella sales relate to temperature.","Different — umbrella sales likely show a negative correlation with temperature."),
  ];
};

const termStr = (coef:number, suffix:string) => coef===1?suffix:coef===-1?`-${suffix}`:`${coef}${suffix}`;

const structuredIntegersS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const base1=r(-9,9)||2,pow1=[2,3][r(0,1)],val1=base1**pow1;
    const a2=r(-6,6)||1,b2=r(-6,6)||1,val2=a2*a2+b2;
    const base3=r(2,9);
    const a4=r(-9,9)||1,b4=r(1,9),c4=r(-9,-1),val4=a4+b4*c4;
    const base5=r(2,5),m5=r(2,4),n5=r(1,3),val5=base5**(m5+n5);
    const base6=r(2,6),m6=r(3,6),n6=r(1,m6-1),val6=base6**(m6-n6);
    return [
      sq("s9-u1-f1","Evaluate a power",difficulty,`Evaluate ${base1}^${pow1}.`,String(val1),"Multiply the base by itself the given number of times.",`${base1}^${pow1}=${val1}.`),
      sq("s9-u1-f2","Combine indices with other operations",difficulty,`Evaluate ${a2}^2 + ${b2}.`,String(val2),"Evaluate the power first, then add.",`${a2}^2+${b2}=${val2}.`),
      sq("s9-u1-f3","Reason about squaring a negative number",difficulty,`Is (${-base3})^2 positive or negative?`,"positive","A negative number squared is always positive.","Squaring removes the negative sign."),
      sq("s9-u1-f4","Apply order of operations",difficulty,`Evaluate ${a4} + ${b4} × ${c4}.`,String(val4),"Multiply before adding.",`${a4}+(${b4}×${c4})=${val4}.`),
      sq("s9-u1-f5","Apply the multiplication index law",difficulty,`Using the index law, evaluate ${base5}^${m5} × ${base5}^${n5} by writing it as a single power, then evaluating.`,String(val5),"Add the powers when multiplying the same base.",`${base5}^${m5+n5}=${val5}.`),
      sq("s9-u1-f6","Apply the division index law",difficulty,`Using the index law, evaluate ${base6}^${m6} ÷ ${base6}^${n6} by writing it as a single power, then evaluating.`,String(val6),"Subtract the powers when dividing the same base.",`${base6}^${m6-n6}=${val6}.`),
    ];
  }
  if (difficulty === "application") {
    const side1=r(2,15),area1=side1*side1;
    const startTemp2=r(-10,20),drop2=r(2,8),rises2=r(1,3),val2=startTemp2-drop2*rises2;
    const repeatBase3=r(2,6),repeatCount3=r(2,4);
    const cost4=r(5,20),qty4=r(2,9),discount4=r(2,10),total4=cost4*qty4-discount4;
    const cubeSide5=r(2,10),volume5=cubeSide5**3;
    const scaleBase6=r(2,4),scalePow6=r(2,3),scaleVal6=scaleBase6**scalePow6;
    return [
      sq("s9-u1-a1","Apply squaring in context",difficulty,`A square has side length ${side1} cm. Find its area.`,String(area1),"Square the side length.",`${side1}^2=${area1} cm².`),
      sq("s9-u1-a2","Apply repeated operations in context",difficulty,`The temperature starts at ${startTemp2}°C. It then drops by ${drop2}°C, ${rises2} times in a row. Find the final temperature.`,String(val2),"Multiply the drop by the number of times, then subtract.",`${startTemp2}−(${drop2}×${rises2})=${val2}°C.`),
      sq("s9-u1-a3","Write repeated multiplication as a power",difficulty,`Write ${Array(repeatCount3).fill(repeatBase3).join(" × ")} as a single power (${repeatBase3}^n form). State n.`,String(repeatCount3),"Count how many times the base is multiplied by itself.",`There are ${repeatCount3} factors of ${repeatBase3}.`),
      sq("s9-u1-a4","Apply order of operations in context",difficulty,`${qty4} items cost R${cost4} each. A discount of R${discount4} is then applied to the total. Find the final cost.`,String(total4),"Multiply first, then subtract the discount.",`(${qty4}×R${cost4})−R${discount4}=R${total4}.`),
      sq("s9-u1-a5","Apply cubing in context",difficulty,`A cube has side length ${cubeSide5} cm. Find its volume.`,String(volume5),"Cube the side length.",`${cubeSide5}^3=${volume5} cm³.`),
      sq("s9-u1-a6","Apply exponential growth",difficulty,`A pattern grows by a factor of ${scaleBase6} each stage, starting from stage 0 at value 1. Find the value at stage ${scalePow6}.`,String(scaleVal6),"Raise the growth factor to the power of the stage number.",`${scaleBase6}^${scalePow6}=${scaleVal6}.`),
    ];
  }
  const base1=r(2,9);
  const base2=r(-9,-2);
  const m3=r(2,4),n3=r(1,3),base3=r(2,4),correctVal3=base3**(m3+n3);
  const base4=r(-6,-2),oddPow4=[3,5][r(0,1)];
  const a5=r(-9,-1),b5=r(1,9),c5=r(-9,-1),val5=a5+b5*c5;
  const base6=r(2,4),m6=r(3,5),n6=r(1,2);
  return [
    sq("s9-u1-r1","Distinguish (-a)² from -a²",difficulty,`Which is larger: (-${base1})^2 or -${base1}^2?`,[`(-${base1})^2`,`(-${base1})^2 is larger`],"(-a)² squares the negative first; -a² negates after squaring.",`(-${base1})^2=${base1*base1}, but -${base1}^2=${-(base1*base1)}.`),
    sq("s9-u1-r2","Reason about squaring vs doubling",difficulty,`Is (${base2})^2 the same value as ${base2}×2? Answer yes or no.`,"no","Squaring multiplies a number by itself; doubling multiplies by 2.",`(${base2})^2=${base2*base2}, but ${base2}×2=${base2*2}.`),
    sq("s9-u1-r3","Correct an index-law error",difficulty,`A learner evaluates ${base3}^${m3} × ${base3}^${n3} by multiplying the two results together but forgets to combine the powers first. Enter the correct answer using the index law ${base3}^${m3+n3}.`,String(correctVal3),"Add the powers, then evaluate the single resulting power.",`${base3}^${m3+n3}=${correctVal3}.`),
    sq("s9-u1-r4","Reason about odd powers of negatives",difficulty,`Is (${base4})^${oddPow4} positive or negative?`,"negative","An odd power of a negative number stays negative.",`An odd number of negative factors gives a negative result.`),
    sq("s9-u1-r5","Apply order of operations with negatives",difficulty,`Evaluate ${a5} + ${b5} × ${c5}, applying the correct order of operations.`,String(val5),"Multiply before adding.",`${a5}+(${b5}×${c5})=${val5}.`),
    sq("s9-u1-r6","Simplify using the division index law",difficulty,`Simplify ${base6}^${m6} ÷ ${base6}^${n6} as a single power, then evaluate it.`,String(base6**(m6-n6)),"Subtract the powers, then evaluate.",`${base6}^${m6-n6}=${base6**(m6-n6)}.`),
  ];
};

const structuredExpressionsS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const a1=r(2,7),b1=r(1,9);
    const a2=r(2,7),b2=r(1,9),c2=r(1,9);
    const p3=r(1,6),q3=r(1,6);
    const commonF4=r(2,6),y4=r(1,8);
    const commonF5=r(2,9),term5a=r(1,9),term5b=r(1,9);
    const a6=r(2,5),b6=r(1,6),xVal6=r(2,6);
    return [
      sq("s9-u2-f1","Expand a single bracket",difficulty,`Expand ${a1}(x + ${b1}).`,[`${a1}x+${a1*b1}`,`${a1}x + ${a1*b1}`],"Multiply everything inside the bracket by the term outside.",`${a1}×x=${a1}x, ${a1}×${b1}=${a1*b1}.`),
      sq("s9-u2-f2","Expand and simplify",difficulty,`Expand and simplify ${a2}(x + ${b2}) + ${c2}.`,[`${a2}x+${a2*b2+c2}`,`${a2}x + ${a2*b2+c2}`],"Expand first, then combine the constant terms.",`${a2}x+${a2*b2}+${c2}=${a2}x+${a2*b2+c2}.`),
      sq("s9-u2-f3","Expand double brackets",difficulty,`Expand (x + ${p3})(x + ${q3}).`,[`x^2+${p3+q3}x+${p3*q3}`,`x^2 + ${p3+q3}x + ${p3*q3}`],"Multiply each term in the first bracket by each term in the second.",`x²+${p3}x+${q3}x+${p3*q3}=x²+${p3+q3}x+${p3*q3}.`),
      sq("s9-u2-f4","Factorise using a common factor",difficulty,`Factorise fully: ${commonF4}x + ${commonF4*y4}.`,[`${commonF4}(x+${y4})`,`${commonF4}(x + ${y4})`],"Find the highest common factor of both terms.",`${commonF4}x+${commonF4*y4}=${commonF4}(x+${y4}).`),
      sq("s9-u2-f5","Factorise fully",difficulty,`Factor out the highest common factor from ${commonF5*term5a}x + ${commonF5*term5b}.`,[`${commonF5}(${termStr(term5a,"x")}+${term5b})`,`${commonF5}(${termStr(term5a,"x")} + ${term5b})`],"Find the highest common factor of both terms.",`${commonF5*term5a}x+${commonF5*term5b}=${commonF5}(${termStr(term5a,"x")}+${term5b}).`),
      sq("s9-u2-f6","Expand then substitute",difficulty,`Expand ${a6}(x + ${b6}), then evaluate the result when x = ${xVal6}.`,String(a6*(xVal6+b6)),"Expand first, then substitute the given value.",`${a6}(${xVal6}+${b6})=${a6*(xVal6+b6)}.`),
    ];
  }
  if (difficulty === "application") {
    const a1=r(2,8),b1=r(1,9);
    const len2=r(3,10),wA2=r(1,9),wB2=r(1,9);
    const areaA3=r(2,6),areaB3=r(1,9);
    const p4=r(2,8),cost4=r(1,9);
    const commonF5=r(2,6),partA5=r(1,8),partB5=r(1,8);
    const a6=r(2,5),b6=r(1,7),xVal6=r(1,6);
    return [
      sq("s9-u2-a1","Write an area as an expanded expression",difficulty,`A rectangle has width ${a1} and length (x + ${b1}). Write an expanded expression for its area.`,[`${a1}x+${a1*b1}`,`${a1}x + ${a1*b1}`],"Multiply the width by the full length expression.",`${a1}(x+${b1})=${a1}x+${a1*b1}.`),
      sq("s9-u2-a2","Simplify a perimeter expression",difficulty,`A garden's perimeter is made of two widths ${wA2} and ${wB2}, plus two lengths of (${len2} + x). Write the simplified total perimeter expression.`,[`2x+${2*len2+wA2+wB2}`,`2x + ${2*len2+wA2+wB2}`],"Add all four sides and collect like terms.",`2(${len2}+x)+${wA2}+${wB2}=2x+${2*len2+wA2+wB2}.`),
      sq("s9-u2-a3","Find a missing factor from an area expression",difficulty,`A rectangle has area ${areaA3}x + ${areaA3*areaB3}. If one side is ${areaA3}, write an expression for the other side.`,[`x+${areaB3}`,`x + ${areaB3}`],"Divide the area expression by the known side.",`(${areaA3}x+${areaA3*areaB3})÷${areaA3}=x+${areaB3}.`),
      sq("s9-u2-a4","Write a total cost as an expanded expression",difficulty,`${p4} friends each pay (x + ${cost4}) rand for a trip. Write the total cost as an expanded expression.`,[`${p4}x+${p4*cost4}`,`${p4}x + ${p4*cost4}`],"Multiply the number of friends by the cost expression.",`${p4}(x+${cost4})=${p4}x+${p4*cost4}.`),
      sq("s9-u2-a5","Factorise a cost expression",difficulty,`A total cost is modelled as ${commonF5*partA5}x + ${commonF5*partB5}. Factorise this expression fully.`,[`${commonF5}(${termStr(partA5,"x")}+${partB5})`,`${commonF5}(${termStr(partA5,"x")} + ${partB5})`],"Find the highest common factor of both terms.",`${commonF5*partA5}x+${commonF5*partB5}=${commonF5}(${termStr(partA5,"x")}+${partB5}).`),
      sq("s9-u2-a6","Evaluate a cost expression",difficulty,`The cost of a trip is ${a6}(x + ${b6}) rand, where x is the number of extra people. Find the cost when x = ${xVal6}.`,String(a6*(xVal6+b6)),"Substitute the given value of x.",`${a6}(${xVal6}+${b6})=R${a6*(xVal6+b6)}.`),
    ];
  }
  const a1=r(2,6),b1=r(1,8),wrongB1=b1+r(1,3);
  const p2=r(1,6),q2=r(1,6);
  const commonF3=r(2,6),partA3=r(1,7),partB3=r(1,7);
  const a4=r(2,5),b4=r(1,7);
  const p5a=r(1,5),q5a=r(1,5),p5b=r(1,5),q5b=r(1,5);
  const commonF6=r(-6,-2),innerA6=r(1,8),innerB6=r(1,8);
  const secondTerm6=commonF6*innerB6;
  return [
    sq("s9-u2-r1","Correct an expansion error",difficulty,`A learner expands ${a1}(x + ${b1}) and writes ${a1}x + ${a1*wrongB1}. Enter the correct expanded expression.`,[`${a1}x+${a1*b1}`,`${a1}x + ${a1*b1}`],"Multiply the outside term by each term inside the bracket separately.",`${a1}(x+${b1})=${a1}x+${a1*b1}.`),
    sq("s9-u2-r2","Find a constant term from a double expansion",difficulty,`Expand (x + ${p2})(x + ${q2}), then state the constant term only.`,String(p2*q2),"The constant term comes from multiplying the two constants together.",`${p2}×${q2}=${p2*q2}.`),
    sq("s9-u2-r3","Factorise and verify by expanding back",difficulty,`Factorise ${commonF3*partA3}x + ${commonF3*partB3} fully, then expand your answer back out to check it matches the original.`,[`${commonF3}(${termStr(partA3,"x")}+${partB3})`,`${commonF3}(${termStr(partA3,"x")} + ${partB3})`],"Divide both terms by their highest common factor.",`${commonF3*partA3}x+${commonF3*partB3}=${commonF3}(${termStr(partA3,"x")}+${partB3}).`),
    sq("s9-u2-r4","Evaluate an equivalence claim",difficulty,`Is ${a4}x + ${a4*b4} the same as ${a4}(x + ${b4})? Answer yes or no.`,"yes","Expand the factorised form and compare.",`${a4}(x+${b4})=${a4}x+${a4*b4}, which matches.`),
    sq("s9-u2-r5","Combine two expanded double brackets",difficulty,`Expand (x + ${p5a})(x + ${q5a}), then add it to the expansion of (x + ${p5b})(x + ${q5b}). State the constant term of the combined result.`,String(p5a*q5a+p5b*q5b),"Find each constant term separately, then add them.",`${p5a}×${q5a}=${p5a*q5a}; ${p5b}×${q5b}=${p5b*q5b}; total=${p5a*q5a+p5b*q5b}.`),
    sq("s9-u2-r6","Factorise with a negative common factor",difficulty,`Factorise ${commonF6*innerA6}x ${secondTerm6<0?"- "+Math.abs(secondTerm6):"+ "+secondTerm6}, taking out the common factor ${commonF6}.`,[`${commonF6}(${termStr(innerA6,"x")}+${innerB6})`,`${commonF6}(${termStr(innerA6,"x")} + ${innerB6})`],"Divide both terms by the negative common factor.",`${commonF6*innerA6}x${secondTerm6<0?"−":"+"}${Math.abs(secondTerm6)}=${commonF6}(${termStr(innerA6,"x")}+${innerB6}).`),
  ];
};

const structuredRoundingS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const mant1=r(1,9)+r(0,9)/10,exp1=r(3,8),num1=Math.round(mant1*(10**exp1));
    const mant2=r(1,9)+r(0,9)/10,exp2=r(2,6);
    const mant3=r(1,9),exp3=r(2,5),numSmall3=mant3/(10**exp3);
    const roundedTo4=r(2,90),boundUpper4=roundedTo4+0.5;
    const roundedTo5=r(2,90),boundLower5=roundedTo5-0.5;
    const mant6a=r(1,9),exp6a=r(1,4),mant6b=r(1,9),exp6b=r(1,4);
    return [
      sq("s9-u3-f1","Write a number in standard form",difficulty,`Write ${num1} in standard form.`,[`${mant1}×10^${exp1}`,`${mant1}x10^${exp1}`,`${mant1}*10^${exp1}`],"Write it as a number between 1 and 10, multiplied by a power of 10.",`${num1}=${mant1}×10^${exp1}.`),
      sq("s9-u3-f2","Convert standard form to an ordinary number",difficulty,`Write ${mant2}×10^${exp2} as an ordinary number.`,String(mant2*(10**exp2)),"Multiply the mantissa by the power of 10.",`${mant2}×10^${exp2}=${mant2*(10**exp2)}.`),
      sq("s9-u3-f3","Write a small number in standard form",difficulty,`Write ${numSmall3} in standard form.`,[`${mant3}×10^-${exp3}`,`${mant3}x10^-${exp3}`,`${mant3}*10^-${exp3}`],"Small numbers use a negative power of 10.",`${numSmall3}=${mant3}×10^-${exp3}.`),
      sq("s9-u3-f4","Find the upper bound",difficulty,`A length is measured as ${roundedTo4} cm, rounded to the nearest cm. Find the upper bound.`,String(boundUpper4),"Add half of the rounding interval.",`${roundedTo4}+0.5=${boundUpper4}.`),
      sq("s9-u3-f5","Find the lower bound",difficulty,`A length is measured as ${roundedTo5} cm, rounded to the nearest cm. Find the lower bound.`,String(boundLower5),"Subtract half of the rounding interval.",`${roundedTo5}−0.5=${boundLower5}.`),
      sq("s9-u3-f6","Multiply numbers in standard form",difficulty,`Calculate (${mant6a}×10^${exp6a}) × (${mant6b}×10^${exp6b}). Give your answer as an ordinary number.`,String(mant6a*mant6b*(10**(exp6a+exp6b))),"Multiply the mantissas and add the powers.",`${mant6a}×${mant6b}=${mant6a*mant6b}; 10^${exp6a}×10^${exp6b}=10^${exp6a+exp6b}.`),
    ];
  }
  if (difficulty === "application") {
    const popMant=r(1,9)+r(0,9)/10,popExp=r(6,9),popNum=Math.round(popMant*(10**popExp));
    const microMant=r(1,9),microExp=r(3,7),microNum=microMant/(10**microExp);
    const measured3=r(5,95),lower3=measured3-0.5,upper3=measured3+0.5;
    const lenA4=r(10,50),lenB4=r(10,50),minPerim4=2*(lenA4-0.5+lenB4-0.5);
    const resultMant5=[2,3][r(0,1)],mantB5=[2,3][r(0,1)],mantA5=resultMant5*mantB5,expB5=r(1,3),resultExp5=r(1,3),expA5=expB5+resultExp5;
    const measured6=r(10,90);
    return [
      sq("s9-u3-a1","Write a large real-world number in standard form",difficulty,`A country's population is approximately ${popNum}. Write this in standard form.`,[`${popMant}×10^${popExp}`,`${popMant}x10^${popExp}`,`${popMant}*10^${popExp}`],"Write it as a number between 1 and 10, multiplied by a power of 10.",`${popNum}=${popMant}×10^${popExp}.`),
      sq("s9-u3-a2","Write a small real-world measurement in standard form",difficulty,`A bacterium measures ${microNum} mm across. Write this in standard form.`,[`${microMant}×10^-${microExp}`,`${microMant}x10^-${microExp}`,`${microMant}*10^-${microExp}`],"Small measurements use a negative power of 10.",`${microNum}=${microMant}×10^-${microExp}.`),
      sq("s9-u3-a3","Write an error interval",difficulty,`A rod is measured as ${measured3} cm, rounded to the nearest cm. Write the error interval as two bounds (lower, upper).`,[`${lower3},${upper3}`,`${lower3}, ${upper3}`],"Subtract and add half the rounding interval.",`${measured3}−0.5=${lower3}; ${measured3}+0.5=${upper3}.`),
      sq("s9-u3-a4","Use bounds to find a minimum perimeter",difficulty,`Two lengths are measured as ${lenA4} cm and ${lenB4} cm, each rounded to the nearest cm. Find the smallest possible perimeter of a rectangle with these side lengths.`,String(minPerim4),"Use the lower bound of each length.",`2×((${lenA4}−0.5)+(${lenB4}−0.5))=${minPerim4}.`),
      sq("s9-u3-a5","Divide numbers in standard form",difficulty,`Calculate (${mantA5}×10^${expA5}) ÷ (${mantB5}×10^${expB5}). Give your answer in standard form.`,[`${resultMant5}×10^${resultExp5}`,`${resultMant5}x10^${resultExp5}`,`${resultMant5}*10^${resultExp5}`],"Divide the mantissas and subtract the powers.",`${mantA5}÷${mantB5}=${resultMant5}; 10^${expA5}÷10^${expB5}=10^${resultExp5}.`),
      sq("s9-u3-a6","Find the width of an error interval",difficulty,`A mass is recorded as ${measured6} kg, rounded to the nearest kg. Find the difference between the upper and lower bounds.`,"1","The bounds are always 1 unit apart when rounding to the nearest whole number.","Upper bound − lower bound = 1."),
    ];
  }
  const roundedTo1=r(2,90),lower1=roundedTo1-0.5,upper1=roundedTo1+0.5;
  const lenA2=r(10,50),lenB2=r(10,50),maxArea2=(lenA2+0.5)*(lenB2+0.5);
  const wrongMant3=r(10,99),correctExp3=r(2,6),correctMantissa3=Number((wrongMant3/10).toFixed(1)).toString();
  const mantA4=r(2,9),expA4=r(3,8),mantB4=r(2,9),expB4=r(3,8);
  const roundedTo5=r(2,90);
  return [
    sq("s9-u3-r1","Write an error interval from a rounded value",difficulty,`A value rounds to ${roundedTo1} to the nearest whole number. Write the error interval as (lower, upper) bounds.`,[`${lower1},${upper1}`,`${lower1}, ${upper1}`],"Subtract and add half the rounding interval.",`${roundedTo1}−0.5=${lower1}; ${roundedTo1}+0.5=${upper1}.`),
    sq("s9-u3-r2","Find a maximum area from bounds",difficulty,`Two lengths ${lenA2} cm and ${lenB2} cm are each rounded to the nearest cm. Find the largest possible area of a rectangle with these sides.`,String(maxArea2),"Use the upper bound of each length.",`(${lenA2}+0.5)×(${lenB2}+0.5)=${maxArea2}.`),
    sq("s9-u3-r3","Correct an invalid standard-form mantissa",difficulty,`A learner writes a number in standard form as ${wrongMant3}×10^${correctExp3}, but the mantissa must be between 1 and 10. Rewrite this correctly in standard form.`,[`${correctMantissa3}×10^${correctExp3+1}`,`${correctMantissa3}x10^${correctExp3+1}`,`${correctMantissa3}*10^${correctExp3+1}`],"Divide the mantissa by 10 and increase the power by 1.",`${wrongMant3}×10^${correctExp3}=${correctMantissa3}×10^${correctExp3+1}.`),
    sq("s9-u3-r4","Compare numbers in standard form",difficulty,`Which is larger: ${mantA4}×10^${expA4} or ${mantB4}×10^${expB4}?`,[expA4!==expB4?(expA4>expB4?`${mantA4}×10^${expA4}`:`${mantB4}×10^${expB4}`):(mantA4>=mantB4?`${mantA4}×10^${expA4}`:`${mantB4}×10^${expB4}`)],"Compare the powers of 10 first; only compare mantissas if the powers are equal.",`A larger power of 10 always means a larger number, regardless of mantissa.`),
    sq("s9-u3-r5","Find the maximum rounding error",difficulty,`A value of ${roundedTo5} was obtained by rounding to the nearest whole number. What is the maximum possible error between this value and the true value?`,"0.5","The true value can differ by up to half the rounding interval.","The maximum possible error is 0.5."),
    sq("s9-u3-r6","Reason about rounding precision",difficulty,"A measurement of 6.83 cm is to be stated to 2 significant figures. What is the resulting value?","6.8","Round to 2 significant figures, looking at the third digit to decide.","6.83 rounds to 6.8 (2 s.f.)."),
  ];
};

const gcdS9 = (a:number,b:number):number => b===0?a:gcdS9(b,a%b);

const structuredAnglesS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const a1=r(20,160);
    const a2=r(20,160);
    const a3=r(20,160),co3=180-a3;
    const a4=r(20,160);
    const a6=r(20,80),straight6=180-a6;
    return [
      sq("s9-u5-f1","Apply corresponding angles",difficulty,`Two parallel lines are cut by a transversal. One angle is ${a1}°. Find the corresponding angle.`,String(a1),"Corresponding angles are equal.",`Corresponding angle = ${a1}°.`),
      sq("s9-u5-f2","Apply alternate angles",difficulty,`Two parallel lines are cut by a transversal. One angle is ${a2}°. Find the alternate angle.`,String(a2),"Alternate angles are equal.",`Alternate angle = ${a2}°.`),
      sq("s9-u5-f3","Apply co-interior angles",difficulty,`Two parallel lines are cut by a transversal. One co-interior angle is ${a3}°. Find the other co-interior angle.`,String(co3),"Co-interior angles sum to 180°.",`180−${a3}=${co3}°.`),
      sq("s9-u5-f4","Apply vertically opposite angles",difficulty,`Two straight lines cross. One angle is ${a4}°. Find the vertically opposite angle.`,String(a4),"Vertically opposite angles are equal.",`Vertically opposite angle = ${a4}°.`),
      sq("s9-u5-f5","Name an angle relationship",difficulty,"Name the angle relationship where two angles are on the same side of a transversal, between two parallel lines, and sum to 180°.",["cointerior","co-interior","allied"],"This pair sits between the parallel lines on the same side.","This is the co-interior (allied) angle relationship."),
      sq("s9-u5-f6","Combine corresponding angles with a straight line",difficulty,`A transversal crosses parallel lines. One angle is ${a6}°, and its corresponding angle lies on a straight line with angle x. Find x.`,String(straight6),"The corresponding angle equals the original; then use angles on a straight line.",`180−${a6}=${straight6}°.`),
    ];
  }
  if (difficulty === "application") {
    const a1=r(20,160);
    const a2=r(20,160),co2=180-a2;
    const a3=r(20,160);
    const bearing4=r(10,170),back4=bearing4+180>360?bearing4-180:bearing4+180;
    const a5=r(30,120),b5=r(20,180-a5-1),c5=180-a5-b5;
    const a6=r(20,160);
    return [
      sq("s9-u5-a1","Apply corresponding angles in context",difficulty,`Two railway tracks are parallel. A signal post makes a corresponding angle of ${a1}° with each track. Find the angle on the other track.`,String(a1),"Corresponding angles are equal.",`Corresponding angle = ${a1}°.`),
      sq("s9-u5-a2","Apply co-interior angles in context",difficulty,`A roof truss has two parallel beams. One co-interior angle between them is ${a2}°. Find the other.`,String(co2),"Co-interior angles sum to 180°.",`180−${a2}=${co2}°.`),
      sq("s9-u5-a3","Apply alternate angles in context",difficulty,`Two parallel roads are crossed by a footpath. One alternate angle is ${a3}°. Find the other.`,String(a3),"Alternate angles are equal.",`Alternate angle = ${a3}°.`),
      sq("s9-u5-a4","Find a back bearing",difficulty,`A ship sails on a bearing of ${bearing4}°. Find the back bearing (the bearing to return along the same path).`,String(back4),"Add or subtract 180° from the original bearing.",`Back bearing = ${back4}°.`),
      sq("s9-u5-a5","Apply parallel line facts in a triangle",difficulty,`A triangle is formed where two of its angles are ${a5}° and ${b5}°, using facts from parallel lines. Find the third angle.`,String(c5),"Angles in a triangle sum to 180°.",`180−${a5}−${b5}=${c5}°.`),
      sq("s9-u5-a6","Apply corresponding angles across parallel lines",difficulty,`A transversal crosses two parallel lines, forming an angle of ${a6}° on one line. Find the corresponding angle on the other line.`,String(a6),"Corresponding angles are equal.",`Corresponding angle = ${a6}°.`),
    ];
  }
  const a1=r(20,160);
  const xCoef3=r(2,5),totalCoef3=1+xCoef3,q3=r(5,Math.floor(170/totalCoef3)),p3=180-q3*totalCoef3;
  const bearing4=r(10,170),back4=bearing4+180>360?bearing4-180:bearing4+180;
  const a5=r(30,80),b5=r(20,180-a5-30),c5=180-a5-b5;
  const co6=r(20,160);
  return [
    sq("s9-u5-r1","Determine if lines are parallel",difficulty,`A transversal crosses two lines. Corresponding angles are both ${a1}°. Are the two lines parallel? Answer yes or no.`,"yes","Equal corresponding angles indicate parallel lines.","Yes — equal corresponding angles confirm the lines are parallel."),
    sq("s9-u5-r2","Distinguish alternate from co-interior angles",difficulty,"A learner says alternate angles and co-interior angles are always equal to each other. Are alternate angles the same as co-interior angles? Answer yes or no.","no","Alternate angles are equal; co-interior angles sum to 180°.","No — they follow different rules."),
    sq("s9-u5-r3","Solve an algebraic co-interior angle problem",difficulty,`Two co-interior angles between parallel lines are x° and (${xCoef3}x + ${p3})°. Find x.`,String(q3),"Set the sum of the two expressions equal to 180° and solve.",`x+${xCoef3}x+${p3}=180, so x=${q3}.`),
    sq("s9-u5-r4","Find a bearing after a return journey",difficulty,`A ship sails on a bearing of ${bearing4}°, then returns along the reverse path. Find the bearing of the return journey.`,String(back4),"Add or subtract 180° from the outward bearing.",`Return bearing = ${back4}°.`),
    sq("s9-u5-r5","Combine multiple parallel-line facts in a triangle",difficulty,`A triangle has one angle of ${a5}° found using alternate angles, and another of ${b5}° found using co-interior angles with a parallel line. Find the third angle.`,String(c5),"Angles in a triangle sum to 180°.",`180−${a5}−${b5}=${c5}°.`),
    sq("s9-u5-r6","Correct a co-interior angle misconception",difficulty,`Two co-interior angles are ${co6}° and ${180-co6}°. A learner claims they should be equal instead. Enter the correct sum of co-interior angles.`,"180","Co-interior angles always sum to 180°, they are not equal in general.","Co-interior angles sum to 180°."),
  ];
};

const structuredFractionsS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  const recurToFrac = (digit:number) => { const g=gcdS9(digit,9); const d=9/g; return d===1?String(digit/g):`${digit/g}/${d}`; };
  if (difficulty === "foundational") {
    const commonFactor1=r(2,6),numMult1=r(2,5),denomMult1=r(2,5);
    const numTerm2a=r(1,8),numTerm2b=r(1,8),denom2=r(2,9);
    const wholeNum3=r(2,6),numer3=r(1,7),denom3=r(2,8);
    const recurDigit4=r(1,9);
    const wholePart5=r(0,3),recurDigit5=r(1,9);
    const numRecur5=wholePart5*9+recurDigit5,gRecur5=gcdS9(numRecur5,9),dRecur5=9/gRecur5;
    const commonFactor6=r(2,6),num6=r(1,8);
    return [
      sq("s9-u8-f1","Simplify an algebraic fraction",difficulty,`Simplify fully: (${commonFactor1*numMult1}x) / ${commonFactor1*denomMult1}.`,`${numMult1}x/${denomMult1}`,"Divide both numerator and denominator by their common factor.",`(${commonFactor1*numMult1}x)/${commonFactor1*denomMult1}=${numMult1}x/${denomMult1}.`),
      sq("s9-u8-f2","Add fractions with the same denominator",difficulty,`Simplify: ${numTerm2a}/${denom2} + ${numTerm2b}/${denom2}.`,`${numTerm2a+numTerm2b}/${denom2}`,"Add the numerators; the denominator stays the same.",`(${numTerm2a}+${numTerm2b})/${denom2}=${numTerm2a+numTerm2b}/${denom2}.`),
      sq("s9-u8-f3","Multiply a whole number by a fraction",difficulty,`Multiply: ${wholeNum3} × (${numer3}/${denom3}). Give your answer as a fraction (do not simplify).`,`${wholeNum3*numer3}/${denom3}`,"Multiply the whole number by the numerator only.",`${wholeNum3}×${numer3}=${wholeNum3*numer3}, over ${denom3}.`),
      sq("s9-u8-f4","Convert a recurring decimal to a fraction",difficulty,`Write 0.${recurDigit4}${recurDigit4}${recurDigit4}... (recurring) as a fraction in simplest form.`,recurToFrac(recurDigit4),"A single repeating digit d equals d/9.",`0.${recurDigit4} recurring = ${recurDigit4}/9, simplified.`),
      sq("s9-u8-f5","Convert a mixed recurring decimal to a fraction",difficulty,`Write ${wholePart5}.${recurDigit5}${recurDigit5}${recurDigit5}... (recurring) as a fraction.`,dRecur5===1?String(numRecur5/gRecur5):`${numRecur5/gRecur5}/${dRecur5}`,"Write the whole number and recurring part over 9, then simplify.",`${wholePart5}.${recurDigit5} recurring = (${wholePart5}×9+${recurDigit5})/9, simplified.`),
      sq("s9-u8-f6","Simplify a numeric fraction",difficulty,`Simplify fully: ${commonFactor6*num6} / ${commonFactor6}.`,String(num6),"Divide both terms by their common factor.",`${commonFactor6*num6}÷${commonFactor6}=${num6}.`),
    ];
  }
  if (difficulty === "application") {
    const speedDenom=r(2,6),hoursNum=r(1,8);
    const partsA=r(1,8),partsB=r(1,8),denomShared=r(2,9);
    const wholeMult=r(2,6),numer=r(1,7),denom=r(2,8);
    const recurDigit4=r(1,9);
    const totalPop=r(20,90),fracPart=r(2,6);
    const recurDigit6=r(1,9);
    return [
      sq("s9-u8-a1","Write a distance as an algebraic fraction",difficulty,`A car travels at (x/${speedDenom}) km per minute for ${hoursNum} minutes. Write an expression for the distance travelled (do not simplify).`,`${hoursNum}x/${speedDenom}`,"Multiply the speed expression by the time.",`(x/${speedDenom})×${hoursNum}=${hoursNum}x/${speedDenom}.`),
      sq("s9-u8-a2","Combine fraction parts of a recipe",difficulty,`Two ingredients make up ${partsA}/${denomShared} and ${partsB}/${denomShared} of a recipe. Find the combined fraction.`,`${partsA+partsB}/${denomShared}`,"Add the numerators; the denominator stays the same.",`${partsA}/${denomShared}+${partsB}/${denomShared}=${partsA+partsB}/${denomShared}.`),
      sq("s9-u8-a3","Scale a fraction quantity",difficulty,`A recipe requires ${wholeMult} batches of ${numer}/${denom} cup of sugar each. Write the total amount needed as a fraction (do not simplify).`,`${wholeMult*numer}/${denom}`,"Multiply the number of batches by the fraction.",`${wholeMult}×${numer}/${denom}=${wholeMult*numer}/${denom}.`),
      sq("s9-u8-a4","Convert a recurring measurement to a fraction",difficulty,`A repeating decimal reading of 0.${recurDigit4}${recurDigit4}${recurDigit4}... litres is recorded on a gauge. Write this as a fraction in simplest form.`,recurToFrac(recurDigit4),"A single repeating digit d equals d/9.",`0.${recurDigit4} recurring = ${recurDigit4}/9, simplified.`),
      sq("s9-u8-a5","Write a quantity as an algebraic fraction",difficulty,`x/${fracPart} of a population of ${totalPop*fracPart} are children. Write an expression for the number of children (do not simplify).`,`${totalPop*fracPart}x/${fracPart}`,"Multiply the population by the fraction.",`(x/${fracPart})×${totalPop*fracPart}=${totalPop*fracPart}x/${fracPart}.`),
      sq("s9-u8-a6","Convert a recurring probability to a fraction",difficulty,`A probability is calculated as 0.${recurDigit6}${recurDigit6}${recurDigit6}... recurring. Write this probability as a fraction.`,recurToFrac(recurDigit6),"A single repeating digit d equals d/9.",`0.${recurDigit6} recurring = ${recurDigit6}/9, simplified.`),
    ];
  }
  const commonFactor1=r(2,6),numMult1=r(2,6),denomMult1=r(2,6),wrongDenom1=commonFactor1*denomMult1+r(1,3);
  const digitA2=r(1,4),digitB2=r(5,9);
  let numer3=r(1,7),denom3=r(2,8); while(gcdS9(numer3,denom3)!==1){numer3=r(1,7);denom3=r(2,8);}
  const commonFactor3=r(2,6);
  const partsA4=r(1,8),partsB4=r(1,8),denomShared4=r(2,9);
  const recurDigit5=r(1,9);
  const numer6=r(2,7),denom6=numer6*r(2,4);
  return [
    sq("s9-u8-r1","Correct a simplification error",difficulty,`A learner simplifies (${commonFactor1*numMult1}x)/${commonFactor1*denomMult1} and writes ${numMult1}x/${wrongDenom1}. Enter the correct simplified fraction.`,`${numMult1}x/${denomMult1}`,"Divide both terms by their common factor.",`(${commonFactor1*numMult1}x)/${commonFactor1*denomMult1}=${numMult1}x/${denomMult1}.`),
    sq("s9-u8-r2","Compare recurring decimals",difficulty,`Compare 0.${digitA2}${digitA2}${digitA2}... recurring and 0.${digitB2}${digitB2}${digitB2}... recurring. Which is larger? Enter the recurring decimal's first digit only.`,String(digitB2),"A larger repeating digit gives a larger recurring decimal.",`0.${digitB2} recurring > 0.${digitA2} recurring.`),
    sq("s9-u8-r3","Factorise then fully simplify",difficulty,`Factorise then simplify: (${commonFactor3*numer3}) / (${commonFactor3*denom3}). Give the fraction in simplest form (as numerator/denominator, using the original variable-free numbers).`,`${numer3}/${denom3}`,"Divide both terms by their highest common factor.",`(${commonFactor3*numer3})/(${commonFactor3*denom3})=${numer3}/${denom3}.`),
    sq("s9-u8-r4","Reason about a sum compared to 1",difficulty,`Add ${partsA4}/${denomShared4} and ${partsB4}/${denomShared4}, then state whether the result is greater than, less than, or equal to 1. Enter 'greater', 'less', or 'equal'.`,(partsA4+partsB4)>denomShared4?"greater":(partsA4+partsB4)<denomShared4?"less":"equal","Add the numerators, then compare to the denominator.",`(${partsA4}+${partsB4})/${denomShared4} compared to 1.`),
    sq("s9-u8-r5","Reason about recurring decimals as rational numbers",difficulty,`Is 0.${recurDigit5}${recurDigit5}${recurDigit5}... recurring a rational number? Answer yes or no.`,"yes","Any recurring decimal can be written as a fraction of integers.","Yes — recurring decimals are always rational."),
    sq("s9-u8-r6","Evaluate an equivalent-fractions claim",difficulty,`Are ${numer6}/${denom6} and 1/${denom6/numer6} equivalent fractions? Answer yes or no.`,Number.isInteger(denom6/numer6)?"yes":"no","Simplify the first fraction and compare to the second.",`${numer6}/${denom6} simplifies to 1/${denom6/numer6}.`),
  ];
};

const PYTH_TRIPLES: [number,number,number][] = [[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[7,24,25],[20,21,29],[12,16,20]];
const structuredShapesS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const [a1,b1,c1]=PYTH_TRIPLES[r(0,PYTH_TRIPLES.length-1)],scale1=r(1,3);
    const [a2,b2,c2]=PYTH_TRIPLES[r(0,PYTH_TRIPLES.length-1)],scale2=r(1,3);
    const hyp3=r(2,10)*10;
    const hyp4=r(2,10)*10;
    const adj5=r(2,20);
    const [a6,b6,c6]=PYTH_TRIPLES[r(0,PYTH_TRIPLES.length-1)],scale6=r(1,2),wrongC6=c6*scale6+r(1,3);
    return [
      sq("s9-u7-f1","Find the hypotenuse using Pythagoras",difficulty,`A right-angled triangle has legs ${a1*scale1} cm and ${b1*scale1} cm. Find the hypotenuse.`,String(c1*scale1),"Use a²+b²=c².",`${a1*scale1}²+${b1*scale1}²=${c1*scale1}².`),
      sq("s9-u7-f2","Find a missing leg using Pythagoras",difficulty,`A right-angled triangle has hypotenuse ${c2*scale2} cm and one leg ${a2*scale2} cm. Find the other leg.`,String(b2*scale2),"Rearrange a²+b²=c² to find the missing leg.",`√(${c2*scale2}²−${a2*scale2}²)=${b2*scale2}.`),
      sq("s9-u7-f3","Use sine to find a side",difficulty,`A right-angled triangle has hypotenuse ${hyp3} cm and one angle of 30°. Using sin(30°)=0.5, find the side opposite the 30° angle.`,String(hyp3*0.5),"Opposite = hypotenuse × sin(angle).",`${hyp3}×0.5=${hyp3*0.5}.`),
      sq("s9-u7-f4","Use cosine to find a side",difficulty,`A right-angled triangle has hypotenuse ${hyp4} cm and one angle of 60°. Using cos(60°)=0.5, find the side adjacent to the 60° angle.`,String(hyp4*0.5),"Adjacent = hypotenuse × cos(angle).",`${hyp4}×0.5=${hyp4*0.5}.`),
      sq("s9-u7-f5","Use tangent to find a side",difficulty,`A right-angled triangle has one angle of 45° with an adjacent side of ${adj5} cm. Using tan(45°)=1, find the opposite side.`,String(adj5),"Opposite = adjacent × tan(angle).",`${adj5}×1=${adj5}.`),
      sq("s9-u7-f6","Test whether a triangle is right-angled",difficulty,`Could a triangle with sides ${a6*scale6}, ${b6*scale6}, ${wrongC6} be right-angled? Answer yes or no.`,"no","Check whether the two smaller sides squared sum to the largest side squared.","The sides do not satisfy Pythagoras' theorem."),
    ];
  }
  if (difficulty === "application") {
    const scale1=r(2,8),wall1=3*scale1,base1=4*scale1,ladder1=5*scale1;
    const scale2=r(2,8),w2=3*scale2,h2=4*scale2,diag2=5*scale2;
    const oppSide3=r(2,10)*10;
    const hyp4=r(2,10)*10;
    const scale5=r(2,8),legA5=3*scale5,legB5=4*scale5,hyp5=5*scale5;
    const [a6,b6,c6]=PYTH_TRIPLES[r(0,PYTH_TRIPLES.length-1)],scale6=r(1,3);
    return [
      sq("s9-u7-a1","Apply Pythagoras to a ladder problem",difficulty,`A ladder leans against a wall. The base of the ladder is ${base1} m from the wall, and the wall height reached is ${wall1} m. Find the length of the ladder.`,String(ladder1),"Use Pythagoras' theorem with the base and height as the two legs.",`√(${base1}²+${wall1}²)=${ladder1} m.`),
      sq("s9-u7-a2","Find the diagonal of a rectangle",difficulty,`A rectangular screen is ${w2} cm wide and ${h2} cm tall. Find the length of its diagonal.`,String(diag2),"Use Pythagoras' theorem with width and height as the two legs.",`√(${w2}²+${h2}²)=${diag2} cm.`),
      sq("s9-u7-a3","Use trigonometry to find a height",difficulty,`From a point on the ground, the angle of elevation to the top of a tower is 30°. The direct line of sight to the top of the tower is ${oppSide3} m. Using sin(30°)=0.5, find the height of the tower.`,String(oppSide3*0.5),"Height = line of sight × sin(30°).",`${oppSide3}×0.5=${oppSide3*0.5} m.`),
      sq("s9-u7-a4","Use trigonometry to find a horizontal distance",difficulty,`A kite string is ${hyp4} m long and makes a 60° angle with the ground. Using cos(60°)=0.5, find the horizontal distance from the person holding the string to the point directly below the kite.`,String(hyp4*0.5),"Horizontal distance = string length × cos(60°).",`${hyp4}×0.5=${hyp4*0.5} m.`),
      sq("s9-u7-a5","Find a diagonal brace length",difficulty,`A right-angled triangular support has legs ${legA5} cm and ${legB5} cm. Find the length of the diagonal brace needed.`,String(hyp5),"Use Pythagoras' theorem.",`√(${legA5}²+${legB5}²)=${hyp5} cm.`),
      sq("s9-u7-a6","Verify a right angle using a Pythagorean triple",difficulty,`A builder checks a corner using sides ${a6*scale6}, ${b6*scale6}, and ${c6*scale6} cm. Is this a right angle?`,"yes","Check whether the two smaller sides squared sum to the largest side squared.","The sides satisfy Pythagoras' theorem, confirming a right angle."),
    ];
  }
  const scale1=r(2,6),legA1=3*scale1,legB1=4*scale1,hyp1=5*scale1,wrongSum1=legA1+legB1;
  const [a2,b2,c2]=PYTH_TRIPLES[r(0,PYTH_TRIPLES.length-1)],scale2=r(1,3);
  const scale5=r(2,6),hyp5=5*scale5,extraLeg5=12*scale5,newHyp5=13*scale5,legA5=3*scale5,legB5=4*scale5;
  const scale6=r(2,6),legA6=3*scale6,legB6=4*scale6;
  return [
    sq("s9-u7-r1","Correct a Pythagoras error",difficulty,`A learner finds the hypotenuse of a right triangle with legs ${legA1} cm and ${legB1} cm by adding the legs, getting ${wrongSum1}. Enter the correct hypotenuse.`,String(hyp1),"Use a²+b²=c², not simple addition.",`√(${legA1}²+${legB1}²)=${hyp1}.`),
    sq("s9-u7-r2","Confirm a right angle from side lengths",difficulty,`A triangle has sides ${a2*scale2}, ${b2*scale2}, ${c2*scale2}. Confirm it is right-angled by checking Pythagoras' theorem. Answer yes or no.`,"yes","Check whether the two smaller sides squared sum to the largest side squared.","The sides satisfy Pythagoras' theorem."),
    sq("s9-u7-r3","Find an angle from a sine ratio",difficulty,"In a right-angled triangle, the side opposite an unknown angle is half the length of the hypotenuse. Find the angle (using sin=0.5 at 30°).","30","Recall that sin(30°)=0.5.","The angle is 30°."),
    sq("s9-u7-r4","Find an angle from a tangent ratio",difficulty,"In a right-angled triangle, the opposite and adjacent sides are equal in length. Find the angle between the adjacent side and the hypotenuse.","45","Recall that tan(45°)=1.","The angle is 45°."),
    sq("s9-u7-r5","Chain two Pythagoras calculations",difficulty,`A right-angled triangle has legs ${legA5} cm and ${legB5} cm, giving hypotenuse ${hyp5} cm. A second right triangle is attached to this hypotenuse, with the hypotenuse as one leg and another leg of ${extraLeg5} cm. Find the new hypotenuse.`,String(newHyp5),"Use Pythagoras' theorem again with the new pair of legs.",`√(${hyp5}²+${extraLeg5}²)=${newHyp5}.`),
    sq("s9-u7-r6","Name the rule for finding a hypotenuse",difficulty,`A right-angled triangle has legs ${legA6} cm and ${legB6} cm. Which trigonometric or geometric rule would you use to find the hypotenuse directly?`,["pythagoras","pythagorastheorem","pythagoreantheorem"],"This rule relates the squares of the two legs to the square of the hypotenuse.","Pythagoras' theorem."),
  ];
};

const coefN2 = (a:number) => a===1 ? "n²" : `${a}n²`;
const coefVar = (a:number, sym:string) => a===1 ? sym : `${a}${sym}`;
const signedTerm = (value:number) => value<0 ? `- ${Math.abs(value)}` : `+ ${value}`;

const structuredSequencesS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const aQuad1=r(1,3),cQuad1=r(1,9),terms1=[1,2,3,4].map(n=>aQuad1*n*n+cQuad1);
    const ratio2=[2,3][r(0,1)],start2=r(2,5),nthTerm2=start2*(ratio2**3);
    const aQuad3=r(1,3),cQuad3=r(1,9),nVal3=r(5,10);
    const t1_4=r(2,8),t2_4=t1_4*[2,3][r(0,1)];
    const aQuad5=r(1,3),cQuad5=r(1,9),secondDiff5=2*aQuad5;
    const ratio6=[2,3][r(0,1)],start6=r(2,4),nVal6=r(5,6);
    return [
      sq("s9-u9-f1","Find the next term of a quadratic sequence",difficulty,`Find the next term: ${terms1.join(", ")}, ...`,String(aQuad1*25+cQuad1),"Look at how the differences between terms are themselves changing.",`The 5th term is ${aQuad1}(5²)+${cQuad1}=${aQuad1*25+cQuad1}.`),
      sq("s9-u9-f2","Find a term of a geometric sequence",difficulty,`A geometric sequence starts at ${start2} with common ratio ${ratio2}. Find the 4th term.`,String(nthTerm2),"Multiply by the common ratio three times from the first term.",`${start2}×${ratio2}³=${nthTerm2}.`),
      sq("s9-u9-f3","Evaluate a quadratic sequence's nth term",difficulty,`A sequence has nth term ${coefN2(aQuad3)} + ${cQuad3}. Find the ${nVal3}th term.`,String(aQuad3*nVal3*nVal3+cQuad3),"Substitute the term number for n.",`${aQuad3}(${nVal3}²)+${cQuad3}=${aQuad3*nVal3*nVal3+cQuad3}.`),
      sq("s9-u9-f4","Find the common ratio of a geometric sequence",difficulty,`A geometric sequence has first term ${t1_4} and second term ${t2_4}. Find the common ratio.`,String(t2_4/t1_4),"Divide the second term by the first.",`${t2_4}÷${t1_4}=${t2_4/t1_4}.`),
      sq("s9-u9-f5","Find the second difference of a quadratic sequence",difficulty,`A sequence has nth term ${coefN2(aQuad5)} + ${cQuad5}. Find the second difference between consecutive terms.`,String(secondDiff5),"The second difference of an² + c is always 2a.",`2×${aQuad5}=${secondDiff5}.`),
      sq("s9-u9-f6","Find a later term of a geometric sequence",difficulty,`A geometric sequence starts at ${start6} with common ratio ${ratio6}. Find the ${nVal6}th term.`,String(start6*(ratio6**(nVal6-1))),"Multiply by the common ratio (n-1) times from the first term.",`${start6}×${ratio6}^${nVal6-1}=${start6*(ratio6**(nVal6-1))}.`),
    ];
  }
  if (difficulty === "application") {
    const startPop1=r(2,9)*10,ratio1=[2,3][r(0,1)],hours1=r(2,4),finalPop1=startPop1*(ratio1**hours1);
    const sideDots2=r(2,8),totalDots2=sideDots2*sideDots2;
    const startVal3=r(50,200)*4,steps3=r(2,3),finalVal3=startVal3/(2**steps3);
    const aQuad4=r(1,3),cQuad4=r(1,9),patternN4=r(6,10);
    const principal5=r(2,9)*100,ratePercent5=[10,20,25,50][r(0,3)],years5=r(2,3);
    const aQuad6=r(1,3),cQuad6=r(1,9),targetN6=r(3,7);
    return [
      sq("s9-u9-a1","Apply geometric growth",difficulty,`A bacteria culture starts at ${startPop1} and multiplies by ${ratio1} every hour. Find the population after ${hours1} hours.`,String(finalPop1),"Multiply the starting population by the ratio raised to the number of hours.",`${startPop1}×${ratio1}^${hours1}=${finalPop1}.`),
      sq("s9-u9-a2","Apply a quadratic pattern",difficulty,`A square pattern has ${sideDots2} dots along each side, arranged in a full square grid. Find the total number of dots.`,String(totalDots2),"Square the number of dots along one side.",`${sideDots2}²=${totalDots2}.`),
      sq("s9-u9-a3","Apply geometric decay",difficulty,`A radioactive sample starts at ${startVal3} g and halves every hour. Find the mass after ${steps3} hours.`,String(finalVal3),"Divide by 2 for each hour that passes.",`${startVal3}÷2^${steps3}=${finalVal3}.`),
      sq("s9-u9-a4","Apply a quadratic sequence in context",difficulty,`A tiling pattern has ${coefN2(aQuad4)} + ${cQuad4} tiles in row n. Find the number of tiles in row ${patternN4}.`,String(aQuad4*patternN4*patternN4+cQuad4),"Substitute the row number for n.",`${aQuad4}(${patternN4}²)+${cQuad4}=${aQuad4*patternN4*patternN4+cQuad4}.`),
      sq("s9-u9-a5","Apply geometric growth to compound interest",difficulty,`R${principal5} is invested at a growth rate that multiplies the amount by ${1+ratePercent5/100} each year (${ratePercent5}% growth). Find the value after ${years5} years.`,String(Math.round(principal5*((1+ratePercent5/100)**years5)*100)/100),"Multiply the principal by the growth factor raised to the number of years.",`R${principal5}×${1+ratePercent5/100}^${years5}.`),
      sq("s9-u9-a6","Apply a quadratic sequence to area growth",difficulty,`A sequence models the area of a growing pattern: ${coefN2(aQuad6)} + ${cQuad6}. Find the area at stage ${targetN6}.`,String(aQuad6*targetN6*targetN6+cQuad6),"Substitute the stage number for n.",`${aQuad6}(${targetN6}²)+${cQuad6}=${aQuad6*targetN6*targetN6+cQuad6}.`),
    ];
  }
  const aQuad1=r(1,3),cQuad1=r(1,9);
  const start2=r(2,5),ratio2=[2,3][r(0,1)],targetVal2=start2*(ratio2**4);
  const aQuad3=r(1,3),cQuad3=r(1,9),wrongDiff3=2*aQuad3+r(1,3);
  const start4=r(2,4),ratio4=[2,3][r(0,1)];
  const ratio5=[2,3][r(0,1)],start5=r(2,4);
  const aQuad6=r(1,3),cQuad6=r(1,9),n6=r(4,8);
  return [
    sq("s9-u9-r1","Classify a sequence as linear or quadratic",difficulty,`A sequence has nth term ${coefN2(aQuad1)} + ${cQuad1}. Is this a linear or quadratic sequence?`,"quadratic","A squared term in the nth term makes it quadratic.","The n² term makes this a quadratic sequence."),
    sq("s9-u9-r2","Find which term first exceeds a value",difficulty,`A geometric sequence starts at ${start2} with common ratio ${ratio2}. Which term number first exceeds ${targetVal2-1}?`,"5","Work out consecutive terms until one exceeds the target.",`The 5th term is ${targetVal2}, which exceeds ${targetVal2-1}.`),
    sq("s9-u9-r3","Correct a second-difference error",difficulty,`A learner says the sequence with nth term ${coefN2(aQuad3)} + ${cQuad3} has a constant second difference of ${wrongDiff3}. Enter the correct second difference.`,String(2*aQuad3),"The second difference of an² + c is always 2a.",`2×${aQuad3}=${2*aQuad3}.`),
    sq("s9-u9-r4","Reason about increasing or decreasing geometric sequences",difficulty,`A geometric sequence starts at ${start4} with common ratio ${ratio4}. Is the sequence increasing or decreasing?`,[ratio4>1?"increasing":"decreasing"],"A ratio greater than 1 makes terms grow; less than 1 makes them shrink.",`A ratio of ${ratio4} means the sequence is ${ratio4>1?"increasing":"decreasing"}.`),
    sq("s9-u9-r5","Find the sum of terms in a geometric sequence",difficulty,`A geometric sequence has first term ${start5} and common ratio ${ratio5}. Find the sum of the first 3 terms.`,String(start5+start5*ratio5+start5*ratio5*ratio5),"Add the first three terms individually.",`${start5}+${start5*ratio5}+${start5*ratio5*ratio5}=${start5+start5*ratio5+start5*ratio5*ratio5}.`),
    sq("s9-u9-r6","Correct a linear-vs-quadratic misconception",difficulty,`A sequence has nth term ${coefN2(aQuad6)} + ${cQuad6}. A learner assumes it is linear and predicts the ${n6}th term by adding a constant difference each time. Find the actual ${n6}th term.`,String(aQuad6*n6*n6+cQuad6),"Substitute the term number directly into the quadratic formula.",`${aQuad6}(${n6}²)+${cQuad6}=${aQuad6*n6*n6+cQuad6}.`),
  ];
};

const structuredGraphsS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const cQuad1=r(1,9),xVal1=r(2,6),yVal1=xVal1*xVal1+cQuad1;
    const aQuad2=r(2,4),xVal2=r(2,5),yVal2=aQuad2*xVal2*xVal2;
    const bLin3=r(1,9),cQuad3=r(1,9);
    const diffCoef4=r(2,4),xSol4=r(2,8);
    const rootA5=r(1,6),rootB5=r(1,6);
    const cQuad6=r(-9,-1);
    return [
      sq("s9-u10-f1","Evaluate a quadratic function",difficulty,`For y = x² + ${cQuad1}, find y when x = ${xVal1}.`,String(yVal1),"Square x, then add the constant.",`${xVal1}²+${cQuad1}=${yVal1}.`),
      sq("s9-u10-f2","Evaluate y=ax²",difficulty,`For y = ${aQuad2}x², find y when x = ${xVal2}.`,String(yVal2),"Square x, then multiply by the coefficient.",`${aQuad2}×${xVal2}²=${yVal2}.`),
      sq("s9-u10-f3","Find the y-intercept of a quadratic",difficulty,`Find the y-intercept of y = x² + ${bLin3}x + ${cQuad3}.`,String(cQuad3),"The y-intercept is the constant term.",`The y-intercept is ${cQuad3}.`),
      sq("s9-u10-f4","Solve simultaneous equations by substitution",difficulty,`Solve simultaneously: y = ${diffCoef4}x, and x + y = ${xSol4 + xSol4*diffCoef4}. Find x.`,String(xSol4),"Substitute y = kx into the second equation and solve for x.",`x(1+${diffCoef4})=${xSol4 + xSol4*diffCoef4}, so x=${xSol4}.`),
      sq("s9-u10-f5","Write a quadratic in factorised form",difficulty,`A quadratic graph crosses the x-axis at x = ${rootA5} and x = -${rootB5}. Write the factorised equation in the form (x - a)(x + b) = 0.`,[`(x-${rootA5})(x+${rootB5})`,`(x - ${rootA5})(x + ${rootB5})`],"Each root gives one factor of the equation.",`Roots at ${rootA5} and -${rootB5} give (x-${rootA5})(x+${rootB5})=0.`),
      sq("s9-u10-f6","Find the minimum value of a quadratic",difficulty,`For y = x² ${signedTerm(cQuad6)}, find the minimum value of y.`,String(cQuad6),"The minimum of x² + c occurs at x=0, giving y=c.",`The minimum value is ${cQuad6}.`),
    ];
  }
  if (difficulty === "application") {
    const initHeight1=r(1,9)*10,timeVal1=r(2,5),dropCoef1=r(1,3),height1=initHeight1-dropCoef1*timeVal1*timeVal1;
    const sideLen2=r(2,10);
    const priceA3=r(2,9),priceB3=r(2,9),qtyA3=r(1,5),qtyB3=r(1,5),total3=priceA3*qtyA3+priceB3*qtyB3;
    const cQuad4=r(1,9),xForTargetY4=r(2,8),targetY4=xForTargetY4*xForTargetY4+cQuad4;
    const costFixed5=r(10,50),costPerItem5=r(2,9),qty5=r(2,8),total5=costFixed5+costPerItem5*qty5;
    const aQuad6=r(1,3),cQuad6=r(1,9);
    return [
      sq("s9-u10-a1","Apply a quadratic height model",difficulty,`A ball's height is modelled by h = ${initHeight1} - ${dropCoef1}t², where t is time in seconds. Find the height after ${timeVal1} seconds.`,String(height1),"Square the time, multiply by the coefficient, then subtract from the initial height.",`${initHeight1}−${dropCoef1}(${timeVal1}²)=${height1}.`),
      sq("s9-u10-a2","Write and evaluate an area function",difficulty,`A square garden has side length ${sideLen2} m. Write an expression for its area in the form y = x², then evaluate it for x = ${sideLen2}.`,String(sideLen2*sideLen2),"Square the side length.",`${sideLen2}²=${sideLen2*sideLen2}.`),
      sq("s9-u10-a3","Verify a total cost equation",difficulty,`${qtyA3} apples at R${priceA3} each and ${qtyB3} oranges at R${priceB3} each cost a total of R${total3}. If apples cost R${priceA3} each, write this as an equation and confirm the total.`,String(total3),"Multiply each price by its quantity, then add.",`${qtyA3}×R${priceA3}+${qtyB3}×R${priceB3}=R${total3}.`),
      sq("s9-u10-a4","Solve a quadratic for x",difficulty,`For y = x² + ${cQuad4}, find a positive value of x that gives y = ${targetY4}.`,String(xForTargetY4),"Subtract the constant, then take the square root.",`√(${targetY4}−${cQuad4})=${xForTargetY4}.`),
      sq("s9-u10-a5","Apply a linear cost model",difficulty,`A phone plan costs R${costFixed5} plus R${costPerItem5} per GB. Find the total cost for ${qty5} GB.`,String(total5),"Multiply the rate by the amount, then add the fixed cost.",`R${costFixed5}+${qty5}×R${costPerItem5}=R${total5}.`),
      sq("s9-u10-a6","Apply a quadratic model in context",difficulty,`A ball's height follows y = ${coefVar(aQuad6,"x²")} + ${cQuad6} (in metres, x = time in seconds). Find the height at x = 3 seconds.`,String(aQuad6*9+cQuad6),"Substitute x=3 into the formula.",`${aQuad6}(3²)+${cQuad6}=${aQuad6*9+cQuad6}.`),
    ];
  }
  const coefY1=r(2,5),xSol1=r(2,8),sumTotal1=xSol1+xSol1*coefY1;
  const cQuad2=r(1,9),xVal2=r(2,7),yVal2=xVal2*xVal2+cQuad2;
  const bLin3=r(1,9),wrongIntercept3=r(1,9);
  const coefA4=r(2,4),coefB4=r(2,4);
  const aQuad5=r(1,3),cQuad5=r(1,9);
  const cQuad6=r(-9,-1);
  return [
    sq("s9-u10-r1","Solve simultaneous equations for y",difficulty,`Solve simultaneously: y = ${coefY1}x, and x + y = ${sumTotal1}. Find y.`,String(xSol1*coefY1),"Find x first, then substitute to find y.",`x=${xSol1}, so y=${coefY1}×${xSol1}=${xSol1*coefY1}.`),
    sq("s9-u10-r2","Use quadratic symmetry",difficulty,`For y = x² + ${cQuad2}, if x = ${xVal2} gives y = ${yVal2}, what other value of x also gives y = ${yVal2}?`,String(-xVal2),"A quadratic graph is symmetric about x=0.",`x=-${xVal2} gives the same y-value.`),
    sq("s9-u10-r3","Correct a y-intercept error",difficulty,`A learner says the y-intercept of y = x² + ${bLin3}x + ${wrongIntercept3} is ${bLin3}. Enter the correct y-intercept.`,String(wrongIntercept3),"The y-intercept is the constant term, not the coefficient of x.",`The y-intercept is ${wrongIntercept3}.`),
    sq("s9-u10-r4","Reason about lines with a shared intercept",difficulty,`Two lines y = ${coefA4}x + 5 and y = ${coefB4}x + 5 are graphed. At what x-value do they always intersect (regardless of the coefficients, since they share this point)?`,"0","Both lines share the same y-intercept.","They intersect at x=0, where both give y=5."),
    sq("s9-u10-r5","Reason about a quadratic's minimum",difficulty,`For y = ${coefVar(aQuad5,"x²")} + ${cQuad5}, is the minimum value of y equal to ${cQuad5}? Answer yes or no.`,"yes","The minimum of ax² + c (for positive a) occurs at x=0.","Yes — the minimum value is always the constant term."),
    sq("s9-u10-r6","Reason about x-axis intersections",difficulty,`For y = x² ${signedTerm(cQuad6)}, a learner says the graph never crosses the x-axis. Is this correct? Answer yes or no.`,"no","A negative constant means the graph dips below the x-axis.","No — since the constant is negative, the graph does cross the x-axis."),
  ];
};

const structuredRatioS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const time1=r(2,8),speed1=r(10,90),dist1=speed1*time1;
    const vol2=r(2,10),density2=r(2,9),mass2=density2*vol2;
    const area3=r(2,10),pressure3=r(2,15),force3=pressure3*area3;
    const speed4=r(2,9)*10,time4=r(2,8),dist4=speed4*time4;
    const density5=r(2,9),vol5=r(2,10),mass5=density5*vol5;
    const densityKgM6=r(2,9)*1000;
    return [
      sq("s9-u11-f1","Calculate speed",difficulty,`A car travels ${dist1} km in ${time1} hours. Find its average speed in km/h.`,String(dist1/time1),"Divide distance by time.",`${dist1}÷${time1}=${dist1/time1} km/h.`),
      sq("s9-u11-f2","Calculate density",difficulty,`An object has mass ${mass2} g and volume ${vol2} cm³. Find its density in g/cm³.`,String(density2),"Divide mass by volume.",`${mass2}÷${vol2}=${density2} g/cm³.`),
      sq("s9-u11-f3","Calculate pressure",difficulty,`A force of ${force3} N acts on an area of ${area3} m². Find the pressure in N/m².`,String(pressure3),"Divide force by area.",`${force3}÷${area3}=${pressure3} N/m².`),
      sq("s9-u11-f4","Calculate distance from speed and time",difficulty,`A car travels at ${speed4} km/h for ${time4} hours. Find the distance travelled.`,String(dist4),"Multiply speed by time.",`${speed4}×${time4}=${dist4} km.`),
      sq("s9-u11-f5","Calculate mass from density and volume",difficulty,`A material has density ${density5} g/cm³ and volume ${vol5} cm³. Find its mass.`,String(mass5),"Multiply density by volume.",`${density5}×${vol5}=${mass5} g.`),
      sq("s9-u11-f6","Convert density units",difficulty,`Convert a density of ${densityKgM6} kg/m³ to g/cm³.`,String(densityKgM6/1000),"Divide by 1000 to convert kg/m³ to g/cm³.",`${densityKgM6}÷1000=${densityKgM6/1000} g/cm³.`),
    ];
  }
  if (difficulty === "application") {
    const time1=r(2,6),speed1=r(60,120),dist1=speed1*time1;
    const vol2=r(2,8),density2=[2,3,7,8][r(0,3)],mass2=density2*vol2;
    const area3=r(2,8),pressure3=r(20,100),force3=pressure3*area3;
    const speed4=r(20,80),timeAns4=r(2,8),dist4=speed4*timeAns4;
    const density5=[8,11][r(0,1)],vol5=r(2,10),mass5=density5*vol5;
    const pressure6=r(2,10),areaAns6=r(2,20),force6=pressure6*areaAns6;
    return [
      sq("s9-u11-a1","Calculate distance in context",difficulty,`A train travels at ${speed1} km/h for ${time1} hours. Find the distance travelled.`,String(dist1),"Multiply speed by time.",`${speed1}×${time1}=${dist1} km.`),
      sq("s9-u11-a2","Calculate mass in context",difficulty,`A metal block has density ${density2} g/cm³ and volume ${vol2} cm³. Find its mass.`,String(mass2),"Multiply density by volume.",`${density2}×${vol2}=${mass2} g.`),
      sq("s9-u11-a3","Calculate pressure in context",difficulty,`A force of ${force3} N is applied over an area of ${area3} m². Find the pressure.`,String(pressure3),"Divide force by area.",`${force3}÷${area3}=${pressure3} N/m².`),
      sq("s9-u11-a4","Calculate time from distance and speed",difficulty,`A cyclist travels ${dist4} km at a speed of ${speed4} km/h. Find the time taken (in hours).`,String(timeAns4),"Divide distance by speed.",`${dist4}÷${speed4}=${timeAns4} hours.`),
      sq("s9-u11-a5","Calculate mass in a real-world context",difficulty,`A gold bar has density ${density5} g/cm³. If its volume is ${vol5} cm³, find its mass.`,String(mass5),"Multiply density by volume.",`${density5}×${vol5}=${mass5} g.`),
      sq("s9-u11-a6","Calculate area from force and pressure",difficulty,`A force of ${force6} N is spread over an area, creating a pressure of ${pressure6} N/m². Find the area.`,String(areaAns6),"Divide force by pressure.",`${force6}÷${pressure6}=${areaAns6} m².`),
    ];
  }
  const time1=r(2,8),speedAns1=r(30,90),dist1=speedAns1*time1,wrongSpeed1=dist1*time1;
  const densityA2=[8,11][r(0,1)],densityB2=[2,3][r(0,1)],vol2=r(4,10);
  const speed3=r(40,100),time3=r(2,6),dist3=speed3*time3;
  const pressure4=r(2,8),area4=r(2,10),force4=pressure4*area4;
  const density5=r(2,9),vol5=r(2,8),mass5=density5*vol5;
  const speed6=r(30,90),time6=r(2,6);
  return [
    sq("s9-u11-r1","Correct a speed-calculation error",difficulty,`A learner finds speed by multiplying distance and time instead of dividing, getting ${wrongSpeed1} for a journey of ${dist1} km in ${time1} hours. Enter the correct speed.`,String(speedAns1),"Speed is distance divided by time, not multiplied.",`${dist1}÷${time1}=${speedAns1} km/h.`),
    sq("s9-u11-r2","Compare densities at equal volume",difficulty,`Material A has density ${densityA2} g/cm³ and Material B has density ${densityB2} g/cm³. For the same volume of ${vol2} cm³, which material has the greater mass, A or B?`,[densityA2>densityB2?"a":"b","material a"],"A higher density means more mass for the same volume.","Material A has the greater density, so the greater mass."),
    sq("s9-u11-r3","State a compound measure with correct units",difficulty,`A car travels ${dist3} km in ${time3} hours. A learner calculates the speed but forgets the units. State the correct speed with units (km/h).`,[`${speed3}km/h`,`${speed3} km/h`],"Divide distance by time, and don't forget the units.",`${dist3}÷${time3}=${speed3} km/h.`),
    sq("s9-u11-r4","Reason about pressure and area",difficulty,`Given force = ${force4} N and area = ${area4} m², find the pressure, then state whether increasing the area would increase or decrease the pressure (for the same force).`,"decrease","Pressure is inversely related to area for a fixed force.","Increasing the area, with force fixed, decreases the pressure."),
    sq("s9-u11-r5","Correct a volume-calculation error",difficulty,`An object has density ${density5} g/cm³ and mass ${mass5} g. A learner tries to find the volume by multiplying density and mass. Enter the correct volume.`,String(vol5),"Volume is mass divided by density, not multiplied.",`${mass5}÷${density5}=${vol5} cm³.`),
    sq("s9-u11-r6","Reason about proportional change in distance",difficulty,`A car travels at ${speed6} km/h. If the time is doubled from ${time6} hours, does the distance travelled double, triple, or stay the same?`,"double","Distance is directly proportional to time for constant speed.","Doubling the time doubles the distance."),
  ];
};

const structuredProbabilityS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  const gcdPS9=(a:number,b:number):number=>b===0?a:gcdPS9(b,a%b);
  const fracPS9=(n:number,d:number)=>{const g=gcdPS9(Math.abs(n),d)||1;return{n:n/g,d:d/g};};
  const fstrPS9=(f:{n:number,d:number})=>f.d===1?String(f.n):`${f.n}/${f.d}`;
  const fdecPS9=(f:{n:number,d:number})=>Number((f.n/f.d).toFixed(10)).toString();
  if (difficulty === "foundational") {
    const pA1=fracPS9(r(1,3),[3,4,5][r(0,2)]),pB1=fracPS9(r(1,3),[3,4,5][r(0,2)]),pBoth1=fracPS9(pA1.n*pB1.n,pA1.d*pB1.d);
    const pFail2a=fracPS9(r(1,3),[3,4][r(0,1)]),pFail2b=fracPS9(r(1,3),[3,4][r(0,1)]),pNoneFail2=fracPS9(pFail2a.n*pFail2b.n,pFail2a.d*pFail2b.d),pAtLeastOne2=fracPS9(pNoneFail2.d-pNoneFail2.n,pNoneFail2.d);
    const redN3=r(2,5),blueN3=r(2,5),totalN3=redN3+blueN3,pBothRed3=fracPS9(redN3*(redN3-1),totalN3*(totalN3-1));
    const denomA5=[4,5][r(0,1)],pA5=fracPS9(r(1,denomA5-1),denomA5),denomB5=[4,5][r(0,1)],pB5=fracPS9(r(1,denomB5-1),denomB5);
    const pKnown6a=fracPS9(r(1,3),[4,5][r(0,1)]);
    return [
      sq("s9-u12-f1","Combine independent probabilities with a tree diagram",difficulty,`Two independent events have probabilities ${fstrPS9(pA1)} and ${fstrPS9(pB1)}. Using a tree diagram, find P(both occur).`,[fstrPS9(pBoth1),fdecPS9(pBoth1)],"Multiply along the branches of the tree.",`${fstrPS9(pA1)}×${fstrPS9(pB1)}=${fstrPS9(pBoth1)}.`),
      sq("s9-u12-f2","Find P(at least one) using the complement",difficulty,`Two independent tasks each have a failure probability of ${fstrPS9(pFail2a)} and ${fstrPS9(pFail2b)}. Find the probability at least one fails.`,[fstrPS9(pAtLeastOne2),fdecPS9(pAtLeastOne2)],"Find P(neither fails) first, then subtract from 1.",`1−(${fstrPS9(pFail2a)}×${fstrPS9(pFail2b)} success chance)=${fstrPS9(pAtLeastOne2)}.`),
      sq("s9-u12-f3","Find probability without replacement",difficulty,`A bag has ${redN3} red and ${blueN3} blue counters. Two are drawn without replacement. Find P(both red).`,[fstrPS9(pBothRed3),fdecPS9(pBothRed3)],"The second draw's probability changes since a counter is removed.",`(${redN3}/${totalN3})×(${redN3-1}/${totalN3-1})=${fstrPS9(pBothRed3)}.`),
      sq("s9-u12-f4","Find P(exactly one) from two events",difficulty,"Two fair coins are tossed. Find P(exactly one head).",["1/2","0.5"],"List the outcomes: HH, HT, TH, TT.","HT and TH both give exactly one head, so P=2/4=1/2."),
      sq("s9-u12-f5","Combine three independent probabilities",difficulty,`Event A has probability ${fstrPS9(pA5)}, event B has probability ${fstrPS9(pB5)}, and event C is certain. Find P(A and B and C), assuming independence.`,[fstrPS9(fracPS9(pA5.n*pB5.n,pA5.d*pB5.d)),fdecPS9(fracPS9(pA5.n*pB5.n,pA5.d*pB5.d))],"Multiply all three probabilities; a certain event has probability 1.",`${fstrPS9(pA5)}×${fstrPS9(pB5)}×1=${fstrPS9(fracPS9(pA5.n*pB5.n,pA5.d*pB5.d))}.`),
      sq("s9-u12-f6","Find a complementary branch probability",difficulty,`In a tree diagram, one branch has probability ${fstrPS9(pKnown6a)}. Find the probability of the complementary branch.`,[fstrPS9(fracPS9(pKnown6a.d-pKnown6a.n,pKnown6a.d)),fdecPS9(fracPS9(pKnown6a.d-pKnown6a.n,pKnown6a.d))],"Complementary branches sum to 1.",`1−${fstrPS9(pKnown6a)}=${fstrPS9(fracPS9(pKnown6a.d-pKnown6a.n,pKnown6a.d))}.`),
    ];
  }
  if (difficulty === "application") {
    const pRain1=fracPS9(r(1,3),[4,5][r(0,1)]),pRainBoth1=fracPS9(pRain1.n*pRain1.n,pRain1.d*pRain1.d);
    const pDefect2=fracPS9(1,r(8,12)),pNoDefect2Sq=fracPS9((pDefect2.d-pDefect2.n)*(pDefect2.d-pDefect2.n),pDefect2.d*pDefect2.d),pAtLeastOneDefect2=fracPS9(pNoDefect2Sq.d-pNoDefect2Sq.n,pNoDefect2Sq.d);
    const totalBalls3=r(6,12),redBalls3=r(2,4),pBothRed3=fracPS9(redBalls3*(redBalls3-1),totalBalls3*(totalBalls3-1));
    const pPass4=fracPS9(r(2,4),5),pFailBoth4=fracPS9((5-pPass4.n)*(5-pPass4.n),25);
    const totalCards5=52,heartCards5=13,pBothHearts5=fracPS9(heartCards5*(heartCards5-1),totalCards5*(totalCards5-1));
    const outcomes6:[{n:number,d:number},{n:number,d:number},{n:number,d:number}]=[fracPS9(1,4),fracPS9(1,4),fracPS9(1,2)];
    return [
      sq("s9-u12-a1","Apply independent-event probability in context",difficulty,`The probability of rain on any given day is ${fstrPS9(pRain1)}. Find the probability it rains on both of the next two days (assume independence).`,[fstrPS9(pRainBoth1),fdecPS9(pRainBoth1)],"Multiply the daily probability by itself.",`${fstrPS9(pRain1)}×${fstrPS9(pRain1)}=${fstrPS9(pRainBoth1)}.`),
      sq("s9-u12-a2","Apply the at-least-one rule in context",difficulty,`A factory finds ${fstrPS9(pDefect2)} of items are defective. Two items are tested independently. Find the probability at least one is defective.`,[fstrPS9(pAtLeastOneDefect2),fdecPS9(pAtLeastOneDefect2)],"Find P(neither defective) first, then subtract from 1.",`1−P(neither defective)=${fstrPS9(pAtLeastOneDefect2)}.`),
      sq("s9-u12-a3","Apply without-replacement probability in context",difficulty,`A box has ${totalBalls3} balls, ${redBalls3} of which are red. Two balls are drawn without replacement. Find P(both red).`,[fstrPS9(pBothRed3),fdecPS9(pBothRed3)],"The second draw's probability changes after the first ball is removed.",`(${redBalls3}/${totalBalls3})×(${redBalls3-1}/${totalBalls3-1})=${fstrPS9(pBothRed3)}.`),
      sq("s9-u12-a4","Apply combined-failure probability",difficulty,`The probability of passing a test is ${fstrPS9(pPass4)}. Two students take the test independently. Find the probability both fail.`,[fstrPS9(pFailBoth4),fdecPS9(pFailBoth4)],"Find the failure probability first, then square it.",`(1−${fstrPS9(pPass4)})²=${fstrPS9(pFailBoth4)}.`),
      sq("s9-u12-a5","Apply without-replacement probability with cards",difficulty,"Two cards are drawn without replacement from a standard 52-card deck. Find P(both are hearts).",[fstrPS9(pBothHearts5),fdecPS9(pBothHearts5)],"The second draw's probability changes after the first card is removed.",`(13/52)×(12/51)=${fstrPS9(pBothHearts5)}.`),
      sq("s9-u12-a6","Verify probabilities sum to 1",difficulty,`A spinner has three outcomes with probabilities ${fstrPS9(outcomes6[0])}, ${fstrPS9(outcomes6[1])} and ${fstrPS9(outcomes6[2])}. Do these probabilities sum to 1? Answer yes or no.`,"yes","Add all the probabilities together.","1/4+1/4+1/2=1, so yes."),
    ];
  }
  const pBoth1=fracPS9(1,r(8,20)),pA1=fracPS9(1,[3,4][r(0,1)]),pB1=fracPS9(pBoth1.n*pA1.d,pBoth1.d*pA1.n);
  const denomA2=[4,5][r(0,1)],pA2=fracPS9(r(1,denomA2-1),denomA2);
  const totalBalls3=r(6,10),redBalls3=r(2,4);
  const pFail4=fracPS9(r(1,3),[4,5][r(0,1)]);
  const pA5=fracPS9(r(1,3),[3,4][r(0,1)]),pB5=fracPS9(r(1,3),[3,4][r(0,1)]);
  const totalCards6=52,heartCards6=13;
  return [
    sq("s9-u12-r1","Reverse a combined-probability calculation",difficulty,`Two independent events A and B have P(A and B) = ${fstrPS9(pBoth1)}. If P(A) = ${fstrPS9(pA1)}, find P(B).`,[fstrPS9(pB1),fdecPS9(pB1)],"Divide P(A and B) by P(A).",`${fstrPS9(pBoth1)}÷${fstrPS9(pA1)}=${fstrPS9(pB1)}.`),
    sq("s9-u12-r2","Distinguish with and without replacement",difficulty,`A learner says drawing two balls "without replacement" gives the same probability as drawing "with replacement". Is this correct? Answer yes or no.`,"no","Without replacement changes the total and favourable counts for the second draw.","No — without replacement changes the probabilities."),
    sq("s9-u12-r3","Reason about changing probabilities without replacement",difficulty,`A bag has ${totalBalls3} balls, ${redBalls3} red. State whether drawing two balls without replacement changes the probability of the second draw compared to the first. Answer yes or no.`,"yes","Removing a ball changes both the favourable and total counts.","Yes — the second draw's probability depends on the first."),
    sq("s9-u12-r4","Distinguish at-least-one from both",difficulty,`An event has failure probability ${fstrPS9(pFail4)}. A learner claims "at least one fails in two trials" has the same probability as "both fail". Is this correct? Answer yes or no.`,"no","At least one includes cases where only one fails, not just both.","No — 'at least one' includes more outcomes than 'both'."),
    sq("s9-u12-r5","Reason about order in independent events",difficulty,`Two independent events have probabilities ${fstrPS9(pA5)} and ${fstrPS9(pB5)}. Does the order in which they occur affect P(A and B)? Answer yes or no.`,"no","Multiplication is commutative, so order doesn't matter for independent events.","No — P(A and B) is the same regardless of order."),
    sq("s9-u12-r6","Reason about dependence without replacement",difficulty,`Two cards are drawn without replacement from a ${totalCards6}-card deck containing ${heartCards6} hearts. Does the probability of the second card being a heart depend on the result of the first draw? Answer yes or no.`,"yes","Removing the first card changes the counts for the second draw.","Yes — the outcome of the first draw affects the second."),
  ];
};

const structuredTransformationsS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const px1=r(-6,6),py1=r(-6,6),v1x=r(-4,4),v1y=r(-4,4),v2x=r(-4,4),v2y=r(-4,4);
    const px2=r(-6,6),py2=r(-6,6);
    const negScale3=-1*r(1,3),side3=r(2,10);
    const fracScaleDenom4=[2,3,4][r(0,2)],side4=fracScaleDenom4*r(2,5);
    const vx5=r(-5,5),vy5=r(-5,5);
    const px6=r(-6,6),py6=r(-6,6);
    return [
      sq("s9-u13-f1","Combine two translations",difficulty,`Translate (${px1},${py1}) by (${v1x},${v1y}), then by (${v2x},${v2y}). Find the final coordinate.`,[`(${px1+v1x+v2x},${py1+v1y+v2y})`,`${px1+v1x+v2x},${py1+v1y+v2y}`],"Add all the vector components together.",`(${px1}+${v1x}+${v2x}, ${py1}+${v1y}+${v2y}).`),
      sq("s9-u13-f2","Combine two reflections",difficulty,`Reflect (${px2},${py2}) in the x-axis, then in the y-axis. Find the final coordinate.`,[`(${-px2},${-py2})`,`${-px2},${-py2}`],"Apply each reflection in turn.",`(${px2},${py2})→(${px2},${-py2})→(${-px2},${-py2}).`),
      sq("s9-u13-f3","Apply a negative scale factor",difficulty,`An enlargement has scale factor ${negScale3} (centre the origin). A side of length ${side3} cm maps to what length?`,String(Math.abs(negScale3)*side3),"Use the absolute value of the scale factor for length.",`|${negScale3}|×${side3}=${Math.abs(negScale3)*side3}.`),
      sq("s9-u13-f4","Apply a fractional scale factor",difficulty,`An enlargement has scale factor 1/${fracScaleDenom4}. A side of length ${side4} cm maps to what length?`,String(side4/fracScaleDenom4),"Multiply (or divide) by the fractional scale factor.",`${side4}÷${fracScaleDenom4}=${side4/fracScaleDenom4}.`),
      sq("s9-u13-f5","Describe a translation vector",difficulty,`Describe the vector for a translation that moves a point ${vx5} units in x and ${vy5} units in y.`,[`(${vx5},${vy5})`,`${vx5},${vy5}`],"Write the x and y movements as a column or coordinate pair.",`The vector is (${vx5},${vy5}).`),
      sq("s9-u13-f6","Combine a rotation and a reflection",difficulty,`Rotate (${px6},${py6}) 180° about the origin, then reflect the result in the x-axis. Find the final coordinate.`,[`(${-px6},${py6})`,`${-px6},${py6}`],"Apply the rotation first, then the reflection.",`(${px6},${py6})→(${-px6},${-py6})→(${-px6},${py6}).`),
    ];
  }
  if (difficulty === "application") {
    const px1=r(-6,6),py1=r(-6,6),v1x=r(-4,4),v1y=r(-4,4);
    const negScale2=-1*r(1,3),side2=r(2,10);
    const fracScaleDenom3=[2,3,4][r(0,2)],side3=fracScaleDenom3*r(2,6);
    const px4=r(-6,6),py4=r(-6,6);
    const origLen5=r(2,4)*r(2,3),newLen5=origLen5*[2,3][r(0,1)];
    const px6=r(-6,6),py6=r(-6,6),vx6=r(-4,4),vy6=r(-4,4);
    return [
      sq("s9-u13-a1","Apply a combined translation and reflection",difficulty,`A game piece at (${px1},${py1}) moves by (${v1x},${v1y}), then is reflected in the x-axis. Find the final position.`,[`(${px1+v1x},${-(py1+v1y)})`,`${px1+v1x},${-(py1+v1y)}`],"Apply the translation first, then the reflection.",`(${px1+v1x},${py1+v1y})→(${px1+v1x},${-(py1+v1y)}).`),
      sq("s9-u13-a2","Apply a negative scale factor in context",difficulty,`A logo is enlarged by scale factor ${negScale2} through its centre point. A feature of length ${side2} cm maps to what length (the image is inverted but find the size)?`,String(Math.abs(negScale2)*side2),"Use the absolute value of the scale factor for the size.",`|${negScale2}|×${side2}=${Math.abs(negScale2)*side2}.`),
      sq("s9-u13-a3","Apply a fractional scale factor in context",difficulty,`A model is built at scale factor 1/${fracScaleDenom3} of the real object. A real feature of length ${side3} cm appears at what length in the model?`,String(side3/fracScaleDenom3),"Divide by the scale factor's denominator.",`${side3}÷${fracScaleDenom3}=${side3/fracScaleDenom3}.`),
      sq("s9-u13-a4","Combine a reflection and a rotation in context",difficulty,`A shape's corner at (${px4},${py4}) is reflected in the y-axis, then rotated 180° about the origin. Find the final coordinate.`,[`(${px4},${-py4})`,`${px4},${-py4}`],"Apply the reflection first, then the rotation.",`(${px4},${py4})→(${-px4},${py4})→(${px4},${-py4}).`),
      sq("s9-u13-a5","Find a scale factor from lengths",difficulty,`A photo enlarged from ${origLen5} cm to ${newLen5} cm. Find the scale factor.`,String(newLen5/origLen5),"Divide the new length by the original.",`${newLen5}÷${origLen5}=${newLen5/origLen5}.`),
      sq("s9-u13-a6","Combine a translation and a reflection",difficulty,`A point at (${px6},${py6}) is translated by (${vx6},${vy6}), then reflected in the y-axis. Find the final position.`,[`(${-(px6+vx6)},${py6+vy6})`,`${-(px6+vx6)},${py6+vy6}`],"Apply the translation first, then the reflection.",`(${px6+vx6},${py6+vy6})→(${-(px6+vx6)},${py6+vy6}).`),
    ];
  }
  const finalX1=r(-6,6),finalY1=r(-6,6),v1x=r(-4,4),v1y=r(-4,4),v2x=r(-4,4),v2y=r(-4,4);
  const negScale2=-1*r(1,4);
  const posScale3=r(2,4),wrongLen3=r(2,10);
  const px4=r(-6,6),py4=r(-6,6);
  const origSide5=r(2,4),scale5=r(2,3);
  const px6=r(-6,6),py6=r(-6,6);
  return [
    sq("s9-u13-r1","Reverse two combined translations",difficulty,`A point is translated by (${v1x},${v1y}) then by (${v2x},${v2y}), ending at (${finalX1},${finalY1}). Find the original point.`,[`(${finalX1-v1x-v2x},${finalY1-v1y-v2y})`,`${finalX1-v1x-v2x},${finalY1-v1y-v2y}`],"Subtract both vectors from the final point.",`(${finalX1}−${v1x}−${v2x}, ${finalY1}−${v1y}−${v2y}).`),
    sq("s9-u13-r2","Reason about negative scale factors",difficulty,`An enlargement has scale factor ${negScale2}. Does the image get larger, smaller, or stay the same size compared to the original?`,[Math.abs(negScale2)>1?"larger":Math.abs(negScale2)<1?"smaller":"same"],"Compare the absolute value of the scale factor to 1.",`|${negScale2}| compared to 1 determines the size change.`),
    sq("s9-u13-r3","Correct an enlargement error",difficulty,`A learner enlarges a side of length ${wrongLen3} cm by scale factor ${posScale3} and gets ${wrongLen3+posScale3} cm by adding instead of multiplying. Enter the correct length.`,String(wrongLen3*posScale3),"Enlargement means multiplying by the scale factor, not adding.",`${wrongLen3}×${posScale3}=${wrongLen3*posScale3}.`),
    sq("s9-u13-r4","Reason about the order of transformations",difficulty,`A point at (${px4},${py4}) is reflected in the x-axis then translated by (2,3). A second point undergoes the same translation first, then the same reflection. Would both methods give the same final point in general? Answer yes or no.`,"no","Reflections and translations do not generally commute.","No — the order of transformations generally matters."),
    sq("s9-u13-r5","Reverse an enlargement with its inverse",difficulty,`A shape is enlarged by scale factor ${scale5} from a side of ${origSide5} cm, then reduced by scale factor 1/${scale5}. Find the final side length.`,String(origSide5),"Enlarging then reducing by the reciprocal scale factor returns to the original.",`${origSide5}×${scale5}÷${scale5}=${origSide5}.`),
    sq("s9-u13-r6","Identify a combination as a single transformation",difficulty,`A point at (${px6},${py6}) undergoes two reflections: first in the x-axis, then in the y-axis. Name the single transformation this combination is equivalent to.`,["rotation180","rotation of 180","180rotation"],"Reflecting in both axes in turn flips both coordinates' signs.","This combination is equivalent to a 180° rotation about the origin."),
  ];
};

const CLEAN_ANGLES_S9 = [90,180,60,120,45,30];
const structuredMeasuresS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const radius1=r(2,15),angle1=CLEAN_ANGLES_S9[r(0,CLEAN_ANGLES_S9.length-1)],arcLen1=Math.round(2*3.14*radius1*(angle1/360)*100)/100;
    const radius2=r(2,15),angle2=CLEAN_ANGLES_S9[r(0,CLEAN_ANGLES_S9.length-1)],sectorArea2=Math.round(3.14*radius2*radius2*(angle2/360)*100)/100;
    const rectW3=r(3,15),rectH3=r(3,15),triBase3=r(3,15),triHeight3=r(3,15),area3=rectW3*rectH3+(triBase3*triHeight3)/2;
    const rectW4=r(3,15),rectH4=r(3,15),semiRadius4=rectH4/2,area4=Math.round((rectW4*rectH4+3.14*semiRadius4*semiRadius4/2)*100)/100;
    const boxL5=r(2,8),boxW5=r(2,8),boxH1_5=r(2,8),boxH2_5=r(2,8),vol5=boxL5*boxW5*boxH1_5+boxL5*boxW5*boxH2_5;
    const radius6=r(2,15),circumference6=Math.round(2*3.14*radius6*100)/100;
    return [
      sq("s9-u14-f1","Find arc length",difficulty,`Find the arc length of a sector with radius ${radius1} cm and angle ${angle1}°, using π=3.14.`,String(arcLen1),"Arc length = 2πr × (angle/360).",`2×3.14×${radius1}×(${angle1}/360)=${arcLen1}.`),
      sq("s9-u14-f2","Find sector area",difficulty,`Find the area of a sector with radius ${radius2} cm and angle ${angle2}°, using π=3.14.`,String(sectorArea2),"Sector area = πr² × (angle/360).",`3.14×${radius2}²×(${angle2}/360)=${sectorArea2}.`),
      sq("s9-u14-f3","Find the area of a rectangle-triangle compound shape",difficulty,`A compound shape is made of a rectangle ${rectW3} cm by ${rectH3} cm, with a triangle of base ${triBase3} cm and height ${triHeight3} cm attached. Find the total area.`,String(area3),"Find each area separately, then add them.",`${rectW3}×${rectH3}+½×${triBase3}×${triHeight3}=${area3}.`),
      sq("s9-u14-f4","Find the area of a rectangle-semicircle compound shape",difficulty,`A compound shape is a rectangle ${rectW4} cm by ${rectH4} cm with a semicircle of diameter ${rectH4} cm attached to one side. Using π=3.14, find the total area.`,String(area4),"Find each area separately, then add them.",`${rectW4}×${rectH4}+½×3.14×${semiRadius4}²=${area4}.`),
      sq("s9-u14-f5","Find the volume of a compound solid",difficulty,`A compound solid is made of two cuboids stacked: one ${boxL5} by ${boxW5} by ${boxH1_5} cm, the other ${boxL5} by ${boxW5} by ${boxH2_5} cm. Find the total volume.`,String(vol5),"Find each volume separately, then add them.",`${boxL5}×${boxW5}×${boxH1_5}+${boxL5}×${boxW5}×${boxH2_5}=${vol5}.`),
      sq("s9-u14-f6","Find circumference",difficulty,`Find the circumference of a circle with radius ${radius6} cm, using π=3.14.`,String(circumference6),"Circumference = 2πr.",`2×3.14×${radius6}=${circumference6}.`),
    ];
  }
  if (difficulty === "application") {
    const trackRadius1=r(20,60),trackAngle1=CLEAN_ANGLES_S9[r(0,CLEAN_ANGLES_S9.length-1)],arcLen1=Math.round(2*3.14*trackRadius1*(trackAngle1/360)*100)/100;
    const pizzaRadius2=r(8,20),pizzaAngle2=CLEAN_ANGLES_S9[r(0,CLEAN_ANGLES_S9.length-1)],sliceArea2=Math.round(3.14*pizzaRadius2*pizzaRadius2*(pizzaAngle2/360)*100)/100;
    const roomL3=r(3,10),roomW3=r(3,10),extL3=r(2,6),extW3=r(2,6),totalArea3=roomL3*roomW3+extL3*extW3;
    const windowW4=r(4,12),windowH4=r(4,12),semiR4=windowW4/2,windowArea4=Math.round((windowW4*windowH4+3.14*semiR4*semiR4/2)*100)/100;
    const boxL5=r(2,6),boxW5=r(2,6),boxH5=r(2,6),solidVol5=boxL5*boxW5*boxH5;
    const semicircleRadius6=r(3,10),straightSide6=r(4,15),perim6=Math.round((3.14*semicircleRadius6+straightSide6)*100)/100;
    return [
      sq("s9-u14-a1","Apply arc length in a real context",difficulty,`A running track curve has radius ${trackRadius1} m and sweeps through ${trackAngle1}°. Using π=3.14, find the arc length of the curve.`,String(arcLen1),"Arc length = 2πr × (angle/360).",`2×3.14×${trackRadius1}×(${trackAngle1}/360)=${arcLen1}.`),
      sq("s9-u14-a2","Apply sector area in a real context",difficulty,`A pizza has radius ${pizzaRadius2} cm. A slice is cut with angle ${pizzaAngle2}°. Using π=3.14, find the area of the slice.`,String(sliceArea2),"Sector area = πr² × (angle/360).",`3.14×${pizzaRadius2}²×(${pizzaAngle2}/360)=${sliceArea2}.`),
      sq("s9-u14-a3","Find the area of an L-shaped room",difficulty,`An L-shaped room is made of a ${roomL3} m by ${roomW3} m rectangle and a ${extL3} m by ${extW3} m extension. Find the total floor area.`,String(totalArea3),"Find each rectangle's area, then add them.",`${roomL3}×${roomW3}+${extL3}×${extW3}=${totalArea3}.`),
      sq("s9-u14-a4","Find the area of a window with a semicircular top",difficulty,`A window is a rectangle ${windowW4} cm by ${windowH4} cm with a semicircle of diameter ${windowW4} cm on top. Using π=3.14, find the total area.`,String(windowArea4),"Find each area separately, then add them.",`${windowW4}×${windowH4}+½×3.14×${semiR4}²=${windowArea4}.`),
      sq("s9-u14-a5","Find the volume of a storage box",difficulty,`A storage box measures ${boxL5} by ${boxW5} by ${boxH5} cm. Find its volume.`,String(solidVol5),"Multiply length, width, and height.",`${boxL5}×${boxW5}×${boxH5}=${solidVol5}.`),
      sq("s9-u14-a6","Find the perimeter of a shape with a curved edge",difficulty,`A shape has a straight edge of ${straightSide6} cm and a semicircular edge with radius ${semicircleRadius6} cm. Using π=3.14, find the total perimeter (straight edge plus curved edge, not the diameter).`,String(perim6),"Add the straight edge to the semicircular arc length.",`${straightSide6}+3.14×${semicircleRadius6}=${perim6}.`),
    ];
  }
  const radius1=r(2,15),arcLenGiven1=Math.round(2*3.14*radius1*(90/360)*100)/100;
  const radius2=r(2,15),sectorAreaGiven2=Math.round(3.14*radius2*radius2*(90/360)*100)/100;
  const rectArea3=r(10,50)*4,triArea3=r(5,20)*2,extraAdded3=r(5,20),wrongTotal3=rectArea3+triArea3+extraAdded3;
  const shapeA4=r(20,60),shapeB4=r(20,80);
  const sectorRadius5=r(2,10),sectorArea5=Math.round(3.14*sectorRadius5*sectorRadius5*(90/360)*100)/100,extraRect5=r(5,20);
  return [
    sq("s9-u14-r1","Reverse an arc-length calculation",difficulty,`A sector has arc length ${arcLenGiven1} cm (using π=3.14) and angle 90°. Find the radius.`,String(radius1),"Divide the arc length by 2π×(angle/360).",`${arcLenGiven1}÷(2×3.14×90/360)=${radius1}.`),
    sq("s9-u14-r2","Reverse a sector-area calculation",difficulty,`A sector has area ${sectorAreaGiven2} cm² (using π=3.14) and angle 90°. Find the radius.`,String(radius2),"Divide the area by π×(angle/360), then take the square root.",`√(${sectorAreaGiven2}÷(3.14×90/360))=${radius2}.`),
    sq("s9-u14-r3","Correct a compound-area error",difficulty,`A compound shape's area is calculated as a rectangle (${rectArea3} cm²) plus a triangle (${triArea3} cm²). A learner adds an extra ${extraAdded3} cm² by mistake, getting ${wrongTotal3} cm². Enter the correct total area.`,String(rectArea3+triArea3),"Only add the areas of the actual shapes, nothing extra.",`${rectArea3}+${triArea3}=${rectArea3+triArea3}.`),
    sq("s9-u14-r4","Compare two shape areas",difficulty,`Shape A has area ${shapeA4} cm² and Shape B has area ${shapeB4} cm². Which has the larger area, A or B?`,[shapeA4>shapeB4?"a":"b","shape "+(shapeA4>shapeB4?"a":"b")],"Compare the two areas directly.",`${shapeA4>shapeB4?"Shape A":"Shape B"} has the larger area.`),
    sq("s9-u14-r5","Combine a sector and a rectangle area",difficulty,`A compound shape is a sector (radius ${sectorRadius5} cm, angle 90°, area ${sectorArea5} cm² using π=3.14) attached to a rectangle of area ${extraRect5} cm². Find the total area.`,String(sectorArea5+extraRect5),"Add the sector area and the rectangle area.",`${sectorArea5}+${extraRect5}=${sectorArea5+extraRect5}.`),
    sq("s9-u14-r6","Reason about scaling a circle's radius",difficulty,"If the radius of a circle is doubled, does the circumference double, quadruple, or stay the same?","double","Circumference is directly proportional to radius.","Doubling the radius doubles the circumference."),
  ];
};

const structuredInvestigationsS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const mSlope2=r(2,6),cInt2=r(1,20),xVal2=r(2,8);
    const sorted3=Array.from({length:7},()=>r(2,30)).sort((a,b)=>a-b);
    const sorted4=Array.from({length:7},()=>r(2,30)).sort((a,b)=>a-b);
    const sorted5=Array.from({length:7},()=>r(2,30)).sort((a,b)=>a-b);
    const sorted6=Array.from({length:7},()=>r(2,30)).sort((a,b)=>a-b);
    return [
      sq("s9-u15-f1","Understand a line of best fit",difficulty,"What does a line of best fit represent on a scatter graph?",["trend","generaltrend","overalltrend"],"It's a single line summarising the pattern in scattered data.","It represents the general trend of the data."),
      sq("s9-u15-f2","Use a line of best fit to predict a value",difficulty,`A line of best fit has equation y = ${mSlope2}x + ${cInt2}. Predict y when x = ${xVal2}.`,String(mSlope2*xVal2+cInt2),"Substitute the x-value into the equation.",`${mSlope2}(${xVal2})+${cInt2}=${mSlope2*xVal2+cInt2}.`),
      sq("s9-u15-f3","Find the median",difficulty,`Find the median of ${sorted3.join(", ")}.`,String(sorted3[3]),"The data is already in order; choose the middle value.",`The middle value is ${sorted3[3]}.`),
      sq("s9-u15-f4","Find the lower quartile",difficulty,`Find the lower quartile (Q1) of ${sorted4.join(", ")}.`,String(sorted4[1]),"Q1 is the median of the lower half of the data.",`Q1=${sorted4[1]}.`),
      sq("s9-u15-f5","Find the upper quartile",difficulty,`Find the upper quartile (Q3) of ${sorted5.join(", ")}.`,String(sorted5[5]),"Q3 is the median of the upper half of the data.",`Q3=${sorted5[5]}.`),
      sq("s9-u15-f6","Find the interquartile range",difficulty,`For the data ${sorted6.join(", ")}, Q1 = ${sorted6[1]} and Q3 = ${sorted6[5]}. Find the interquartile range.`,String(sorted6[5]-sorted6[1]),"IQR = Q3 − Q1.",`${sorted6[5]}−${sorted6[1]}=${sorted6[5]-sorted6[1]}.`),
    ];
  }
  if (difficulty === "application") {
    const mSlope1=r(2,5),cInt1=r(5,20),xInterp1=r(3,7);
    const mSlope2=r(2,5),cInt2=r(5,20),xExtrap2=r(50,100);
    const sortedA3=Array.from({length:7},()=>r(10,40)*2).sort((a,b)=>a-b);
    const sortedB4=Array.from({length:7},()=>r(2,15)).sort((a,b)=>a-b);
    const sortedC4=Array.from({length:7},()=>r(2,60)).sort((a,b)=>a-b);
    const sortedD5=Array.from({length:7},()=>r(2,20)).sort((a,b)=>a-b);
    return [
      sq("s9-u15-a1","Interpolate using a line of best fit",difficulty,`A line of best fit for exam scores is y = ${mSlope1}x + ${cInt1}, where x is hours studied (within the data range 1-10). Predict the score for ${xInterp1} hours studied.`,String(mSlope1*xInterp1+cInt1),"Substitute the x-value into the equation.",`${mSlope1}(${xInterp1})+${cInt1}=${mSlope1*xInterp1+cInt1}.`),
      sq("s9-u15-a2","Evaluate the reliability of extrapolation",difficulty,`A line of best fit is y = ${mSlope2}x + ${cInt2}, based on data where x ranged from 1 to 10. A learner extrapolates to predict y at x = ${xExtrap2}. Is this prediction reliable? Answer yes or no.`,"no","Predicting far outside the data range is unreliable.","No — extrapolating this far beyond the data isn't reliable."),
      sq("s9-u15-a3","Find the IQR of real data",difficulty,`A shop's daily sales (in rand) are: ${sortedA3.join(", ")}. Find the interquartile range.`,String(sortedA3[5]-sortedA3[1]),"IQR = Q3 − Q1.",`${sortedA3[5]}−${sortedA3[1]}=${sortedA3[5]-sortedA3[1]}.`),
      sq("s9-u15-a4","Compare consistency using IQR",difficulty,`Class X test scores: ${sortedB4.join(", ")}. Class Y test scores: ${sortedC4.join(", ")}. Which class has more consistent scores (smaller IQR), X or Y?`,[(sortedB4[5]-sortedB4[1])<(sortedC4[5]-sortedC4[1])?"x":"y","class "+((sortedB4[5]-sortedB4[1])<(sortedC4[5]-sortedC4[1])?"x":"y")],"Find each class's IQR, then compare.","The class with the smaller IQR has more consistent scores."),
      sq("s9-u15-a5","Identify quartiles for outlier detection",difficulty,`A data set is: ${sortedD5.join(", ")}. A value below Q1 - 1.5×IQR or above Q3 + 1.5×IQR is an outlier. Find Q1 and Q3 for this data (state as Q1,Q3).`,[`${sortedD5[1]},${sortedD5[5]}`,`${sortedD5[1]}, ${sortedD5[5]}`],"Find the median of each half of the data.",`Q1=${sortedD5[1]}, Q3=${sortedD5[5]}.`),
      sq("s9-u15-a6","Choose an appropriate spread statistic",difficulty,"A data set is heavily skewed with some extreme values. Which is more appropriate to summarise its spread: range or interquartile range?",["interquartilerange","iqr"],"Consider which statistic resists the influence of extreme values.","The interquartile range, since it isn't distorted by extremes."),
    ];
  }
  const mSlope1=r(2,5),cInt1=r(5,20),xNear1=r(3,7),xFar1=r(80,150);
  const sortedQ2=Array.from({length:7},()=>r(2,20)).sort((a,b)=>a-b);
  const q1_4=r(2,10),q3_4=q1_4+r(3,15),median_4=r(q1_4,q3_4);
  const mSlope5=r(-5,-2);
  return [
    sq("s9-u15-r1","Reason about interpolation vs extrapolation reliability",difficulty,`A line of best fit y = ${mSlope1}x + ${cInt1} is based on data with x between 1 and 10. Is a prediction at x = ${xNear1} more reliable than one at x = ${xFar1}? Answer yes or no.`,"yes","Predictions within the data range are more reliable than those far outside it.","Yes — interpolation is generally more reliable than extrapolation."),
    sq("s9-u15-r2","Correct a quartile identification error",difficulty,`For the data ${sortedQ2.join(", ")}, a learner says Q1 is the smallest value (${sortedQ2[0]}). Enter the correct Q1.`,String(sortedQ2[1]),"Q1 is the median of the lower half, not the minimum.",`Q1=${sortedQ2[1]}.`),
    sq("s9-u15-r3","Compare the sensitivity of range and IQR",difficulty,"Is the interquartile range or the range more affected by an extreme outlier?","range","The range uses only the two extreme values.","The range is more affected, since it depends directly on the extremes."),
    sq("s9-u15-r4","Calculate IQR from a five-number summary",difficulty,`A data set has Q1 = ${q1_4}, median = ${median_4}, and Q3 = ${q3_4}. Find the interquartile range.`,String(q3_4-q1_4),"IQR = Q3 − Q1.",`${q3_4}−${q1_4}=${q3_4-q1_4}.`),
    sq("s9-u15-r5","Reason about negative gradients",difficulty,`A line of best fit has a negative gradient of ${mSlope5}. As x increases, does y increase or decrease?`,"decrease","A negative gradient means y falls as x rises.","A negative gradient means y decreases as x increases."),
    sq("s9-u15-r6","Reason about the limits of a linear model",difficulty,"A scatter graph shows a curved (non-linear) pattern. Is a straight line of best fit appropriate for making predictions? Answer yes or no.","no","A straight line poorly models a clearly curved relationship.","No — a straight line isn't appropriate for a non-linear pattern."),
  ];
};

const structuredEquationsS9 = (difficulty:"foundational"|"application"|"reasoning") => {
  if (difficulty === "foundational") {
    const a1=r(2,9),xAns1=r(2,10),b1=a1*xAns1;
    const a2=r(2,7),xAns2=r(2,10),c2=r(1,9),b2=a2*xAns2+c2;
    const a3=r(3,7),d3=r(2,a3-1),xAns3=r(2,8),c3=r(1,9),e3=(a3-d3)*xAns3+c3;
    const a4=r(2,6),b4=r(1,8),xAns4=r(2,8),rhs4=a4*(xAns4+b4);
    const a5=r(2,6),xAns5=r(2,10),c5=r(1,9),b5=a5*xAns5+c5;
    const a6=r(2,6),xAns6=a6*r(2,6),c6=r(1,9),rhs6=xAns6/a6+c6;
    return [
      sq("s9-u4-f1","Solve a one-step equation",difficulty,`Solve ${a1}x = ${b1}.`,String(xAns1),"Divide both sides by the coefficient of x.",`${b1}÷${a1}=${xAns1}.`),
      sq("s9-u4-f2","Solve a two-step equation",difficulty,`Solve ${a2}x + ${c2} = ${b2}.`,String(xAns2),"Subtract the constant, then divide by the coefficient of x.",`(${b2}−${c2})÷${a2}=${xAns2}.`),
      sq("s9-u4-f3","Solve an equation with x on both sides",difficulty,`Solve ${a3}x + ${c3} = ${d3}x + ${e3}.`,String(xAns3),"Collect the x terms on one side and the constants on the other.",`(${a3}−${d3})x=${e3}−${c3}, so x=${xAns3}.`),
      sq("s9-u4-f4","Solve an equation with brackets",difficulty,`Solve ${a4}(x + ${b4}) = ${rhs4}.`,String(xAns4),"Divide by the outside number first, then subtract.",`x+${b4}=${rhs4/a4}, so x=${xAns4}.`),
      sq("s9-u4-f5","Solve a linear inequality",difficulty,`Solve the inequality ${a5}x + ${c5} > ${b5}.`,[`x>${xAns5}`,`x > ${xAns5}`],"Subtract the constant, then divide by the coefficient of x.",`${a5}x>${b5-c5}, so x>${xAns5}.`),
      sq("s9-u4-f6","Solve an equation with a fraction",difficulty,`Solve x/${a6} + ${c6} = ${rhs6}.`,String(xAns6),"Subtract the constant, then multiply by the denominator.",`(x/${a6})=${rhs6-c6}, so x=${xAns6}.`),
    ];
  }
  if (difficulty === "application") {
    const perKg1=r(2,9),xAns1=r(2,15),total1=perKg1*xAns1;
    const fixed2=r(10,40),perUnit2=r(2,9),xAns2=r(2,10),total2=fixed2+perUnit2*xAns2;
    const priceB3=r(3,7),priceA3=priceB3+r(1,4),xAns3=r(2,10),fixedB3=(priceA3-priceB3)*xAns3;
    const fixed4=r(10,40),perItem4=r(2,9),xAns4=r(2,10),budgetVal4=fixed4+perItem4*xAns4;
    const width5=r(2,8),xAns5=r(2,10),area5=width5*(xAns5+r(1,5)),b5=area5/width5-xAns5;
    const xAns6=r(5,30),total6=3*xAns6+3;
    return [
      sq("s9-u4-a1","Form and solve an equation from a shopping context",difficulty,`Apples cost R${perKg1} per kg. A shopper spends R${total1} on apples. Write and solve an equation to find how many kg were bought.`,String(xAns1),"Divide the total spent by the price per kg.",`R${total1}÷R${perKg1}=${xAns1} kg.`),
      sq("s9-u4-a2","Form and solve an equation from a fixed-plus-rate context",difficulty,`A taxi charges a fixed R${fixed2} plus R${perUnit2} per km. A trip costs R${total2}. Write and solve an equation to find the number of km travelled.`,String(xAns2),"Subtract the fixed charge, then divide by the rate.",`(R${total2}−R${fixed2})÷R${perUnit2}=${xAns2} km.`),
      sq("s9-u4-a3","Find a break-even point",difficulty,`Plan A costs R${priceA3} per visit. Plan B costs R${priceB3} per visit plus a R${fixedB3} joining fee. For how many visits, x, do both plans cost the same? (Set up ${priceA3}x = ${priceB3}x + ${fixedB3} and solve.)`,String(xAns3),"Collect the x terms on one side and solve.",`(${priceA3}−${priceB3})x=${fixedB3}, so x=${xAns3}.`),
      sq("s9-u4-a4","Solve an equation from a cost context",difficulty,`A stall has a fixed cost of R${fixed4} plus R${perItem4} per item made. Find the number of items, x, that gives a total cost of exactly R${budgetVal4}.`,String(xAns4),"Subtract the fixed cost, then divide by the cost per item.",`(R${budgetVal4}−R${fixed4})÷R${perItem4}=${xAns4}.`),
      sq("s9-u4-a5","Solve an equation from an area context",difficulty,`A rectangular garden has width ${width5} m. Its length is (x + ${b5}) m, and its area is ${area5} m². Find x.`,String(xAns5),"Divide the area by the width, then subtract the constant.",`${area5}÷${width5}=${area5/width5}, so x=${xAns5}.`),
      sq("s9-u4-a6","Solve a consecutive-integers word problem",difficulty,`Three consecutive integers sum to ${total6}. Find the smallest integer.`,String(xAns6),"Let the smallest be x; the others are x+1 and x+2.",`3x+3=${total6}, so x=${xAns6}.`),
    ];
  }
  const a1=r(2,7),c1=r(1,9),xAns1=r(2,10),b1=a1*xAns1+c1,wrongAns1=xAns1+r(1,3);
  const a2=r(-6,-2),c2=r(1,9),xAns2=r(2,10),b2=a2*xAns2+c2;
  const priceB3=r(3,7),priceA3=priceB3+r(1,4),xAns3=r(2,10),fixedB3=(priceA3-priceB3)*xAns3;
  const a4=r(-5,-2),c4=r(1,9),xAns4=r(2,10),b4=a4*xAns4+c4;
  const xCheck5=r(2,10),a5=r(2,7),c5=r(1,9),rhs5=a5*xCheck5+c5,wrongCheck5=xCheck5+1;
  const a6=r(2,6),xAns6=r(2,8),c6=r(1,9),b6=a6*xAns6+c6;
  return [
    sq("s9-u4-r1","Correct an equation-solving error",difficulty,`A learner solves ${a1}x + ${c1} = ${b1} and gets x = ${wrongAns1}. Enter the correct solution.`,String(xAns1),"Subtract the constant, then divide by the coefficient of x.",`(${b1}−${c1})÷${a1}=${xAns1}.`),
    sq("s9-u4-r2","Solve an equation with a negative coefficient",difficulty,`Solve ${a2}x + ${c2} = ${b2}. (Notice the coefficient of x is negative.)`,String(xAns2),"Subtract the constant, then divide by the negative coefficient.",`(${b2}−${c2})÷${a2}=${xAns2}.`),
    sq("s9-u4-r3","Reason beyond a break-even point",difficulty,`Plan A costs R${priceA3} per visit. Plan B costs R${priceB3} per visit plus a R${fixedB3} joining fee. After how many visits does Plan A start costing more than Plan B (i.e. beyond the break-even point)?`,String(xAns3+1),"Find the break-even point first, then consider the next whole visit.",`Break-even is at ${xAns3} visits, so Plan A costs more from visit ${xAns3+1} onward.`),
    sq("s9-u4-r4","Solve an inequality with a sign flip",difficulty,`Solve the inequality ${a4}x + ${c4} < ${b4}. Remember to flip the inequality sign when dividing by a negative number.`,[`x>${xAns4}`,`x > ${xAns4}`],"Dividing by a negative number reverses the inequality sign.",`${a4}x<${b4-c4}, and dividing by ${a4} flips the sign to x>${xAns4}.`),
    sq("s9-u4-r5","Verify a solution by substitution",difficulty,`A learner checks if x = ${wrongCheck5} is a solution to ${a5}x + ${c5} = ${rhs5} by substituting. Is x = ${wrongCheck5} correct? Answer yes or no.`,"no","Substitute the value into the equation and check both sides match.",`${a5}(${wrongCheck5})+${c5}≠${rhs5}, so no.`),
    sq("s9-u4-r6","Solve and classify a solution",difficulty,`Solve ${a6}x + ${c6} = ${b6}, then state whether the solution is a positive or negative number.`,"positive","Solve the equation, then check the sign of the result.",`x=${xAns6}, which is positive.`),
  ];
};

const integers=()=>{const a=r(18,65),b=r(7,24),x=r(-12,-3),y=r(5,17);return[
  q(`Calculate ${a} + (${x}).`,String(a+x),"Adding a negative is subtraction.",`${a}+(${x})=${a+x}`),
  q(`Calculate ${b} - (${x}).`,String(b-x),"Subtracting a negative becomes addition.",`${b}-(${x})=${b-x}`),
  q(`Calculate (${x}) × ${y}.`,String(x*y),"Different signs give a negative product.",`${x}×${y}=${x*y}`),
  q(`Find the highest common factor of 18 and 30.`,"6","List the factors shared by both numbers.","Common factors are 1, 2, 3 and 6, so HCF = 6."),
  q(`Evaluate 3⁴.`,"81","Multiply four factors of 3.","3⁴=3×3×3×3=81."),
  q(`Find √196.`,"14","Find the positive number whose square is 196.","14×14=196, so √196=14."),
]};
const expressions=()=>{const a=r(2,7),b=r(2,8),x=r(2,6);return[
  q(`Simplify ${a}x + ${b}x.`,`${a+b}x`,"Add the coefficients of like terms.",`${a}x+${b}x=${a+b}x.`),
  q(`Evaluate 3n + 5 when n = ${x}.`,String(3*x+5),"Substitute the value for n.",`3(${x})+5=${3*x+5}.`),
  q(`Expand 4(x + 3).`,`4x+12`,"Multiply every term inside the bracket by 4.","4(x+3)=4x+12."),
  q(`Factorise 6x + 18.`,`6(x+3)`,"Take out the highest common factor.","6x+18=6(x+3)."),
  q(`Make x the subject: y = x + 7.`,`x=y-7`,"Use the inverse operation.","Subtract 7 from both sides: x=y−7."),
  q(`If A = lw, find A when l = 8 and w = 5.`,"40","Substitute into the formula.","A=8×5=40."),
]};
const rounding=()=>{const n=r(1250,9870);return[
  q(`Round ${n} to the nearest hundred.`,String(Math.round(n/100)*100),"Look at the tens digit.",`${n} rounds to ${Math.round(n/100)*100}.`),
  q(`Round 7.846 to 2 decimal places.`,"7.85","Look at the third decimal place.","The third decimal is 6, so 7.846 rounds to 7.85."),
  q(`Write 0.00072 in standard form.`,["7.2x10^-4","7.2×10^-4","7.2*10^-4"],"Move the decimal point until the first number is between 1 and 10.","0.00072 = 7.2 × 10⁻⁴."),
  q(`Estimate 19.8 × 5.1 by rounding each number to 1 significant figure.`,"100","19.8≈20 and 5.1≈5.","20×5=100."),
  q(`What is the value of the digit 6 in 46 281?`,"6000","Identify the place occupied by 6.","The 6 is in the thousands place, so its value is 6000."),
  q(`Round 0.06784 to 2 significant figures.`,"0.068","The first significant digit is 6.","0.06784 rounds to 0.068."),
]};
const decimals=()=>[
  q("Calculate 4.8 + 7.35.","12.15","Align the decimal points.","4.80+7.35=12.15."),q("Calculate 9.2 − 3.47.","5.73","Write 9.2 as 9.20.","9.20−3.47=5.73."),q("Calculate 2.4 × 0.5.","1.2","Multiplying by 0.5 means finding one half.","Half of 2.4 is 1.2."),q("Calculate 6.3 ÷ 0.9.","7","Multiply both numbers by 10 first.","63÷9=7."),q("A pencil costs R3.75. Find the cost of 4 pencils.","15","Multiply the unit cost by 4.","3.75×4=15."),q("Put 0.7, 0.07 and 0.707 in ascending order.",["0.07,0.7,0.707","0.07 0.7 0.707"],"Compare equal numbers of decimal places.","0.070 < 0.700 < 0.707."),
];
const angles=()=>{const a=r(35,75);return[
  q(`Angles on a straight line are ${a}° and x°. Find x.`,String(180-a),"Angles on a straight line total 180°.",`x=180−${a}=${180-a}°.`),q("Two vertically opposite angles are labelled 68° and x°. Find x.","68","Vertically opposite angles are equal.","x=68°."),q("Find each interior angle of a regular hexagon.","120","Use (n−2)×180÷n.","(6−2)×180÷6=120°."),q("Two angles of a triangle are 52° and 71°. Find the third angle.","57","Angles in a triangle total 180°.","180−52−71=57°."),q("How many degrees are in one complete turn?","360","Recall the angle fact for a full rotation.","A complete turn is 360°."),q("Name the angle type of 135°.",["obtuse","obtuseangle"],"It is greater than 90° but less than 180°.","135° is an obtuse angle."),
]};
const data=()=>[
  q("Which average is found by adding all values and dividing by the number of values?","mean","Recall the definitions of averages.","This calculation gives the mean."),q("Find the median of 3, 6, 7, 9, 12.","7","Order the data and choose the middle value.","The middle value is 7."),q("Find the mode of 2, 4, 4, 5, 7.","4","Find the value occurring most often.","4 occurs twice, more than any other value."),q("Find the range of 5, 11, 8, 17, 6.","12","Subtract the minimum from the maximum.","17−5=12."),q("Which sampling method gives every member an equal chance of selection?",["random","randomsampling","simplerandomsampling"],"Think of names selected by chance.","Random sampling gives each member an equal chance."),q("A survey asks only members of a school chess club about favourite sports. Is the sample likely biased?",["yes","y"],"Consider whether it represents the whole school.","Yes. Chess-club members may not represent all learners."),
];
const fractions=()=>[
  q("Simplify 18/24.",["3/4","0.75"],"Divide numerator and denominator by their HCF.","18÷6 over 24÷6 gives 3/4."),q("Calculate 2/5 + 1/10.",["1/2","0.5"],"Use a common denominator of 10.","4/10+1/10=5/10=1/2."),q("Calculate 7/8 − 1/4.",["5/8","0.625"],"Write 1/4 as eighths.","7/8−2/8=5/8."),q("Calculate 3/5 × 10/9.",["2/3","0.6666666667"],"Cancel common factors before multiplying.","30/45 simplifies to 2/3."),q("Calculate 4/7 ÷ 2/3.",["6/7","0.857142857"],"Multiply by the reciprocal.","4/7×3/2=12/14=6/7."),q("Write 0.375 as a fraction in simplest form.","3/8","Write it over 1000 and simplify.","375/1000=3/8."),
];
const shapes=()=>[
  q("How many lines of symmetry does a square have?","4","Count vertical, horizontal and diagonal symmetry lines.","A square has 4 lines of symmetry."),q("What is the rotational symmetry order of an equilateral triangle?","3","Count how often it matches itself in 360°.","It matches 3 times."),q("Name a quadrilateral with exactly one pair of parallel sides.",["trapezium","trapezoid"],"Recall quadrilateral properties.","A trapezium has one pair of parallel sides."),q("How many faces does a cube have?","6","Count the square surfaces.","A cube has 6 faces."),q("Are two shapes with the same shape and size congruent?",["yes","y"],"Recall the meaning of congruent.","Yes, congruent shapes have equal corresponding lengths and angles."),q("How many diagonals does a quadrilateral have?","2","Join opposite vertices.","A quadrilateral has 2 diagonals."),
];
const sequences=()=>{const start=r(2,9),d=r(3,7);return[
  q(`Find the next term: ${start}, ${start+d}, ${start+2*d}, ${start+3*d}, ...`,String(start+4*d),"Find the constant difference.",`Add ${d}, giving ${start+4*d}.`),q("Find the 10th term of the sequence with nth term 3n + 2.","32","Substitute n=10.","3(10)+2=32."),q("Write the nth term of 5, 8, 11, 14, ...",["3n+2","2+3n"],"The common difference is the coefficient of n.","3n+2 gives 5 when n=1."),q("Is 41 a term of the sequence 4n+1?",["yes","y"],"Solve 4n+1=41.","n=10, a whole number, so yes."),q("For f(x)=2x−3, find f(7).","11","Substitute x=7.","2(7)−3=11."),q("The term-to-term rule is multiply by 2. The first term is 3. Find the fourth term.","24","Apply the rule three times.","3, 6, 12, 24."),
]};
const percentages=()=>[
  q("Find 15% of 240.","36","10% is 24 and 5% is 12.","15% of 240=36."),q("Increase 80 by 25%.","100","Find 25% then add it.","25% of 80=20; 80+20=100."),q("Decrease 350 by 20%.","280","Keep 80% of the original.","0.8×350=280."),q("Express 18 as a percentage of 60.",["30","30%"],"Divide by 60 and multiply by 100.","18÷60×100=30%."),q("A price rises from R50 to R65. Find the percentage increase.",["30","30%"],"Increase ÷ original ×100.","15÷50×100=30%."),q("After a 10% discount, an item costs R72. Find the original price.","80","R72 represents 90%.","72÷0.9=80."),
];
const graphs=()=>[
  q("A point has coordinates (−3, 5). What is its x-coordinate?","-3","The x-coordinate is written first.","The x-coordinate is −3."),q("Find the gradient between (1,2) and (5,10).","2","Use change in y divided by change in x.","(10−2)÷(5−1)=8÷4=2."),q("For y=3x−1, find y when x=4.","11","Substitute x=4.","y=3(4)−1=11."),q("What is the y-intercept of y=2x+7?","7","Compare with y=mx+c.","c=7, so the y-intercept is 7."),q("A horizontal line has what gradient?","0","There is no vertical change.","Rise=0, so gradient=0."),q("Does the point (3,7) lie on y=2x+1?",["yes","y"],"Substitute x=3.","2(3)+1=7, so yes."),
];
const ratio=()=>[
  q("Simplify the ratio 18:30.","3:5","Divide both parts by 6.","18:30=3:5."),q("Share 72 in the ratio 5:3. Give the larger share.","45","There are 8 equal parts.","72÷8=9; 5×9=45."),q("If 4 books cost R60, find the cost of 7 books.","105","Find the cost of one book first.","60÷4=15; 7×15=105."),q("A map scale is 1:50 000. What real distance in km is represented by 6 cm?","3","6×50 000 cm then convert to km.","300 000 cm=3 km."),q("y is directly proportional to x. If y=12 when x=3, find y when x=8.","32","Find the constant y÷x.","k=4, so y=4×8=32."),q("Convert 72 km/h to m/s.","20","Divide km/h by 3.6.","72÷3.6=20 m/s."),
];
const probability=()=>[
  q("A fair die is rolled. Find the probability of rolling a 6.",["1/6","0.1666666667"],"There is one favourable result out of six.","Probability=1/6."),q("A bag has 3 red and 7 blue counters. Find P(red).",["3/10","0.3"],"Favourable outcomes ÷ total outcomes.","3÷10=3/10."),q("If P(rain)=0.35, find P(no rain).","0.65","Complementary probabilities total 1.","1−0.35=0.65."),q("Two fair coins are tossed. Find P(two heads).",["1/4","0.25"],"List HH, HT, TH, TT.","Only HH works, so 1/4."),q("A certain event has what probability?","1","Use the probability scale from impossible to certain.","A certain event has probability 1."),q("In 200 trials, an event occurs 46 times. Find its experimental probability.",["0.23","23/100","46/200"],"Frequency ÷ number of trials.","46÷200=0.23."),
];
const transformations=()=>[
  q("Translate (2,−1) by the vector (3,4). Give the new coordinate.",["(5,3)","5,3"],"Add corresponding coordinates.","(2+3,−1+4)=(5,3)."),q("Reflect (4,−2) in the x-axis.",["(4,2)","4,2"],"The x-coordinate stays; the y-sign changes.","(4,−2) maps to (4,2)."),q("Reflect (−3,5) in the y-axis.",["(3,5)","3,5"],"The y-coordinate stays; the x-sign changes.","(−3,5) maps to (3,5)."),q("Rotate (2,1) 90° anticlockwise about the origin.",["(-1,2)","-1,2"],"Use (x,y)→(−y,x).","(2,1) maps to (−1,2)."),q("An enlargement has scale factor 3. A side is 5 cm. Find the image side.","15","Multiply by the scale factor.","5×3=15 cm."),q("What single transformation turns a shape about a fixed centre?","rotation","Recall transformation definitions.","A rotation turns a shape about a centre."),
];
const measures=()=>[
  q("Find the perimeter of a rectangle 8 cm by 5 cm.","26","Add all four sides.","2(8+5)=26 cm."),q("Find the area of a triangle with base 12 cm and height 7 cm.","42","Use one half × base × height.","1/2×12×7=42 cm²."),q("Find the area of a circle of radius 5 cm using π=3.14.","78.5","Use A=πr².","3.14×25=78.5 cm²."),q("Find the volume of a cuboid 6 cm by 4 cm by 3 cm.","72","Multiply length, width and height.","6×4×3=72 cm³."),q("Convert 2.7 m to centimetres.","270","Multiply metres by 100.","2.7×100=270 cm."),q("Find the surface area of a cube with side 4 cm.","96","A cube has six square faces.","6×4²=96 cm²."),
];
const investigations=()=>[
  q("Which graph is most suitable for showing change over time?",["linegraph","line"],"Time is continuous and ordered.","A line graph shows trends over time."),q("Which graph is suitable for categorical frequency data?",["bargraph","barchart","bar"],"Categories need separate bars.","A bar chart is suitable."),q("A scatter graph slopes upward from left to right. Name the correlation.",["positive","positivecorrelation"],"As one variable rises, the other tends to rise.","This is positive correlation."),q("Does correlation always prove causation?",["no","n"],"Another variable may affect both quantities.","No. Correlation alone does not prove cause."),q("Class A has mean 64 and Class B has mean 71. Which has the higher mean?",["classb","b"],"Compare the two means.","Class B has the higher mean."),q("Two sets have the same median. Set X has range 4 and Set Y has range 15. Which is more consistent?",["setx","x"],"A smaller spread means greater consistency.","Set X is more consistent because its range is smaller."),
];
const equations=()=>[
  q("Solve 3x+5=20.","5","Subtract 5, then divide by 3.","3x=15, so x=5."),q("Solve 5x−7=2x+11.","6","Collect x terms on one side.","3x=18, so x=6."),q("Solve 4(x+2)=28.","5","Divide by 4 before subtracting 2.","x+2=7, so x=5."),q("Solve x/3+4=9.","15","Subtract 4, then multiply by 3.","x/3=5, so x=15."),q("Find the greatest integer satisfying x<6.","5","Integers are whole numbers.","The greatest integer below 6 is 5."),q("Solve −2x>10.",["x<-5","x<−5"],"Dividing by a negative reverses the inequality.","x<−5."),
];

const engines:Record<string,()=>MasteryQuestion[]>={
  "s8-u1":integers,"s8-u2":expressions,"s8-u3":rounding,"s8-u4":decimals,"s8-u5":angles,"s8-u6":data,"s8-u7":fractions,"s8-u8":shapes,"s8-u9":sequences,"s8-u10":percentages,"s8-u11":graphs,"s8-u12":ratio,"s8-u13":probability,"s8-u14":transformations,"s8-u15":measures,"s8-u16":investigations,
  "s9-u1":integers,"s9-u2":expressions,"s9-u3":rounding,"s9-u4":equations,"s9-u5":angles,"s9-u6":investigations,"s9-u7":shapes,"s9-u8":fractions,"s9-u9":sequences,"s9-u10":graphs,"s9-u11":ratio,"s9-u12":probability,"s9-u13":transformations,"s9-u14":measures,"s9-u15":investigations,
};

export function supportsMasteryUnit(chapter:string){return Boolean(engines[chapter]);}
export function makeUnitQuestions(chapter:string,difficulty:string){
  const level = (["foundational","application","reasoning"].includes(difficulty)
    ? difficulty
    : "foundational") as "foundational"|"application"|"reasoning";
  const structuredPilot: Record<string,(value:typeof level)=>MasteryQuestion[]> = {
    "s8-u1": structuredIntegers,
    "s8-u2": structuredExpressions,
    "s8-u3": structuredRounding,
    "s8-u4": structuredDecimals,
    "s8-u5": structuredAngles,
    "s8-u6": structuredData,
    "s8-u7": structuredFractions,
    "s8-u8": structuredShapes,
    "s8-u9": structuredSequences,
    "s8-u10": structuredPercentages,
    "s8-u11": structuredGraphs,
    "s8-u12": structuredRatio,
    "s8-u13": structuredProbability,
    "s8-u14": structuredTransformations,
    "s8-u15": structuredMeasures,
    "s8-u16": structuredInvestigations,
    "s9-u1": structuredIntegersS9,
    "s9-u2": structuredExpressionsS9,
    "s9-u3": structuredRoundingS9,
    "s9-u4": structuredEquationsS9,
    "s9-u5": structuredAnglesS9,
    "s9-u6": structuredInvestigationsS9,
    "s9-u7": structuredShapesS9,
    "s9-u8": structuredFractionsS9,
    "s9-u9": structuredSequencesS9,
    "s9-u10": structuredGraphsS9,
    "s9-u11": structuredRatioS9,
    "s9-u12": structuredProbabilityS9,
    "s9-u13": structuredTransformationsS9,
    "s9-u14": structuredMeasuresS9,
    "s9-u15": structuredInvestigationsS9,
  };
  if (structuredPilot[chapter])
    return validateStructuredSet(structuredPilot[chapter](level), chapter, level);
  const questions=(engines[chapter]||integers)();
  if(difficulty==="application")return [...questions.slice(2),...questions.slice(0,2)];
  if(difficulty==="reasoning")return [...questions].reverse();
  return questions;
}
