export function createDraft({sq,r,validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 19.
// Eleven objectives in 5.1–5.2; source hash and wording in as-physics-syllabus.json.
const structuredAsEnergy = (difficulty) => {
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
// END VERIFIED BODY
return structuredAsEnergy;
}
