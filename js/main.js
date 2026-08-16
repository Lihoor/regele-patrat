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
let menu = null;
let mouseX = 0, mouseY = 0;
let gameStarted = false;
let paused = false;
let pauseState = "main";
let sneezeTriggered = false;
let currentRoom = 0;
let knight = null;
let npcTalked = false;
let fadeAlpha = 0;
let fadeDir = 0;
let fadeCallback = null;

const dialogue = {
  active: false,
  text: "",
  lines: [],
  currentLine: 0,
  shown: 0,
  timer: 0,
  speed: 35,
  show(textOrArray) {
    this.active = true;
    if (Array.isArray(textOrArray)) {
      this.lines = textOrArray;
      this.currentLine = 0;
      this.text = textOrArray[0];
    } else {
      this.lines = [textOrArray];
      this.currentLine = 0;
      this.text = textOrArray;
    }
    this.shown = 0;
    this.timer = 0;
  },
  update(dt) {
    if (!this.active) return;
    this.timer += dt;
    this.shown = Math.min(this.text.length, Math.floor(this.timer * this.speed));
  },
  draw(ctx, W, H) {
    if (!this.active) return;
    const boxH = 90;
    const boxY = H - boxH - 20;
    ctx.fillStyle = "rgba(10,8,5,0.88)";
    roundRect(ctx, 40, boxY, W - 80, boxH, 10);
    ctx.fill();
    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 2;
    roundRect(ctx, 40, boxY, W - 80, boxH, 10);
    ctx.stroke();
    const txt = this.text.substring(0, this.shown);
    ctx.fillStyle = "#e8d8a0";
    ctx.font = "18px Georgia, serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const maxW = W - 120;
    const words = txt.split(" ");
    let line = "", ly = boxY + 18;
    for (const w of words) {
      const test = line + (line ? " " : "") + w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, 60, ly); line = w; ly += 24;
      } else line = test;
    }
    if (line) ctx.fillText(line, 60, ly);
    if (this.shown >= this.text.length) {
      ctx.fillStyle = "rgba(180,146,46,0.5)";
      ctx.font = "13px Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText(menu && menu.lang === "en" ? "Click to continue..." : "Click pentru a continua...", W - 60, boxY + boxH - 16);
    }
  },
  advance() {
    if (!this.active) return false;
    if (this.shown < this.text.length) { this.shown = this.text.length; this.timer = this.text.length / this.speed + 1; return true; }
    if (this.currentLine < this.lines.length - 1) {
      this.currentLine++;
      this.text = this.lines[this.currentLine];
      this.shown = 0;
      this.timer = 0;
      return true;
    }
    this.active = false; return true;
  }
};

