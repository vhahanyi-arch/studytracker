# Topic 1 — Physical quantities and units

Source: supplied Cambridge 9702 syllabus (2025–2027), printed page 16; objectives 1.1.1–1.4.3. See [source and scope](README.md).

## Concept summary

### Measurements and estimates — 1.1.1, 1.1.2

A physical quantity has a numerical magnitude and a unit, such as 2.0 m. A dimensionless ratio has unit 1, usually left unwritten. Estimate using familiar sizes and orders of magnitude: an adult's height is of order 1 m, not 100 m. Check that a calculated answer is plausible in its context.

### SI units — 1.2.1, 1.2.2, 1.2.3, 1.2.4

Recall the five base quantity–unit pairs required here: mass–kilogram (kg), length–metre (m), time–second (s), electric current–ampere (A), thermodynamic temperature–kelvin (K). These are the five specified by this objective, not a list of all SI base quantities.

Build derived units from definitions, and check that every term added or equated has the same base units. Unit consistency is necessary but cannot detect a wrong dimensionless numerical factor. Prefixes are case-sensitive; convert before substitution. When squaring or cubing a length, square or cube its conversion factor too: 1 cm² = 10⁻⁴ m².

| Prefix | Symbol | Multiplier |
|---|---|---|
| pico | p | 10⁻¹² |
| nano | n | 10⁻⁹ |
| micro | μ | 10⁻⁶ |
| milli | m | 10⁻³ |
| centi | c | 10⁻² |
| deci | d | 10⁻¹ |
| kilo | k | 10³ |
| mega | M | 10⁶ |
| giga | G | 10⁹ |
| tera | T | 10¹² |

### Errors and uncertainties — 1.3.1, 1.3.2, 1.3.3

A systematic error shifts readings consistently; a zero error is a non-zero reading when the true input is zero. Correct a known offset. Repeating and averaging does not remove systematic error. Random errors produce unpredictable scatter; repeated measurements and averaging reduce their effect.

Accuracy means closeness to the true value. Precision concerns how closely repeated readings agree. A precise set can still be inaccurate. State uncertainty in the same unit as the quantity. For derived results, use the simple addition rules below; do not subtract uncertainties when subtracting measurements.

### Scalars and vectors — 1.4.1, 1.4.2, 1.4.3

Scalars have magnitude only (mass, time, speed, energy); vectors have magnitude and direction (displacement, velocity, acceleration, force, momentum). Add coplanar vectors head-to-tail or by signed perpendicular components. To subtract a vector, add its reverse. A scaled diagram must include a scale and directions.

## Key formulas

### Units and uncertainty

| Formula or relation | Symbols and SI units | Use / condition |
|---|---|---|
| q = numerical value × unit | q: measured quantity, with its appropriate SI unit | The numerical value changes when the chosen unit changes. |
| fractional uncertainty = δx / \|x\|; percentage uncertainty = 100 δx / \|x\| | x: non-zero measured value; δx: absolute uncertainty, same unit as x; ratios dimensionless | Convert an absolute uncertainty to a relative one. |
| z = x ± y ⇒ δz = δx + δy | x, y, z: quantities with the same SI unit; δ values: uncertainties in that unit | Simple maximum-uncertainty rule for addition or subtraction. |
| z = xy or x/y ⇒ δz/\|z\| ≈ δx/\|x\| + δy/\|y\| | x, y: non-zero quantities; z: corresponding product or quotient unit; each uncertainty has its quantity's unit | Add fractional or percentage uncertainties for products and quotients. |
| z = Cxⁿ ⇒ δz/\|z\| ≈ \|n\| δx/\|x\| | C: exact constant (units as needed); n: dimensionless exact power; x, z and their uncertainties: appropriate SI units | Repeated-product extension of the simple rule; small relative uncertainties. An exact constant contributes no uncertainty. |

Here δ denotes uncertainty, not a signed change. These are the simple uncertainty rules required by 1.3.3, not a statistical quadrature method. Repeated or dependent quantities should first be simplified algebraically; x/x is exactly 1, not two independent measurements.

Examples of derived units from later mechanics definitions: force N = kg m s⁻²; energy J = kg m² s⁻²; power W = kg m² s⁻³; pressure Pa = kg m⁻¹ s⁻². Derive other syllabus units from their defining equations when needed.

### Coplanar vectors

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| Aₓ = A cos θ; Aᵧ = A sin θ | A: vector magnitude; Aₓ, Aᵧ: signed components, all with the same SI unit (e.g. N for force); θ: angle from +x, rad (or degrees consistently) | Resolve a vector along perpendicular axes. |
| Rₓ = Aₓ + Bₓ; Rᵧ = Aᵧ + Bᵧ | R: resultant of vectors A and B; all components share the quantity's SI unit | Add components; use minus signs for subtraction. Extend to more vectors. |
| R = √(Rₓ² + Rᵧ²); tan θ = Rᵧ/Rₓ | R and components: same SI unit; θ: resultant direction from +x, rad | Perpendicular components only. Choose the correct quadrant; handle Rₓ = 0 separately. A zero resultant has no defined direction. |

