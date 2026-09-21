# Topic 9 — Electricity

Source: supplied Cambridge 9702 syllabus (2025–2027), printed page 23; objectives 9.1.1–9.3.8. See [source and scope](README.md). Circuit networks, internal resistance and potential dividers belong to Topic 10.

## Concept summary

### Current and charge — 9.1.1, 9.1.2, 9.1.3

Electric current is a flow of charge carriers. Conduction electrons move in a metal; positive and negative ions carry charge in an electrolyte. Conventional current points in the direction positive charge would move, so electron drift is opposite to conventional current. Oppositely charged ions moving in opposite directions can both contribute to current in the same conventional direction.

Charge is quantised. An electron has charge −e, where e is the positive elementary charge magnitude, approximately 1.60 × 10⁻¹⁹ C. A packet containing N electrons has charge −Ne and magnitude Ne, with N a whole number. Ordinary ions carry integer multiples of e. Do not confuse the number of carriers with their total charge or with current, which is charge passing per unit time.

### Drift speed — 9.1.4

Drift speed is the small mean directed speed of charge carriers, not their random microscopic speed. For a uniform conductor with one carrier type, use I = Anvq. In time t, carriers drift distance vt; the corresponding volume is Avt, containing nAvt carriers. Multiplying by charge magnitude q and dividing by t gives the current magnitude. Here n is the number of carriers per unit volume, not the total number in the wire.

At the same carrier density and current, a larger cross-sectional area means a lower drift speed. For a circular wire, area depends on radius squared. Convert square millimetres to square metres with a factor of 10⁻⁶, not 10⁻³.

### Potential difference and power — 9.2.1, 9.2.2, 9.2.3

Potential difference across a component is the energy transferred per unit charge passing through it: one volt means one joule per coulomb. Charge is not used up as it passes through a component; energy is transferred.

Electrical power is energy transferred per second. Combining energy per coulomb with coulombs per second gives P = VI. Substitute V = IR to obtain P = I²R or P = V²/R. Choose the formula that uses the known quantities and distinguish the condition being held fixed: increasing resistance reduces power at fixed voltage, but increases power at fixed current.

### Resistance and Ohm's law — 9.3.1, 9.3.2, 9.3.5

Resistance at an operating point is potential difference divided by current. Rearrange this definition as V = IR. It does not by itself say that R is constant as voltage changes.

Ohm's law describes current proportional to potential difference when temperature and other physical conditions remain constant. An ohmic conductor then has constant resistance and a straight I–V line through the origin. Not every component is ohmic. For a nonlinear component, V/I at a point gives its resistance; the reciprocal of a tangent gradient is not generally that same ratio.

### I–V characteristics and the filament lamp — 9.3.3, 9.3.4

For every sketch, label **current I vertically** and **potential difference V horizontally**, mark the origin and show both polarities where relevant. Reversing the axes reverses which way a curve appears to bend.

| Component | How to sketch I vertically against V horizontally | Explanation |
|---|---|---|
| Metallic conductor at constant temperature | A straight line of positive gradient through the origin, extending into the first and third quadrants | R is constant; gradient I/V = 1/R. |
| Filament lamp | A curve through the origin in the first and third quadrants, steep near the origin and progressively less steep as the magnitude of V grows; opposite-polarity sections correspond under a 180° rotation | Larger current magnitude heats the metal filament, increasing its resistance; current therefore rises less rapidly than voltage. |
| Semiconductor diode | With forward bias on the positive-V side, show little current at small forward voltage followed by a steep rise; on the reverse side, show negligible current over the range before breakdown | It conducts much more readily in one direction. A universal exact turn-on voltage is not specified by this objective. |

For a lamp, lowering current magnitude allows cooling and lowers resistance, assuming the same surroundings. Do not treat a lamp's hot resistance as its cold resistance. A diode's reverse current is very small, not necessarily mathematically zero; reverse-breakdown behaviour is not needed for the basic sketch here.

### Resistivity and wire dimensions — 9.3.6

Resistivity describes the material under stated conditions and has unit Ω m. Resistance describes a particular specimen and also depends on its length and cross-sectional area. A longer uniform wire has greater resistance; a wider wire has lower resistance, if resistivity is unchanged.

If a wire is drawn longer at constant volume, its area decreases as well. Include both changes. Real processing or heating can change resistivity, so assume it remains constant only when the problem says so or specifies unchanged material conditions.

