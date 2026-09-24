// The small amount of physics a draggable surface needs to feel held rather
// than scripted. Pure functions, so they are tested without a DOM; the phone
// navigation drawer (components/NavDrawer.tsx) is the only user today.
//
// The house style is critically damped: things arrive without overshoot. The
// app's surfaces are used hundreds of times a day, and a bounce there reads as
// personality nobody asked for (see the Interaction block in globals.css).

/** Where a released surface would come to rest if left to decelerate, as an
 *  offset from where it was let go. Apple's exponential-decay projection (the
 *  one scroll views use), not the textbook v^2/2a: with 0.998 a 1000 px/s
 *  flick travels about 500 px. Velocity in px/s. */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Resistance past an edge: the further past it, the less the surface
 *  follows, so a boundary reads as "nothing more here" rather than frozen.
 *  Never reaches `dimension`, however far the pointer goes. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  if (dimension <= 0) return 0;
  const sign = Math.sign(overshoot);
  const distance = Math.abs(overshoot);
  return (sign * (distance * dimension * constant)) / (dimension + constant * distance);
}

/** Release velocity in px/s from recent pointer samples (oldest first). Uses
 *  only the last ~100 ms, so a drag that paused before letting go is treated
 *  as a slow release, not as the speed it had earlier. */
export function releaseVelocity(samples: Array<{ x: number; t: number }>, windowMs = 100) {
  if (samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  let first = samples[samples.length - 2];
  for (let i = samples.length - 2; i >= 0; i--) {
    if (last.t - samples[i].t > windowMs) break;
    first = samples[i];
  }
  const dt = last.t - first.t;
  return dt > 0 ? ((last.x - first.x) / dt) * 1000 : 0;
}

/** A critically damped spring at time `t` seconds after starting at `from`
 *  moving at `velocity` px/s toward `to`. `response` is Apple's parameter:
 *  roughly how long it takes to get there, in seconds -- not a duration,
 *  since a spring has none. Closed form, so a slow frame cannot make it
 *  unstable, and a spring re-aimed mid-flight carries its velocity with it. */
export function criticalSpring(from: number, to: number, velocity: number, response: number, t: number) {
  const omega = (2 * Math.PI) / response;
  const a = from - to;
  const b = velocity + omega * a;
  const decay = Math.exp(-omega * t);
  return {
    value: to + (a + b * t) * decay,
    velocity: (b - omega * (a + b * t)) * decay,
  };
}

/** True once a spring is close enough to rest to stop drawing frames. */
export function settled(value: number, velocity: number, to: number) {
  return Math.abs(value - to) < 0.5 && Math.abs(velocity) < 5;
}
