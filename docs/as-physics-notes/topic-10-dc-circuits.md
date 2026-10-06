# Topic 10 — D.C. circuits

Cambridge International AS Level Physics 9702, 2025–2027 syllabus, version 1, printed page 24 (16 objectives). Circuit symbols: section 6, printed pages 61–62. These notes accompany the question bank; practise drawing circuits on paper as well as answering its text questions.

## 10.1 Practical circuits

### Symbols and diagrams — 10.1.1–10.1.2

Use the exact syllabus symbols below. The first sheet contains the cell, battery, power supply, a.c. supply, conductor junction, lamp, fixed resistor, variable resistor, thermistor, LDR, heater, switch, earth, electric bell, buzzer, microphone, loudspeaker, motor, generator, ammeter, voltmeter and galvanometer. The second adds the potentiometer, diode, LED, oscilloscope and capacitor. Recognition of a symbol does not introduce A Level capacitor or a.c. theory into this topic.

![Cambridge 9702 circuit symbols, printed page 61](assets/syllabus-circuit-symbols-61.png)

![Cambridge 9702 circuit symbols, printed page 62](assets/syllabus-circuit-symbols-62.png)

A filled junction dot joins wires electrically. Draw connections clearly and label component values and polarities. The long cell plate is positive. A closed switch completes its path; an open switch breaks that path. Series components lie along one unbranched path. Parallel components connect across the same two nodes, even if drawn in different places.

Draw an ammeter in series with the branch being measured. Its ideal resistance is zero. Draw a voltmeter across the two nodes whose potential difference is required; its ideal resistance is infinite, so it draws no current. An ideal ammeter across a supply would short it. For drawing practice, sketch a cell and switch supplying two parallel resistors, put an ammeter in just one branch and a voltmeter across the pair. Identify every junction and trace the complete current paths.

### E.m.f., p.d. and internal resistance — 10.1.3–10.1.5

E.m.f. is the energy transferred by a source per unit charge in driving charge around a complete circuit. It is measured in volts, not newtons. Potential difference across a resistor is the electrical energy transferred to other forms per unit charge. A source can convert chemical energy into electrical energy; resistors transfer electrical energy to thermal energy.

Model a real source as ideal e.m.f. E in series with internal resistance r. When it supplies current I, the internal drop is Ir, so its terminal p.d. is E − Ir. Increasing current reduces terminal p.d. if E and r remain constant. At open circuit I = 0, so the ideal voltmeter reading equals E. These statements use a discharging source; do not apply the same sign blindly to charging.

Example: E = 12 V, r = 1 Ω and external R = 5 Ω give I = 2 A and terminal V = 10 V. The source supplies 24 W: 4 W is dissipated internally and 20 W in the load.

## 10.2 Kirchhoff’s laws

### Conservation and circuit equations — 10.2.1–10.2.2, 10.2.7

The first law states that total current entering a junction equals total current leaving it. It follows from conservation of charge: charge does not accumulate at a steady junction. Current divides between branches and recombines; it is not consumed by resistors.

The second law states that the algebraic sum of potential changes around a closed loop is zero. Equivalently, total e.m.f. rises equal total potential drops for a consistently chosen loop direction. This follows from conservation of energy per unit charge. Going through a source from negative to positive is a rise; going through a resistor in the assumed current direction is a drop IR. A negative solved current means the actual current is opposite to the assumed arrow.

To solve a circuit, label nodes, assume branch-current directions, write independent junction and loop equations, solve together, and check both laws. Components in parallel share p.d., not generally current. Example: an 18 V ideal source supplies 2 Ω in series with 6 Ω and 12 Ω in parallel. The parallel equivalent is 4 Ω, total current is 3 A, and the parallel p.d. is 12 V. Branch currents are 2 A and 1 A; they add to 3 A.

### Resistance combinations and their derivations — 10.2.3–10.2.6

In series, current I is common. The loop law gives V = V1 + V2 + … = IR1 + IR2 + … = I(R1 + R2 + …). Comparing with V = IR_total and dividing by nonzero I gives R_total = R1 + R2 + … . It exceeds any one positive component resistance.

In parallel, p.d. V is common. The junction law gives I = I1 + I2 + … = V/R1 + V/R2 + … . Comparing with I = V/R_total and dividing by nonzero V gives 1/R_total = 1/R1 + 1/R2 + … . For two resistors, rearrange to R_total = R1R2/(R1 + R2). The equivalent is smaller than the smallest branch resistance. These formulas require the stated series/parallel connections; visual position alone is insufficient.

## 10.3 Potential dividers

### Unloaded and loaded output — 10.3.1

Connect R_upper between +V_s and junction J, and R_lower between J and 0 V. Define output as the potential of J relative to 0 V. With no output load, the same current flows through both resistors and V_out = V_s R_lower/(R_upper + R_lower). A high-resistance voltmeter approximates this unloaded condition.

