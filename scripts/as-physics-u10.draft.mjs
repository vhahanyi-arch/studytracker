export function createDraft({sq,r,validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 24;
// circuit symbols visually checked on pp. 61–62. Sixteen objectives in 10.1–10.3.
const structuredAsCircuits = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested.'
  });
  if(difficulty==='foundational') {
    const symbols=[
      ['one long and one short parallel plate','cell'],
      ['several alternating long and short parallel plates','battery of cells'],
      ['two open terminal circles on horizontal leads, with no alternating-wave mark between them','power supply'],
      ['two terminal circles with an alternating-wave mark between them','a.c. power supply'],
      ['a filled dot where three conducting lines meet','junction of conductors'],
      ['a circle containing a cross','lamp'],
      ['a plain rectangle with two end leads','fixed resistor'],
      ['a resistor rectangle crossed by a diagonal arrow','variable resistor'],
      ['a resistor rectangle crossed by a sloping line with a short bent end, without an arrowhead','thermistor'],
      ['a resistor rectangle with two arrows pointing towards it','light-dependent resistor'],
      ['a rectangle split into narrow vertical sections with leads at its ends','heater'],
      ['a gap between two conductors with a sloping movable contact','switch'],
      ['a conductor ending in three horizontal bars of decreasing length','earth'],
      ['an upward dome over a horizontal base, with two downward connection lines','electric bell'],
      ['a downward-facing semicircular bowl below a horizontal line, with two downward connections','buzzer'],
      ['a circle touching a vertical line on its left, with two leads on its right','microphone'],
      ['a rectangle joined to a flared cone outline, with two leads on the left','loudspeaker'],
      ['a circle containing an underlined M','motor'],
      ['a rectangle containing G','generator'],
      ['a circle containing A','ammeter'],
      ['a circle containing V','voltmeter'],
      ['a circle containing an upward-pointing pointer arrow','galvanometer'],
      ['a resistor rectangle with two end leads and a third lead ending in a slider arrow touching its top','potentiometer'],
      ['a triangle pointing towards a bar, with one lead at each end and no light arrows','diode'],
      ['a diode symbol with two arrows pointing away from it','light-emitting diode'],
      ['a circle containing the short rising-and-falling trace mark shown in the syllabus','oscilloscope'],
      ['two equal parallel plates separated by a gap, with one lead on each side','capacitor']
    ];
    const symbol=r(0,symbols.length-1),ammeter=r(0,1)===0,emf=r(2,12),charge=r(2,10),sourceEnergy=r(0,1)===0;
    const outgoing=r(1,8),unknown=r(1,8),drop1=r(1,8),drop2=r(1,8);
    return validateUnitSet([
      choice('as-u10-f1','10.1.1',`In the syllabus circuit-symbol sheet, which component or connection is represented by ${symbols[symbol][0]}?`,
        [symbols[symbol][1],symbols[(symbol+1)%symbols.length][1],symbols[(symbol+7)%symbols.length][1],symbols[(symbol+13)%symbols.length][1]],0,
        'Match the shape and identifying marks to the syllabus symbol sheet, pages 61–62.',`This is the symbol for ${symbols[symbol][1]}.`),
      choice('as-u10-f2','10.1.2',`In a circuit diagram, resistor R is connected between nodes P and Q. To measure ${ammeter?'the current through R with an ideal ammeter':'the potential difference across R with an ideal voltmeter'}, which connection is correct?`,
        ['insert the meter in series in the branch containing R','connect the meter directly between P and Q in parallel with R','replace R by an ideal wire','leave both meter terminals unconnected'],ammeter?0:1,
        'An ammeter carries the branch current; a voltmeter compares two node potentials.',ammeter?'The ideal ammeter is inserted in series so the current through R passes through it.':'The ideal voltmeter connects across P and Q; it draws no current in this ideal model.'),
      numeric('as-u10-f3','10.1.3',`A source transfers ${emf*charge} J from its chemical store to electrical energy while driving ${charge} C around a complete circuit. Find its e.m.f. in V.`,emf,
        'E.m.f. is source energy transferred per unit charge.',`E = ${emf*charge} / ${charge} = ${emf} V.`),
      {...sq('as-u10-f4','10.1.4',difficulty,`True or false: e.m.f. describes ${sourceEnergy?'energy supplied by a source per unit charge, whereas p.d. across a resistor describes energy transferred from electrical to other forms per unit charge':'a mechanical force on charge measured in newtons, whereas p.d. is energy per unit charge'}.`,sourceEnergy?'true':'false',
        'Despite its name, electromotive force is measured in volts, not newtons.',sourceEnergy?'True: both are energy per charge, but describe different energy transfers.':'False: e.m.f. is energy supplied per unit charge and has unit volt.'),answerFormat:'Enter true or false.'},
      numeric('as-u10-f5','10.2.1',`At a junction, ${outgoing+unknown} A enters and ${outgoing} A leaves through one branch. There is just one other branch. Find the current leaving through it in A.`,unknown,
        "Kirchhoff's first law follows from conservation of charge: total current in equals total current out.",`${outgoing+unknown} = ${outgoing} + I, so I = ${unknown} A.`),
      numeric('as-u10-f6','10.2.2',`A single loop contains an ideal ${drop1+drop2} V source and two resistors. In the direction of current, the first resistor has a ${drop1} V drop. Find the drop across the second resistor in V.`,drop2,
        "Kirchhoff's second law expresses conservation of energy per unit charge around a loop.",`Source rise = sum of drops: ${drop1+drop2} = ${drop1} + V, so V = ${drop2} V.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    const current=r(1,4),load=r(3,12),internal=r(1,3),three=r(0,1)===0;
    const r1=r(2,20),r2=r(2,20),r3=r(2,20),reciprocal=r(0,1)===0,base=r(1,10),unequal=r(0,1)===0;
    const upper=r(1,5),lower=r(1,5),voltageStep=r(1,3);
    return validateUnitSet([
      numeric('as-u10-a1','10.1.5',`A cell has e.m.f. ${current*(load+internal)} V and internal resistance ${internal} ohms. It supplies a single ${load} ohm external load. Find its terminal p.d. in V.`,current*load,
        'First use the total series resistance to find current; terminal voltage is the voltage across the external load.',`I = ${current*(load+internal)} / (${load} + ${internal}) = ${current} A. Terminal V = I R = ${current*load} V.`),
      choice('as-u10-a2','10.2.3',`The same nonzero current I flows through ${three?'three series resistors R1, R2 and R3':'two series resistors R1 and R2'}. Kirchhoff's loop law gives IR_total = ${three?'IR1 + IR2 + IR3':'IR1 + IR2'}. Dividing by I, which expression is R_total?`,
        three?['R1 + R2 + R3','1/(R1 + R2 + R3)','R1R2R3','R1 - R2 - R3']:['R1 + R2','R1R2/(R1 + R2)','1/(R1 + R2)','R1 - R2'],0,
        'In series, potential differences add while the current is common.',three?'Dividing every term by I gives R_total = R1 + R2 + R3.':'Dividing every term by I gives R_total = R1 + R2.'),
      numeric('as-u10-a3','10.2.4',`Resistors of ${r1} ohms, ${r2} ohms and ${r3} ohms are connected in series. Find their combined resistance in ohms.`,r1+r2+r3,
        'Add all series resistances.',`R_total = ${r1} + ${r2} + ${r3} = ${r1+r2+r3} ohms.`),
      choice('as-u10-a4','10.2.5',`Two parallel resistors R1 and R2 have the same nonzero p.d. V. Kirchhoff's junction law gives V/R_total = V/R1 + V/R2. ${reciprocal?'Divide by V: which expression equals 1/R_total?':'Divide by V and rearrange: which expression equals R_total?'}`,
        reciprocal?['1/R1 + 1/R2','R1 + R2','1/(R1 + R2)','R1R2']:['R1R2/(R1 + R2)','R1 + R2','1/R1 + 1/R2','R1R2'],0,
        'Parallel branch currents add, and the branch voltage is common.',reciprocal?'Dividing by V gives 1/R_total = 1/R1 + 1/R2.':'The reciprocal sum is (R1 + R2)/(R1R2), so R_total = R1R2/(R1 + R2).'),
      numeric('as-u10-a5','10.2.6',`Two resistors of ${unequal?3*base:2*base} ohms and ${unequal?6*base:2*base} ohms are connected in parallel. Find their combined resistance in ohms.`,unequal?2*base:base,
        'Use the reciprocal sum or R1R2/(R1 + R2); the result must be less than either resistance.',`R_total = ${unequal?2*base:base} ohms from the reciprocal sum.`),
      numeric('as-u10-a6','10.3.1',`An unloaded potential divider connects an upper ${upper} kilohm resistor from +${(upper+lower)*voltageStep} V to junction J and a lower ${lower} kilohm resistor from J to 0 V. Find the p.d. of J relative to 0 V in V.`,lower*voltageStep,
        'Both resistors carry the same current. The output across the lower resistor is its fraction of the total resistance times supply voltage.',`V_out = ${(upper+lower)*voltageStep} × ${lower}/(${upper} + ${lower}) = ${lower*voltageStep} V.`)
    ],difficulty);
  }
  const base=r(1,3),branchCurrent=r(1,2),internal=r(1,4),current=r(1,4),terminal=current*internal+4*r(1,5);
  const reference=r(1,4),referenceLength=20*r(1,2),unknownLength=10*r(1,9),nullCurrent=r(0,1)===0;
  const ldr=r(0,1)===0,increasing=r(0,1)===0,sensorUpper=r(0,1)===0,upper=r(1,2),output=2*r(1,5);
  const sensorDecreases=increasing,outputRises=sensorUpper===sensorDecreases;
  return validateUnitSet([
    numeric('as-u10-r1','10.2.7',`An ideal ${9*base*branchCurrent} V source feeds a ${base} ohm resistor in series with a parallel pair of ${3*base} ohms and ${6*base} ohms. A learner assumes the total current flows in both parallel branches. Find the current in the ${3*base} ohm branch in A.`,2*branchCurrent,
      'Use the common voltage across the parallel pair and conserve current at the junction.',`The parallel resistance is ${2*base} ohms, so total current is ${3*branchCurrent} A. The series drop is ${3*base*branchCurrent} V and branch p.d. is ${6*base*branchCurrent} V. Branch current = ${2*branchCurrent} A.`),
    numeric('as-u10-r2','10.1.5',`A cell has open-circuit terminal voltage ${terminal+current*internal} V. When supplying ${current} A its terminal voltage is ${terminal} V. Assume constant e.m.f. and internal resistance. A learner uses terminal V/I for internal resistance. Find the correct internal resistance in ohms.`,internal,
      'At open circuit, I = 0 so terminal voltage equals e.m.f.; the loaded voltage deficit is Ir.',`Lost voltage = ${terminal+current*internal} - ${terminal} = ${current*internal} V. Internal r = ${current*internal}/${current} = ${internal} ohms.`),
    numeric('as-u10-r3','10.3.2',`A uniform potentiometer wire is supplied by a steady driver current. A reference p.d. of ${reference} V balances at ${referenceLength} cm from the zero end. An unknown p.d. balances at ${unknownLength} cm with the same wire current. Both are null measurements. Find the unknown p.d. in V.`,reference*unknownLength/referenceLength,
      'For the same potential gradient, the ratio of p.d.s equals the ratio of balance lengths.',`V_unknown = ${reference} × ${unknownLength}/${referenceLength} = ${reference*unknownLength/referenceLength} V.`),
    choice('as-u10-r4','10.3.3',nullCurrent
      ? 'A cell is compared with a section of a current-carrying potentiometer wire. At balance the galvanometer shows null. Which current statement is correct?'
      : 'A cell is connected in opposition to a section of a current-carrying potentiometer wire. At galvanometer null, which voltage statement is correct?',
      ['the galvanometer comparison branch carries zero current while the driver wire can still carry current','the driver wire must carry zero current','the cell voltage must equal the voltage across the entire driver wire','the cell voltage equals the p.d. across the selected balance length'],nullCurrent?0:3,
      'A null means no current through the comparison branch, not no current anywhere in the circuit.',nullCurrent?'There is no comparison current at balance; the separate driver circuit still establishes a potential gradient.':'No galvanometer current flows when the opposed p.d.s across the selected section and cell are equal.'),
    choice('as-u10-r5','10.3.4',`An unloaded divider has a ${ldr?'light-dependent resistor (LDR)':'negative-temperature-coefficient thermistor'} as the ${sensorUpper?'upper resistor from +V_s to junction J':'lower resistor from junction J to 0 V'}, and a fixed resistor in the other position. The supply stays fixed. The ${ldr?'light intensity':'temperature'} is ${increasing?'increased':'decreased'}. What happens to sensor resistance and the output p.d. of J relative to 0 V?`,
      ['sensor resistance decreases and output rises','sensor resistance decreases and output falls','sensor resistance increases and output rises','sensor resistance increases and output falls'],sensorDecreases?(outputRises?0:1):(outputRises?2:3),
      'First find how the sensor resistance changes, then apply the divider ratio to the resistor connected below J.',`Sensor resistance ${sensorDecreases?'decreases':'increases'}. With the sensor in the ${sensorUpper?'upper':'lower'} position, the lower-resistor fraction ${outputRises?'increases':'decreases'}, so output ${outputRises?'rises':'falls'}.`),
    numeric('as-u10-r6','10.3.1',`An ideal ${(2*upper+1)*output} V supply feeds an upper ${upper} kilohm resistor and a lower 1 kilohm resistor as a divider. A 1 kilohm load is then connected in parallel with the lower resistor. A learner still uses the unloaded divider ratio. Find the actual p.d. across the load in V.`,output,
      'Combine the lower resistor and load in parallel before calculating the divider output.',`The lower equivalent resistance is 0.5 kilohms. V_out = ${(2*upper+1)*output} × 0.5/(${upper} + 0.5) = ${output} V.`)
  ],difficulty);
};
// END VERIFIED BODY
return structuredAsCircuits;
}
