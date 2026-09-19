// Standalone Dynamics draft. Existing engine helpers are injected unchanged.
export function createDraft({sq, r, validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, user-supplied 664565-2025-2027-syllabus.pdf, version 1, pp. 17–18.
// Thirteen objectives, sections 3.1–3.3; provenance in lib/as-physics-syllabus.json.
const structuredAsDynamics = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    const letter=String.fromCharCode(97+(correct-offset+options.length)%options.length);
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((text,i)=>`(${String.fromCharCode(97+i)}) ${text}`).join(' ')}`,
      letter,hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({
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
// END VERIFIED BODY
return structuredAsDynamics;
}
