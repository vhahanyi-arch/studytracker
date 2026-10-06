# Topic 5 — Work, energy and power

Source: supplied Cambridge 9702 syllabus (2025–2027), printed page 19; objectives 5.1.1–5.2.4. See [source and scope](README.md).

## Concept summary

### Work and conservation — 5.1.1, 5.1.2

Work transfers energy when a force acts through a displacement. Only the force component along the displacement contributes. Work by a force is positive if it assists the displacement, negative if it opposes it, and zero if perpendicular.

Energy cannot be created or destroyed; it is transferred between objects or changed between forms. Include the surroundings when setting the system boundary. Friction transfers mechanical energy into internal energy: total energy is conserved, but kinetic plus gravitational potential energy need not be. Start calculations with an energy balance and identify all transfers.

### Efficiency and power — 5.1.3, 5.1.4, 5.1.5, 5.1.6, 5.1.7

Efficiency compares useful output with total input. It is a dimensionless fraction or percentage, never useful output divided by wasted output. For a sequence of converters, multiply fractional efficiencies when each one's useful output is the next one's input.

Power is the rate of doing work or transferring energy. Derive P = Fv from W = Fs and P = W/t, using v = s/t for motion along the force. For an instantaneous value use the instantaneous velocity and force component along it. An efficient motor's useful mechanical power can be smaller than its input power.

### Potential and kinetic energy — 5.2.1, 5.2.2, 5.2.3, 5.2.4

In a uniform gravitational field, lifting a mass slowly through height Δh requires an upward force mg, so work against gravity is mgΔh. This is the gain in gravitational potential energy. Only changes in potential energy matter; choose any convenient zero. A downward change in height gives a negative change in potential energy.

To derive kinetic energy, use resultant force F = ma and v² − u² = 2as for constant acceleration. Then net work Fs = mas = ½m(v² − u²). Starting from rest gives Eₖ = ½mv². This derivation uses uniform acceleration; the kinetic-energy expression itself does not require uniform acceleration. Kinetic energy is a scalar and depends on speed squared, so reversing direction at the same speed leaves it unchanged.

## Key formulas

### Work and energy accounting

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| W = Fs cos θ = F_parallel s | W: work, J; F: force magnitude, N; s: displacement magnitude, m; θ: angle between force and displacement, rad (or degrees consistently); F_parallel: signed component, N | Constant force over a straight displacement; W = Fs for parallel force. |
| E_initial + E_transferred_in = E_final + E_transferred_out | All E quantities: energy, J | Conservation balance for the chosen system; account for each transfer once. |
| W_net = ΔEₖ | W_net: net work by all forces, J; ΔEₖ: kinetic-energy change, J | Derived link between net work and kinetic energy for a particle; work by just one force need not equal ΔEₖ. |

### Efficiency and power

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| η = E_useful/E_input; efficiency (%) = 100η | η: efficiency, dimensionless; E_useful: useful output energy, J; E_input: total input energy, J | Same process and accounting interval, with positive input. |
| η = P_useful/P_input | P_useful, P_input: output and input power, W; η: dimensionless | Equivalent power form for the same interval or steady operation. |
| η_total = η₁η₂… | All η values: dimensionless fractions | Derived application for successive converters; do not multiply percentage numbers directly. |
| P_average = W/t = E_transferred/t | P_average: power, W = J s⁻¹; W: work, J; E_transferred: energy, J; t: elapsed time, s | Average power during the interval. The unit W means watt; the quantity W means work. |
| P = Fv | P: mechanical power, W; F: force component along velocity, N; v: speed, m s⁻¹ | Force along motion; more generally P = F_magnitude v cos θ, with θ between force and velocity. |

### Gravitational and kinetic energy

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| ΔEₚ = mgΔh | ΔEₚ: potential-energy change, J; m: mass, kg; g: field strength, N kg⁻¹ or m s⁻²; Δh: upward height change, m | Uniform gravitational field, constant mass. |
| Eₖ = ½mv² | Eₖ: kinetic energy, J; m: mass, kg; v: speed, m s⁻¹ | Translational kinetic energy in the motion considered here. |
| ΔEₖ = ½m(v² − u²) | ΔEₖ: kinetic-energy change, J; u, v: initial and final speeds, m s⁻¹; m: kg | Derived form for constant mass; negative when slowing. |
| Eₖ,initial + Eₚ,initial = Eₖ,final + Eₚ,final | All energy terms: J | Derived mechanical-energy balance when only gravity does work and no energy is dissipated. |

