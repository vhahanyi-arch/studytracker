export function createDraft({sq,r,validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, pp. 18–19.
// Thirteen objectives in 4.1–4.3; source hash and wording in as-physics-syllabus.json.
const structuredAsForces = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({
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
// END VERIFIED BODY
return structuredAsForces;
}
