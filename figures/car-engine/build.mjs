import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../.claude/skills/anatomy/kit/lathe.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";
import * as X from "./model.mjs";
import { makeMoving } from "./moving.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, "..", "..", ".claude", "skills", "anatomy", "kit");
const theme = process.argv.includes("--light") ? "light" : "dark";
const { M } = X;
const RAD = Math.PI / 180;

const WIDTH = 600;
const HEIGHT = 600;

// ---- layout (world units of 1.5 mm; x across, y toward the viewer, z up) ----
const B = M.R;
const D = 44;                                   // the engine's back half: y from -D to the cut at y = 0
const T = Math.tan(M.tilt * RAD);
const roofAt = (x) => M.roof + (16.5 - Math.abs(x)) * T;
const LINER = 56;                               // bottom of the cylinder liner
const RAIL = -14;                               // pan rail
const SUMP = -61;
const HEAD_TOP = M.roof + 44 * Math.cos(M.tilt * RAD);
const COVER_TOP = 236;
const PLATE = { x: -128, y: -104, w: 256, d: 168, r: 8 };
const PLATE_Z = -83;
const PLATE_H = 10;
const FOOT_H = 5;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, PLATE_Z - PLATE_H - FOOT_H, PLATE_Z), [0, -12, 254], [-62, -44, COVER_TOP], [62, 0, COVER_TOP], [62, -44, COVER_TOP], [-116, 0, M.roof + 50], [104, 0, M.roof + 28]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 60, elevation: 30 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const V = G.viewOf(P);
const Lt = G.lightOf(P);
const Y = [0, 1, 0];
const FZ = (x, y, z = 0) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], Y);
const alongY = (x, z) => G.frameOf([x, 0, z], Y, [1, 0, 0], [0, 0, 1]);
const alongX = (y, z, x = 0) => G.frameOf([x, y, z], [1, 0, 0], Y, [0, 0, 1]);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const face = (pts, y = 0, closed = true) => k.pathOf(pts.map(([x, z]) => at([x, y, z])), closed);
const shadeOf = (n) => {
  const band = G.bandOf(G.dot3(G.unit3(n), Lt));
  return band === 4 ? `class="iso-top"` : `class="iso-shade" data-shade="${band}"`;
};
const quad = (pts, n) => `<path ${shadeOf(n)} d="${k.pathOf(pts.map(at), true)}"/>`;
const bezier = (a, c, b, n = 16) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n;
  return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
});
const MOVE = makeMoving(k, G, P, M, X);

// ---- the cut: openings in the section plane y = 0 -----------------------
// Each opening is a polygon in (x, z); a point with a third value `1` starts an edge that is open
// (it joins another opening), so no section edge is drawn along it.
const valveGeo = M.valves.map((v) => {
  const a = X.axisOf(v);
  const e = [Math.cos(M.tilt * RAD) * -v.side, Math.sin(M.tilt * RAD)]; // along the face, toward the centre and up
  const throat = v.head - 1;
  const inner = [v.x + e[0] * throat, M.roof + e[1] * throat];
  const outer = [v.x - e[0] * throat, M.roof - e[1] * throat];
  const s = v.side;
  const floor = bezier(outer, [s * 34, M.roof + 2], [s * 62, M.roof + 8]);
  const roof = bezier(inner, [s * 9, M.roof + 15], [s * 62, M.roof + 24]);
  const pocket = (side) => {
    const u = [a[2], -a[0]];
    const base = [v.x + a[0] * 17.6 + u[0] * side * 8.5, M.roof + a[2] * 17.6 + u[1] * side * 8.5];
    const top = (HEAD_TOP - base[1]) / a[2];
    return [base, [base[0] + a[0] * top, HEAD_TOP]];
  };
  const [l0, l1] = pocket(-1);
  const [r0, r1] = pocket(1);
  const cam = [v.x + a[0] * M.axis, M.roof + a[2] * M.axis];
  return { v, a, inner, outer, floor, roof, pocket: s < 0 ? [l0, r0, r1, l1] : [r0, l0, l1, r1], cam };
});
const [IN, EX] = valveGeo;

