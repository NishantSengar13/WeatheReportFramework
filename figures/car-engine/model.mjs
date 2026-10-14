// The engine's truth: one cylinder of an 86 × 86 mm, 10 : 1 four-stroke.
// World units are 1.5 mm. Cycle angle θ runs 0–720°, 0 = TDC at the start of intake.
export const MM = 1.5;
export const M = {
  bore: 86, stroke: 86, rod: 143.5, cr: 10,
  R: 86 / 2 / MM,            // bore radius, units
  r: 86 / 2 / MM,            // crank throw, units
  L: 143.5 / MM,             // rod centres, units
  pinToCrown: 20,            // compression height, units
  deck: 146,                 // block deck (head gasket), units: crown at TDC + 1.7
  roof: 150.4,               // valve face centres: a pent roof at ±16°, ~41 cc chamber
  tilt: 16,                  // valve angle from the bore axis, degrees
  lift: 10 / MM,             // peak valve lift, units
  base: 12,                  // cam base-circle radius, units
  axis: 61.5,                // valve face centre to cam centre, along the valve axis
  valves: [
    { name: "intake", x: -16.5, side: -1, head: 10.5, open: 710, close: 940 },   // IVO 10° BTDC, IVC 40° ABDC
    { name: "exhaust", x: 16.5, side: 1, head: 9.5, open: 500, close: 730 },    // EVO 40° BBDC, EVC 10° ATDC
  ],
  spark: 350,                // 10° BTDC
  strokes: ["intake", "compression", "power", "exhaust"],
};

export const wrap = (t) => ((t % 720) + 720) % 720;

export function pinZ(t) {
  const a = (t * Math.PI) / 180;
  return M.r * Math.cos(a) + Math.sqrt(M.L * M.L - (M.r * Math.sin(a)) ** 2);
}

export function liftOf(valve, t) {
  const span = valve.close - valve.open;
  let u = (wrap(t) - valve.open) / span;
  if (u < 0) u += 720 / span;
  if (u > 1) u -= 720 / span;
  if (u < 0 || u > 1) return 0;
  return M.lift * Math.sin(Math.PI * u) ** 2;
}

// Combustion: the flame front starts at the spark and burns out by 60° ATDC.
export function burnOf(t) {
  const d = wrap(t) - M.spark;
  if (d < 0 || d > 140) return { grow: 0, glow: 0 };
  const grow = Math.min(1, d / 50);
  const glow = d < 12 ? (d / 12) ** 2 : Math.exp(-(d - 12) / 38);
  return { grow, glow };
}

export function strokeOf(t) {
  return M.strokes[Math.floor(wrap(t) / 180)];
}

// Piston travel from TDC, mm.
export const fromTDC = (t) => (pinZ(0) - pinZ(t)) * MM;
export const sweptCc = () => (Math.PI / 4) * M.bore ** 2 * M.stroke / 1000;

// A valve's axis: unit vector up its stem (tilted away from the bore axis).
export function axisOf(valve) {
  const b = (M.tilt * Math.PI) / 180;
  return [valve.side * Math.sin(b), 0, Math.cos(b)];
}
export const faceOf = (valve) => [valve.x, 0, M.roof];
