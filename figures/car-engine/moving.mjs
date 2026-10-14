// Parts that move with the crank, drawn at any cycle angle t. Used by the build for the
// first frame and inlined into the page to redraw each frame.
export function makeMoving(k, G, P, M, X) {
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const at = (p) => k.iso(p, P);
  const V = G.viewOf(P);
  const RAD = Math.PI / 180;
  const Y = [0, 1, 0];
  const alongY = (x, z) => G.frameOf([x, 0, z], Y, [1, 0, 0], [0, 0, 1]);
  const FY = alongY(0, 0);
  const circle = (cx, cz, r, n = 40) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), cz + r * Math.sin((i / n) * 2 * Math.PI)]);
  const onFace = (pts, y, closed = true) => k.pathOf(pts.map(([x, z]) => at([x, y, z])), closed);
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];

  // ---- crank -------------------------------------------------------------
  const pinOf = (t) => [M.r * Math.sin(t * RAD), M.r * Math.cos(t * RAD)];
  function webOf(t) {
    const [px, pz] = pinOf(t);
    const a = t * RAD;
    const counter = [];
    for (let d = -62; d <= 62; d += 4) counter.push([36 * Math.sin(a + Math.PI + d * RAD), 36 * Math.cos(a + Math.PI + d * RAD)]);
    return G.hullOf([...circle(px, pz, 12.5, 32), ...circle(0, 0, 15, 32), ...counter]);
  }
  function webFace(t, y) {
    const a = t * RAD;
    const holes = [-34, 34].map((d) => {
      const c = [29 * Math.sin(a + Math.PI + d * RAD), 29 * Math.cos(a + Math.PI + d * RAD)];
      return G.circleOf(alongY(c[0], c[1]), y, 3.2, P, 24);
    });
    return Ln(holes.join(""), { tone: "lo" });
  }
  function crankBack(t) {
    const [px, pz] = pinOf(t);
    return [
      S(G.disc(-28, -14, 9, FY, P), { tone: "mid" }),
      S(G.prismOf(FY, webOf(t), -14, -8, P), { tone: "hi", inner: webFace(t, -8) }),
      S(G.disc(-8, 5.5, 8.5, alongY(px, pz), P), { tone: "mid" }),
    ].join("");
  }
  function crankFront(t) {
    const [px, pz] = pinOf(t);
    const a = t * RAD;
    const nut = Array.from({ length: 6 }, (_, i) => [8 * Math.cos(i * Math.PI / 3 + a), 8 * Math.sin(i * Math.PI / 3 + a)]);
    return [
      S(G.disc(5.5, 8, 8.5, alongY(px, pz), P), { tone: "mid" }),
      S(G.prismOf(FY, webOf(t), 8, 14, P), { tone: "hi", inner: webFace(t, 14) }),
      S(G.disc(14, 19, 10, FY, P), { tone: "mid" }),
      S(G.prismOf(FY, nut, 19, 23, P), { tone: "mid" }),
      Ln(G.circleOf(FY, 23, 3.4, P, 24), { tone: "lo" }),
      k.dotsSvg([at([px + 4 * Math.sin(a + 1), 8, pz + 4 * Math.cos(a + 1)])], { size: 0.5, tone: "lo" }),
    ].join("");
  }

  // ---- connecting rod ----------------------------------------------------
  function rod(t) {
    const [px, pz] = pinOf(t);
    const top = [0, X.pinZ(t)];
    const dx = top[0] - px, dz = top[1] - pz;
    const len = Math.hypot(dx, dz);
    const ax = [dx / len, dz / len];
    const nx = [-ax[1], ax[0]];
    const p = (s, n) => [px + ax[0] * s + nx[0] * n, pz + ax[1] * s + nx[1] * n];
    const outline = G.hullOf([...circle(px, pz, 14, 40), ...circle(top[0], top[1], 9, 32)]);
    const web = [p(22, -4.4), p(len - 15, -3), p(len - 15, 3), p(22, 4.4)];
    const cap = [p(-1, -14.2), p(-1, 14.2)];
    const face = [
      onFace(web, 5),
      onFace(cap, 5, false),
      G.circleOf(alongY(top[0], top[1]), 5, 6.6, P, 28),
    ].join("");
    const bolts = [p(-1, -10.6), p(-1, 10.6)].map(([x, z]) => at([x, 5, z]));
    return S(G.prismOf(FY, outline, -5, 5, P), { tone: "hi", inner: Ln(face, { tone: "lo" }) }) + k.dotsSvg(bolts, { size: 0.55, tone: "mid" });
  }

  // ---- valve train -------------------------------------------------------
  const helix = (F, s0, s1, r, turns, steps = 160) => {
    const back = [], front = [];
    let run = null, side = null;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const angle = u * turns * 2 * Math.PI;
      const p = G.pointOf(F, s0 + (s1 - s0) * u, r, angle);
      const facing = G.dot3(G.radialOf(F, angle), V) >= 0;
      if (facing !== side) {
        if (run) (side ? front : back).push(run);
        run = run ? [run[run.length - 1]] : [];
        side = facing;
      }
      run.push(at(p));
    }
    if (run) (side ? front : back).push(run);
    return { back: back.map((r) => k.pathOf(r)).join(""), front: front.map((r) => k.pathOf(r)).join("") };
  };
  const frameOfValve = (v) => {
    const a = X.axisOf(v);
    return G.frameOf(X.faceOf(v), a, [a[2], 0, -a[0]], Y);
  };
  function spring(v, lift) {
    const F = frameOfValve(v);
    return helix(F, 18.8, 33.5 - lift, 5.4, 6.5);
  }
  function camLobe(v, t) {
    const a = X.axisOf(v);
    const c = add(X.faceOf(v), mul(a, M.axis));
    const down = Math.atan2(-a[0], -a[2]) / RAD;
    const pts = [];
    for (let phi = 0; phi < 360; phi += 3) {
      const r = M.base + X.liftOf(v, t + 2 * (down - phi));
      pts.push([c[0] + r * Math.sin(phi * RAD), c[2] + r * Math.cos(phi * RAD)]);
    }
    const mark = (phi) => [c[0] + 9 * Math.sin(phi * RAD), c[2] + 9 * Math.cos(phi * RAD)];
    const F = alongY(c[0], c[2]);
    const dot = mark(t / 2 + v.side * 90);
    return S(G.prismOf(F, pts.map(([x, z]) => [x - c[0], z - c[2]]), -5, 5, P), { tone: "hi", inner: Ln(G.circleOf(F, 5, 6.6, P, 28), { tone: "faint" }) })
      + k.dotsSvg([at([dot[0], 5, dot[1]])], { size: 0.6, tone: "hi" });
  }

  // ---- gas in the cylinder -----------------------------------------------
  function gasOf(t) {
    const crown = X.pinZ(t) + M.pinToCrown;
    const T = Math.tan(M.tilt * RAD);
    const roofAt = (x) => M.roof + (16.5 - Math.abs(x)) * T;
    const pts = [[-M.R, crown], [M.R, crown], [M.R, M.deck], [28, M.deck], [28, roofAt(28)], [0, roofAt(0)], [-28, roofAt(28)], [-28, M.deck], [-M.R, M.deck]];
    return onFace(pts, 0);
  }

  return { pinOf, crankBack, crankFront, rod, spring, camLobe, gasOf, frameOfValve, helix };
}