const plugR = 5.5;
const lower = [[-57, SUMP + 3], [57, SUMP + 3], [57, RAIL], [46, RAIL], [46, LINER], [B, LINER, 1], [-B, LINER], [-46, LINER], [-46, RAIL], [-57, RAIL]];
const cylinder = [
  [-B, LINER, 1], [B, LINER], [B, M.deck], [28, M.deck], [28, roofAt(28)], [EX.outer[0], EX.outer[1], 1], [EX.inner[0], EX.inner[1]],
  [plugR, roofAt(plugR), 1], [-plugR, roofAt(plugR)], [IN.inner[0], IN.inner[1], 1], [IN.outer[0], IN.outer[1]], [-28, roofAt(28)], [-28, M.deck], [-B, M.deck],
];
const exPort = [[EX.outer[0], EX.outer[1]], ...EX.floor.slice(1, -1), [62, EX.floor.at(-1)[1], 1], ...[...EX.roof].reverse().slice(0, -1), [EX.inner[0], EX.inner[1], 1]];
const inPort = [[-62, IN.floor.at(-1)[1]], ...[...IN.floor].reverse().slice(1, -1), [IN.outer[0], IN.outer[1], 1], ...IN.roof.slice(0, -1), [-62, IN.roof.at(-1)[1], 1]];
const plugTube = [[-plugR, roofAt(plugR), 1], [plugR, roofAt(plugR)], [plugR, HEAD_TOP, 1], [-plugR, HEAD_TOP]];
const pocketOf = (g) => {
  const [p0, p1, p2, p3] = g.pocket;
  return [[p0[0], p0[1]], [p1[0], p1[1]], [p2[0], p2[1], 1], [p3[0], p3[1]]];
};
const coverIn = [
  [-59, HEAD_TOP], [IN.pocket[3][0], HEAD_TOP, 1], [IN.pocket[2][0], HEAD_TOP], [-plugR, HEAD_TOP, 1], [plugR, HEAD_TOP], [EX.pocket[3][0], HEAD_TOP, 1], [EX.pocket[2][0], HEAD_TOP],
  [59, HEAD_TOP], [59, COVER_TOP - 3], [-59, COVER_TOP - 3],
];
const ZC = M.roof + 16;                         // runner centreline height
const IN_END = -114;
const EX_END = 102;
const inRunner = [[IN_END, ZC - 8], [-62, ZC - 8, 1], [-62, ZC + 8], [IN_END, ZC + 8, 1]];
const exRunner = [[62, ZC - 8], [EX_END, ZC - 8, 1], [EX_END, ZC + 8], [62, ZC + 8, 1]];
const gallery = (s) => Array.from({ length: 24 }, (_, i) => [s * 51 + 3.2 * Math.cos((i / 24) * 2 * Math.PI), 30 + 3.2 * Math.sin((i / 24) * 2 * Math.PI)]);
const jackets = [-1, 1].map((s) => (s < 0 ? [[-42, 64], [-34, 64], [-34, 141], [-42, 141]] : [[34, 64], [42, 64], [42, 141], [34, 141]]));
const OPENINGS = [lower, cylinder, exPort, inPort, inRunner, exRunner, plugTube, pocketOf(IN), pocketOf(EX), coverIn, ...jackets, gallery(-1), gallery(1)];

const ccw = (poly) => {
  let area = 0;
  poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; area += p[0] * q[1] - q[0] * p[1]; });
  return area > 0;
};
function edgesOf(poly) {
  const runs = [];
  let run = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % n];
    if (p[2]) {
      if (run.length) runs.push(run);
      run = [];
      continue;
    }
    if (!run.length) run.push(p);
    run.push(q);
  }
  if (run.length) runs.push(run);
  return runs.map((r) => face(r, 0, false)).join("");
}
// A recess behind an opening: its back face at y = -depth, and the walls that face the viewer.
function recess(poly, depth, { backClass = "" } = {}) {
  const sign = ccw(poly) ? 1 : -1;
  const out = [`<path class="iso-shade eng-back ${backClass}" data-shade="${G.bandOf(G.dot3(Y, Lt))}" d="${face(poly, -depth)}"/>`];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const n = [-(q[1] - p[1]) * sign, 0, (q[0] - p[0]) * sign];
    if (G.dot3(n, V) <= 1e-6) return;
    out.push(quad([[p[0], 0, p[1]], [q[0], 0, q[1]], [q[0], -depth, q[1]], [p[0], -depth, p[1]]], n));
  });
  return out.join("");
}
// The inside of the back half of a round bore, seen through the cut. `top(angle)` may end each facet.
function halfBore(F, s0, s1, r, { steps = 48, top = null, floor = false } = {}) {
  const buckets = new Map();
  const put = (n, d) => {
    const key = shadeOf(n);
    buckets.set(key, (buckets.get(key) || "") + d);
  };
  if (floor) {
    const rim = [];
    for (let i = 0; i <= steps; i++) rim.push(G.pointOf(F, s0, r, Math.PI + (i / steps) * Math.PI));
    put(F.a, k.pathOf(rim.map(at), true));
  }
  for (let i = 0; i < steps; i++) {
    const a0 = Math.PI + (i / steps) * Math.PI;
    const a1 = Math.PI + ((i + 1) / steps) * Math.PI;
    const n = G.mul3(G.radialOf(F, (a0 + a1) / 2), -1);
    if (G.dot3(n, V) <= 1e-6) continue;
    const e0 = top ? top(a0) : s1;
    const e1 = top ? top(a1) : s1;
    put(n, k.pathOf([G.pointOf(F, s0, r, a0), G.pointOf(F, s0, r, a1), G.pointOf(F, e1, r, a1), G.pointOf(F, e0, r, a0)].map(at), true));
  }
  return [...buckets].map(([cls, d]) => `<path ${cls} d="${d}"/>`).join("");
}