### LDRs and thermistors — 9.3.7, 9.3.8

An LDR's resistance decreases as light intensity increases. At a fixed potential difference, this raises current. Reducing illumination has the opposite effect.

The syllabus assumes an NTC thermistor: its resistance decreases as temperature increases. At fixed voltage, a lower resistance gives greater current and greater electrical power. Keep the voltage/current constraint clear before comparing power. In a measurement, electrical heating can itself affect temperature; a question may hold temperature fixed externally to isolate the stated effect.

## Key formulas

### Charge, current and carriers

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| Q = It; I = Q/t | Q: charge passing a section, C; I: current, A = C s⁻¹; t: elapsed time, s | Constant current, or average current over the interval. |
| Q_electrons = −Ne; charge magnitude = Ne | Q_electrons: signed charge, C; N: number of electrons, dimensionless integer; e: elementary charge magnitude, C | Electron-only packet; use the magnitude to count electrons. |
| N = charge magnitude/e | N: dimensionless count; charge and e: C | Derived carrier-count relation for electrons. Do not divide current by e and forget elapsed time when a total count is requested. |
| I = Anvq; v = I/(Anq) | I: current magnitude, A; A: cross-sectional area, m²; n: carrier number density, m⁻³; v: drift speed, m s⁻¹; q: charge magnitude per carrier, C | Uniform drift and one carrier type; use charge magnitude with speed. |
| A = πr² = πd²/4 | A: area, m²; r: wire radius, m; d: diameter, m | Circular cross-section; geometry used in drift and resistivity calculations. |

The letter A can denote area, while the unit symbol A denotes ampere. The quantity N counts carriers; n counts carriers per cubic metre. Use the value of e given in a question.

### Potential difference, resistance, power and energy

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| V = W/Q; W = VQ | V: potential difference, V = J C⁻¹; W: transferred energy, J; Q: charge, C | Energy transferred per unit charge; constant V for W = VQ over an interval. |
| R = V/I; V = IR | R: resistance, Ω; V: potential difference, V; I: current, A | Resistance at the stated operating point, with I nonzero for the ratio. Constant R across points requires the relevant physical conditions. |
| P = VI | P: electrical power, W = J s⁻¹; V: V; I: A | Power transferred at the stated operating point. |
| P = I²R | P: W; I: A; R: Ω | Derived from P = VI and V = IR; useful with known I and R. |
| P = V²/R | P: W; V: V; R: Ω | Derived form; useful with known V and nonzero R. |
| W = Pt = VIt | W: transferred energy, J; P: W; t: s; V: V; I: A | Constant power; the VI form assumes constant voltage and current. |

The quantity W above is energy; the unit W is watt. The two resistance-based power formulas can use the resistance at a nonlinear component's operating point without claiming it obeys Ohm's law over all voltages.

### Resistivity and geometry

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| R = ρL/A; ρ = RA/L | R: resistance, Ω; ρ: resistivity, Ω m; L: wire length, m; A: cross-sectional area, m² | Uniform wire with uniform resistivity. Here ρ is not mass density. |
| R₂/R₁ = (ρ₂/ρ₁)(L₂/L₁)(A₁/A₂) | R: Ω; ρ: Ω m; L: m; A: m²; subscripts 1, 2 label initial/final states | Derived comparison; retain every factor that changes. |
| volume = AL; R₂/R₁ = (L₂/L₁)² | volume: m³; A: m²; L: m; R: Ω | The squared resistance ratio is derived only for unchanged volume and resistivity when a uniform wire is redrawn. |

Useful conversions: 1 mA = 10⁻³ A; 1 μA = 10⁻⁶ A; 1 mm² = 10⁻⁶ m²; 1 kΩ = 10³ Ω. There is no prescribed quantitative resistance-versus-light or resistance-versus-temperature formula for LDRs or NTC thermistors in these objectives; use the qualitative trend or supplied data.

## Exam checks

Distinguish current, charge and carrier count. Convert squared area units correctly. Keep drift speed separate from wave or signal propagation speed. State the constant-temperature condition for Ohm's law. Read I–V axes before interpreting slopes, and check whether voltage or current is fixed before predicting power changes. The listed objectives need no additional scope assumption; the diode sketch does not justify inventing a fixed turn-on voltage.
