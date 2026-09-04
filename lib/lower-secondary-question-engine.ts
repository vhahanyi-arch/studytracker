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
  };
  if (structuredPilot[chapter])
    return validateStructuredSet(structuredPilot[chapter](level), chapter, level);
  const questions=(engines[chapter]||integers)();
  if(difficulty==="application")return [...questions.slice(2),...questions.slice(0,2)];
  if(difficulty==="reasoning")return [...questions].reverse();
  return questions;
}