// ---- stand ---------------------------------------------------------------
function stand() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, PLATE_Z - PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 8, PLATE_Z - PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6.2, PLATE_Z - PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, PLATE_Z - PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(Ln(k.planOutline(k.insetPlan(PLATE, 5), PLATE_Z, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(Ln(screws.map(([x, y]) => k.ring(x, y, 2.4, PLATE_Z, P, 16)).join(""), { tone: "lo" }));
  out.push(Dots(screws.map(([x, y]) => at([x, y, PLATE_Z])), { size: 0.5 }));
  const strip = { x: -104, y: PLATE.y + PLATE.d - 17, w: 160, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, PLATE_Z, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, PLATE_Z + 0.6, [2, 3.6], P);
  out.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));
  out.push(Dots([at([strip.x + 2, strip.y + 3.5, PLATE_Z + 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, PLATE_Z + 0.6])], { size: 0.45 }));
  const label = { x: 68, y: PLATE.y + PLATE.d - 30, w: 44, d: 20, r: 1.5 };
  out.push(S(k.slabOf(label, PLATE_Z, 0.8, P, 4), { tone: "mid" }));
  out.push(Ln(k.planOutline(k.insetPlan(label, 1.6), PLATE_Z + 0.8, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 5, label.y + 7.5], PLATE_Z + 0.8, P, "x"), "86 × 86", { size: 4.2, tone: "mid" }));
  [[label.x + 5, 34], [label.x + 5, 26]].forEach(([x, w], i) => out.push(Ln(k.lineOnTop([x, label.y + 12 + i * 3.4], [x + w, label.y + 12 + i * 3.4], PLATE_Z + 0.8, P), { tone: "lo", free: true })));
  out.push(Dots([at([label.x + label.w - 3, label.y + 3, PLATE_Z + 0.8]), at([label.x + label.w - 3, label.y + label.d - 3, PLATE_Z + 0.8])], { size: 0.45 }));
  return out.join("");
}

function mount(side) {
  const out = [];
  const x0 = side > 0 ? 66 : -86;
  const ped = { x: x0, y: -38, w: 20, d: 30, r: 2 };
  out.push(S(k.slabOf(k.insetPlan(ped, -3), PLATE_Z, 3, P, 4, 0.5), { tone: "mid" }));
  const flange = k.insetPlan(ped, -3);
  out.push(Dots(k.corners(flange, 2.4).map(([x, y]) => at([x, y, PLATE_Z + 3])), { size: 0.5, tone: "mid" }));
  out.push(S(k.slabOf(ped, PLATE_Z + 3, -24 - PLATE_Z - 3, P, 4, 0.6), { tone: "mid" }));
  out.push(Ln(k.planOutline(k.insetPlan(ped, 3), -24, P, 3), { tone: "faint" }));
  out.push(S(k.slabOf(k.insetPlan(ped, 2), -24, 6, P, 4), { tone: "lo" }));
  const arm = { x: side > 0 ? 60 : -86, y: -36, w: 26, d: 26, r: 2 };
  out.push(S(k.slabOf(arm, -18, 9, P, 4, 0.5), { tone: "mid" }));
  const bolt = [x0 + 10, -23];
  out.push(S(k.cylinder(bolt[0], bolt[1], 3.6, -9, 2.6, P, 6), { tone: "mid" }));
  out.push(Dots([at([bolt[0], bolt[1], -6.4])], { size: 0.5, tone: "mid" }));
  out.push(Dots([at([x0 + 4, -31, -9]), at([x0 + 4, -15, -9])], { size: 0.45, tone: "lo" }));
  return out.join("");
}

// ---- the engine's back half ------------------------------------------------
const body = (plan, z, h, bevel = 0.8, extra = "") => S(k.slabOf(plan, z, h, P, 4, bevel), { tone: "mid", inner: extra });
const half = (x0, x1) => ({ x: x0, y: -D, w: x1 - x0, d: D, r: 1.5 });

