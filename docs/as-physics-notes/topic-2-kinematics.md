# Topic 2 — Kinematics

Source: supplied Cambridge 9702 syllabus (2025–2027), printed page 17; objectives 2.1.1–2.1.9. See [source and scope](README.md).

## Concept summary

### Describing and graphing motion — 2.1.1, 2.1.2, 2.1.3, 2.1.4, 2.1.5

Distance is total path length; displacement is the directed change in position. Speed is the rate of change of distance; velocity is the rate of change of displacement. Acceleration is the rate of change of velocity. Choose and keep a positive direction. Negative acceleration does not always mean slowing down: an object speeds up when velocity and acceleration have the same sign.

The gradient of a displacement–time graph gives velocity; a tangent gives the instantaneous value. The gradient of a velocity–time graph gives acceleration. Signed area under a velocity–time graph gives displacement; count all areas positively to find distance. A distance–time graph cannot decrease, and its gradient gives speed. Area under a speed–time graph gives distance. An acceleration–time graph shows how acceleration varies; its signed area gives velocity change (a direct consequence of the definition).

### Uniform acceleration and free fall — 2.1.6, 2.1.7

The equations below require constant acceleration in a straight line. Derive v = u + at by rearranging acceleration; then use the trapezium area of the velocity–time graph to obtain s = (u + v)t/2. Substitution and elimination give the other forms.

In a uniform gravitational field without air resistance, acceleration is constant and downward. Use the given value of g; near Earth's surface it is approximately 9.81 m s⁻². At the top of a vertical flight velocity is momentarily zero, but acceleration remains downward.

### Measuring free-fall acceleration — 2.1.8

Release a small dense object from rest using an electronic release and timer; stop the timer when it reaches a detector a measured vertical distance h below the release point. Measure the travel distance for the same part of the object at both ends. Repeat timings at each of several heights and plot h against t²: gradient = g/2. Avoid an initial push, minimise air resistance, and consider release or detector delays. Electronic timing avoids human reaction-time error; repeated measurements reveal scatter but do not remove a systematic delay.

### Motion in perpendicular directions — 2.1.9

Treat the horizontal and vertical components independently, using the same time. With negligible air resistance, horizontal velocity is constant and vertical acceleration is −g if upward is positive. Resolve the initial velocity for an angled launch. The path is curved because the vertical velocity changes while the horizontal velocity stays constant.

## Key formulas

In the tables, u and v are initial and final signed velocities (m s⁻¹), a is signed acceleration (m s⁻²), t is elapsed time (s), and s is displacement (m). Δ means final minus initial.

### Definitions and graphs

| Formula | Other symbols and SI units | Use / condition |
|---|---|---|
| average speed = d/t | d: total distance, m; speed: m s⁻¹ | Over the whole stated time interval. |
| average velocity = Δx/Δt | x: position, m; Δt: time interval, s; velocity: m s⁻¹ | Displacement divided by time, not distance. |
| average acceleration = Δv/Δt | Δv: velocity change, m s⁻¹; Δt: s | Use a tangent gradient for instantaneous acceleration on a curved v–t graph. |
| velocity = gradient of x–t graph; acceleration = gradient of v–t graph | x: displacement/position, m; t: s | Tangent for an instant, chord for an average. |
| displacement = signed area under v–t graph | v: m s⁻¹; t: s; area: m | Split at crossings of the time axis; sum area magnitudes for distance. |
| Δv = signed area under a–t graph | a: m s⁻²; t: s; Δv: m s⁻¹ | Derived graphical application of acceleration's definition. |

### Uniform acceleration in one dimension

| Formula | Symbols | Use / condition |
|---|---|---|
| v = u + at | As defined above | Constant a. |
| s = (u + v)t/2 | As defined above | Constant a; average velocity is then (u + v)/2. |
| s = ut + ½at² | As defined above | Constant a; no final velocity needed. |
| v² = u² + 2as | As defined above | Constant a; no time needed. Squaring loses velocity's sign. |
| s = vt − ½at² | As defined above | Rearranged form, constant a; no initial velocity needed. |
| h = ½gt² | h: downward distance, m; g: positive free-fall acceleration magnitude, m s⁻²; t: s | Released from rest, negligible resistance, uniform g. |

### Projectile components (derived applications)

| Formula | Symbols and SI units | Use / condition |
|---|---|---|
| uₓ = u cos θ; uᵧ = u sin θ | u: launch speed, m s⁻¹; θ: launch angle above horizontal, rad (or degrees consistently); uₓ, uᵧ: m s⁻¹ | Resolve initial velocity. |
| x = uₓt; y = uᵧt − ½gt² | x, y: displacement from launch, m; t: s; g: m s⁻² | Upward +y; constant horizontal velocity; no resistance. |
| vₓ = uₓ; vᵧ = uᵧ − gt | vₓ, vᵧ: velocity components, m s⁻¹; other symbols above | Same conditions; speed = √(vₓ² + vᵧ²). |

