export function createDraft({sq,r,validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, pp. 20–21.
// Sixteen objectives in 7.1–7.5; source hash and wording in as-physics-syllabus.json.
const structuredAsWaves = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested.'
  });
  if(difficulty==='foundational') {
    const source=r(0,1)===0, term=r(0,3), area=r(1,8), intensity=5*r(1,20), transverse=r(0,1)===0;
    const correctEM=r(0,1)===0, visible=400+50*r(0,6);
    return validateUnitSet([
      choice('as-u7-f1','7.1.1',source
        ? 'A small marked section of rope carries a travelling transverse wave. Which describes the motion of the marked section?'
        : 'A marked coil of a spring carries a travelling longitudinal wave. Which describes the motion of the marked coil?',
        ['oscillates about equilibrium perpendicular to the direction the disturbance travels','oscillates about equilibrium parallel to the direction the disturbance travels','travels continuously with the disturbance','remains permanently at its equilibrium position'],source?0:1,
        'Distinguish the motion of the material from the motion of a disturbance.',source?'The marked section oscillates transversely; it does not travel along the rope with the wave.':'Neighbouring coils transmit the disturbance while oscillating along the spring about their equilibrium positions.'),
      choice('as-u7-f2','7.1.2',`Which term means ${['the greatest magnitude of displacement from equilibrium','the time for one complete oscillation','the number of complete oscillations per second','the distance between neighbouring points in phase on a wave'][term]}?`,
        ['amplitude','period','frequency','wavelength'],term,'Displacement is position relative to equilibrium; distinguish spatial and temporal wave quantities.',`${['Amplitude','Period','Frequency','Wavelength'][term]} has this definition.`),
      numeric('as-u7-f3','7.1.7',`A progressive wave carries power ${area*intensity} W uniformly through a perpendicular area of ${area} m^2. Find its intensity in W/m^2.`,intensity,
        'Intensity is power per unit area normal to propagation.',`I = ${area*intensity} / ${area} = ${intensity} W/m^2.`),
      choice('as-u7-f4','7.2.1',`A wave travels horizontally to the right. The particles of its medium oscillate ${transverse?'vertically up and down':'horizontally left and right'}. How is the wave classified?`,
        ['transverse','longitudinal','electromagnetic because it moves right','stationary because particles oscillate'],transverse?0:1,
        'Compare particle displacement with the propagation direction.',transverse?'The oscillations are perpendicular to propagation: transverse.':'The oscillations are parallel to propagation: longitudinal.'),
      {...sq('as-u7-f5','7.4.1',difficulty,`True or false: in free space, all electromagnetic waves ${correctEM?'are transverse and travel at the same speed c':'have the same frequency because they travel at the same speed c'}.`,correctEM?'true':'false',
        'The common free-space speed does not require equal frequencies or wavelengths.',correctEM?'True: all electromagnetic waves are transverse and share free-space speed c.':'False: different electromagnetic frequencies have different wavelengths, with c = fλ.'),answerFormat:'Enter true or false.'},
      choice('as-u7-f6','7.4.3','Which of these free-space wavelengths is in the visible range stated by the syllabus?',
        [`${visible} nm`,'100 nm','1000 nm','10000 nm'],0,'Recall the stated visible range, 400–700 nm.',`${visible} nm lies in the stated range 400–700 nm.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    const frequencyTask=r(0,1)===0, timeBase=[0.5,1,2][r(0,2)], periodDiv=[2,4,5,8][r(0,3)], gain=[0.5,1,2][r(0,2)], peakDiv=2*r(1,4);
    const wavelengthTask=r(0,1)===0, frequency=20*r(1,8), wavelengthCm=5*r(1,10);
    const first=r(1,4), separation=r(2,8), opposite=r(0,1)===0, approaching=r(0,1)===0, sourceFrequency=600*r(1,3);
    // Interior examples avoid disputed spectral boundaries; microwave is named separately from radio here.
    const band=r(0,6), bandNames=['radio waves (excluding microwaves)','microwaves','infrared','visible light','ultraviolet','X-rays','gamma rays'];
    const sampleWavelengths=['10 m','10 mm','10 micrometres','500 nm','100 nm','0.1 nm','0.001 nm'];
    return validateUnitSet([
      numeric('as-u7-a1','7.1.3',frequencyTask
        ? `A CRO time-base is set to ${timeBase} ms/div. One complete period spans ${periodDiv} horizontal divisions. Find the signal frequency in Hz.`
        : `A CRO y-gain is set to ${gain} V/div. The trace has a peak-to-peak height of ${peakDiv} vertical divisions. Find the voltage amplitude in V.`,frequencyTask?1000/(timeBase*periodDiv):gain*peakDiv/2,
        frequencyTask?'Period = horizontal divisions × time-base; convert ms to s, then use f = 1/T.':'Amplitude is half the peak-to-peak voltage.',frequencyTask?`T = ${timeBase*periodDiv} ms, so f = 1000 / ${timeBase*periodDiv} = ${1000/(timeBase*periodDiv)} Hz.`:`Amplitude = ${gain} × ${peakDiv} / 2 = ${gain*peakDiv/2} V.`),
      choice('as-u7-a2','7.1.4',wavelengthTask
        ? 'A wave moves one wavelength λ in one period T. Using v = λ/T and f = 1/T gives v = fλ. Which expression gives λ?'
        : 'A wave moves one wavelength λ in one period T. Starting from v = λ/T, substitute T = 1/f. Which expression gives v?',
        wavelengthTask?['v/f','vf','f/v','1/(vf)']:['fλ','λ/f','f/λ','1/(fλ)'],0,
        'Use distance per cycle and cycles per second.',wavelengthTask?'v = fλ, so λ = v/f.':'v = λ/(1/f) = fλ.'),
      numeric('as-u7-a3','7.1.5',`A wave on a rope has frequency ${frequency} Hz and wavelength ${wavelengthCm} cm. Find its propagation speed in m/s.`,frequency*wavelengthCm/100,
        'Convert the wavelength to metres and multiply by frequency.',`v = ${frequency} × ${wavelengthCm/100} = ${frequency*wavelengthCm/100} m/s.`),
      numeric('as-u7-a4','7.2.2',`At one instant, a displacement-position graph for a sinusoidal longitudinal wave has a positive displacement maximum at x = ${first} cm. The next ${opposite?'negative displacement minimum':'positive displacement maximum'} occurs at x = ${first+separation} cm. Find the wavelength in cm.`,separation*(opposite?2:1),
        'A displacement-position graph describes displacement along the propagation direction for this longitudinal wave. Adjacent opposite extrema are half a wavelength apart.',`The stated separation is ${opposite?'half a wavelength':'one wavelength'}, so λ = ${separation*(opposite?2:1)} cm.`),
      numeric('as-u7-a5','7.3.2',`A sound source emits at ${sourceFrequency} Hz while moving directly ${approaching?'towards':'away from'} a stationary observer at 30 m/s through still air. Sound speed is 330 m/s. Find the observed frequency in Hz.`,sourceFrequency*330/(approaching?300:360),
        'For a moving source and stationary observer, use f_o = f_s v/(v - v_s) for approach, or v + v_s in the denominator for recession.',`f_o = ${sourceFrequency} × 330 / ${approaching?300:360} = ${sourceFrequency*330/(approaching?300:360)} Hz.`),
      choice('as-u7-a6','7.4.2',`Which principal electromagnetic region contains a representative free-space wavelength of ${sampleWavelengths[band]}? Treat microwaves as a separate named region from radio waves; use the broad school-level regions, not overlapping specialised classifications.`,
        [bandNames[band],bandNames[(band+1)%7],bandNames[(band+3)%7],bandNames[(band+5)%7]],0,
        'Order the regions by decreasing wavelength: radio, microwave, infrared, visible, ultraviolet, X-ray, gamma.',`${sampleWavelengths[band]} is an interior example of ${bandNames[band]}; approximate boundaries are not needed for this example.`)
    ],difficulty);
  }
  const transportsEnergy=r(0,1)===0, approach=r(0,1)===0, polarises=r(0,1)===0;
  const angleIndex=r(0,4), relativeAngle=[0,30,45,60,90][angleIndex], transmission=[1,0.75,0.5,0.25,0][angleIndex];
  const inputIntensity=16*r(1,20), firstAngle=45, secondAngle=firstAngle+relativeAngle;
  const initialArea=r(1,6), finalArea=r(1,6), initialIntensity=5*r(1,20), amplitudeFactor=r(2,3);
  const quarterPeriod=2*r(1,6), phaseSteps=r(1,3), firstPeak=2*r(0,4);
  return validateUnitSet([
    {...sq('as-u7-r1','7.1.6',difficulty,`A floating marker oscillates as a small-amplitude progressive ripple passes it in a ripple tank. Neglect bulk flow. A learner says that because the marker has no net travel with the wave, ${transportsEnergy?'the wave can still transfer energy':'the wave cannot transfer energy'}. Is the learner's statement true or false?`,transportsEnergy?'true':'false',
      'Local oscillation can transfer energy to neighbouring regions without net transport of the medium.',transportsEnergy?'True: energy travels with the disturbance while the marker oscillates locally.':'False: progressive waves transfer energy even without net travel of the marker.'),answerFormat:'Enter true or false.'},
    choice('as-u7-r2','7.3.1',`A source moves directly ${approach?'towards':'away from'} a stationary observer through still air. A learner says the observed pitch changes because sound travels through the air at a different speed. Which correction is right?`,
      ['wavefront spacing decreases; sound speed is unchanged and observed frequency increases','wavefront spacing increases; sound speed is unchanged and observed frequency decreases','wavefront spacing stays fixed; sound speed increases','the source frequency must change'],approach?0:1,
      'The source changes the spacing of successive wavefronts in the air, not the sound speed of that air.',approach?'Wavefronts reaching the observer are closer together; with the same sound speed, more arrive per second.':'Wavefronts reaching the observer are farther apart; with the same sound speed, fewer arrive per second.'),
    choice('as-u7-r3','7.5.1',polarises
      ? 'A wave can be restricted to one direction of oscillation perpendicular to its travel by polarisation. What does this show about the wave?'
      : 'A sound wave in air is longitudinal. Why can it not be plane-polarised in the way light can?',
      ['it is transverse, with oscillations perpendicular to propagation','its oscillations are parallel to propagation, so there is no transverse oscillation direction to select','it must be a stationary wave','its frequency must be zero'],polarises?0:1,
      'Polarisation selects a transverse oscillation direction.',polarises?'Ability to polarise demonstrates transverse wave motion.':'Longitudinal sound in air has oscillations along propagation, not a choice of transverse directions.'),
    numeric('as-u7-r4','7.5.2',`Plane-polarised light of intensity ${inputIntensity} W/m^2 has its initial polarisation direction at 0°. It passes through ideal polarising filters whose transmission axes are at ${firstAngle}° and then ${secondAngle}° to the original direction. Use cos^2 45° = 0.5 and cos^2 ${relativeAngle}° = ${transmission}. A learner uses both angles relative to the original light in Malus's law. Find the correct final intensity in W/m^2.`,inputIntensity*transmission/2,
      'After the first filter, the transmitted polarisation is along its axis. Use the angle between successive axes for the second filter.',`After the first filter I = ${inputIntensity/2} W/m^2. The second relative angle is ${secondAngle} - ${firstAngle} = ${relativeAngle}°, so final I = ${inputIntensity/2} × ${transmission} = ${inputIntensity*transmission/2} W/m^2.`),
    numeric('as-u7-r5','7.1.7',`In the same medium at the same frequency, a progressive wave carries ${initialIntensity*initialArea} W uniformly through a perpendicular area of ${initialArea} m^2. In a second region its amplitude is ${amplitudeFactor} times as large. A learner assumes intensity changes by the same factor as amplitude. Find the power crossing a perpendicular area of ${finalArea} m^2 uniformly illuminated by the wave in the second region, in W.`,initialIntensity*amplitudeFactor*amplitudeFactor*finalArea,
      'First find initial intensity, scale it by the square of the amplitude ratio, then multiply by the final area.',`Initial intensity = ${initialIntensity} W/m^2; new intensity = ${initialIntensity*amplitudeFactor*amplitudeFactor} W/m^2. Power = ${initialIntensity*amplitudeFactor*amplitudeFactor*finalArea} W.`),
    numeric('as-u7-r6','7.1.2',`Two sinusoidal signals have the same period. On a displacement-time graph, signal A has consecutive positive maxima at ${firstPeak} ms and ${firstPeak+4*quarterPeriod} ms. Signal B's corresponding positive maximum is at ${firstPeak+phaseSteps*quarterPeriod} ms. A learner confuses the horizontal delay with an amplitude difference. Find the positive phase lag of B behind A in degrees, between 0° and 360°.`,phaseSteps*90,
      'Phase lag = 360° × time delay / period. Both time values may stay in ms in this ratio.',`Period = ${4*quarterPeriod} ms; delay = ${phaseSteps*quarterPeriod} ms. Phase lag = 360 × ${phaseSteps*quarterPeriod} / ${4*quarterPeriod} = ${phaseSteps*90}°.`)
  ],difficulty);
};
// END VERIFIED BODY
return structuredAsWaves;
}