function buildWorld() {
  level = new Floor(W, H);
  wall = new StoneWall(W, level.groundY);

  const frac = king ? king.x / Math.max(1, W - king.w) : 0.5;
  king = new King(level, W);
  king.sound = sound;
  if (frac) king.x = frac * (W - king.w);

  knight = new Knight(W * 0.78, level.groundY);

  if (currentRoom === 0) {
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
    chest = new Chest(W * 0.20, level.groundY, 2.2);
    chest.sound = sound;
  } else {
    torches = [
      new Torch(W * 0.10, level.groundY * 0.20, 2.0),
      new Torch(W * 0.35, level.groundY * 0.30, 1.9),
      new Torch(W * 0.55, level.groundY * 0.16, 2.1),
      new Torch(W * 0.92, level.groundY * 0.28, 1.8),
    ];
    furniture = [
      new Furniture("tapestry", W * 0.3, level.groundY * 0.04, 1.7),
      new Furniture("barrel", W * 0.15, level.groundY, 1.7),
      new Furniture("barrel", W * 0.20, level.groundY, 1.35),
      new Furniture("crate", W * 0.40, level.groundY, 1.8),
      new Furniture("candelabra", W * 0.55, level.groundY, 1.9),
      new Furniture("barrel", W * 0.65, level.groundY, 1.5),
    ];
    chest = null;
  }

  if (!inventory) inventory = new Inventory();

  dust = new Dust(W, H);
  if (!lighting) lighting = new Lighting();
  if (!menu) menu = new Menu(W, H);
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

canvas.addEventListener("click", (e) => {
  if (menu && menu.active) {
    menu.handleClick(e.clientX, e.clientY, W, H);
    return;
  }
  if (paused) { handlePauseClick(e.clientX, e.clientY); return; }
  if (dialogue.active) { dialogue.advance(); return; }
});

let last = performance.now();

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (menu && menu.active) {
    menu.draw(ctx, W, H);
    canvas.style.cursor = menu.getCursor();
    requestAnimationFrame(frame);
    return;
  }

  if (input.consumeEscape() && !dialogue.active && gameStarted) {
    if (paused) { paused = false; pauseState = "main"; }
    else { paused = true; pauseState = "main"; }
  }

  if (paused) {
    canvas.style.cursor = "default";
    drawPause(ctx, W, H);
    requestAnimationFrame(frame);
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
    king.sleeping = true;
    king.sleepTimer = 0;
    king.sleepProgress = 0;
    king.x = W * 0.07 - king.w / 2;
    king.y = level.groundY - king.h + 35;
    king.onWakeUp = function() {
      king.y = level.groundY - king.h;
      const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
      dialogue.show(L.dialogue);
    };
  }

  canvas.style.cursor = dialogue.active ? "default" : "default";

  if (menu && menu.music) menu.music.update(dt);
  sound.unlock();

  if (!dialogue.active) {
    king.update(dt, input, level, dust);
    if (currentRoom === 0 && chest) chest.update(dt, king.x, king.w);
    if (currentRoom === 1 && knight) knight.update(dt, king.x, king.w);
  }

  if (!dialogue.active && !king.sleeping && !king.sneezing) {
    if (king.x + king.w >= W - 2) {
      fadeDir = 1;
      fadeCallback = () => {
        currentRoom = 1;
        king.x = 2;
        king.y = level.groundY - king.h;
        buildWorld();
        fadeDir = -1;
      };
    } else if (currentRoom === 1 && king.x <= 2) {
      fadeDir = 1;
      fadeCallback = () => {
        currentRoom = 0;
        king.x = W - king.w - 2;
        king.y = level.groundY - king.h;
        buildWorld();
        fadeDir = -1;
      };
    }
  }

  if (fadeDir !== 0) {
    fadeAlpha += fadeDir * dt * 3;
    if (fadeDir === 1 && fadeAlpha >= 1) {
      fadeAlpha = 1;
      if (fadeCallback) { fadeCallback(); fadeCallback = null; }
    }
    if (fadeDir === -1 && fadeAlpha <= 0) {
      fadeAlpha = 0;
      fadeDir = 0;
    }
  }
  for (const torch of torches) torch.update(dt);
  for (const f of furniture) f.update(dt);
  dust.update(dt, W, H);

  if (input.consumeInteract()) {
    if (currentRoom === 0 && chest) {
      const result = chest.interact();
      if (result === "sword") inventory.add("sword");
    }
    if (currentRoom === 1 && knight && knight.promptAlpha > 0.5 && !npcTalked) {
      npcTalked = true;
      const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
      dialogue.show(L.knightDialogue);
    }
  }
  if (!sneezeTriggered && chest && chest.state !== "closed" && king.x > W * 0.78 && !king.sneezing && !king.sleeping) {
    sneezeTriggered = true;
    king.sneezing = true;
    king.sneezeTimer = 0;
    sound.play("sneeze", 1, 0.5);
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
  if (chest) {
    const chestLight = chest.lightInfo();
    if (chestLight) torchLights.push(chestLight);
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
  if (chest) chest.drawBody(ctx);

  lighting.apply(ctx, W, H, allLights);
  lighting.glow(ctx, W, H, torchLights);
  for (const torch of torches) torch.draw(ctx);
  dust.draw(ctx);
  lighting.vignette(ctx, W, H);

  if (chest) chest.drawGlow(ctx);
  if (currentRoom === 1 && knight) knight.draw(ctx);
  king.draw(ctx, level);

  dialogue.update(dt);
  dialogue.draw(ctx, W, H);

  if (currentRoom === 0 && chest) chest.drawHUD(ctx);
  inventory.draw(ctx, W, H);

  drawStamina(ctx);

  if (fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha.toFixed(2)})`;
    ctx.fillRect(0, 0, W, H);
  }

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

let pauseBtns = [];
let pauseSliderDrag = false;

function _pauseBtn(ctx, x, y, w, h, label, fn) {
  pauseBtns.push({ x, y, w, h, fn });
  const hover = mouseX >= x && mouseX <= x+w && mouseY >= y && mouseY <= y+h;
  ctx.fillStyle = hover ? "rgba(50,40,20,0.85)" : "rgba(25,20,10,0.75)";
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = hover ? "#e8c84a" : "#b8922e";
  ctx.lineWidth = hover ? 2.5 : 1.8;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();
  ctx.fillStyle = hover ? "#fff8e0" : "#e8d8a0";
  ctx.font = "bold 19px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w/2, y + h/2 + 1);
}

function _pauseLangBtn(ctx, x, y, w, h, label, active, fn) {
  pauseBtns.push({ x, y, w, h, fn });
  ctx.fillStyle = active ? "rgba(100,80,30,0.85)" : "rgba(25,20,10,0.65)";
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = active ? "#e8c84a" : "rgba(180,146,46,0.4)";
  ctx.lineWidth = active ? 2 : 1;
  roundRect(ctx, x, y, w, h, 6);
  ctx.stroke();
  ctx.fillStyle = active ? "#fff8e0" : "#a09060";
  ctx.font = (active ? "bold " : "") + "15px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w/2, y + h/2);
}

function drawPause(ctx, W, H) {
  pauseBtns = [];
  const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;

  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#c8b880";
  ctx.font = "bold 36px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(L.pauseTitle || "PAUSED", W/2, H * 0.18);

  if (pauseState === "main") {
    const bw = 230, bh = 52;
    _pauseBtn(ctx, W/2 - bw/2, H*0.30, bw, bh, L.play, () => { paused = false; });
    _pauseBtn(ctx, W/2 - bw/2, H*0.42, bw, bh, L.settings, () => { pauseState = "settings"; });
    _pauseBtn(ctx, W/2 - bw/2, H*0.54, bw, bh, L.returnToLobby, () => {
      paused = false;
      dialogue.active = false;
      menu.active = true;
      pauseState = "main";
    });
    _pauseBtn(ctx, W/2 - bw/2, H*0.66, bw, bh, L.restart, () => {
      paused = false;
      gameStarted = false;
      dialogue.active = false;
      sneezeTriggered = false;
      currentRoom = 0;
      npcTalked = false;
      inventory = null;
      buildWorld();
      pauseState = "main";
    });
  } else if (pauseState === "settings") {
    ctx.fillStyle = "#a09060";
    ctx.font = "16px Georgia, serif";
    ctx.fillText(L.musicVolume, W/2, H*0.28);

    const sx = W*0.28, sw = W*0.44, sh = 8;
    const sy = H*0.34;
    ctx.fillStyle = "rgba(25,20,10,0.7)";
    roundRect(ctx, sx, sy - sh/2, sw, sh, 4);
    ctx.fill();
    ctx.fillStyle = "#b8922e";
    roundRect(ctx, sx, sy - sh/2, sw * menu.volume, sh, 4);
    ctx.fill();
    ctx.fillStyle = "#e8d8a0";
    ctx.beginPath();
    ctx.arc(sx + sw * menu.volume, sy, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#a09060";
    ctx.font = "14px Georgia, serif";
    ctx.fillText(Math.round(menu.volume * 100) + "%", W/2, H*0.39);

    ctx.fillStyle = "#a09060";
    ctx.font = "16px Georgia, serif";
    ctx.fillText(L.language, W/2, H*0.46);

    const lbw = 130, lbh = 38, lby = H*0.50;
    _pauseLangBtn(ctx, W/2 - lbw - 8, lby, lbw, lbh, L.langRO, menu.lang === "ro", () => { menu.lang = "ro"; });
    _pauseLangBtn(ctx, W/2 + 8, lby, lbw, lbh, L.langEN, menu.lang === "en", () => { menu.lang = "en"; });

    _pauseBtn(ctx, W/2 - 85, H*0.62, 170, 48, L.back, () => { pauseState = "main"; });
  }
}

function handlePauseClick(x, y) {
  for (const b of pauseBtns) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { b.fn(); return; }
  }
}

function handlePauseMove(x, y) {
  mouseX = x; mouseY = y;
  if (pauseSliderDrag && pauseState === "settings") {
    const sx = W * 0.28, sw = W * 0.44;
    menu.volume = Math.max(0, Math.min(1, (x - sx) / sw));
    menu.music.setVolume(menu.volume);
  }
}

canvas.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (menu) menu.handleMove(mouseX, mouseY);
  if (paused) handlePauseMove(mouseX, mouseY);
});
canvas.addEventListener("mousedown", () => {
  if (menu) menu.handleDown();
  if (paused && pauseState === "settings") {
    const sx = W * 0.28, sw = W * 0.44;
    const sy = H * 0.34;
    if (mouseX >= sx && mouseX <= sx + sw && mouseY >= sy - 16 && mouseY <= sy + 16) {
      pauseSliderDrag = true;
      const v = Math.max(0, Math.min(1, (mouseX - sx) / sw));
      menu.volume = v;
      menu.music.setVolume(v);
    }
  }
});
canvas.addEventListener("mouseup", () => { if (menu) menu.handleUp(); pauseSliderDrag = false; });

requestAnimationFrame(frame);
