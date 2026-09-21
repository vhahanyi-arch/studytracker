export function createDraft({sq,r,validateUnitSet}) {
// BEGIN VERIFIED BODY
// Cambridge 9702, supplied 664565-2025-2027-syllabus.pdf, version 1, p. 25.
// All 18 objectives in 11.1–11.2; source page visually checked.
const structuredAsParticles = (difficulty) => {
  const choice = (id, objective, prompt, options, correct, hint, solution) => {
    const offset=r(0,options.length-1),rotated=options.slice(offset).concat(options.slice(0,offset));
    return {...sq(id,objective,difficulty,`${prompt} ${rotated.map((s,i)=>`(${String.fromCharCode(97+i)}) ${s}`).join(' ')}`,String.fromCharCode(97+(correct-offset+options.length)%options.length),hint,solution),answerFormat:'Enter the option letter (a, b, c or d).'};
  };
  const numeric = (id, objective, prompt, answer, hint, solution) => ({...sq(id,objective,difficulty,prompt,String(answer),hint,solution),answerFormat:'Enter the number only, in the unit requested.'});
  // Columns: parent A, parent Z, parent symbol, daughter symbol, decay type.
  const decays=[[238,92,'U','Th','alpha'],[226,88,'Ra','Rn','alpha'],[210,84,'Po','Pb','alpha'],[14,6,'C','N','beta-minus'],[3,1,'H','He','beta-minus'],[90,38,'Sr','Y','beta-minus'],[11,6,'C','B','beta-plus'],[13,7,'N','C','beta-plus'],[18,9,'F','O','beta-plus']];
  if(difficulty==='foundational') {
    const rare=r(0,1)===0,particle=r(0,2),[Z,N]=[[3,4],[6,6],[6,7],[8,8],[8,10],[10,10],[12,12],[14,14],[18,22],[20,20],[20,24]][r(0,10)],protons=r(0,1)===0,isotope=r(0,1)===0;
    const speciesList=[['C',6,12],['O',8,16],['Ne',10,20],['Mg',12,24]];
    const species=speciesList[r(0,3)],decay=decays[r(0,8)];
    const [A,z,parent,daughter,mode]=decay,daughterA=mode==='alpha'?A-4:A,daughterZ=mode==='alpha'?z-2:(mode==='beta-minus'?z+1:z-1),emittedCharge=z-daughterZ;
    return validateUnitSet([
      choice('as-u11-f1','11.1.1',`In alpha-particle scattering from thin metal foil, ${rare?'a very small fraction of incident particles are deflected through large angles, with some returning backwards':'most incident particles pass through with little or no deflection'}. Which inference follows?`,
        ['the atom is mostly empty space','positive charge and most atomic mass are concentrated in a small nucleus','electrons contain almost all atomic mass','positive charge is spread uniformly throughout the atom'],rare?1:0,
        'Relate the fraction affected and size of deflection to the concentration of charge and mass.',rare?'Large deflections of massive positive alpha particles require a concentrated positive centre; their rarity indicates its small size.':'Most trajectories miss the tiny nucleus, consistent with an atom that is mostly empty space.'),
      choice('as-u11-f2','11.1.2',`In the simple nuclear model, which description applies to ${['a proton','a neutron','an electron'][particle]}?`,
        ['positive charge, located in the nucleus','zero charge, located in the nucleus','negative charge, outside the nucleus','negative charge, located in the nucleus'],particle,
        'Distinguish nuclear constituents from orbital electrons.',`${['Protons are positive nuclear constituents.','Neutrons are neutral nuclear constituents.','Orbital electrons are negatively charged and lie outside the nucleus.'][particle]}`),
      numeric('as-u11-f3','11.1.3',`A nucleus contains ${Z} protons and ${N} neutrons. Find its ${protons?'proton number Z':'nucleon number A'}.`,protons?Z:Z+N,
        'Proton number counts protons; nucleon number counts protons plus neutrons.',protons?`Z = ${Z}.`:`A = ${Z} + ${N} = ${Z+N}.`),
      {...sq('as-u11-f4','11.1.4',difficulty,`True or false: two nuclei with ${isotope?'the same proton number but different neutron numbers':'the same nucleon number but different proton numbers'} are isotopes of the same element.`,isotope?'true':'false',
        'The proton number fixes the element; isotope differences are in neutron number.',isotope?'True: they are the same element with different neutron numbers.':'False: different proton numbers mean different elements, even when nucleon numbers match.'),answerFormat:'Enter true or false.'},
      choice('as-u11-f5','11.1.5',`Use the text notation ^A_Z X, with nucleon number A above proton number Z. Which notation represents a ${species[0]} nucleus with ${species[1]} protons and ${species[2]-species[1]} neutrons?`,
        [`^${species[2]}_${species[1]} ${species[0]}`,`^${species[1]}_${species[2]} ${species[0]}`,`^${species[2]-species[1]}_${species[1]} ${species[0]}`,`^${species[2]}_${species[2]} ${species[0]}`],0,
        'Add protons and neutrons for the upper number; use protons alone for the lower number.',`A = ${species[2]} and Z = ${species[1]}, so the notation is ^${species[2]}_${species[1]} ${species[0]}.`),
      numeric('as-u11-f6','11.1.6',`A nuclear decay is written ^${A}_${z} ${parent} -> ^${daughterA}_${daughterZ} ${daughter} + emitted particles. What is the total charge carried by the emitted particles, in units of positive elementary charge e?`,emittedCharge,
        'Conserve charge: parent proton number equals daughter proton number plus emitted charge in units of e.',`Charge balance: ${z} = ${daughterZ} + q/e, so q/e = ${emittedCharge}. Nucleon number is also conserved; emitted particles carry total nucleon number ${A-daughterA}.`)
    ],difficulty);
  }
  if(difficulty==='application') {
    const radiation=r(0,3),same=r(0,1)===0,minus=r(0,1)===0,alpha=r(0,1)===0,decay=decays[r(0,8)],mass=r(2,20);
    const [A,Z,parent,daughter,mode]=decay,a=mode==='alpha'?A-4:A,z=mode==='alpha'?Z-2:(mode==='beta-minus'?Z+1:Z-1);
    const emission=mode==='alpha'?'^4_2 alpha':(mode==='beta-minus'?'^0_-1 e + electron antineutrino':'^0_+1 e + electron neutrino');
    return validateUnitSet([
      choice('as-u11-a1','11.1.7',`Which description correctly identifies ${['alpha','beta-minus','beta-plus','gamma'][radiation]} radiation? Here m_e denotes the electron rest mass and e is the positive elementary charge.`,
        ['helium-4 nucleus; mass approximately 4 u; charge +2e','electron; rest mass m_e; charge -e','positron; rest mass m_e; charge +e','photon; zero rest mass; zero charge'],radiation,
        'Match the radiation to its constituents, rest mass and charge.',['An alpha particle contains two protons and two neutrons.','A beta-minus particle is an electron emitted in nuclear decay.','A beta-plus particle is a positron emitted in nuclear decay.','Gamma radiation consists of photons, which carry energy but have zero rest mass and no charge.'][radiation]),
      {...sq('as-u11-a2','11.1.8',difficulty,`True or false: a positron is the electron's antiparticle and has ${same?'the same rest mass but opposite electric charge':'the opposite electric charge and a negative rest mass'}.`,same?'true':'false',
        'Antimatter reverses charge, not the sign of mass.',same?'True: both have mass m_e; electron charge is -e and positron charge is +e.':'False: the positron has positive rest mass m_e, equal to the electron mass.'),answerFormat:'Enter true or false.'},
      choice('as-u11-a3','11.1.9',`A nucleus undergoes ${minus?'beta-minus':'beta-plus'} decay. Which neutral lepton must be included alongside the emitted ${minus?'electron':'positron'} in the decay equation?`,
        ['electron neutrino','electron antineutrino','neutron','gamma photon'],minus?1:0,
        'The neutrino type differs for the two beta-decay modes.',minus?'Beta-minus emission is accompanied by an electron antineutrino.':'Beta-plus emission is accompanied by an electron neutrino.'),
      choice('as-u11-a4','11.1.10',`For a particular parent nuclide, ${alpha?'alpha-particle energies occur at discrete values':'beta-particle energies form a continuous range'}. Which explanation is correct?`,
        ['each alpha transition to a specified daughter state has a fixed energy release shared in a fixed way with daughter recoil','the beta-decay energy is shared variably with an emitted neutrino or antineutrino and daughter recoil','energy is not conserved in nuclear decay','all emitted particles have zero kinetic energy'],alpha?0:1,
        'A beta decay includes an additional light neutral particle; an alpha transition has fixed final masses.',alpha?'Each allowed alpha transition has a definite energy; different daughter states can give different discrete alpha energies.':'Different shares of energy go to the beta particle and (anti)neutrino, so beta energies are continuous although total energy is conserved.'),
      choice('as-u11-a5','11.1.11',`The nuclide ^${A}_${Z} ${parent} undergoes ${mode} decay to ${daughter}. Using ^A_Z notation, which complete set of products is correct?`,
        [`^${a}_${z} ${daughter} + ${emission}`,`^${a}_${z+1} ${daughter} + ${emission}`,`^${a+1}_${z} ${daughter} + ${emission}`,`^${a}_${z-1} ${daughter} + ${emission}`],0,
        'Balance upper nucleon numbers and lower charge numbers separately; include the correct (anti)neutrino for beta decay.',`The products are ^${a}_${z} ${daughter} + ${emission}. Alpha emission reduces A by 4 and Z by 2; beta emission leaves A unchanged and changes Z by one.`),
      numeric('as-u11-a6','11.1.12',`A particle has mass ${mass} u. Use 1 u = 1.66 × 10^-27 kg. Express its mass as a coefficient multiplying 10^-27 kg.`,Number((mass*1.66).toFixed(2)),
        'Multiply the mass in u by the supplied kg-per-u coefficient.',`Mass = ${mass} × 1.66 × 10^-27 kg = ${Number((mass*1.66).toFixed(2))} × 10^-27 kg.`)
    ],difficulty);
  }
  const flavours=['up','down','strange','charm','top','bottom'],missing=r(0,5),flavour=r(0,5),anti=r(0,1)===0,proton=r(0,1)===0,baryon=r(0,1)===0,minus=r(0,1)===0,electron=r(0,1)===0;
  const chargeThirds=[2,-1,-1,2,2,-1][flavour]*(anti?-1:1);
  return validateUnitSet([
    choice('as-u11-r1','11.2.1',`A learner lists ${flavours.filter((_,i)=>i!==missing).join(', ')} and proton as the six fundamental quark flavours. Which correction makes the list valid?`,
      [`replace proton with ${flavours[missing]}`,'keep proton because every hadron is fundamental','replace proton with electron','replace proton with neutrino'],0,
      'A proton is composite; recall all six quark flavours.',`Replace proton with ${flavours[missing]}. The six flavours are up, down, strange, charm, top and bottom.`),
    numeric('as-u11-r2','11.2.2',`A learner claims that every quark or antiquark has a whole-number charge in units of e. Consider ${anti?'the antiquark corresponding to the':'the'} ${flavours[flavour]} quark. What is its signed charge in units of e/3, where e is positive?`,chargeThirds,
      'Up, charm and top have +2e/3; down, strange and bottom have -e/3. Reverse the sign for an antiquark.',`The charge is ${chargeThirds} × (e/3). Antiquarks have the opposite charge to their corresponding quarks.`),
    choice('as-u11-r3','11.2.3',`A learner calls a ${proton?'proton':'neutron'} fundamental because it is inside the nucleus. Which quark composition and conclusion correct this?`,
      ['uud; it is composite','udd; it is composite','uuu; it is fundamental','ddd; it is fundamental'],proton?0:1,
      'Add up-quark and down-quark charges, and remember that constituents imply a composite particle.',proton?'A proton is uud: +2e/3 +2e/3 -e/3 = +e. It is not fundamental.':'A neutron is udd: +2e/3 -e/3 -e/3 = 0. It is not fundamental.'),
    choice('as-u11-r4','11.2.4',`A learner says that any particle containing quarks must be a baryon. A hadron contains ${baryon?'two up quarks and one down quark':'one up quark and one down antiquark'}. Which classification and reason are correct?`,
      ['baryon, because it consists of three quarks','meson, because it consists of one quark and one antiquark','lepton, because it has constituents','meson, because it consists of three quarks'],baryon?0:1,
      'Classify by the number of quarks and whether an antiquark is present.',baryon?'This particular hadron is a baryon: three quarks. The claim about all quark-containing particles is too broad.':'This is a meson: a quark–antiquark pair. It disproves the claim that all hadrons are baryons.'),
    choice('as-u11-r5','11.2.5',`During nuclear ${minus?'beta-minus':'beta-plus'} decay, a ${minus?'neutron becomes a proton':'proton becomes a neutron'}. A learner thinks all three constituent quarks change flavour. Which single-quark change actually gives the required final composition?`,
      ['one down quark becomes an up quark','one up quark becomes a down quark','one down quark becomes a down antiquark','one up quark becomes an up antiquark'],minus?0:1,
      'Compare udd with uud; only one constituent needs to change.',minus?'udd -> uud requires d -> u, with an electron and electron antineutrino emitted in beta-minus decay.':'uud -> udd requires u -> d, with a positron and electron neutrino emitted in beta-plus decay.'),
    choice('as-u11-r6','11.2.6',`A learner classifies the ${electron?'electron':'electron neutrino'} emitted in a beta decay as a hadron because it came from a nuclear process. Which correction is valid?`,
      [`${electron?'the electron':'the electron neutrino'} is a fundamental lepton, not a quark composite`,'any particle emitted by a nucleus is a baryon','both electrons and neutrinos consist of three quarks','both electrons and neutrinos are mesons'],0,
      'Classification depends on the particle itself, not where it is produced.',electron?'The emitted electron is a fundamental lepton; nuclear production does not make it a hadron.':'The emitted electron neutrino is a fundamental lepton; it is not made of quarks.')
  ],difficulty);
};
// END VERIFIED BODY
return structuredAsParticles;
}
