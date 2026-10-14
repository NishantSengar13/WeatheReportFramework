const D = __DATA__;
const P = D.P;
const KIT = { iso, pathOf, solidSvg, lineSvg, dotsSvg, translateAlong };
const MOVE = makeMoving(KIT, G, P, X.M, X);
const stage = document.querySelector(".eng");
const svg = stage.querySelector("svg");
const q = (s) => svg.querySelector(s);
const parts = { back: q('[data-part="crank-back"]'), rod: q('[data-part="rod"]'), front: q('[data-part="crank-front"]'), piston: q('[data-part="piston"]') };
const gasD = svg.querySelectorAll("[data-gas]");
const fresh = q(".eng-gas");
const exh = fresh.cloneNode();
exh.setAttribute("class", "eng-exh");
exh.removeAttribute("data-gas");
fresh.after(exh);
const burn = q("[data-burn]");
const spark = q("[data-spark]");
const spray = q("[data-spray]");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const valves = X.M.valves.map((v, i) => ({
  v,
  a: D.valves[i].a,
  moving: svg.querySelectorAll(`[data-valve="${v.name}"]`),
  back: q(`[data-spring-back="${v.name}"]`),
  front: q(`[data-spring-front="${v.name}"]`),
  cam: q(`[data-cam="${v.name}"]`),
  flow: q(`[data-flow-line="${v.name}"]`),
  dash: 0,
}));
const smooth = (e0, e1, x) => { const u = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return u * u * (3 - 2 * u); };
function freshOf(c) {
  if (c < 360) return 0.1 * smooth(0, 70, c) + 0.22 * smooth(190, 355, c);
  return 0.32 * (1 - smooth(352, 372, c));
}
function burntOf(c) {
  if (c < 352) return 0;
  return 0.26 * smooth(355, 385, c) * (1 - 0.35 * smooth(400, 540, c)) * (1 - smooth(560, 715, c));
}
let t = 0, target = 0, frame = 0, last = 0, touring = !still.matches, visible = false, idle = 0, said = "";
function draw(dt) {
  const c = X.wrap(t);
  parts.back.innerHTML = MOVE.crankBack(c);
  parts.rod.innerHTML = MOVE.rod(c);
  parts.front.innerHTML = MOVE.crankFront(c);
  parts.piston.setAttribute("transform", translateAlong(P, [0, 0, X.pinZ(c) - D.pin0]));
  const gas = MOVE.gasOf(c);
  gasD.forEach((el) => el.setAttribute("d", gas));
  exh.setAttribute("d", gas);
  fresh.style.opacity = freshOf(c).toFixed(3);
  exh.style.opacity = burntOf(c).toFixed(3);
  const b = X.burnOf(c);
  burn.setAttribute("r", (b.grow * 46 * D.scale).toFixed(1));
  burn.style.opacity = b.glow.toFixed(3);
  const sp = c - X.M.spark;
  spark.style.opacity = sp > -2 && sp < 8 ? (1 - Math.abs(sp - 3) / 5).toFixed(2) : "0";
  const [i0, i1] = D.inject;
  spray.style.opacity = c > i0 && c < i1 ? (Math.min(1, (c - i0) / 12, (i1 - c) / 12) * 0.7).toFixed(3) : "0";
  const speed = Math.abs(X.pinZ(c + 1) - X.pinZ(c));
  for (const item of valves) {
    const lift = X.liftOf(item.v, c);
    const drop = translateAlong(P, [-item.a[0] * lift, 0, -item.a[2] * lift]);
    item.moving.forEach((el) => el.setAttribute("transform", drop));
    const s = MOVE.spring(item.v, lift);
    item.back.setAttribute("d", s.back);
    item.front.setAttribute("d", s.front);
    item.cam.innerHTML = MOVE.camLobe(item.v, c);
    item.dash += (item.v.side < 0 ? -1 : 1) * dt * (8 + speed * 90) * (lift / X.M.lift);
    item.flow.style.strokeDashoffset = item.dash.toFixed(2);
    item.flow.style.opacity = (lift / X.M.lift).toFixed(3);
  }
  const stroke = X.strokeOf(c);
  const text = `${stroke} · ${Math.round(c)}° · piston ${X.fromTDC(c).toFixed(1)} mm`;
  if (readout.textContent !== text) readout.textContent = text;
  if (said !== stroke) {
    said = stroke;
    stage.setAttribute("aria-valuetext", `${stroke} stroke, crank at ${Math.round(c)} degrees`);
  }
  stage.setAttribute("aria-valuenow", String(Math.round(c)));
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) target += dt * 80;
  const calm = still.matches;
  t = calm ? target : t + (target - t) * (1 - Math.exp(-dt / (touring ? 0.05 : 0.25)));
  if (Math.abs(target - t) < 0.01) t = target;
  draw(dt);
  const settled = !touring && t === target;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false;
  target = next;
  clearTimeout(idle);
  idle = setTimeout(() => { if (!still.matches) { touring = true; run(); } }, 3600);
  run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const share = Math.min(1, Math.max(0, ((event.clientX - box.left) / box.width - 0.1) / 0.8));
  const base = Math.floor(t / 720) * 720;
  steer(base + share * 720);
});
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = (Math.floor(target / 180 + 1e-6) + 1) * 180;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = (Math.ceil(target / 180 - 1e-6) - 1) * 180;
  if (event.key === "Home") to = Math.floor(target / 720) * 720;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
window.__engine = { set: (deg) => steer(deg) };
draw(0);