## Using the formulas in different situations

### Situation: converting prefixed, squared and cubed units

**Example — area.** A wire's cross-sectional area is 0.25 mm². Since 1 mm = 10⁻³ m, 1 mm² = 10⁻⁶ m², so A = 0.25 × 10⁻⁶ = 2.5 × 10⁻⁷ m². (Multiplying by 10⁻³ instead is the most common error.)

**Example — density.** 7.9 g cm⁻³ = 7.9 × 10⁻³ kg ÷ 10⁻⁶ m³ = 7.9 × 10³ kg m⁻³.

**Example — speed.** 90 km h⁻¹ = 90 × 10³ m ÷ 3600 s = 25 m s⁻¹.

### Situation: checking an equation is homogeneous

**Example — a motion equation.** Check s = ut + ½at². Left: m. Right: (m s⁻¹)(s) + (m s⁻²)(s²) = m + m. Every term has base unit m, so the equation is homogeneous. The ½ cannot be checked this way: a wrong numerical factor would still pass.

**Example — an equation that fails.** A student writes v² = u² + 2a. The term 2a has unit m s⁻², but v² has m² s⁻². Terms with different base units cannot be added, so the equation is wrong (a distance is missing).

### Situation: finding the base units of a constant

**Example — drag constant.** Drag F = kv². Then k = F/v², with base units kg m s⁻² ÷ (m² s⁻²) = kg m⁻¹.

**Example — Young modulus.** E = FL/(Ax): kg m s⁻² × m ÷ (m² × m) = kg m⁻¹ s⁻², the same as the pascal.

### Situation: making an estimate

**Example — power climbing stairs.** A student of mass about 60 kg climbs about 3 m of stairs in about 5 s. Power ≈ mgh/t = 60 × 9.81 × 3 ÷ 5 ≈ 350 W, so of order 10² W. An answer of 3.5 W or 35 kW would be implausible.

**Example — kinetic energy of a car.** About 1000 kg at about 30 m s⁻¹: ½ × 1000 × 30² ≈ 4.5 × 10⁵ J.

### Situation: uncertainty from repeated readings

**Example — timing.** Readings: 2.47 s, 2.52 s, 2.49 s, 2.54 s. Mean = 10.02 ÷ 4 = 2.505 s. A common convention takes half the range as the uncertainty: (2.54 − 2.47) ÷ 2 = 0.035 s. Result: 2.51 ± 0.04 s. Quote the value to the same decimal place as its uncertainty.

### Situation: combining uncertainties

**Example — a difference.** Two lengths are 45.0 ± 0.1 cm and 12.0 ± 0.1 cm. Their difference is 33.0 ± 0.2 cm: absolute uncertainties add, even though the values subtract.

**Example — density of a cube.** Side 2.00 ± 0.02 cm (1.0%); mass 62.4 ± 0.1 g (0.16%).

- V = 2.00³ = 8.00 cm³, with 3 × 1.0% = 3.0% uncertainty (the power multiplies the percentage).
- ρ = 62.4 ÷ 8.00 = 7.80 g cm⁻³, with 3.0% + 0.16% ≈ 3.2% uncertainty.
- Absolute uncertainty = 0.032 × 7.80 = 0.25 g cm⁻³, so ρ = 7.8 ± 0.2 g cm⁻³.

**Example — a pendulum.** g = 4π²L/T² with L = 0.800 ± 0.002 m (0.25%) and T = 1.80 ± 0.02 s (1.1%).

- g = 4π² × 0.800 ÷ 1.80² = 9.75 m s⁻².
- Percentage uncertainty = 0.25% + 2 × 1.1% ≈ 2.5%. The 4π² is exact and adds nothing.
- g = 9.75 ± 0.24 m s⁻², quoted as 9.7 ± 0.2 m s⁻².

### Situation: resolving a vector

**Example — a pull at an angle.** A 50 N force acts at 30° above the horizontal. Horizontal component = 50 cos 30° = 43.3 N; vertical component = 50 sin 30° = 25.0 N.

### Situation: adding vectors that are not perpendicular

**Example — two forces.** 40 N along +x and 30 N at 60° to +x.

- Rₓ = 40 + 30 cos 60° = 40 + 15 = 55 N; Rᵧ = 0 + 30 sin 60° = 26.0 N.
- R = √(55² + 26.0²) = 60.8 N; θ = tan⁻¹(26.0 ÷ 55) = 25.3° above +x.

### Situation: subtracting vectors (change in velocity)

**Example — a turning ball.** A ball's velocity changes from 10 m s⁻¹ east to 10 m s⁻¹ north. Δv = v_final − v_initial = v_final + (−v_initial): add 10 m s⁻¹ north and 10 m s⁻¹ west. |Δv| = √(10² + 10²) = 14.1 m s⁻¹, directed north-west. The speed is unchanged but the velocity has changed.

## Exam checks

Keep unit symbols distinct from quantity symbols, distinguish precision from accuracy, and attach a direction to vector answers. The syllabus does not prescribe a fixed list of numerical estimates: use reasonable estimates of quantities elsewhere in the syllabus.
