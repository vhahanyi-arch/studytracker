// Standalone draft; injected existing engine helpers preserve the production architecture.
export function createDraft({sq, r, validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, page 17.
// Nine objectives, 2.1.1–2.1.9, transcribed in lib/as-physics-syllabus.json.
const structuredAsKinematics = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    const offset = r(0, options.length - 1);
    const rotated = options.slice(offset).concat(options.slice(0, offset));
    const letter = String.fromCharCode(97 + (correct - offset + options.length) % options.length);
    return {...sq(id, objective, difficulty,
      `${prompt} ${rotated.map((option,i)=>`(${String.fromCharCode(97+i)}) ${option}`).join(' ')}`,
      letter, hint, solution), answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({
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
// END VERIFIED BODY
return structuredAsKinematics;
}
