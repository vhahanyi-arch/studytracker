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

## Exam checks

Keep unit symbols distinct from quantity symbols, distinguish precision from accuracy, and attach a direction to vector answers. The syllabus does not prescribe a fixed list of numerical estimates: use reasonable estimates of quantities elsewhere in the syllabus.
