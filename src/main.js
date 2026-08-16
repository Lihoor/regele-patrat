const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = { left: false, right: false };
const lights = [];

let W = window.innerWidth;
let H = window.innerHeight;

let level = null;
let wall = null;
let player = null;
let lighting = null;
let torches = [];
let dust = [];

function buildWorld() {
  level = new Floor(W, H);
  wall = new StoneWall(W, level.groundY);

  const frac = player ? player.x / Math.max(1, W - player.w) : 0.5;
  player = new Player(level, W);
  if (frac) player.x = frac * (W - player.w);

  torches = [
    new Torch(W * 0.12, level.groundY * 0.22, 1),
    new Torch(W * 0.40, level.groundY * 0.34, 0.92),
    new Torch(W * 0.68, level.groundY * 0.18, 1.06),
    new Torch(W * 0.90, level.groundY * 0.30, 0.9),
  ];

  dust = [];
  for (let i = 0; i < 46; i++) {
    dust.push({
      x: Math.random() * W,
      y: Math.random() * H,
      s: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 8,
      vy: -4 - Math.random() * 10,
      ph: Math.random() * 6.28,
    });
  }

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
window.addEventListener("keydown", (e) => {
  if (e.code === "KeyA" || e.code === "ArrowLeft") input.left = true;
  if (e.code === "KeyD" || e.code === "ArrowRight") input.right = true;
});
window.addEventListener("keyup", (e) => {
  if (e.code === "KeyA" || e.code === "ArrowLeft") input.left = false;
  if (e.code === "KeyD" || e.code === "ArrowRight") input.right = false;
});

resize();

let last = performance.now();

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const t = now / 1000;

  player.update(dt, input, level);
  for (const torch of torches) torch.update(dt);

  lights.length = 0;
  for (const torch of torches) lights.push(torch.lightInfo());
  lights.push({
    x: player.x + player.w / 2,
    y: level.groundY - player.h * 0.55,
    r: Math.max(200, W * 0.14),
  });

  wall.draw(ctx);
  level.draw(ctx);
  for (const torch of torches) torch.draw(ctx);
  player.draw(ctx);

  lighting.apply(ctx, W, H, lights);
  lighting.glow(ctx, W, H, lights);
  lighting.vignette(ctx, W, H);

  drawDust(ctx, dt, t);

  requestAnimationFrame(frame);
}

function drawDust(ctx, dt, t) {
  for (const p of dust) {
    p.x += p.vx * dt + Math.sin(t * 0.8 + p.ph) * 4 * dt;
    p.y += p.vy * dt;
    if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
    if (p.x < -4) p.x = W + 4;
    if (p.x > W + 4) p.x = -4;
    const a = 0.05 + 0.07 * Math.abs(Math.sin(t * 1.5 + p.ph));
    ctx.fillStyle = `rgba(255,190,120,${a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
    ctx.fill();
  }
}

requestAnimationFrame(frame);
