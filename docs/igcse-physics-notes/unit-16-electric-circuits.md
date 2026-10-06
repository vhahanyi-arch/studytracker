# Unit 16 — Electric circuits

Source: Cambridge IGCSE Physics 0625 syllabus, sections 4.3.1, 4.3.2 and 4.3.3, Core and Supplement. See [source and scope](README.md).

## Concept summary

### Circuit components — 4.3.1

You need to draw and recognise the symbols for, and know how these behave: cells and batteries, power supplies (d.c. and a.c.), generators, potential dividers, switches, fixed and variable resistors, heaters, thermistors, light-dependent resistors, lamps, motors, bells, ammeters, voltmeters, magnetising coils, transformers, fuses and relays.

- **Cell / battery:** a source of e.m.f.; a battery is two or more cells joined together. The longer line of a cell symbol is the positive terminal.
- **Fixed resistor:** limits the current. **Variable resistor (rheostat):** its resistance can be changed to control the current, for example to dim a lamp.
- **Thermistor (NTC):** its resistance decreases as its temperature increases. Used in temperature sensors, fire alarms and thermostats.
- **Light-dependent resistor (LDR):** its resistance decreases as the light falling on it gets brighter. Used in automatic street lights and light meters.
- **Fuse:** a thin wire that melts if the current gets too large, breaking the circuit.
- **Relay:** a switch operated by an electromagnet, so a small current in one circuit can switch a large current in another.
- **Heater, lamp, motor, bell:** transfer electrical energy to internal energy, light, kinetic energy, sound.

**Supplement:** a **diode** lets current flow in one direction only (the direction of the arrow in its symbol). A **light-emitting diode (LED)** is a diode that gives out light when current flows forwards through it; it uses little energy. Diodes are used to change a.c. into d.c. (rectification) and to protect circuits from a battery connected the wrong way round.

### Series circuits — 4.3.2

Components are connected one after another in a single loop.

- The current is the same at every point.
- The e.m.f.s of cells in series add up (if they all face the same way). A cell connected the wrong way round subtracts.
- The combined resistance is the sum of the individual resistances.
- **Supplement:** the p.d. of the source is shared between the components: the sum of the p.d.s across them equals the total. The largest resistance gets the largest share.

If one component breaks, the whole circuit stops.

### Parallel circuits — 4.3.2

Components are connected in separate branches between the same two points.

- The current from the source is larger than the current in any one branch: it splits between the branches and recombines.
- The combined resistance of two resistors in parallel is less than either resistor on its own (there are more paths for the current).
- **Supplement:** at a junction, the total current in equals the total current out. This is because charge is conserved: it is not created or destroyed, so the charge flowing in each second must flow out.
- **Supplement:** the p.d. across each branch is the same, and equals the p.d. across the whole parallel arrangement.

**Lamps in parallel (house lighting):** each lamp gets the full supply p.d., so it is at full brightness; each can be switched on and off independently; if one fails, the others stay on.

### Potential dividers — 4.3.3

For a constant current, the p.d. across a conductor increases as its resistance increases (V = IR). Two resistors in series across a supply share the p.d. in the ratio of their resistances.

**Supplement:** a variable potential divider is either a variable resistor or a sliding contact on a resistor track (a potentiometer) used to give an output p.d. that can be changed smoothly from zero up to the full supply. Replacing one resistor with a thermistor or LDR makes a sensing circuit: the output p.d. changes with temperature or light.

- **LDR in a dark-detecting circuit:** in the dark the LDR's resistance rises, so it takes a larger share of the p.d.; the output across the LDR rises and can switch on a street light.
- **Thermistor in a fire alarm:** when hot, the thermistor's resistance falls, so the p.d. across the fixed resistor rises and can trigger an alarm.

## Key formulas

| Formula | Symbols and units | When to use it | Level |
|---|---|---|---|
| R = R₁ + R₂ + R₃ + … | R: combined resistance, Ω | Resistors in series. | Core |
| total e.m.f. = E₁ + E₂ + … | V | Cells in series, all facing the same way. | Core |
| I is the same everywhere in a series circuit | A | Find the current once, use it for every component. | Core |
| V = IR | V: V; I: A; R: Ω | The p.d. across any single component, or the whole circuit. | Core |
| I = I₁ + I₂ | A | Current from the source equals the sum of branch currents (junction rule). | Supplement |
| V = V₁ + V₂ | V | P.d.s in series add up to the supply p.d. | Supplement |
| p.d. across each parallel branch = p.d. across the arrangement | V | Parallel branches. | Supplement |
| 1 ÷ R = 1 ÷ R₁ + 1 ÷ R₂ | R₁, R₂: resistors in parallel, Ω | Two resistors in parallel. For two only: R = (R₁ × R₂) ÷ (R₁ + R₂). | Supplement |
| R₁ ÷ R₂ = V₁ ÷ V₂ | V₁, V₂: p.d.s across R₁ and R₂ in series, V | Potential dividers. With supply V: V₁ = V × R₁ ÷ (R₁ + R₂). | Supplement |