function runner(side) {
  const out = [];
  const x0 = side < 0 ? IN_END : 62;
  const x1 = side < 0 ? -62 : EX_END;
  const plan = { x: x0, y: -16, w: x1 - x0, d: 16, r: 1 };
  out.push(S(k.slabOf(plan, ZC - 12, 24, P, 3, 0.6), { tone: "mid", inner: Ln(k.sideSeam(plan, ZC, P, 3), { tone: "faint" }) }));
  // flange against the head, with studs and nuts above and below the runner
  const fx = side < 0 ? -66 : 62;
  const flange = { x: fx, y: -20, w: 4, d: 20, r: 0.8 };
  out.push(S(k.slabOf(flange, ZC - 20, 40, P, 2, 0.4), { tone: "mid" }));
  for (const dz of [-16, 16]) {
    if (side > 0) {
      const F = alongX(-10, ZC + dz, 66);
      out.push(S(G.disc(0, 5, 1.5, F, P), { tone: "mid" }));
      out.push(S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [2.7 * Math.cos(i * Math.PI / 3 + 0.5), 2.7 * Math.sin(i * Math.PI / 3 + 0.5)]), 0, 2.6, P), { tone: "mid" }));
    } else {
      out.push(Dots([at([-64, -10, ZC + dz])], { size: 0.5, tone: "mid" }));
    }
  }
  // end flange
  const ex = side < 0 ? IN_END : EX_END - 3;
  const end = { x: ex, y: -18, w: 3, d: 18, r: 0.8 };
  out.push(S(k.slabOf(end, ZC - 14, 28, P, 2, 0.4), { tone: "mid" }));
  if (side > 0) {
    const mouth = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI;
      mouth.push(at([EX_END, -8 * Math.sin(a), ZC + 8 * Math.cos(a)]));
    }
    out.push(`<g class="eng-cav"><path class="iso-shade" data-shade="0" d="${k.pathOf(mouth, true)}"/></g>`);
    out.push(Ln(k.pathOf(mouth), { tone: "lo" }));
    out.push(Dots([at([EX_END, -14, ZC + 11]), at([EX_END, -14, ZC - 11])], { size: 0.5, tone: "mid" }));
  }
  return out.join("");
}

function castings() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(half(-60, 60), SUMP, 4, P)}" style="filter:blur(6px)"/>`);
  out.push(body(half(-60, 60), SUMP, RAIL - SUMP, 1.2, Ln(k.sideSeam(half(-60, 60), RAIL - 4, P, 4), { tone: "faint" })));
  out.push(body(half(-60, 60), RAIL, M.deck - RAIL, 1.2));
  out.push(runner(-1));
  out.push(body(half(-62, 62), M.deck, HEAD_TOP - M.deck, 1.2));
  out.push(runner(1));
  out.push(body(half(-62, 62), HEAD_TOP, COVER_TOP - HEAD_TOP, 1.4));
  // pan bolts along the rail, drain plug, cover bolts
  out.push(Dots([-46, -26, -6, 14, 34].map((y) => at([60, y * 0.8 - 6, RAIL - 2])), { size: 0.5, tone: "mid" }));
  const drain = alongX(-20, SUMP + 9, 60);
  out.push(S(G.disc(0, 2.2, 4.2, drain, P), { tone: "mid" }));
  out.push(S(G.prismOf(drain, Array.from({ length: 6 }, (_, i) => [3.1 * Math.cos(i * Math.PI / 3), 3.1 * Math.sin(i * Math.PI / 3)]), 2.2, 5, P), { tone: "mid" }));
  out.push(Dots([-8, -22, -36].flatMap((y) => [at([-52, y, COVER_TOP]), at([52, y, COVER_TOP])]), { size: 0.55, tone: "mid" }));
  // oil filler cap on the cam cover
  out.push(S(k.cylinder(-38, -24, 7, COVER_TOP, 4.5, P, 32), { tone: "mid" }));
  out.push(Ln(k.knurl(-38, -24, 7, COVER_TOP, COVER_TOP + 4.5, 36, P), { tone: "lo" }));
  out.push(Ln(k.ring(-38, -24, 4, COVER_TOP + 4.5, P, 24), { tone: "faint" }));
  return out.join("");
}