A load across J and 0 V is in parallel with R_lower. Replace that lower branch by its parallel equivalent before using the divider ratio. This is a derived application of Kirchhoff’s laws. For example, a 12 V supply and two 1 kΩ divider resistors give 6 V unloaded. Adding a 1 kΩ load across the lower resistor gives a lower equivalent of 0.5 kΩ and output 4 V. The original unloaded ratio no longer applies.

### Potentiometer comparisons and null measurements — 10.3.2–10.3.3

A steady driver current through a uniform wire creates a constant potential gradient. Connect the p.d. under comparison in opposition to the p.d. between the zero end and a movable contact, using a galvanometer in the comparison branch. Adjust the contact until the galvanometer reads zero. At null the two opposed p.d.s are equal and there is no comparison-branch current. The driver wire still carries current.

For unchanged wire current, p.d. is proportional to balance length: V1/V2 = L1/L2. Measure both lengths from the same reference end; the whole-wire length is not the balance length unless the contact is at the far end. A 1.5 V reference balancing at 30 cm and an unknown balancing at 50 cm give an unknown of 2.5 V. The driver must provide enough p.d. along the available wire to obtain a balance. A cell measured at null supplies no comparison current, so there is no internal Ir drop due to that measurement; with no other load, its e.m.f. is measured.

### Sensor dividers — 10.3.4

For an LDR, increasing light intensity decreases resistance. For a negative-temperature-coefficient thermistor, increasing temperature decreases resistance. The response is not assumed linear. Determine the sensor-resistance change first, then use its position in the divider to determine the output change. Keep supply voltage and the other resistance fixed.

| Change | Sensor position | Output J relative to 0 V |
|---|---|---|
| More light or higher temperature: sensor R falls | Upper | Rises |
| More light or higher temperature: sensor R falls | Lower | Falls |
| Less light or lower temperature: sensor R rises | Upper | Falls |
| Less light or lower temperature: sensor R rises | Lower | Rises |

## Formula sheet

All resistance symbols (R, r, R1, R2, R_total, R_upper, R_lower, R_L and R_b) have SI unit ohm (Ω). All current symbols (I, I1, I2, I_in, I_out) have unit ampere (A). E, V, V_s, V_out, V1 and V2 are e.m.f.s or p.d.s in volts (V), as identified below. Subscripts label components or measurement states, not new units.

| Formula | Meanings and conditions |
|---|---|
| E = W_source/Q | E: source e.m.f.; W_source: energy supplied by source (J); Q: charge circulated (C). Definition. |
| V = W_component/Q | V: component p.d.; W_component: electrical energy transferred (J); Q: charge (C). Topic 9 definition used here. |
| V = IR | V across resistance R carrying I; use the appropriate operating resistance. Topic 9 relation. |
| V = E − Ir; E = V + Ir | V: terminal p.d.; E: source e.m.f.; r: internal resistance; I: current supplied by the discharging source. |
| I = E/(R + r) | One external equivalent resistance R in series with internal r; ideal connecting wires. Derived. |
| r = (E − V)/I | E from open circuit and V at nonzero loaded current I; assume E and r unchanged. Derived. |
| ΣI_in = ΣI_out | Sums of currents entering/leaving a steady junction; conservation of charge. |
| ΣΔV = 0 | Signed potential changes ΔV (V) round a closed loop; consistent traversal direction. Equivalent to signed source rises equalling resistor drops. |
| R_total = R1 + R2 + … | Series resistances; common current. |
| 1/R_total = 1/R1 + 1/R2 + … | Parallel resistances; common p.d. |
| R_total = R1R2/(R1 + R2) | Exactly two parallel resistors; derived from the reciprocal sum. |
| V_out = V_s R_lower/(R_upper + R_lower) | Ideal fixed supply V_s; output across lower resistor, unloaded. |
| R_b = R_lower R_L/(R_lower + R_L); V_out = V_s R_b/(R_upper + R_b) | Load R_L across lower resistor; R_b: lower equivalent. Derived loaded-divider result. |
| V = kL; k = V_wire/L_wire | Uniform potentiometer wire at steady current. k: potential gradient (V m⁻¹); L: balance length (m); V: p.d. over L; V_wire and L_wire: p.d. and length of the uniform driven section. |
| V1/V2 = L1/L2 | Two balances with the same gradient; L1, L2 in m (or matching length units in the ratio); compared p.d.s V1, V2. |
| P_source = EI; P_internal = I²r; P_load = VI | Powers in watts (W); source supplying I, terminal p.d. V, internal r. Derived energy check from Topic 9 power relations; P_source = P_internal + P_load. |

1 kΩ = 1000 Ω and 1 cm = 0.01 m. Matching resistance units cancel in a divider ratio, but use Ω for calculations with A and V. Keep intermediate precision and round the final answer appropriately.

Common mistakes: calling e.m.f. a force; using terminal V/I as internal resistance; assuming parallel branch currents are equal for unequal resistors; adding parallel resistances directly; confusing a null comparison current with zero driver current; and predicting a sensor output without specifying where the sensor sits.

## Using the formulas in different situations

### Situation: internal resistance from meter readings

**Example — open circuit, then loaded.** A cell's terminal p.d. is 1.55 V with nothing connected and 1.40 V across a 4.0 Ω resistor.

