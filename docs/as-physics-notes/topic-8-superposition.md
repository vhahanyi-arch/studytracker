# Topic 8 — Superposition

Source: supplied Cambridge 9702 syllabus (2025–2027), printed page 22; objectives 8.1.1–8.4.2. See [source and scope](README.md). End corrections for air columns and the structure or operation of a spectrometer are not required.

## Concept summary

### Superposition and stationary waves — 8.1.1, 8.1.3, 8.1.4

When waves overlap, add their displacements at the same point and instant, keeping their signs. Add displacement, not intensity. In the linear wave model, the waves continue through one another after overlapping.

A stationary wave forms when waves of the same frequency and wavelength travel in opposite directions and superpose. Equal amplitudes give complete cancellation at fixed nodes. At antinodes the resultant oscillation amplitude is greatest. To construct the resultant graph, add the two displacement profiles point by point, then repeat a quarter-period later: nodes stay at zero while other points oscillate. An antinode passes through zero displacement, so one zero-displacement snapshot does not identify a node.

Adjacent nodes, or adjacent antinodes, are half a wavelength apart. A node and its nearest antinode are a quarter wavelength apart. A stationary pattern does not carry net energy along the medium in the way a single progressive wave does; the two ideal opposing waves carry equal energy in opposite directions.

### Demonstrating stationary waves — 8.1.2

- **Microwaves:** direct a transmitter towards a metal reflector. Move a receiver along the incident/reflected overlap region to find fixed maxima and minima. Measure across several consecutive minima and divide by the number of intervals; each interval is half a wavelength.
- **Stretched string:** drive a tensioned string periodically and adjust the frequency, vibrating length or tension until large, stable loops form. Reflection produces the counter-travelling wave. Identify nodes and antinodes; each complete loop between nodes spans half a wavelength.
- **Air column:** hold a fixed-frequency sound source near a tube open at one end and closed at the other, and vary its air-column length. Loud resonances identify stationary patterns. The closed end is a displacement node; the open end is a displacement antinode. The shortest resonant length is a quarter wavelength and successive resonant lengths differ by half a wavelength. Pressure nodes and antinodes are the reverse of displacement nodes and antinodes. Neglect end corrections as instructed by the syllabus.

### Diffraction — 8.2.1, 8.2.2

Diffraction is spreading of waves at an aperture or around an obstacle into a region that would otherwise be in its geometrical shadow. In a ripple tank, send straight wavefronts towards a barrier with a gap and observe the outgoing wavefronts. Keep wavelength fixed while changing the gap: spreading is more pronounced when gap width is comparable to wavelength than when it is much larger. Alternatively, change wavelength while keeping the gap fixed. Diffraction in the same medium does not itself change the wave's frequency or wavelength.

### Coherence and interference — 8.3.1, 8.3.3

Interference is the reinforcement and cancellation pattern produced by superposing waves. Coherent sources maintain a constant phase difference and have the same frequency; the constant phase difference need not be zero. Equal frequency alone does not guarantee coherence.

To observe fixed fringes, the waves must overlap with a stable relative phase. For light, use matching, or at least non-orthogonal, polarisation directions and suitable spatially coherent illumination. The detector or screen must resolve the pattern. Comparable amplitudes improve contrast; equal amplitudes are needed for completely dark minima, but unequal nonzero amplitudes can still produce interference.

For sources initially in phase, a whole-number wavelength path difference produces constructive interference. A half-odd-integer wavelength path difference produces destructive interference. Complete cancellation also requires equal amplitudes and compatible oscillation directions. Account for any stated initial source phase difference instead of applying the in-phase rules blindly.

### Two-source experiments and double slits — 8.3.2, 8.3.4

- **Water:** drive two ripple-tank dippers from one vibrator and observe overlapping wavefronts and lines of reinforcement/cancellation.
- **Sound:** connect two loudspeakers to the same signal generator; move a microphone through their overlap region and record alternating maxima and minima.
- **Light:** illuminate two narrow slits coherently, for example with a laser or via a narrow source slit and monochromatic light. Observe the overlapping beams on a distant screen.
- **Microwaves:** use one transmitter to illuminate two apertures and scan the overlap region with a receiver.

In the double-slit formula, a is slit separation, x is the spacing of adjacent bright fringes (or adjacent dark fringes), and D is slit-to-screen distance. A distance spanning N consecutive fringe centres contains N − 1 intervals. Measure several intervals to reduce fractional measurement uncertainty. The usual formula uses the small-angle approximation and a screen far from the slits; do not confuse slit separation with slit width.

