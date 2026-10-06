# Topic 4 — Forces, density and pressure

Source: supplied Cambridge 9702 syllabus (2025–2027), printed pages 18–19; objectives 4.1.1–4.3.6. See [source and scope](README.md).

## Concept summary

### Turning effects — 4.1.1, 4.1.2, 4.1.3, 4.1.4

Treat an object's weight as acting at its centre of gravity. The moment of a force about a point measures its turning effect: multiply force by the perpendicular distance from the point to the force's line of action. A force through the pivot has zero moment.

A couple consists of two equal, opposite, parallel forces on different lines of action. It has zero resultant force but a turning effect. Its torque equals one force multiplied by the perpendicular separation of the two lines of action. Do not double this separation or use the distance to an arbitrary pivot.

### Equilibrium — 4.2.1, 4.2.2, 4.2.3

For rotational equilibrium, clockwise and anticlockwise moments about the same point balance (principle of moments). Full equilibrium also requires zero resultant force. Resolve forces along perpendicular axes and choose a convenient point for moments, often one through an unknown force. Three coplanar forces in equilibrium form a closed head-to-tail vector triangle; this represents force balance, and rotational balance must also hold for an extended object.

### Density, pressure and upthrust — 4.3.1, 4.3.2, 4.3.3, 4.3.4, 4.3.5, 4.3.6

Density is mass per unit volume. Pressure is normal force per unit area. In a stationary fluid of uniform density, pressure increases with depth. Derive the pressure difference by considering a fluid column of area A and height Δh: its mass is ρAΔh; its weight is ρAΔhg; dividing by area gives Δp = ρgΔh.

Greater pressure on an object's lower surface than its upper surface produces an upward resultant, upthrust. It equals the weight of displaced fluid. Use fluid density and the displaced (submerged) volume, which need not equal the object's total volume. A freely floating object in equilibrium has upthrust equal to weight; a supported submerged object can have additional forces.

## Key formulas

### Moments and equilibrium

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| M = Fd⊥ | M: moment, N m; F: force, N; d⊥: perpendicular distance from pivot to line of action, m | Choose clockwise/anticlockwise sense. Moment is quoted in N m, not J. |
| M = Fr sin θ | r: distance from pivot to point of application, m; θ: angle between r and F, rad (or degrees consistently); M, F as above | Derived form of the perpendicular-distance rule. |
| τ = Fd | τ: couple torque, N m; F: magnitude of either force, N; d: perpendicular separation of force lines, m | For equal and opposite parallel forces forming a couple. |
| ΣM_clockwise = ΣM_anticlockwise | M: moment magnitude, N m; Σ: sum | Rotational equilibrium, all moments about the same point. |
| ΣFₓ = 0; ΣFᵧ = 0; ΣM = 0 | Fₓ, Fᵧ: signed force components, N; M: signed moments, N m | Conditions for coplanar equilibrium. |

### Fluids

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| ρ = m/V | ρ: density, kg m⁻³; m: mass, kg; V: volume, m³ | Mean density; uniform material gives its material density. |
| p = F⊥/A | p: pressure, Pa = N m⁻²; F⊥: normal force, N; A: area, m² | Uniform pressure, or mean pressure over the area. |
| Δp = ρgΔh | Δp: pressure increase, Pa; ρ: fluid density, kg m⁻³; g: m s⁻²; Δh: downward depth increase, m | Stationary fluid, constant density and g. |
| p = p_surface + ρgh | p, p_surface: pressure, Pa; h: depth below surface, m; ρ, g as above | Derived form; include surface pressure for absolute pressure. ρgh alone is the increase over surface pressure. |
| U = ρ_fluid gV_displaced | U: upthrust, N; ρ_fluid: fluid density, kg m⁻³; g: m s⁻²; V_displaced: displaced volume, m³ | Archimedes' principle in a fluid of uniform density. The syllabus writes this force as F. |
| U = mg | m: floating object's mass, kg; g: m s⁻²; U: N | Derived equilibrium condition for an object supported only by upthrust and weight. |

## Using the formulas in different situations