// ---- seen through the cut --------------------------------------------------
const PIN0 = X.pinZ(0);
const RP = 28.4;
function piston() {
  const z0 = PIN0 - 16;
  const crown = PIN0 + M.pinToCrown;
  const ring = [];
  for (let i = 0; i <= 48; i++) ring.push([RP * Math.cos(Math.PI + (i / 48) * Math.PI), RP * Math.sin(Math.PI + (i / 48) * Math.PI)]);
  const out = [S(k.extrude(ring, z0, crown - z0, P), { tone: "hi" })];
  // inside the skirt: the back of the bore, the pin boss and the pin, cut at y = 0
  const hollow = [[-25.4, z0], [25.4, z0], [25.4, crown - 5.5], [-25.4, crown - 5.5]];
  out.push(`<clipPath id="eng-skirt"><path d="${face(hollow)}"/></clipPath>`);
  out.push(`<g clip-path="url(#eng-skirt)" class="eng-cav">${halfBore(FZ(0, 0), z0 - 1, crown - 5.5, 25.4, { steps: 32 })}`);
  out.push(S(G.disc(-25, -16, 10, alongY(0, PIN0), P), { tone: "mid" }));
  out.push(`</g>`);
  out.push(Ln(face(hollow, 0), { tone: "lo" }));
  out.push(S(G.disc(-22, 0, 6, alongY(0, PIN0), P), { tone: "mid" }));
  // ring grooves with their rings, on both cut edges and round the visible flank
  const grooves = [3, 6.5, 10];
  for (const s of [-1, 1]) {
    grooves.forEach((g, i) => {
      const z = crown - g;
      const x0 = s * RP;
      const x1 = s * (RP - 2.2);
      out.push(`<path class="eng-groove" d="${face([[x0, z - 0.7], [x1, z - 0.7], [x1, z + 0.7], [x0, z + 0.7]])}"/>`);
      out.push(`<path class="iso-line" data-tone="${i === 2 ? "lo" : "mid"}" d="${face([[x0, z - 0.45], [x1 + s * 0.3, z - 0.45], [x1 + s * 0.3, z + 0.45], [x0, z + 0.45]])}"/>`);
    });
  }
  const flank = (z) => {
    const pts = [];
    for (let a = -30; a <= 0; a += 3) pts.push(at([RP * Math.cos(a * RAD), RP * Math.sin(a * RAD), z]));
    return k.pathOf(pts);
  };
  out.push(Ln(grooves.map((g) => flank(crown - g)).join(""), { tone: "lo" }));
  // valve reliefs on the crown
  const reliefs = M.valves.map((v) => {
    const pts = [];
    const rr = Math.min(v.head + 1, RP - 1 - Math.abs(v.x));
    for (let a = 180; a <= 360; a += 6) pts.push([v.x + rr * Math.cos(a * RAD), rr * Math.sin(a * RAD)]);
    return k.onTop(pts, crown, P);
  });
  out.push(Ln(reliefs.join(""), { tone: "faint" }));
  return out.join("");
}