## Using the formulas in different situations

Take g = 9.81 m s⁻². Start energy questions by writing the balance: initial energy + energy in = final energy + energy out (including work against friction).

### Situation: a force at an angle to the motion

**Example — pulling a suitcase.** A 40 N pull at 35° above the horizontal moves a suitcase 50 m along the floor. W = Fs cos θ = 40 × 50 × cos 35° = 1.64 × 10³ J. The vertical component does no work, because there is no vertical displacement.

**Example — negative work.** Friction of 12 N acting over the same 50 m does −600 J of work on the suitcase: it removes kinetic energy and becomes internal energy.

### Situation: a slope with friction

**Example — block sliding down a ramp.** A 2.0 kg block slides from rest down a ramp 3.0 m long and 1.5 m high, against 4.0 N of friction.

- Loss of Eₚ = mgΔh = 2.0 × 9.81 × 1.5 = 29.4 J.
- Work against friction = 4.0 × 3.0 = 12.0 J (friction acts along the whole 3.0 m, not the height).
- Gain in Eₖ = 29.4 − 12.0 = 17.4 J, so v = √(2 × 17.4 ÷ 2.0) = 4.17 m s⁻¹.

### Situation: mechanical energy conserved

**Example — swing.** A child on a swing is released 0.80 m above the lowest point. With negligible resistance, ½mv² = mgΔh, so v = √(2 × 9.81 × 0.80) = 3.96 m s⁻¹ at the bottom. At 0.30 m above the bottom, Δh = 0.50 m, giving v = 3.13 m s⁻¹. The mass cancels.

### Situation: net work and kinetic energy

**Example — average resultant force.** A 1200 kg car speeds up from 10 m s⁻¹ to 20 m s⁻¹ over 150 m.

- ΔEₖ = ½ × 1200 × (20² − 10²) = 1.80 × 10⁵ J. (Not ½ × 1200 × 10², which uses the change in speed.)
- Net work = ΔEₖ, so average resultant force = 1.80 × 10⁵ ÷ 150 = 1200 N.

**Example — stopping distance and speed.** With the same braking force, Fs = ½mu², so s ∝ u². A car that stops in 20 m from 15 m s⁻¹ needs 80 m from 30 m s⁻¹.

### Situation: power at constant velocity

**Example — resistive force from power.** A car's wheels deliver 45 kW while it travels at a steady 30 m s⁻¹. Constant velocity means driving force = resistive force = P ÷ v = 45 000 ÷ 30 = 1500 N.

**Example — lifting at a steady speed.** A motor lifts a 250 kg load at a steady 0.40 m s⁻¹. Useful power = Fv = mgv = 250 × 9.81 × 0.40 = 981 W.

### Situation: efficiency

**Example — motor.** The motor above draws 1500 W of electrical power. η = 981 ÷ 1500 = 0.654, or 65%.

**Example — a chain of converters.** Boiler 85%, turbine 45%, generator 95%. η_total = 0.85 × 0.45 × 0.95 = 0.36, or 36%. Multiply the fractions, not 85 × 45 × 95.

**Example — energy wasted.** A 60 W lamp of efficiency 15% runs for 2.0 hours. Input energy = 60 × 7200 = 4.32 × 10⁵ J; useful light = 6.5 × 10⁴ J; wasted as internal energy = 3.67 × 10⁵ J.

### Situation: average power for a task

**Example — sprinter.** A 70 kg sprinter reaches 9.0 m s⁻¹ from rest in 3.0 s. Average useful power = ΔEₖ ÷ t = ½ × 70 × 81 ÷ 3.0 = 945 W.

## Exam checks

Distinguish the force's work from total work, input power from useful output power, and energy conservation from mechanical-energy conservation. State the chosen height reference and keep the sign of Δh. No additional ambiguity in the listed objectives needs a scope assumption; elastic potential energy belongs to Topic 6.