## Using the formulas in different situations

Choosing an equation: list s, u, v, a, t; mark the one not given and not wanted, and pick the equation without it. Choose a positive direction first and give every vector a sign. Take g = 9.81 m s⁻² unless told otherwise.

### Situation: acceleration with no time given

**Example — speeding up.** A car accelerates uniformly from 12 m s⁻¹ to 30 m s⁻¹ over 126 m.

- t is not given, so use v² = u² + 2as: a = (30² − 12²) ÷ (2 × 126) = 756 ÷ 252 = 3.0 m s⁻².
- Then t = (v − u) ÷ a = 18 ÷ 3.0 = 6.0 s.

### Situation: braking to rest

**Example — stopping distance.** A train at 25 m s⁻¹ decelerates at 0.50 m s⁻² (a = −0.50 m s⁻²).

- s = (v² − u²) ÷ 2a = (0 − 625) ÷ (−1.0) = 625 m.
- t = (0 − 25) ÷ (−0.50) = 50 s.
- Stopping distance ∝ u² at a fixed deceleration: at 50 m s⁻¹ it would be 2500 m.

### Situation: thrown vertically upwards

**Example — from the ground.** A ball is thrown up at 15 m s⁻¹. Take up as positive, so a = −9.81 m s⁻².

- At the top v = 0: height = u² ÷ 2g = 225 ÷ 19.62 = 11.5 m.
- Time to the top = u ÷ g = 15 ÷ 9.81 = 1.53 s. At the top the velocity is zero but the acceleration is still −9.81 m s⁻².
- With no air resistance it returns at −15 m s⁻¹ after 3.06 s.

**Example — from a cliff.** The same throw from the edge of a 20 m cliff. When it hits the base, s = −20 m.

- −20 = 15t − 4.905t², so 4.905t² − 15t − 20 = 0.
- t = [15 + √(15² + 4 × 4.905 × 20)] ÷ (2 × 4.905) = (15 + 24.8) ÷ 9.81 = 4.06 s (reject the negative root).
- v² = u² + 2as = 225 + 2(−9.81)(−20) = 617, so v = −24.8 m s⁻¹ (downwards).

### Situation: dropped from rest

**Example — a falling stone.** A stone falls 45 m from rest. h = ½gt² gives t = √(2h/g) = √(90 ÷ 9.81) = 3.03 s, and v = gt = 29.7 m s⁻¹.

### Situation: displacement and distance from a velocity–time graph

**Example — reversing.** An object moves at +4.0 m s⁻¹ for 3.0 s, then its velocity falls uniformly to −2.0 m s⁻¹ over the next 3.0 s.

- Acceleration in the second stage = (−2.0 − 4.0) ÷ 3.0 = −2.0 m s⁻², so v = 0 at t = 5.0 s.
- Areas: 0–3 s: 4.0 × 3.0 = 12 m; 3–5 s: ½ × 2.0 × 4.0 = 4.0 m; 5–6 s: ½ × 1.0 × (−2.0) = −1.0 m.
- Displacement = 12 + 4.0 − 1.0 = 15 m. Distance = 12 + 4.0 + 1.0 = 17 m.

### Situation: g from a free-fall experiment

**Example — graph gradient.** A graph of h against t² is a straight line through the origin with gradient 4.90 m s⁻². Since h = ½gt², gradient = g/2, so g = 9.80 m s⁻². A line that misses the origin suggests a systematic timing delay.

### Situation: horizontal launch

**Example — ball off a table.** A ball leaves a 1.25 m high table horizontally at 3.0 m s⁻¹.

- Vertical (from rest vertically): t = √(2 × 1.25 ÷ 9.81) = 0.505 s.
- Horizontal (constant velocity): range = 3.0 × 0.505 = 1.51 m.
- Landing velocity: vᵧ = 9.81 × 0.505 = 4.95 m s⁻¹ down; speed = √(3.0² + 4.95²) = 5.79 m s⁻¹ at tan⁻¹(4.95 ÷ 3.0) = 58.8° below the horizontal.

### Situation: angled launch over level ground

**Example — a kicked ball.** Launched at 20 m s⁻¹ at 30° above the horizontal.

- uₓ = 20 cos 30° = 17.3 m s⁻¹; uᵧ = 20 sin 30° = 10.0 m s⁻¹.
- Time of flight (y returns to 0): 0 = uᵧt − ½gt², so t = 2uᵧ ÷ g = 20 ÷ 9.81 = 2.04 s.
- Range = uₓt = 17.3 × 2.04 = 35.3 m. Maximum height = uᵧ² ÷ 2g = 100 ÷ 19.62 = 5.10 m.
- Landing at a different height: solve y = uᵧt − ½gt² for the actual landing value of y instead of using 2uᵧ/g.

## Exam checks

Use signed velocities, identify whether distance or displacement is requested, and check constant acceleration before using the motion equations. Projectile range and time-of-flight shortcuts are not separately stated in the syllabus; derive the needed result from components and the actual landing height.