- Open circuit, so E = 1.55 V.
- Loaded current I = 1.40 ÷ 4.0 = 0.35 A.
- r = (E − V) ÷ I = (1.55 − 1.40) ÷ 0.35 = 0.43 Ω.

**Example — two loaded readings.** A supply gives 1.20 V at 0.50 A and 1.00 V at 1.50 A. From V = E − Ir: the p.d. falls 0.20 V when the current rises 1.00 A, so r = 0.20 Ω, and E = 1.20 + 0.50 × 0.20 = 1.30 V. On a graph of V against I, the gradient is −r and the intercept is E.

**Example — short circuit.** A 6.0 V source with r = 0.50 Ω, shorted by a thick wire: I = E ÷ r = 12 A. The large current heats the source, which is why shorting a battery is dangerous.

### Situation: a network with internal resistance

**Example — find every current and p.d.** E = 12 V, r = 2.0 Ω. Externally, 6.0 Ω and 12 Ω in parallel are in series with a 4.0 Ω resistor.

- Parallel pair: 6.0 × 12 ÷ (6.0 + 12) = 4.0 Ω; external total 8.0 Ω; with r, 10 Ω.
- I = 12 ÷ 10 = 1.2 A. Terminal p.d. = 12 − 1.2 × 2.0 = 9.6 V.
- P.d. across the 4.0 Ω resistor = 4.8 V; across the parallel pair = 4.8 V.
- Branch currents: 4.8 ÷ 6.0 = 0.80 A and 4.8 ÷ 12 = 0.40 A, which add to 1.2 A.
- Power: source 14.4 W = internal 2.88 W + external 11.52 W.

### Situation: two sources (Kirchhoff's laws)

**Example — find the branch currents.** Two branches join at the same two nodes, each with its positive terminal towards the top node: branch 1 has E₁ = 12 V and 2.0 Ω; branch 2 has E₂ = 6.0 V and 2.0 Ω. A third branch is a 4.0 Ω resistor. Assume currents I₁ and I₂ upwards through the sources and I₃ downwards through the 4.0 Ω.

- Junction: I₃ = I₁ + I₂.
- Loop through branch 1 and the 4.0 Ω: 12 = 2.0I₁ + 4.0I₃.
- Loop through branch 2 and the 4.0 Ω: 6.0 = 2.0I₂ + 4.0I₃.
- Substituting I₃: 12 = 6.0I₁ + 4.0I₂ and 6.0 = 4.0I₁ + 6.0I₂. Solving: I₁ = 2.4 A, I₂ = −0.60 A, I₃ = 1.8 A.
- The minus sign means 0.60 A actually flows down through the 6.0 V source: it is being charged. Check: p.d. across 4.0 Ω = 7.2 V, and 12 − 2.4 × 2.0 = 7.2 V.

### Situation: sensor in a potential divider

**Example — thermistor at the top.** A 9.0 V supply; NTC thermistor (upper) in series with a fixed 5.0 kΩ resistor (lower); output across the lower resistor. The thermistor is 10 kΩ at 20 °C and 2.0 kΩ at 60 °C.

- At 20 °C: V_out = 9.0 × 5.0 ÷ (10 + 5.0) = 3.0 V.
- At 60 °C: V_out = 9.0 × 5.0 ÷ (2.0 + 5.0) = 6.4 V. Output rises with temperature, as the table predicts for a sensor in the upper position.

### Situation: a voltmeter loading a divider

**Example — real voltmeter.** Two 10 kΩ resistors divide 12 V. A voltmeter of resistance 100 kΩ is connected across the lower one.

- Lower equivalent = 10 × 100 ÷ (10 + 100) = 9.09 kΩ.
- Reading = 12 × 9.09 ÷ (10 + 9.09) = 5.71 V, not 6.00 V. A 10 kΩ voltmeter would read only 4.0 V: the voltmeter's resistance must be much larger than the resistor it measures.

### Situation: potentiometer measurements

**Example — e.m.f. and internal resistance.** A 1.000 m uniform wire has 2.00 V across it, so k = 2.00 V m⁻¹.

- A cell alone balances at 0.730 m: at null no current flows from the cell, so E = 2.00 × 0.730 = 1.46 V.
- With a 5.0 Ω resistor across the cell, the balance moves to 0.610 m: terminal p.d. V = 1.22 V.
- Current through the resistor = 1.22 ÷ 5.0 = 0.244 A; r = (1.46 − 1.22) ÷ 0.244 = 0.98 Ω.

**Example — comparison without k.** A 1.018 V standard cell balances at 50.9 cm and an unknown at 72.0 cm. V = 1.018 × 72.0 ÷ 50.9 = 1.44 V.

Source: [supplied Cambridge syllabus](C:/Users/USER/Downloads/664565-2025-2027-syllabus.pdf). The two symbol images are renders of its printed pages 61–62. [Checked objectives and source hash](../../lib/as-physics-syllabus.json). [Topic verification](../as-physics-circuits-verification.md).