function inside() {
  const out = [];
  out.push(`<g class="eng-cav">`);
  out.push(recess(lower, 40));
  out.push(`</g>`);
  out.push(S(G.disc(-40, -30, 17, alongY(0, 0), P), { tone: "mid", inner: Ln(G.circleOf(alongY(0, 0), -30, 12, P, 40), { tone: "faint" }) }));
  out.push(Dots([[-12, -12], [12, -12], [-12, 12], [12, 12]].map(([x, z]) => at([x, -30, z])).slice(0, 4), { size: 0.5, tone: "mid" }));
  out.push(`<g class="eng-oil">${S(k.slabOf({ x: -57, y: -40, w: 114, d: 40, r: 0.5 }, SUMP + 3, 14, P, 2), { tone: "lo", crease: "none" })}</g>`);
  // oil pickup: a strainer in the oil and a tube up to the pump on the back wall
  out.push(S(k.cylinder(-20, -20, 8, SUMP + 7, 3, P, 32), { tone: "mid" }));
  out.push(`<g class="eng-cav">${jackets.map((j) => recess(j, 6, { backClass: "eng-coolant" })).join("")}</g>`);
  out.push(`<g class="eng-cav">${halfBore(FZ(0, 0), LINER, roofAt(0), B, { steps: 64, top: () => M.deck })}</g>`);
  out.push(`<g class="eng-cav">${halfBore(FZ(0, 0), M.deck, roofAt(0), 28, { steps: 64, top: (a) => roofAt(28 * Math.cos(a)) })}</g>`);
  out.push(`<g data-part="piston">${piston()}</g>`);
  out.push(`<path data-gas class="eng-gas" d="${MOVE.gasOf(0)}"/>`);
  out.push(`<circle data-burn class="eng-burn" cx="${at([0, 0, roofAt(0)])[0]}" cy="${at([0, 0, roofAt(0)])[1]}" r="0" clip-path="url(#eng-gas-clip)"/>`);
  out.push(`<g class="eng-cav">${recess(exPort, 8)}${recess(inPort, 8)}${recess(inRunner, 8)}${recess(exRunner, 8)}${recess(gallery(-1), 30)}${recess(gallery(1), 30)}</g>`);
  {
    const a = G.mul3(INJ.up, -1);
    const side = G.unit3([0.82, 0, 0.57]);
    const tip = INJ.tip;
    const far = (w) => G.add3(G.add3(tip, G.mul3(a, 30)), G.mul3(side, w));
    out.push(`<path data-spray class="eng-fuel" style="opacity:0" d="${k.pathOf([at(tip), at(far(-6)), at(far(6))], true)}"/>`);
  }
  // throttle plate on its spindle, part open
  const th = 28 * RAD;
  const tx = -100;
  out.push(S(G.disc(-8, 0, 1.6, alongY(tx, ZC), P), { tone: "mid" }));
  out.push(S(G.prismOf(alongY(tx, ZC), [[-7.6 * Math.cos(th) - 0.5 * Math.sin(th), -7.6 * Math.sin(th) + 0.5 * Math.cos(th)], [7.6 * Math.cos(th) - 0.5 * Math.sin(th), 7.6 * Math.sin(th) + 0.5 * Math.cos(th)], [7.6 * Math.cos(th) + 0.5 * Math.sin(th), 7.6 * Math.sin(th) - 0.5 * Math.cos(th)], [-7.6 * Math.cos(th) + 0.5 * Math.sin(th), -7.6 * Math.sin(th) - 0.5 * Math.cos(th)]], -8, 0, P), { tone: "hi" }));
  for (const g of valveGeo) {
    const s = g.v.side;
    const far = s < 0 ? IN_END + 2 : EX_END - 2;
    const line = [[far, ZC], ...bezier([s * 62, ZC], [s * 24, M.roof + 11], [g.v.x, M.roof + 4], 24)];
    out.push(`<path data-flow-line="${g.v.name}" class="iso-line eng-flow" data-tone="${s < 0 ? "mid" : "lo"}" d="${face(line, -4, false)}" style="opacity:0"/>`);
  }
  out.push(`<g class="eng-cav">${halfBore(FZ(0, 0), roofAt(plugR), HEAD_TOP, plugR, { steps: 24 })}</g>`);
  out.push(`<g class="eng-cav">${recess(coverIn, 41)}</g>`);
  for (const g of valveGeo) {
    const F = MOVE.frameOfValve(g.v);
    const top = (angle) => (HEAD_TOP - G.pointOf(F, 0, 8.5, angle)[2]) / g.a[2];
    out.push(`<g class="eng-cav">${halfBore(F, 17.6, 40, 8.5, { steps: 32, top, floor: true })}</g>`);
  }
  // head bolts on the head deck, inside the cover
  for (const [x, y] of [[-50, -34], [-50, -14], [50, -34], [50, -14]]) {
    out.push(S(k.cylinder(x, y, 5.2, HEAD_TOP, 0.8, P, 24), { tone: "lo" }));
    out.push(S(G.prismOf(FZ(x, y), Array.from({ length: 6 }, (_, i) => [4 * Math.cos(i * Math.PI / 3), 4 * Math.sin(i * Math.PI / 3)]), HEAD_TOP + 0.8, HEAD_TOP + 4.6, P), { tone: "mid" }));
  }
  // cam bearing towers on the back wall of the cover
  for (const g of valveGeo) {
    const tower = { x: g.cam[0] - 11, y: -41, w: 22, d: 11, r: 1 };
    out.push(S(k.slabOf(tower, HEAD_TOP, g.cam[1] + 11 - HEAD_TOP, P, 3, 0.5), { tone: "mid", inner: Ln(k.sideSeam(tower, g.cam[1], P, 3), { tone: "faint" }) }));
    out.push(Dots([at([g.cam[0] - 7, -35.5, g.cam[1] + 11]), at([g.cam[0] + 7, -35.5, g.cam[1] + 11])], { size: 0.5, tone: "mid" }));
  }
  return out.join("");
}

// ---- moving parts in front of the cut ------------------------------------
function valvetrain(g, t) {
  const v = g.v;
  const F = MOVE.frameOfValve(v);
  const lift = X.liftOf(v, t);
  const drop = G.mul3(g.a, -lift);
  const profile = [[0, v.head], [1.4, v.head], [2.6, v.head - 1.6, 1], [4.6, 5, 1], [7, 3.2, 1], [9.5, 2.3], [39.5, 2.3]];
  const sp = MOVE.spring(v, lift);
  const cam = alongY(g.cam[0], g.cam[1]);
  return [
    S(G.disc(17.6, 18.8, 6.6, F, P), { tone: "lo" }),
    `<path data-spring-back="${v.name}" class="iso-line eng-spring" data-tone="lo" d="${sp.back}"/>`,
    `<g data-valve="${v.name}" transform="${k.translateAlong(P, drop)}">`,
    S(G.solidOf(profile, F, P), { tone: "hi", inner: Ln(G.arcOf(F, 37, 2.3, P), { tone: "lo" }) }),
    `</g>`,
    `<path data-spring-front="${v.name}" class="iso-line eng-spring" data-tone="mid" d="${sp.front}"/>`,
    `<g data-valve="${v.name}" transform="${k.translateAlong(P, drop)}">`,
    S(G.disc(33.5, 35, 6.6, F, P), { tone: "mid" }),
    S(G.disc(39.5, 49, 7.5, F, P), { tone: "mid", inner: Ln(G.arcOf(F, 47.6, 7.5, P), { tone: "faint" }) }),
    `</g>`,
    S(G.disc(-30, -5, 7, cam, P), { tone: "mid" }),
    `<g data-cam="${v.name}">${MOVE.camLobe(v, t)}</g>`,
    S(G.disc(5, 9, 7, cam, P), { tone: "mid", inner: Ln(G.circleOf(cam, 9, 3, P, 20), { tone: "faint" }) }),
  ].join("");
}

