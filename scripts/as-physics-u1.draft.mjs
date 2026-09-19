// Standalone draft. Production helpers are injected so the verified body ports unchanged.
export function createDraft({sq, r, validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, page 16.
// Objective IDs refer to lib/as-physics-syllabus.json (12 objectives, sections 1.1–1.4).
const structuredAsQuantities = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    // Rotate choices and the key together; the semantic answer must also vary.
    const offset = r(0, options.length - 1);
    const rotated = options.slice(offset).concat(options.slice(0, offset));
    const letter = String.fromCharCode(97 + (correct - offset + options.length) % options.length);
    return {...sq(id, objective, difficulty,
      `${prompt} ${rotated.map((option, i) => `(${String.fromCharCode(97+i)}) ${option}`).join(' ')}`,
      letter, hint, solution), answerFormat: 'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({
    ...sq(id, objective, difficulty, prompt, String(answer), hint, solution),
    answerFormat: 'Enter the number only, in the unit requested.'
  });
  if (difficulty === 'foundational') {
    const magnitude = r(2, 20);
    const quantity = r(0, 1) === 0 ? ['length', 'm'] : ['time', 's'];
    const estimate = r(0, 1) === 0
      ? ['the height of an adult', ['1.7 m', '0.017 m', '170 m', '1700 m']]
      : ['the mass of an adult', ['70 kg', '0.07 kg', '7000 kg', '70000 kg']];
    const base = [['mass', 'kg'], ['length', 'm'], ['time', 's'], ['current', 'A'], ['temperature', 'K']][r(0,4)];
    const derived = [['force', 'kg m s^-2'], ['energy', 'kg m^2 s^-2'], ['pressure', 'kg m^-1 s^-2'], ['power', 'kg m^2 s^-3']];
    const derivedIndex = r(0,3);
    const prefix = [['pico','p',-12],['nano','n',-9],['micro','μ',-6],['milli','m',-3],['centi','c',-2],['deci','d',-1],['kilo','k',3],['mega','M',6],['giga','G',9],['tera','T',12]][r(0,9)];
    const scalar = r(0,1) === 0;
    const example = scalar ? ['mass','energy','speed'][r(0,2)] : ['force','velocity','momentum'][r(0,2)];
    return validateUnitSet([
      choice('as-u1-f1','1.1.1',`A ${quantity[0]} is recorded as ${magnitude} ${quantity[1]}. Which gives its numerical magnitude followed by its unit?`,
        [`${magnitude}; ${quantity[1]}`, `${quantity[1]}; ${magnitude}`, `${magnitude}; no unit`, `no magnitude; ${quantity[1]}`],0,
        'A measurement combines a number with a unit.',`The magnitude is ${magnitude} and the unit is ${quantity[1]}.`),
      choice('as-u1-f2','1.1.2',`Which is a reasonable estimate of ${estimate[0]}?`,estimate[1],0,
        'Compare each order of magnitude with an everyday adult.',`${estimate[1][0]} is a reasonable adult value.`),
      {...sq('as-u1-f3','1.2.1',difficulty,`Give the SI base unit for ${base[0]}. Write its name.`,
        {kg:['kilogram','kilograms'],m:['metre','meter','metres','meters'],s:['second','seconds'],A:['ampere','amp','amperes','amps'],K:['kelvin','kelvins']}[base[1]],
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
// END VERIFIED BODY
return structuredAsQuantities;
}
