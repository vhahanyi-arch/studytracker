export function createDraft({sq,r,validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 20.
// Ten objectives in 6.1–6.2; source hash and wording in as-physics-syllabus.json.
const structuredAsDeformation = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested.'
  });
  if(difficulty==='foundational') {
    const pulling=r(0,1)===0, length=10*r(2,5), change=r(1,8), extending=r(0,1)===0;
    const k=100*r(1,8), cm=r(1,5), hookeK=50*r(1,8), hookeCm=2*r(1,5);
    const area=r(1,5), stress=10*r(1,8), elastic=r(0,1)===0;
    return validateUnitSet([
      choice('as-u6-f1','6.1.1',`Equal and opposite forces act at the ends of a rod along its length, ${pulling?'pulling the ends apart':'pushing the ends towards each other'}. What type of loading is this?`,
        ['tensile','compressive','a couple','no loading'],pulling?0:1,'Decide whether the forces tend to lengthen or shorten the rod.',pulling?'Pulling apart produces tensile loading.':'Pushing together produces compressive loading.'),
      numeric('as-u6-f2','6.1.2',`An unloaded specimen has length ${length} cm. Under load its length becomes ${length+(extending?change:-change)} cm. Find the magnitude of its ${extending?'extension':'compression'} in cm.`,change,
        'Compare the loaded and unloaded lengths.',`The ${extending?'extension':'compression'} is ${change} cm; it is not the total length.`),
      numeric('as-u6-f3','6.1.4',`A spring obeying Hooke's law extends by ${cm} cm under a force of ${k*cm/100} N. Find its spring constant in N/m.`,k,
        'Convert extension to metres, then use k = F/x.',`k = ${k*cm/100} / ${cm/100} = ${k} N/m.`),
      numeric('as-u6-f4','6.1.3',`A spring of constant ${hookeK} N/m is extended by ${hookeCm} cm within its limit of proportionality. Find the magnitude of the applied force in N.`,hookeK*hookeCm/100,
        "Hooke's law is F = kx within the limit of proportionality.",`F = ${hookeK} × ${hookeCm/100} = ${hookeK*hookeCm/100} N.`),
      numeric('as-u6-f5','6.1.5',`A wire of cross-sectional area ${area} mm^2 carries a tensile force of ${area*stress} N. Find its tensile stress in MPa.`,stress,
        'Stress is force divided by cross-sectional area. 1 N/mm^2 = 1 MPa.',`Stress = ${area*stress} / ${area} = ${stress} MPa.`),
      {...sq('as-u6-f6','6.2.1',difficulty,`True or false: a specimen returns completely to its original length when the load is removed, so the deformation is ${elastic?'elastic':'plastic'}.`,elastic?'true':'false',
        'Elastic deformation is fully reversed on unloading.',elastic?'True: there is no permanent deformation.':'False: plastic deformation leaves a permanent change in length.'),answerFormat:'Enter true or false.'}
    ],difficulty);
  }
  if(difficulty==='application') {
    const length=r(1,4), strainStep=r(1,8), extension=length*strainStep/10;
    const modulus=25*r(2,8), strainUnits=r(1,4), wireStress=modulus*strainUnits;
    const experimentStep=r(0,3), stepCm=r(1,5), middleForce=10*r(1,8), endForce=3*middleForce;
    const finalForce=10*r(1,10), endCm=r(1,8), energyK=200*r(1,10), energyCm=r(1,8);
    return validateUnitSet([
      numeric('as-u6-a1','6.1.5',`A wire has original length ${length} m and extension ${extension} mm. Calculate its tensile strain (dimensionless).`,strainStep/10000,
        'Strain is extension divided by original length, both in the same unit.',`Strain = ${extension} / ${length*1000} = ${strainStep/10000}.`),
      numeric('as-u6-a2','6.1.5',`Within the proportional region, a wire has tensile stress ${wireStress} MPa and tensile strain ${strainUnits/1000}. Find its Young modulus in GPa.`,modulus,
        'Young modulus is stress divided by strain. Convert MPa to GPa.',`E = ${wireStress} / ${strainUnits/1000} MPa = ${modulus} GPa.`),
      choice('as-u6-a3','6.1.6',`In a Young modulus experiment on a long thin wire, the original gauge length is L and cross-sectional area is A. Which method is suitable for ${['measuring the diameter accurately','measuring L','obtaining the modulus from a force-extension graph','collecting a series of force-extension readings'][experimentStep]}?`,
        ['use a micrometer at several positions and orientations, then average the diameters','use a metre rule along the wire between the gauge marks','plot force F against extension x in the proportional region and multiply the gradient by L/A','increase the load in small steps within the proportional region and measure each extension from the original length'],experimentStep,
        'Distinguish measuring the dimensions, collecting readings and processing the graph.',[
          'Repeated micrometer readings check variation in diameter; calculate cross-sectional area from the diameter.',
          'Measure the initial distance between the gauge marks with a metre rule; measure extension separately.',
          'The F-x gradient is F/x = EA/L, so multiply it by L/A to obtain E.',
          'Use a series of small loads and measure extension relative to the initial length; keep within the proportional region.'
        ][experimentStep]),
      numeric('as-u6-a4','6.2.2',`A force-extension graph consists of straight segments joining (0 cm, 0 N), (${stepCm} cm, ${middleForce} N) and (${2*stepCm} cm, ${endForce} N). Find the total work done in stretching the specimen from zero to ${2*stepCm} cm, in J.`,(2*middleForce+endForce)*stepCm/200,
        'Add the first triangular area and the second trapezium area; convert cm to m.',`Work = 0.5 × ${middleForce} × ${stepCm/100} + 0.5 × (${middleForce} + ${endForce}) × ${stepCm/100} = ${(2*middleForce+endForce)*stepCm/200} J.`),
      numeric('as-u6-a5','6.2.3',`A material is stretched within its limit of proportionality. Its force-extension graph is a straight line from (0 cm, 0 N) to (${endCm} cm, ${finalForce} N). Find the stored elastic potential energy in J.`,finalForce*endCm/200,
        'Stored energy is the triangular area under the force-extension graph.',`Energy = 0.5 × ${finalForce} × ${endCm/100} = ${finalForce*endCm/200} J.`),
      numeric('as-u6-a6','6.2.4',`A spring of constant ${energyK} N/m is stretched by ${energyCm} cm within its limit of proportionality. Find the elastic potential energy stored in J.`,energyK*energyCm*energyCm/20000,
        'Use E = 0.5kx^2 with x in metres.',`E = 0.5 × ${energyK} × (${energyCm/100})^2 = ${energyK*energyCm*energyCm/20000} J.`)
    ],difficulty);
  }
  const radiusFactor=r(2,3), lengthFactor=r(2,4), extensionStep=r(1,3);
  const oldExtension=radiusFactor*radiusFactor*extensionStep/10, newExtension=lengthFactor*extensionStep/10;
  const radiusMistake=r(0,1)===0, permanent=r(0,1)===0;
  const residual=r(1,4), recoverCm=r(2,6), peakForce=20*r(1,6), loss=peakForce*r(1,4)/100;
  const recovered=peakForce*recoverCm/200, loadingWork=(peakForce*recoverCm+loss*200)/200, askLost=r(0,1)===0;
  const limitK=200*r(1,8), limitCm=r(1,8), limitForce=limitK*limitCm/100;
  const energyK=800*r(1,5), startCm=5*r(1,4), stretchFactor=r(2,3), extraEnergy=energyK*startCm*startCm*(stretchFactor*stretchFactor-1)/20000;
  return validateUnitSet([
    numeric('as-u6-r1','6.1.5',`Wire A has original length 4 m and extends ${oldExtension} mm under a tensile force. Wire B is made of the same material, has ${lengthFactor} times A's original length and ${radiusFactor} times A's radius, and carries the same force. Both remain within the proportional region. A learner treats area as proportional to radius. Find B's correct extension in mm.`,newExtension,
      'From E = FL/(Ax), extension is proportional to L/A for the same force and material. Area is proportional to radius squared.',`Extension = ${oldExtension} × ${lengthFactor} / ${radiusFactor}^2 = ${newExtension} mm.`),
    choice('as-u6-r2','6.1.6',`A learner determines a wire's Young modulus using E = FL/(Ax). All measurements are correct, but when calculating A the learner ${radiusMistake?'substitutes the radius for d in A = πd^2/4':'substitutes the diameter for r in A = πr^2'}. How does the calculated modulus compare with the true modulus?`,
      ['four times the true modulus','one quarter of the true modulus','twice the true modulus','half the true modulus'],radiusMistake?0:1,
      'Track the factor error in area, then remember E is inversely proportional to area.',radiusMistake?'Area is one quarter of the true area, so the calculated modulus is four times the true value.':'Area is four times the true area, so the calculated modulus is one quarter of the true value.'),
    choice('as-u6-r3','6.2.1',permanent
      ? 'A specimen is loaded and then completely unloaded. It retains a permanent extension. Which conclusion follows?'
      : 'A specimen is loaded beyond the point where force is proportional to extension, then completely unloaded. It returns to its original length. Which conclusion follows?',
      ['the elastic limit was exceeded and plastic deformation occurred','the proportionality limit was exceeded but the deformation was elastic','no deformation occurred','force stayed proportional to extension throughout'],permanent?0:1,
      'The proportionality limit concerns a linear relation; the elastic limit concerns permanent deformation.',permanent?'Permanent extension demonstrates plastic deformation beyond the elastic limit.':'Returning to the original length demonstrates elastic deformation, despite a non-proportional loading relation.'),
    numeric('as-u6-r4','6.2.2',`A specimen takes ${loadingWork} J of work to load from zero extension to ${residual+recoverCm} cm at force ${peakForce} N. Its unloading graph is a straight line from this point to zero force at extension ${residual} cm. Assume all loading work not returned mechanically during unloading is converted to thermal energy. Find the ${askLost?'energy dissipated during this loading-unloading process':'energy returned as mechanical work during unloading'} in J.`,askLost?loss:recovered,
      'Returned work is the area under the unloading line down to its zero-force intercept. Dissipated energy is loading work minus returned work.',`Returned work = 0.5 × ${peakForce} × (${residual+recoverCm} - ${residual}) / 100 = ${recovered} J. Dissipated energy = ${loadingWork} - ${recovered} = ${loss} J.`),
    numeric('as-u6-r5','6.1.2',`A spring has constant ${limitK} N/m and a limit of proportionality at force ${limitForce} N. A proposed extension of ${2*limitCm} cm would exceed that limit. Find the greatest extension, in cm, for which the proportional force-extension model applies.`,limitCm,
      'Calculate the extension at the proportionality limit using x = F/k.',`At the limit, x = ${limitForce} / ${limitK} m = ${limitCm} cm. The proposed extension is twice this.`),
    numeric('as-u6-r6','6.2.4',`A spring of constant ${energyK} N/m is initially extended by ${startCm} cm. It is then stretched to ${stretchFactor*startCm} cm; all extensions remain within the limit of proportionality. A learner uses 0.5k(final extension - initial extension)^2. Find the correct additional work required in J.`,extraEnergy,
      'Subtract the two stored energies; the difference of squares is not the square of the difference.',`Extra work = 0.5 × ${energyK} × ((${stretchFactor*startCm/100})^2 - (${startCm/100})^2) = ${extraEnergy} J.`)
  ],difficulty);
};
// END VERIFIED BODY
return structuredAsDeformation;
}