Take g = 9.81 m s⁻². For equilibrium, take moments about the point where an unknown force acts, so that force drops out, then use ΣF = 0 for the rest.

### Situation: a force at an angle to a lever

**Example — spanner.** A 40 N force is applied at the end of a 0.30 m spanner, at 60° to the spanner. Perpendicular distance = 0.30 sin 60° = 0.260 m. M = 40 × 0.260 = 10.4 N m. A force along the spanner (θ = 0) has no moment.

### Situation: a beam on two supports

**Example — find the support forces.** A uniform 4.0 m beam of weight 200 N rests on supports at each end. A 500 N load sits 1.0 m from the left end.

- Moments about the left support: R_right × 4.0 = 200 × 2.0 + 500 × 1.0 = 900 N m, so R_right = 225 N.
- Vertical forces: R_left + 225 = 200 + 500, so R_left = 475 N. The support nearer the load takes more.

### Situation: a couple

**Example — steering wheel.** Two hands push with 15 N in opposite directions on opposite sides of a wheel of diameter 0.40 m. Torque = Fd = 15 × 0.40 = 6.0 N m. Use the separation of the two forces, not the radius, and not double the diameter.

### Situation: a hinged rod held by a cable

**Example — find the tension and the hinge force.** A uniform horizontal rod of length 1.2 m and weight 30 N is hinged to a wall and held by a cable from its far end at 30° to the rod.

- Moments about the hinge (hinge force has no moment): T sin 30° × 1.2 = 30 × 0.60, so T = 18 ÷ 0.60 = 30 N.
- Horizontal: hinge pushes out with T cos 30° = 26.0 N.
- Vertical: hinge pushes up with 30 − T sin 30° = 15 N.
- Hinge force = √(26.0² + 15²) = 30 N.

### Situation: three forces on a point (vector triangle)

**Example — hanging sign.** A 50 N sign hangs from two strings, each at 40° above the horizontal. Horizontal components cancel; vertically 2T sin 40° = 50, so T = 25 ÷ 0.643 = 38.9 N. Shallower strings need larger tensions.

### Situation: pressure at depth, including the surface

**Example — diver.** A diver is 12 m below the surface of sea water (ρ = 1030 kg m⁻³); atmospheric pressure is 1.01 × 10⁵ Pa.

- Extra pressure from the water = ρgh = 1030 × 9.81 × 12 = 1.21 × 10⁵ Pa.
- Total pressure = 1.01 × 10⁵ + 1.21 × 10⁵ = 2.22 × 10⁵ Pa, about twice atmospheric.

### Situation: force from pressure on a surface

**Example — window of a submersible.** At a pressure difference of 4.0 × 10⁶ Pa, a circular window of radius 0.10 m feels F = Δp × A = 4.0 × 10⁶ × π × 0.10² = 1.26 × 10⁵ N.

### Situation: upthrust on a submerged object

**Example — steel block on a string in water.** Volume 2.0 × 10⁻⁴ m³, density 7800 kg m⁻³.

- Upthrust = ρ_water gV = 1000 × 9.81 × 2.0 × 10⁻⁴ = 1.96 N (uses the water's density).
- Weight = 7800 × 2.0 × 10⁻⁴ × 9.81 = 15.3 N.
- Tension in the string = 15.3 − 1.96 = 13.3 N: the "apparent weight".

### Situation: a floating object

**Example — fraction submerged.** A wooden block of density 600 kg m⁻³ floats in water. Upthrust = weight: 1000 × g × V_sub = 600 × g × V, so V_sub/V = 0.60. Sixty per cent is under water; in sea water (1030 kg m⁻³) slightly less, 58%.

**Example — load a raft can carry.** A raft of volume 0.50 m³ and mass 150 kg is fully submerged at most when the upthrust is 1000 × 9.81 × 0.50 = 4905 N. Maximum total mass = 4905 ÷ 9.81 = 500 kg, so the extra load is 350 kg.

## Exam checks

Use perpendicular distances for moments and perpendicular force for pressure. Convert area and volume units with squared and cubed factors. Distinguish pressure difference from absolute pressure and use fluid density for upthrust. No additional ambiguity in the listed objectives needs a scope assumption.
