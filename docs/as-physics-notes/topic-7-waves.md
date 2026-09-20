# Topic 7 — Waves

Source and scope: supplied Cambridge 9702 syllabus (2025–2027), printed pages 20–21; objectives 7.1.1–7.5.2. See [the reference index](README.md). The spectrum-boundary ambiguity in 7.4.2 is flagged below; its illustrative numerical ranges have a separately identified source.

## Concept summary

### Progressive waves and their quantities — 7.1.1, 7.1.2, 7.1.6

A progressive wave is a travelling disturbance that transfers energy. On a rope, adjacent sections transmit a disturbance as they oscillate. In a spring, travelling compressions and rarefactions pass between coils. In a ripple tank, the surface disturbance travels while a small floating marker mainly oscillates locally. In these simple models, energy transfer does not require net transport of material with the wave; distinguish this from bulk flow or drift.

Displacement is the signed distance of a particle from its equilibrium position. Amplitude is its greatest displacement magnitude. Period is the time for one complete oscillation, and frequency is the number of complete oscillations per second. Wavelength is the distance between successive points at the same phase, such as neighbouring crests. Wave speed is the speed of propagation of the disturbance, not the oscillating particle's speed.

Phase difference describes the difference in stage of the oscillation. A complete cycle is 360° or 2π radians; half a cycle is 180° or π radians. Compare equal-frequency signals, and state whether a signal leads or lags. A horizontal delay on a displacement–time graph is not an amplitude difference.

### Using a CRO — 7.1.3

The time-base gives time per horizontal division; the y-gain setting gives voltage per vertical division. For a stable trace, measure the horizontal width of one cycle, or several cycles and divide by their number. Multiply by the time-base to obtain the period, then take its reciprocal for frequency. Convert milliseconds to seconds.

Multiply the vertical height from the signal's midline to a peak by the y-gain to obtain voltage amplitude. If measuring peak-to-peak height, divide by two. The CRO measures signal voltage: inferring a sound displacement or pressure amplitude requires the relevant sensor calibration. Keep a DC offset separate from the oscillation amplitude.

### Wave equation and intensity — 7.1.4, 7.1.5, 7.1.7

In one period T, a wave travels one wavelength λ. Speed is distance/time, so v = λ/T; with f = 1/T, this gives v = fλ. Use consistent units and distinguish propagation speed from frequency.

Intensity is power crossing unit area normal to propagation. For the same kind of progressive wave in the same medium at the same frequency, intensity is proportional to amplitude squared. Doubling amplitude gives four times the intensity. To calculate power, also account for the area crossed; intensity and total power are different quantities.

### Transverse, longitudinal and wave graphs — 7.2.1, 7.2.2

In a transverse wave, oscillations are perpendicular to propagation. In a longitudinal wave, oscillations are parallel to propagation; sound in air has successive compressions and rarefactions. A spring can demonstrate either kind, depending on how it is driven.

A displacement–position graph is a snapshot at one instant: the spacing between consecutive positive maxima gives wavelength. A displacement–time graph follows one point: the spacing between consecutive positive maxima gives period. The vertical scale gives displacement and amplitude in either graph. Adjacent positive and negative extrema are separated by half a wavelength or half a period, according to the horizontal axis.

A sinusoidal graph of a longitudinal wave does not mean particles move transversely: its vertical coordinate represents their displacement along the propagation direction. Do not mistake a particle-displacement maximum for a pressure maximum. The separation between successive compressions (or successive rarefactions) is one wavelength; between a compression and the adjacent rarefaction it is half a wavelength.

### Doppler effect for sound — 7.3.1, 7.3.2

A source moving towards a stationary observer produces more closely spaced wavefronts on the observer's side, so the observed frequency and pitch are higher. Moving away produces wider spacing and a lower frequency. The source's emitted frequency need not change, and sound speed in the same still air is unchanged.

Use the source's speed relative to the medium. The formula below is for motion directly towards or away from a stationary observer, with source speed below sound speed. The syllabus does not require the moving-observer case; do not substitute a moving-observer formula.

### Electromagnetic spectrum — 7.4.1, 7.4.2, 7.4.3

All electromagnetic waves are transverse and travel at the same speed c in free space, approximately 3.00 × 10⁸ m s⁻¹. Their frequencies and wavelengths differ. In order of decreasing wavelength: radio, microwave, infrared, visible, ultraviolet, X-ray, gamma. Frequency increases along that order. The syllabus explicitly specifies visible wavelengths of **400–700 nm** in free space.

