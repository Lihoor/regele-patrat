const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();

let W = 0;
let H = 0;
let level = null;
let wall = null;
let torches = [];
let furniture = [];
let lighting = null;
let dust = null;
let king = null;

function buildWorld() {
  level = new Floor(W, H);
  wall = new StoneWall(W, level.groundY);

  const frac = king ? king.x / Math.max(1, W - king.w) : 0.5;
  king = new King(level, W);
  if (frac) king.x = frac * (W - king.w);

  torches = [
    new Torch(W * 0.12, level.groundY * 0.22, 1),
    new Torch(W * 0.40, level.groundY * 0.34, 0.92),
    new Torch(W * 0.68, level.groundY * 0.18, 1.06),
    new Torch(W * 0.90, level.groundY * 0.30, 0.9),
  ];

  furniture = [
    new Furniture("tapestry", W * 0.5, level.groundY * 0.06, 1.3),
    new Furniture("throne", W * 0.07, level.groundY, 1.5),
    new Furniture("table", W * 0.28, level.groundY, 1.35),
    new Furniture("barrel", W * 0.50, level.groundY, 1.25),
    new Furniture("barrel", W * 0.545, level.groundY, 0.95),
    new Furniture("crate", W * 0.61, level.groundY, 1.35),
    new Furniture("candelabra", W * 0.74, level.groundY, 1.4),
    new Furniture("barrel", W * 0.90, level.groundY, 1.35),
  ];

  dust = new Dust(W, H);
  if (!lighting) lighting = new Lighting();
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildWorld();
}

window.addEventListener("resize", resize);
resize();

let last = performance.now();

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  king.update(dt, input, level, dust);
  for (const torch of torches) torch.update(dt);
  for (const f of furniture) f.update(dt);
  dust.update(dt, W, H);

  const torchLights = [];
  for (const torch of torches) torchLights.push(torch.lightInfo());
  for (const f of furniture) {
    const l = f.lightInfo();
    if (l) torchLights.push(l);
  }

  const allLights = torchLights.slice();
  allLights.push({
    x: king.x + king.w / 2,
    y: level.groundY - king.h * 0.5,
    r: Math.max(250, W * 0.18),
  });

  wall.draw(ctx);
  level.draw(ctx);
  for (const f of furniture) f.draw(ctx);

  lighting.apply(ctx, W, H, allLights);
  lighting.glow(ctx, W, H, torchLights);
  for (const torch of torches) torch.draw(ctx);
  dust.draw(ctx);
  lighting.vignette(ctx, W, H);

  king.draw(ctx, level);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