## Using the formulas in different situations

### Situation: series circuit

**Example — find everything.** A 12 V battery is connected to a 4.0 Ω resistor and an 8.0 Ω resistor in series.

- R = 4.0 + 8.0 = 12 Ω.
- I = V ÷ R = 12 ÷ 12 = 1.0 A, the same through both.
- V across 4.0 Ω = 1.0 × 4.0 = 4.0 V. V across 8.0 Ω = 1.0 × 8.0 = 8.0 V.
- Check: 4.0 + 8.0 = 12 V, the supply p.d.

**Example — cells in series.** Three 1.5 V cells in series give 4.5 V. If one is reversed: 1.5 + 1.5 − 1.5 = 1.5 V.

### Situation: two resistors in parallel (Supplement)

**Example — combined resistance.** 6.0 Ω and 3.0 Ω in parallel.

- 1 ÷ R = 1 ÷ 6.0 + 1 ÷ 3.0 = 0.167 + 0.333 = 0.500, so R = 2.0 Ω.
- Or: R = (6.0 × 3.0) ÷ (6.0 + 3.0) = 18 ÷ 9.0 = 2.0 Ω. Less than either resistor, as expected.

**Example — branch currents.** The pair above is connected to a 12 V supply.

- Each branch has 12 V across it.
- I through 6.0 Ω = 12 ÷ 6.0 = 2.0 A; I through 3.0 Ω = 12 ÷ 3.0 = 4.0 A.
- Current from the supply = 2.0 + 4.0 = 6.0 A. Check: 12 ÷ 2.0 Ω = 6.0 A.

**Example — two equal resistors.** Two 10 Ω resistors in parallel: R = 100 ÷ 20 = 5.0 Ω, half of one.

### Situation: junction rule (Supplement)

**Example — missing current.** 2.5 A enters a junction; one branch carries 0.9 A. The other carries 2.5 − 0.9 = 1.6 A.

### Situation: series and parallel combined (Supplement)

**Example.** A 4.0 Ω resistor is in series with a parallel pair of 12 Ω and 6.0 Ω, connected to a 9.0 V supply.

- Parallel pair: (12 × 6.0) ÷ (12 + 6.0) = 72 ÷ 18 = 4.0 Ω.
- Total resistance = 4.0 + 4.0 = 8.0 Ω.
- Supply current = 9.0 ÷ 8.0 = 1.125 A ≈ 1.1 A.
- P.d. across the 4.0 Ω series resistor = 1.125 × 4.0 = 4.5 V; across the parallel pair = 9.0 − 4.5 = 4.5 V.
- Current in the 12 Ω branch = 4.5 ÷ 12 = 0.375 A; in the 6.0 Ω branch = 4.5 ÷ 6.0 = 0.75 A. Check: 0.375 + 0.75 = 1.125 A.

### Situation: potential divider (Supplement)

**Example — output p.d.** R₁ = 2.0 kΩ and R₂ = 8.0 kΩ in series across 10 V.

- V₁ ÷ V₂ = R₁ ÷ R₂ = 2.0 ÷ 8.0 = 1 : 4, so the 10 V is split 2.0 V and 8.0 V.
- Or: V₂ = 10 × 8.0 ÷ (2.0 + 8.0) = 8.0 V.

**Example — find a resistor.** A 6.0 V supply across a 1.0 kΩ resistor and an LDR in series. In the dark the p.d. across the LDR is 5.0 V.

- P.d. across the resistor = 6.0 − 5.0 = 1.0 V.
- R(LDR) ÷ 1.0 kΩ = 5.0 ÷ 1.0, so R(LDR) = 5.0 kΩ.

**Example — sensor behaviour.** A thermistor is in series with a fixed resistor; the output is taken across the fixed resistor. As temperature rises, the thermistor's resistance falls, its share of the p.d. falls, so the p.d. across the fixed resistor (the output) rises.

## Exam checks

- Series: same current, p.d.s add. Parallel: same p.d., currents add.
- Two resistors in parallel always combine to less than the smaller one; use product ÷ sum.
- Find the total resistance and supply current first, then work out each part.
- A thermistor's resistance falls as it gets hotter; an LDR's falls as it gets brighter.
- Check your answers: branch currents should add to the supply current; series p.d.s should add to the supply p.d.
- Explain lamps in parallel: full p.d. each, independent switching, others stay on if one fails.