### Diffraction grating measurements — 8.4.1, 8.4.2

A grating has many equally spaced slits or lines. For normal incidence, principal maxima occur where waves from neighbouring slits differ in path by an integer number of wavelengths. The central maximum is order zero; matching orders occur on either side. Grating spacing is the reciprocal of line density, after converting units.

Illuminate the grating normally with monochromatic light. Find the central maximum, identify an order n, and measure its angle from the central direction. If measuring the angular separation of matching left and right maxima, halve that separation. Use the known spacing and grating equation to find wavelength; repeat for matching sides or other observable orders. The question may supply the angular measurements; no knowledge of spectrometer construction is needed.

An order requiring a sine greater than one is impossible. When counting all allowed maxima, include both sides and count the central maximum once. This ideal count assumes no missing orders; a 90° grazing order needs special treatment if the question asks what can appear on a finite screen.

## Key formulas

### Superposition and stationary-wave geometry

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| y = y₁ + y₂ | y: resultant displacement, m; y₁, y₂: individual signed displacements, m | Same point and instant, measured along the same axis; linear superposition. |
| node–node spacing = λ/2; antinode–antinode spacing = λ/2 | λ: wavelength of either constituent progressive wave, m; spacings: m | Adjacent points of the specified type. |
| node–nearest-antinode spacing = λ/4 | λ and spacing: m | Do not use λ/2 for unlike adjacent points. |
| L = nλ/2 | L: vibrating length, m; n: positive integer number of loops, dimensionless; λ: m | Derived geometry for a string with a displacement node at each end. |
| L = (2n − 1)λ/4 | L: air-column length, m; n: positive integer resonance index; λ: m | Derived geometry for one closed and one open end; displacement node at closed end, antinode at open end; negligible end corrections. |
| λ = 2(L₂ − L₁); v = fλ | L₁, L₂: consecutive resonance lengths, m; λ: m; v: sound speed, m s⁻¹; f: frequency, Hz | Same fixed-frequency closed–open tube; v = fλ is recalled from Topic 7. |

### Interference and double slits

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| Δr = mλ | Δr: path difference, m; λ: wavelength, m; m: integer order, dimensionless | Constructive interference for coherent sources initially in phase. |
| Δr = (m + ½)λ | Same symbols and units | Destructive interference for in-phase sources; zero resultant requires equal amplitudes and the same polarisation direction. |
| Δφ_path = 2πΔr/λ | Δφ_path: phase difference due to path, rad; Δr, λ: m | Direct application of Topic 7's phase relation; combine with any initial source phase difference using a consistent sign convention. |
| λ = ax/D; x = λD/a | λ: wavelength, m; a: slit separation, m; x: adjacent fringe spacing, m; D: screen distance, m | Coherent double-slit light interference, small angles, D much larger than a. |
| x = w/(N − 1) | x: fringe spacing, m; w: distance from first to last of N consecutive fringe centres, m; N: number of centres, dimensionless | Derived measurement rule; N must exceed 1. |

There is no additional quantitative diffraction-at-a-gap formula required by section 8.2; its comparison of gap width and wavelength is qualitative.

### Diffraction grating

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| d = 1/ρ_lines | d: grating spacing, m; ρ_lines: number of lines per metre, m⁻¹ | Convert lines per mm to lines per m by multiplying by 1000. This ρ denotes line density, not mass density. |
| d sin θ = nλ; λ = d sin θ/n | d, λ: m; θ: angle from the central direction, rad (or degrees consistently); n: integer diffraction order | Normal incidence; use a nonzero order to determine λ. |
| θ = α/2 | α: angular separation of matching left/right orders; θ: one-sided diffraction angle, same angular unit | Matching orders at −θ and +θ under normal incidence. |
| nλ/d ≤ 1 | n: nonnegative order magnitude; d, λ: m | Sine bound for a possible order. Equality gives grazing diffraction at 90°. |
| N_maxima = 2n_max + 1 | N_maxima: count of maxima; n_max: largest allowed positive order, both dimensionless | Ideal grating with no missing orders, counting both sides and the central maximum. Apply any detector/screen restriction separately. |

## Exam checks

Add signed displacements, not amplitudes indiscriminately. Identify nodes from zero amplitude throughout the cycle. Count intervals between fringes or nodes. Keep diffraction distinct from interference. Check coherence, units, grating order and the reference direction for every angle before substituting.
