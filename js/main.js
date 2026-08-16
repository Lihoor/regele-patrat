const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();
const sound = new Sound();

window.addEventListener("keydown", () => sound.unlock(), { once: true });

let W = 0;
let H = 0;
let level = null;
let wall = null;
let torches = [];
let furniture = [];
let lighting = null;
let dust = null;
let king = null;
let chest = null;
let inventory = null;

function buildWorld() {
  level = new Floor(W, H);
  wall = new StoneWall(W, level.groundY);

  const frac = king ? king.x / Math.max(1, W - king.w) : 0.5;
  king = new King(level, W);
  king.sound = sound;
  if (frac) king.x = frac * (W - king.w);

  torches = [
    new Torch(W * 0.12, level.groundY * 0.22, 2.0),
    new Torch(W * 0.40, level.groundY * 0.34, 1.8),
    new Torch(W * 0.68, level.groundY * 0.18, 2.1),
    new Torch(W * 0.90, level.groundY * 0.30, 1.9),
  ];

  furniture = [
    new Furniture("tapestry", W * 0.5, level.groundY * 0.05, 1.7),
    new Furniture("throne", W * 0.07, level.groundY, 2.0),
    new Furniture("table", W * 0.28, level.groundY, 1.8),
    new Furniture("barrel", W * 0.50, level.groundY, 1.7),
    new Furniture("barrel", W * 0.545, level.groundY, 1.35),
    new Furniture("crate", W * 0.61, level.groundY, 1.8),
    new Furniture("candelabra", W * 0.74, level.groundY, 1.9),
    new Furniture("barrel", W * 0.90, level.groundY, 1.8),
  ];

  chest = new Chest(W * 0.20, level.groundY, 1.5);
  if (!inventory) inventory = new Inventory();

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
  chest.update(dt, king.x, king.w);
  for (const torch of torches) torch.update(dt);
  for (const f of furniture) f.update(dt);
  dust.update(dt, W, H);

  if (input.consumeInteract()) {
    const result = chest.interact();
    if (result === "sword") inventory.add("sword");
  }
  const eq = input.consumeEquip();
  if (eq >= 0) {
    inventory.toggleEquip(eq);
    king.heldItem = inventory.getEquipped();
  }

  const torchLights = [];
  for (const torch of torches) torchLights.push(torch.lightInfo());
  for (const f of furniture) {
    const l = f.lightInfo();
    if (l) torchLights.push(l);
  }
  const chestLight = chest.lightInfo();
  if (chestLight) torchLights.push(chestLight);

  const allLights = torchLights.slice();
  allLights.push({
    x: king.x + king.w / 2,
    y: level.groundY - king.h * 0.5,
    r: Math.max(250, W * 0.18),
  });

  wall.draw(ctx);
  level.draw(ctx);
  for (const f of furniture) f.draw(ctx);
  chest.drawBody(ctx);

  lighting.apply(ctx, W, H, allLights);
  lighting.glow(ctx, W, H, torchLights);
  for (const torch of torches) torch.draw(ctx);
  dust.draw(ctx);
  lighting.vignette(ctx, W, H);

  king.draw(ctx, level);

  chest.drawHUD(ctx);
  inventory.draw(ctx, W, H);

  drawStamina(ctx);

  requestAnimationFrame(frame);
}

function drawStamina(ctx) {
  const bw = Math.min(260, W * 0.3);
  const bh = 13;
  const bx = (W - bw) / 2;
  const by = H - 26;
  const p = Math.max(0, Math.min(1, king.stamina / 100));

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  roundRect(ctx, bx - 3, by - 3, bw + 6, bh + 6, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  roundRect(ctx, bx - 3, by - 3, bw + 6, bh + 6, 6);
  ctx.stroke();

  ctx.fillStyle = p > 0.3 ? "#e8c84a" : "#e05a3a";
  if (p > 0.01) {
    roundRect(ctx, bx, by, bw * p, bh, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    roundRect(ctx, bx, by, bw * p, bh * 0.45, 4);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("STAMINA", W / 2, by - 7);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

requestAnimationFrame(frame);