**Boundary ambiguity:** objective 7.4.2 requires approximate ranges but does not supply numerical boundaries for the other regions. The following is a conventional study guide, verified against [NASA's approximate spectrum table](https://imagine.gsfc.nasa.gov/science/toolbox/spectrum_chart.html), not a Cambridge-prescribed list of exact cut-offs. Region edges can vary between classifications, and microwaves are also often treated as a radio subset. Use any convention explicitly supplied in an exam question. Practice questions use interior examples and name microwaves separately.

| Region | Approximate free-space wavelength range | Interior example |
|---|---|---|
| Radio, separated from microwaves here | Greater than 0.1 m | 10 m |
| Microwave | 1 mm–0.1 m | 10 mm |
| Infrared | 700 nm–1 mm | 10 μm |
| Visible | 400–700 nm (explicit syllabus range) | 500 nm |
| Ultraviolet | 10–400 nm | 100 nm |
| X-ray | 0.01–10 nm | 0.1 nm |
| Gamma | Less than 0.01 nm | 0.001 nm |

### Polarisation — 7.5.1, 7.5.2

Polarisation restricts transverse oscillations to one direction. Plane-polarised light has its electric-field oscillations restricted to one direction perpendicular to travel. Longitudinal sound in air has no transverse oscillation direction to select, so it cannot be plane-polarised in this way.

For an ideal polarising filter receiving plane-polarised light, use Malus's law. The angle is between the incoming polarisation and the filter's transmission axis. After each filter, the transmitted light is polarised along that filter's axis; therefore use the angle between successive axes at the next filter. Parallel axes transmit all of the already polarised incident intensity in the ideal model; crossed axes transmit none. Calculation for unpolarised incident light is explicitly outside this syllabus objective.

## Key formulas

### Wave quantities, phase and CRO measurements

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| f = 1/T; T = 1/f | f: frequency, Hz = s⁻¹; T: period, s | Periodic motion. |
| v = λ/T = fλ | v: propagation speed, m s⁻¹; λ: wavelength, m; T: s; f: Hz | One wavelength travelled per cycle. For electromagnetic waves in free space, v = c. |
| Δφ = 2πΔx/λ or 360°Δx/λ | Δφ: phase difference, rad or degrees; Δx: separation along propagation, m; λ: m | Sinusoidal progressive wave compared at the same instant; phase repeats after a full cycle. State the phase convention if a signed answer is needed. |
| Δφ = 2πΔt/T or 360°Δt/T | Δφ: phase difference, rad or degrees; Δt: corresponding-point time delay, s; T: common period, s | Equal-frequency signals; positive delay corresponds to a lag. Both times may use the same non-SI unit in this ratio. |
| T = Nₓb/n | Nₓ: horizontal divisions spanned, dimensionless; b: time-base, s per division; n: complete cycles measured, dimensionless; T: s | Derived CRO measurement rule; n = 1 for one period. |
| V_peak = NᵧG; V_peak = V_pp/2 | V_peak: voltage amplitude, V; Nᵧ: divisions from midline to peak, dimensionless; G: y-gain setting, V per division; V_pp: peak-to-peak voltage, V | A symmetric oscillating trace; use half the peak-to-peak height if that is what is measured. |

Angles in radians are dimensionless ratios; the label rad clarifies the convention. Do not mix the numerical values for degrees and radians.

### Intensity

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| I = P/S; P = IS | I: intensity, W m⁻²; P: power, W; S: area perpendicular to propagation, m² | Uniform intensity over S, or mean intensity if P is total power through S. |
| I ∝ A²; I₂/I₁ = (A₂/A₁)² | I₁, I₂: intensities, W m⁻²; A₁, A₂: amplitudes of the same wave quantity, e.g. displacement in m | Same medium, wave type and frequency; ratios are dimensionless. S above is area, whereas A here is amplitude. |

### Moving source, stationary observer

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| fₒ = fₛv/(v − vₛ) | fₒ: observed frequency, Hz; fₛ: emitted frequency, Hz; v: sound speed, m s⁻¹; vₛ: positive source speed, m s⁻¹ | Source approaches directly; observer and medium stationary; 0 ≤ vₛ < v. |
| fₒ = fₛv/(v + vₛ) | Same symbols and units | Source recedes directly; same model. |
| λ_towards = (v − vₛ)/fₛ; λ_away = (v + vₛ)/fₛ | λ: wavefront spacing, m; other symbols as above | Derived spacing explanation for the Doppler formulas, not a moving-observer rule. |

### Malus's law

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| I = I₀ cos²θ | I₀: incident plane-polarised intensity, W m⁻²; I: transmitted intensity, W m⁻²; θ: angle between incoming polarisation and axis, rad (or degrees consistently) | Ideal polarising filter; already plane-polarised input. |
| I_final = I_initial cos²θ₁ cos²θ₂ … | All I: W m⁻²; θ₁: first axis relative to initial polarisation; θ₂ and later angles: between successive axes, rad (or degrees) | Derived successive-filter application. Each filter acts on the preceding transmitted intensity. |

## Exam checks

Read the horizontal graph axis before identifying period or wavelength. Halve peak-to-peak CRO height for amplitude. Square amplitude ratios for intensity. Check the Doppler result is higher on approach and lower on recession. For each polariser, update both the intensity and the polarisation direction. Do not assume all electromagnetic waves have the same frequency because their free-space speeds are equal.