// Port fuel injector in the intake runner, fed from a rail above it.
const INJ = { tip: [-82, 0, ZC + 8], up: G.unit3([-0.57, 0, 0.82]) };
function injector() {
  const F = G.frameOf(INJ.tip, INJ.up, G.unit3([0.82, 0, 0.57]), Y);
  const out = [];
  out.push(S(G.solidOf([[0, 1.8], [3, 1.8], [3, 3.4], [8, 3.4], [8, 4.4], [17, 4.4], [17, 5.2], [24, 5.2], [24, 3], [28, 3]], F, P), { tone: "hi", inner: Ln([G.arcOf(F, 5.5, 3.4, P), G.arcOf(F, 20.5, 5.2, P)].join(""), { tone: "lo" }) }));
  const top = G.pointOf(F, 28, 0, 0);
  const rail = alongY(top[0] - 2, top[2] + 5);
  for (const y of [-12.5, -3.5]) {
    const foot = { x: top[0] - 6, y: y - 2.5, w: 8, d: 5, r: 1 };
    out.push(S(k.slabOf(foot, ZC + 12, top[2] + 5 - ZC - 12, P, 2, 0.3), { tone: "mid" }));
    out.push(Dots([at([top[0] - 2, y, ZC + 12])], { size: 0.45, tone: "lo" }));
  }
  out.push(S(G.disc(-40, 8, 5.6, rail, P), { tone: "mid", inner: Ln(G.arcOf(rail, -6, 5.6, P), { tone: "faint" }) }));
  out.push(Ln(G.circleOf(rail, 8, 2.4, P, 20), { tone: "lo" }));
  const plug = alongX(-4, G.pointOf(F, 21, 0, 0)[2], G.pointOf(F, 21, 0, 0)[0] - 13);
  out.push(S(G.prismOf(plug, [[-3, -3.2], [3, -3.2], [3, 3.2], [-3, 3.2]], 0, 8, P), { tone: "mid" }));
  return out.join("");
}

function plug() {
  const F = FZ(0, 0);
  const tip = roofAt(0);
  const out = [];
  out.push(S(G.disc(tip - 1.6, tip, 1, F, P), { tone: "hi" }));
  out.push(S(G.solidOf([[tip, 3.8], [tip + 12, 3.8]], F, P), { tone: "mid", inner: Ln([3, 6, 9].map((s) => G.arcOf(F, tip + s, 3.8, P)).join(""), { tone: "lo" }) }));
  out.push(S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [5 * Math.cos(i * Math.PI / 3 + 0.3), 5 * Math.sin(i * Math.PI / 3 + 0.3)]), tip + 12, tip + 19, P), { tone: "mid" }));
  out.push(S(G.solidOf([[tip + 19, 3.4], [tip + 32, 3.4, 1], [tip + 34, 2.6, 1]], F, P), { tone: "hi", inner: Ln([23, 26, 29].map((s) => G.arcOf(F, tip + s, 3.4, P)).join(""), { tone: "faint" }) }));
  out.push(S(G.solidOf([[tip + 31, 5], [COVER_TOP + 1, 5]], F, P), { tone: "lo", inner: Ln(G.arcOf(F, tip + 40, 5, P), { tone: "faint" }) }));
  const coil = { x: -10, y: -14, w: 20, d: 24, r: 2 };
  out.push(S(k.slabOf(coil, COVER_TOP, 16, P, 4, 0.6), { tone: "mid", inner: Ln(k.sideSeam(coil, COVER_TOP + 5, P, 4), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: 10, y: -6, w: 7, d: 10, r: 1 }, COVER_TOP + 6, 7, P, 3, 0.4), { tone: "mid" }));
  out.push(Dots([at([-6, -10, COVER_TOP + 16]), at([6, 6, COVER_TOP + 16])], { size: 0.5, tone: "mid" }));
  return out.join("");
}

