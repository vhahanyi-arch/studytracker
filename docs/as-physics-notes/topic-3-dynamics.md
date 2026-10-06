# Topic 3 — Dynamics

Source: supplied Cambridge 9702 syllabus (2025–2027), printed pages 17–18; objectives 3.1.1–3.3.4. See [source and scope](README.md).

## Concept summary

### Mass, force, momentum and weight — 3.1.1, 3.1.2, 3.1.3, 3.1.4, 3.1.5, 3.1.6

Mass measures resistance to a change in motion (inertia). Momentum is mass multiplied by velocity and is a vector. A resultant force changes momentum; for constant mass, it produces acceleration in the direction of that force.

Newton's first law: an object remains at rest or moves at constant velocity unless a resultant external force acts. Newton's second law: resultant force is the rate of change of momentum. Newton's third law: when two objects interact, their forces on each other are equal in magnitude, opposite in direction and of the same type, acting on different objects. Third-law partners therefore do not cancel on one object's force diagram.

Weight is the gravitational force on a mass. Mass is measured in kg; weight in N. A support force and weight may balance, but are not a third-law pair. Draw all forces acting on the chosen object, resolve them, then use the resultant in F = ma.

### Resistance and terminal velocity — 3.2.1, 3.2.2, 3.2.3

Friction opposes relative sliding or the tendency to slide between surfaces. Drag opposes motion relative to a fluid and increases with speed in the simple model required here. For an object released from rest in air, drag is initially small, so downward acceleration is large. As speed rises, drag grows and resultant downward force falls. Terminal velocity occurs when all forces balance: acceleration is zero while velocity is non-zero. If buoyancy matters, include upthrust as well as drag. Changing the object's area can change its terminal speed.

No coefficient-of-friction or viscosity calculations are required by 3.2.1; no particular drag-versus-speed equation is prescribed.

### Momentum conservation and collisions — 3.3.1, 3.3.2, 3.3.3, 3.3.4

Total momentum of a system stays constant if the resultant external force is zero (or its effect over the interaction is negligible). Internal forces exchange momentum between objects without changing the total. Apply the rule separately along two perpendicular directions for a two-dimensional interaction.

Elastic collisions conserve total kinetic energy as well as momentum. In a one-dimensional elastic collision, relative speed of approach equals relative speed of separation. Inelastic collisions do not conserve total kinetic energy, although total energy remains conserved. Objects that stick together share a final velocity. Recoil and explosions also obey momentum conservation, while internal energy can become kinetic energy.

## Key formulas

### Forces and momentum

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| p = mv | p: momentum, kg m s⁻¹; m: mass, kg; v: velocity, m s⁻¹ | Vector equation; use signed components in calculations. |
| F̄ = Δp/Δt | F̄: average resultant force, N; Δp: momentum change, kg m s⁻¹; Δt: time interval, s | Average over an interval; instantaneous force is the local rate of momentum change. |
| F = ma | F: resultant force, N; m: constant mass, kg; a: acceleration, m s⁻² | Vector equation; resolve forces along the chosen axis. |
| W = mg | W: weight, N; m: kg; g: gravitational field strength, N kg⁻¹, equivalently free-fall acceleration in m s⁻² | Weight acts along the gravitational field. W here is weight, not work. |
| F̄Δt = Δp | Symbols as above; product unit N s = kg m s⁻¹ | Rearrangement of the force definition for a contact or collision interval; often called impulse. |

### Interactions

For the equations below, m₁ and m₂ are masses (kg), u₁ and u₂ initial velocities (m s⁻¹), and v₁ and v₂ final velocities (m s⁻¹). Subscripts identify the objects.

| Formula | Other symbols and SI units | Use / condition |
|---|---|---|
| Σp_before = Σp_after | p: vector momentum, kg m s⁻¹; Σ means sum | No significant external momentum transfer during the interaction. |
| m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂ | Symbols defined above | One-dimensional signed form, or one component of a two-dimensional problem. |
| v = (m₁u₁ + m₂u₂)/(m₁ + m₂) | v: common final velocity, m s⁻¹ | Derived result when the two objects stick together. |
| ½m₁u₁² + ½m₂u₂² = ½m₁v₁² + ½m₂v₂² | Each energy term: J; velocity magnitudes used for kinetic energy | Elastic collision only; kinetic-energy expression is developed in Topic 5. |
| u₁ − u₂ = v₂ − v₁ | All velocities: m s⁻¹ | One-dimensional elastic collision with objects labelled so u₁ − u₂ is the positive approach speed. Do not use the full-speed relation indiscriminately in two dimensions. |

## Using the formulas in different situations

Method for any force problem: choose the object, draw every force acting on it, choose a positive direction, resolve, find the resultant, then apply F = ma or F = Δp/Δt. Take g = 9.81 m s⁻².

### Situation: driving force against resistance

**Example — car.** A 1200 kg car has a driving force of 3000 N and total resistive force 600 N. a = (3000 − 600) ÷ 1200 = 2.0 m s⁻². At terminal (top) speed, resistance would have risen to 3000 N and a = 0.

### Situation: a person in a lift

