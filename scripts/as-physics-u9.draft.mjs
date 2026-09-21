export function createDraft({sq,r,validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 23.
// Fifteen objectives in 9.1–9.3; source hash and wording in as-physics-syllabus.json.
const structuredAsElectricity = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({
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
// END VERIFIED BODY
return structuredAsElectricity;
}
