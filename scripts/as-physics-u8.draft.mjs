export function createDraft({sq,r,validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 22.
// Twelve objectives in 8.1–8.4; source hash and wording in as-physics-syllabus.json.
const structuredAsSuperposition = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    const offset=r(0,options.length-1), rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,
      String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({
    ...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested. Retain a negative sign where appropriate.'
  });
  if(difficulty==='foundational') {
    const first=r(1,8),second=r(1,8)*(r(0,1)===0?1:-1),node=r(0,1)===0;
    const distance=r(2,12),adjacentNode=r(0,1)===0,diffraction=r(0,1)===0,coherent=r(0,1)===0;
    const density=[100,200,250,400,500][r(0,4)];
    return validateUnitSet([
      numeric('as-u8-f1','8.1.1',`At one point, two overlapping waves produce displacements of +${first} mm and ${second} mm along the same axis at the same instant. Find the signed resultant displacement in mm.`,first+second,
        'Add the individual displacements algebraically, keeping their signs.',`${first} + (${second}) = ${first+second} mm.`),
      choice('as-u8-f2','8.1.3',`In a stationary wave, what is a point where ${node?'the displacement remains zero at all times':'the oscillation amplitude is greatest'} called?`,['a node','an antinode','a wavefront','a source'],node?0:1,
        'A node stays at rest; an antinode has maximum oscillation amplitude.',node?'The point is a node, not merely a point crossing equilibrium at one instant.':'The point is an antinode; its instantaneous displacement can still be zero.'),
      numeric('as-u8-f3','8.1.4',`In a stationary wave, the distance from a node to the ${adjacentNode?'next node':'nearest antinode'} is ${distance} cm. Find the wavelength in cm.`,distance*(adjacentNode?2:4),
        'Adjacent nodes are half a wavelength apart; a node and nearest antinode are a quarter wavelength apart.',`λ = ${distance} × ${adjacentNode?2:4} = ${distance*(adjacentNode?2:4)} cm.`),
      choice('as-u8-f4','8.2.1',diffraction?'Water waves spread into the region behind a narrow gap. Which phenomenon describes this spreading?':'Two overlapping coherent water waves produce alternating regions of reinforcement and cancellation. Which phenomenon describes this pattern?',
        ['diffraction','interference','absorption','a change in wave frequency'],diffraction?0:1,
        'Distinguish spreading at an aperture from the pattern produced by overlapping waves.',diffraction?'Diffraction is spreading at a gap or around an obstacle.':'The reinforcement and cancellation pattern is interference.'),
      {...sq('as-u8-f5','8.3.1',difficulty,`True or false: two sources with the same frequency are coherent if their phase difference ${coherent?'remains constant':'varies randomly with time'}.`,coherent?'true':'false',
        'Coherence requires a constant phase difference as well as equal frequency.',coherent?'True: the phase difference may be nonzero, but must remain constant.':'False: equal frequency alone is insufficient if relative phase changes randomly.'),answerFormat:'Enter true or false.'},
      numeric('as-u8-f6','8.4.1',`A diffraction grating has ${density} equally spaced lines per mm. Find the grating spacing in micrometres.`,1000/density,
        'The spacing is the reciprocal of line density. There are 1000 micrometres in a millimetre.',`d = 1000 / ${density} = ${1000/density} micrometres.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    const experiment=r(0,2),narrow=r(0,1)===0,medium=r(0,3);
    const wavelength=50*r(8,14),screen=r(1,3),slitTenths=[5,10][r(0,1)],fringe=wavelength*screen/(100*slitTenths);
    const gratingWavelength=100*r(4,7),order=r(1,2),angleMethod=r(0,1)===0;
    return validateUnitSet([
      choice('as-u8-a1','8.1.2',`Which method demonstrates stationary waves using ${['microwaves','a stretched string','an air column'][experiment]}?`,
        ['reflect a transmitted beam from a metal sheet and move a detector to locate alternating maxima and minima','drive one end periodically and adjust frequency until fixed nodes and large oscillating loops form','vary the length of a tube closed at one end while a fixed-frequency sound source drives it, finding resonances','use two unrelated sources whose relative phase continually changes'],experiment,
        'Incident and reflected waves of the same frequency can superpose to form a stationary pattern.',['The incident and reflected microwaves produce fixed positions of minimum and maximum detector response.','Reflection and periodic driving create a stationary string pattern with nodes and antinodes.','Resonance in the tube reveals a stationary wave in the air column.'][experiment]),
      choice('as-u8-a2','8.2.2',`In a ripple tank, wavelength is held fixed. A gap changes from ${narrow?'ten wavelengths wide to one wavelength wide':'one wavelength wide to ten wavelengths wide'}. How does the spreading of the transmitted waves change?`,
        ['spreading becomes more pronounced','spreading becomes less pronounced','frequency doubles','wavelength becomes zero'],narrow?0:1,
        'Compare gap width with wavelength; a gap comparable to wavelength produces pronounced spreading.',narrow?'The narrower gap is comparable to the wavelength, so diffraction becomes more pronounced.':'The gap is now much wider than the wavelength, so diffraction becomes less pronounced.'),
      choice('as-u8-a3','8.3.2',`Which arrangement is suitable for demonstrating two-source interference with ${['water waves','sound','light','microwaves'][medium]}?`,
        ['drive two ripple-tank dippers from the same vibrator','drive two loudspeakers from the same signal generator and move a microphone across their overlap region','illuminate two narrow slits with one coherent monochromatic source and observe the overlapping light on a screen','illuminate two apertures from one transmitter and scan their overlapping beams with a receiver'],medium,
        'Use two mutually coherent waves and a suitable way to detect their overlap.',['The linked dippers produce a stable relative phase in overlapping ripples.','The common signal generator provides coherence; the microphone detects maxima and minima.','The two slits illuminated from one source provide coherent secondary waves.','The apertures fed by one transmitter provide coherent microwave paths.'][medium]),
      numeric('as-u8-a4','8.3.4',`In a double-slit experiment, slit separation is ${slitTenths/10} mm and screen distance is ${screen} m. Adjacent bright fringe centres are ${fringe} mm apart. The small-angle approximation applies. Find the light wavelength in nm.`,wavelength,
        'Use λ = ax/D, converting both slit separation and fringe spacing from mm to m.',`λ = (${slitTenths/10} × ${fringe} / ${screen}) × 1000 = ${wavelength} nm.`),
      numeric('as-u8-a5','8.4.1',`Monochromatic light is incident normally on a grating of spacing ${2*order*gratingWavelength} nm. The order n = ${order} maximum is at 30° to the central direction. Use sin 30° = 0.5. Find the wavelength in nm.`,gratingWavelength,
        'Rearrange d sin θ = nλ to λ = d sin θ/n.',`λ = ${2*order*gratingWavelength} × 0.5 / ${order} = ${gratingWavelength} nm.`),
      choice('as-u8-a6','8.4.2',angleMethod
        ? 'Light is normally incident on a diffraction grating. The angular separation between matching maxima of the same nonzero order on opposite sides of the central maximum is measured. What angle should be used as θ in d sin θ = nλ?'
        : 'A grating is illuminated normally with monochromatic light. A learner measures θ from the central maximum to a bright maximum but has not identified its order. What must be established before calculating wavelength from d sin θ = nλ?',
        ['half the measured angular separation','the order n of the measured maximum, with the central maximum as n = 0','the full measured angular separation','the mass of the grating'],angleMethod?0:1,
        'θ is measured from the central direction to one identified-order maximum.',angleMethod?'Matching maxima are at -θ and +θ, so their separation is 2θ.':'Identify the order by counting maxima from the central n = 0 maximum; use known grating spacing and the measured angle.')
    ],difficulty);
  }
  const stable=r(0,1)===0,swap=r(0,1)===0,amplitude=r(1,6);
  const wavelength=50*r(8,14),screen=r(1,3),fringeCount=r(3,8),span=wavelength*screen*(fringeCount-1)/500;
  const largestOrder=r(2,4),gratingWavelength=100*r(4,7),spacing=(2*largestOrder+1)*gratingWavelength/2,total=r(0,1)===0;
  const destructive=r(0,1)===0,pathWavelength=2*r(1,5),pathDifference=pathWavelength*(r(1,3)+(destructive?.5:0));
  const airWavelength=[20,40,50,80,100][r(0,4)],soundSpeed=320+10*r(0,4),frequency=soundSpeed*100/airWavelength;
  return validateUnitSet([
    choice('as-u8-r1','8.3.3',stable
      ? 'Two overlapping light waves have the same frequency, fixed relative phase and the same polarisation. Their amplitudes are unequal but both nonzero. What is the correct conclusion about an interference pattern on a resolving screen?'
      : 'Two overlapping light waves have the same frequency and the same polarisation, but their relative phase changes randomly many times during the observation. A learner expects fixed fringes merely because the frequencies match. What is the correct conclusion?',
      ['a stable pattern can form, but its minima need not be completely dark','no stable fringe pattern is resolved because the changing relative phase washes it out','unequal amplitudes always prevent any interference','equal frequency alone guarantees fixed dark fringes'],stable?0:1,
      'Constant relative phase fixes the pattern; equal amplitudes are needed for complete cancellation, not for all interference.',stable?'Coherence allows a stable pattern. Unequal amplitudes leave a nonzero minimum intensity.':'The moving phase-dependent pattern averages out, so equal frequency alone is insufficient.'),
    choice('as-u8-r2','8.1.3',`Two sinusoidal waves of equal amplitude ${amplitude} mm and frequency travel in opposite directions. Their displacement profiles are sampled at t = 0, T/4, T/2 and 3T/4. At point ${swap?'Q':'P'}, their pairs of displacements in mm are (${amplitude}, -${amplitude}), (0, 0), (-${amplitude}, ${amplitude}), (0, 0). At point ${swap?'P':'Q'}, the pairs are (0, 0), (${amplitude}, ${amplitude}), (0, 0), (-${amplitude}, -${amplitude}). Which identifies these points in the resultant stationary wave?`,
      ['P is a node and Q is an antinode','Q is a node and P is an antinode','both are nodes because both reach zero displacement','both are antinodes because each travelling wave moves'],swap?1:0,
      'Add the profiles point by point. Distinguish zero displacement at an instant from zero amplitude throughout the cycle.',`${swap?'Q':'P'} has cancelling displacements throughout the cycle and is a node. ${swap?'P':'Q'} oscillates between +${2*amplitude} and -${2*amplitude} mm and is an antinode.`),
    numeric('as-u8-r3','8.3.4',`A double-slit screen is ${screen} m from slits separated by 0.5 mm. The distance from the first to the last of ${fringeCount} consecutive bright fringe centres is ${span} mm. A learner divides this distance by ${fringeCount}. Assuming small angles, find the correct wavelength in nm.`,wavelength,
      'There is one fewer interval than fringe centres. Find adjacent fringe spacing before using λ = ax/D.',`There are ${fringeCount-1} intervals, so x = ${span} / ${fringeCount-1} = ${wavelength*screen/500} mm. λ = 0.5 × ${wavelength*screen/500} × 1000 / ${screen} = ${wavelength} nm.`),
    numeric('as-u8-r4','8.4.1',`Light of wavelength ${gratingWavelength} nm is incident normally on an ideal grating with spacing ${spacing} nm and no missing orders. A learner allows orders requiring sin θ greater than 1. Find the ${total?'total number of principal maxima, including both sides and the central maximum':'greatest possible order number on one side'}.`,total?2*largestOrder+1:largestOrder,
      'Require nλ/d ≤ 1. Count the central maximum once if a total is requested.',`d/λ = ${spacing/gratingWavelength}, so the largest integer order is ${largestOrder}. ${total?`There are 2 × ${largestOrder} + 1 = ${2*largestOrder+1} maxima.`:`No higher order is possible.`}`),
    choice('as-u8-r5','8.3.1',`Two coherent sources emit in phase with wavelength ${pathWavelength} cm. At an observation point their waves have equal amplitude, the same polarisation, and path difference ${pathDifference} cm. Ignore attenuation differences. What occurs at that point?`,
      ['constructive interference with maximum resultant amplitude','destructive interference with zero resultant amplitude','no superposition because the paths differ','the wave frequency doubles'],destructive?1:0,
      'For in-phase sources, integer-wavelength path differences reinforce; half-integer differences cancel when amplitudes are equal.',`The path difference is ${pathDifference/pathWavelength} wavelengths, giving ${destructive?'opposite phases and complete cancellation':'equal phases and maximum resultant amplitude'}.`),
    numeric('as-u8-r6','8.1.2',`A tube is closed at one end and open at the other. With a sound source of frequency ${frequency} Hz, successive resonance lengths are ${airWavelength/4} cm and ${3*airWavelength/4} cm. Neglect end corrections. A learner treats their difference as a full wavelength. Find the correct sound speed in m/s.`,soundSpeed,
      'Successive resonances of this tube differ in length by half a wavelength; then use v = fλ.',`Length difference = ${airWavelength/2} cm, so λ = ${airWavelength/100} m. v = ${frequency} × ${airWavelength/100} = ${soundSpeed} m/s.`)
  ],difficulty);
};
// END VERIFIED BODY
return structuredAsSuperposition;
}