**Example — accelerating up.** A 60 kg person stands in a lift accelerating upwards at 1.5 m s⁻². Upwards positive: R − mg = ma, so R = m(g + a) = 60 × 11.31 = 679 N. The scale reads more than the weight (589 N).

**Example — accelerating down.** At 1.5 m s⁻² downwards: R = m(g − a) = 60 × 8.31 = 499 N. In free fall (a = g), R = 0.

### Situation: a slope (resolve along and perpendicular)

**Example — block on a 25° slope.** Mass 5.0 kg.

- Component of weight down the slope = mg sin 25° = 5.0 × 9.81 × 0.423 = 20.7 N.
- Normal contact force = mg cos 25° = 44.5 N (no acceleration perpendicular to the slope).
- Without friction: a = g sin 25° = 4.15 m s⁻².
- With 8.0 N of friction up the slope: a = (20.7 − 8.0) ÷ 5.0 = 2.5 m s⁻².

### Situation: connected objects

**Example — trolley and hanging mass.** A 2.0 kg trolley on a frictionless table is pulled by a string over a pulley to a hanging 0.50 kg mass.

- Whole system: resultant force = weight of the hanging mass = 0.50 × 9.81 = 4.91 N; total mass = 2.5 kg; a = 4.91 ÷ 2.5 = 1.96 m s⁻².
- Trolley alone: T = 2.0 × 1.96 = 3.92 N.
- Check on the hanging mass: 4.91 − 3.92 = 0.98 N = 0.50 × 1.96. The tension is less than the hanging weight because that mass accelerates downwards.

### Situation: force from a momentum change

**Example — ball and bat.** A 0.15 kg ball arrives at 20 m s⁻¹ and leaves in the opposite direction at 30 m s⁻¹. Contact time 2.5 ms. Taking the arrival direction as positive: Δp = 0.15 × (−30 − 20) = −7.5 N s. Average force = 7.5 ÷ 0.0025 = 3000 N, opposite to the arrival direction.

**Example — rocket thrust.** A rocket ejects 50 kg of gas each second at 2000 m s⁻¹ relative to it. Momentum given to the gas per second = 50 × 2000 = 1.0 × 10⁵ kg m s⁻², so the thrust is 1.0 × 10⁵ N (third law).

### Situation: objects stick together (inelastic)

**Example — car collision.** A 1500 kg car at 20 m s⁻¹ hits a stationary 1000 kg car and they lock together.

- v = (1500 × 20 + 0) ÷ 2500 = 12 m s⁻¹.
- Eₖ before = ½ × 1500 × 20² = 300 kJ; after = ½ × 2500 × 12² = 180 kJ.
- 120 kJ became internal energy and sound: momentum conserved, kinetic energy not.

### Situation: elastic collision in one dimension

**Example — find both final velocities.** A 2.0 kg ball at 3.0 m s⁻¹ hits a stationary 1.0 kg ball elastically.

- Momentum: 2.0 × 3.0 = 2.0v₁ + 1.0v₂, so 6.0 = 2.0v₁ + v₂.
- Relative speeds: u₁ − u₂ = v₂ − v₁, so 3.0 = v₂ − v₁.
- Solving: v₁ = 1.0 m s⁻¹, v₂ = 4.0 m s⁻¹.
- Check kinetic energy: before ½ × 2.0 × 9.0 = 9.0 J; after 1.0 + 8.0 = 9.0 J.

### Situation: explosion from rest

**Example — energy released.** A 3.0 kg object at rest splits into 1.0 kg at 12 m s⁻¹ and 2.0 kg moving the other way. Momentum: 1.0 × 12 = 2.0v, so v = 6.0 m s⁻¹. Kinetic energy produced = ½ × 1.0 × 12² + ½ × 2.0 × 6.0² = 72 + 36 = 108 J, from internal (chemical or elastic) energy.

### Situation: a collision in two dimensions

**Example — pucks.** A 0.20 kg puck A at 5.0 m s⁻¹ along x hits a stationary 0.20 kg puck B. Afterwards A has velocity components 3.2 m s⁻¹ along x and 2.4 m s⁻¹ along y.

- x: 0.20 × 5.0 = 0.20 × 3.2 + 0.20vₓ, so vₓ = 1.8 m s⁻¹.
- y: 0 = 0.20 × 2.4 + 0.20vᵧ, so vᵧ = −2.4 m s⁻¹.
- B moves at √(1.8² + 2.4²) = 3.0 m s⁻¹ at tan⁻¹(2.4 ÷ 1.8) = 53° below the x direction. (Here the kinetic energy, 2.5 J, is unchanged, so this collision is elastic.)

### Situation: terminal velocity

**Example — skydiver.** An 80 kg skydiver at terminal velocity has drag = weight = 80 × 9.81 = 785 N and zero acceleration. Opening the parachute increases the area, so drag exceeds weight, the resultant force is upwards, and the skydiver decelerates to a lower terminal velocity.

## Exam checks and wording

Objective 3.3.4 says momentum is “always conserved” in interactions. Apply this to the complete isolated system: a selected pair of objects can exchange momentum with external surroundings. State the negligible-external-force condition explicitly. Coefficient of restitution is not required. At terminal velocity use zero resultant force, not zero weight or zero velocity.