// ---- assemble --------------------------------------------------------------
const t0 = 0;
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A single cylinder of a car engine, cut in half on a test stand. A piston slides in the bore, joined by a connecting rod to a crankshaft below; above it, two cams open an intake and an exhaust valve and a spark plug sits between them. Turning the crank runs the four strokes: intake, compression, power and exhaust.",
  body: [
    `<defs><radialGradient id="eng-burn-grad"><stop offset="0" class="eng-burn-core"/><stop offset=".55" class="eng-burn-mid"/><stop offset="1" class="eng-burn-edge"/></radialGradient><linearGradient id="eng-fuel-grad" gradientUnits="userSpaceOnUse" x1="${at(INJ.tip)[0]}" y1="${at(INJ.tip)[1]}" x2="${at(G.add3(INJ.tip, G.mul3(INJ.up, -30)))[0]}" y2="${at(G.add3(INJ.tip, G.mul3(INJ.up, -30)))[1]}"><stop offset="0" class="eng-fuel-0"/><stop offset="1" class="eng-fuel-1"/></linearGradient>`,
    `<clipPath id="eng-gas-clip"><path data-gas d="${MOVE.gasOf(t0)}"/></clipPath>`,
    `<clipPath id="eng-cut">${OPENINGS.map((o) => `<path d="${face(o)}"/>`).join("")}</clipPath></defs>`,
    stand(),
    mount(-1),
    castings(),
    mount(1),
    `<g clip-path="url(#eng-cut)">${inside()}</g>`,
    Ln(OPENINGS.map(edgesOf).join(""), { tone: "mid" }),
    `<g data-part="crank-back">${MOVE.crankBack(t0)}</g>`,
    `<g data-part="rod">${MOVE.rod(t0)}</g>`,
    `<g data-part="crank-front">${MOVE.crankFront(t0)}</g>`,
    ...valveGeo.map((g) => valvetrain(g, t0)),
    injector(),
    plug(),
    `<path data-spark class="iso-line" data-tone="lit" style="opacity:0;stroke-width:1.2" d="${k.pathOf([at([0, 0, roofAt(0) - 1.6]), at([1.2, 0, roofAt(0) - 2.4]), at([-0.6, 0, roofAt(0) - 3.2]), at([0.8, 0, roofAt(0) - 4.2])])}"/>`,
  ],
});

// ---- page ----------------------------------------------------------------
const stripExports = (text) => text.replace(/^import .*$/gm, "").replace(/^export /gm, "");
const latheScript = `const G = (() => {${stripExports(readFileSync(join(KIT, "lathe.mjs"), "utf8"))}\nreturn { viewOf, lightOf, scaleOf, frameAlong, frameOf, pointOf, radialOf, disc, prismOf, circleOf, arcOf, hullOf, dot3, add3, sub3, mul3, unit3, cross3, len3, bandOf };})();\n`;
const modelScript = `const X = (() => {${stripExports(readFileSync(join(HERE, "model.mjs"), "utf8"))}\nreturn { M, MM, wrap, pinZ, liftOf, burnOf, strokeOf, fromTDC, axisOf, faceOf };})();\n`;
const movingScript = stripExports(readFileSync(join(HERE, "moving.mjs"), "utf8"));
const DATA = {
  P,
  inject: [600, 700],
  pin0: PIN0,
  tip: at([0, 0, roofAt(0)]),
  valves: valveGeo.map((g) => ({ name: g.v.name, a: g.a })),
  scale: G.scaleOf(P),
};
const LIVE = readFileSync(join(HERE, "live.js"), "utf8").replace("__DATA__", JSON.stringify(DATA));
const CSS = readFileSync(join(HERE, "engine.css"), "utf8");

const html = k.plateHtml({
  fig: "Fig 1",
  title: "Four-stroke cylinder, cut open",
  hint: "Hover to turn the crank · ← → by stroke",
  readout: "intake · 0° · piston 0.0 mm",
  keys: [
    { mark: "lit", label: "Spark and burning charge: the power stroke" },
    { mark: "raised", label: "Piston, rod and crank turn the push into rotation" },
    { mark: "edge", label: "Cams turn at half crank speed and open each valve once per cycle" },
  ],
  caption:
    "One cylinder of an 86 × 86 mm, 500 cc, 10 : 1 four-stroke petrol engine, cut through the bore. Two crank turns make one cycle: the intake valve opens 10° before top dead centre and shuts 40° after bottom; the charge is squeezed to a tenth and fired 10° before top; the burning gas drives the piston down; the exhaust valve opens 40° before bottom and shuts 10° after top.",
  body: `<div class="iso-stage eng" tabindex="0" role="slider" aria-label="Engine cycle: arrow keys step one stroke, Home returns to the start of intake" aria-valuemin="0" aria-valuemax="720" aria-valuenow="0" aria-valuetext="intake stroke, crank at 0 degrees">${svg}</div>`,
});
const file = theme === "light" ? "car-engine-light.html" : "car-engine.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Car engine", theme, body: `<style>${CSS}</style>` + html, script: kitScript() + latheScript + modelScript + movingScript + LIVE }));
writeFileSync(join(HERE, theme === "light" ? "car-engine-light.svg" : "car-engine.svg"), k.figureSvg({ width: WIDTH, height: HEIGHT, label: "Car engine cylinder, cut open", body: [`<style>${CSS}</style>`, svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")], standalone: theme }));
console.log("wrote", file);
