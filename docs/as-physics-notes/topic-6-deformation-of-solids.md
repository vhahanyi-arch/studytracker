# Topic 6 — Deformation of solids

Source: supplied Cambridge 9702 syllabus (2025–2027), printed page 20; objectives 6.1.1–6.2.4. See [source and scope](README.md). The syllabus assumes forces and deformation in one dimension here.

## Concept summary

### Loading and Hooke's law — 6.1.1, 6.1.2, 6.1.3, 6.1.4

Tensile forces pull a specimen's ends apart; compressive forces push them together. The load is the applied force. Extension is the increase from the original length; compression is the decrease. Use the change in length, not the loaded length.

Within the limit of proportionality, force is directly proportional to extension: a force–extension graph is a straight line through the origin. Its gradient is the spring constant k. A larger k means more force is needed for a given extension. Beyond the proportionality limit, the straight-line model no longer applies.

### Stress, strain and Young modulus — 6.1.5

Tensile stress is force divided by cross-sectional area. Tensile strain is extension divided by original length, so it has no unit. The Young modulus is tensile stress divided by tensile strain in the proportional region. It measures the material's stiffness; spring constant also depends on a specimen's dimensions. For the same material and force, a longer wire extends more, while a larger cross-sectional area reduces extension. Doubling the radius multiplies the area by four.

### Measuring Young modulus of a metal wire — 6.1.6

Secure a long thin wire, with a small initial load to straighten it. Measure its initial gauge length L between reference marks. Measure diameter d with a micrometer at several positions and orientations, check the zero reading, and use the mean diameter to calculate the area. Small extensions need a sensitive displacement instrument, such as a travelling microscope or a micrometer arrangement; a metre rule is suitable for L, not usually for a tiny extension.

Add known loads in small steps, recording the extra force and corresponding extension from the initial reference. Keep within the proportional region; remove loads in steps to check that the wire returns to its starting length. Plot added force F vertically against extension x horizontally. Find the gradient using a best-fit line and widely separated points, then calculate E = (gradient)L/A. If using an initial straightening load, use changes in force and extension consistently.

Use a rigid support or reference wire to reduce errors from support movement, keep temperature stable, and measure diameter carefully because area depends on its square. Catch falling masses safely and avoid overloading the wire. Repeats reduce random scatter but do not correct a micrometer zero error.

### Elastic and plastic deformation — 6.2.1

Elastic deformation disappears when the load is removed. Plastic deformation leaves a permanent change in length. The elastic limit is the greatest loading before permanent deformation occurs. It is different from the limit of proportionality: a material can behave elastically even when its force–extension relation is no longer linear.

### Work and stored energy — 6.2.2, 6.2.3, 6.2.4

The area under a force–extension graph represents work done in deforming the specimen. For a straight line through the origin, this area is a triangle, giving stored elastic potential energy ½Fx = ½kx². These expressions apply within the proportional region; do not use a triangular area for a curved or segmented graph without checking its shape.

If an already stretched spring is extended further, subtract its initial stored energy from its final stored energy. Work returned during unloading is the area under the unloading graph. When loading and unloading paths differ, do not assume that all loading work is returned; identify any stated energy transfers using Topic 5's conservation principle. The syllabus does not prescribe a general hysteresis or plastic-energy model.

## Key formulas

### Force and deformation

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| x = L_loaded − L₀ | x: extension, m; L_loaded: loaded length, m; L₀: original length, m | Extension is a change in length. Compression magnitude is L₀ − L_loaded for shortening. |
| F = kx; k = F/x | F: applied force magnitude, N; k: spring constant, N m⁻¹; x: extension, m | Hooke's law within the proportional region; x is measured from the unloaded reference. |
| k = gradient of F–x graph | F: N; x: m; gradient and k: N m⁻¹ | Force on the vertical axis; straight proportional region. |

The applied stretching force and restoring force point in opposite directions. The table uses magnitudes, not a sign convention for the restoring force.

### Stress, strain and Young modulus

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| σ = F/A | σ: tensile stress, Pa = N m⁻²; F: tensile force, N; A: cross-sectional area, m² | Use area normal to the force, not the wire's surface area. |
| ε = x/L | ε: tensile strain, dimensionless (unit 1); x: extension, m; L: original gauge length, m | Use matching length units. |
| E = σ/ε = FL/(Ax) | E: Young modulus, Pa; other symbols as above | Stress divided by strain in the proportional region. |
| A = πd²/4 = πr² | A: area, m²; d: diameter, m; r: radius, m; π: dimensionless | Geometry used for a circular wire; d = 2r. |
| E = GL/A | G: gradient of force against extension, N m⁻¹; L: m; A: m²; E: Pa | Derived experimental form; G is the graph gradient here, not another material modulus. |
| x = FL/(AE); k = AE/L | F: N; L, x: m; A: m²; E: Pa; k: N m⁻¹ | Derived relations for a uniform wire in its proportional region. |

Useful conversions: 1 mm = 10⁻³ m; 1 mm² = 10⁻⁶ m²; 1 MPa = 10⁶ Pa; 1 GPa = 10⁹ Pa. Consequently, 1 N/mm² = 1 MPa. The symbol E here denotes Young modulus; Eₚ below denotes energy.

### Work and elastic potential energy

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| W = area under F–x graph | W: work, J; F: applied force, N; x: extension, m; graph area: N m = J | Applies to the stated loading or unloading path. |
| W_segment = ½(F₁ + F₂)(x₂ − x₁) | W_segment: work, J; F₁, F₂: endpoint forces, N; x₁, x₂: endpoint extensions, m | Geometric trapezium area for a straight segment with x₂ greater than x₁. Add segments for a piecewise-linear loading graph. |
| Eₚ = ½Fx = ½kx² | Eₚ: elastic potential energy, J; F: final applied force, N; x: extension, m; k: N m⁻¹ | From zero extension, within the proportional region. |
| ΔEₚ = ½k(x₂² − x₁²) | ΔEₚ: energy change, J; k: N m⁻¹; x₁, x₂: initial and final extensions, m | Derived extra work for a spring with constant k over the interval. Not ½k(x₂ − x₁)². |

## Exam checks

Distinguish extension from total length, diameter from radius, Young modulus from spring constant, and elastic limit from proportionality limit. Label graph axes with units and convert extensions to metres before calculating work. No extra scope assumption is needed for the listed syllabus objectives; any energy-loss model beyond a stated graph must be supplied in the question.
