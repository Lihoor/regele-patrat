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
let scarecrow = null;
let scarecrowTalked = false;
let trainingPhase = "none";
let trainingMenuActive = false;
let damageNumbers = [];
let bowChest = null;
let arrows = [];
let bowCooldown = 0;
let stairs = null;
let nightSky = null;
let trap = null;
let trapTriggered = false;
let armorStand = null;
let hasArmor = false;
let armorCollected = false;
let foodChestUsed = false;
let swordChestOpened = false;
let bowPickedUp = false;
let scarecrow2Dead = false;
let scarecrow3Dead = false;
let boss = null;
let bossDefeated = false;
let bossIntroShown = false;
let gameOver = false;
let battleMusic = null;
let nightSoundId = null;

const dialogue = {
  active: false,
  text: "",
  lines: [],
  currentLine: 0,
  shown: 0,
  timer: 0,
  speed: 35,
  onDone: null,
  show(textOrArray) {
    this.active = true;
    this.onDone = null;
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
    const boxH = 75;
    const boxY = H - boxH - 140;
    ctx.fillStyle = "rgba(10,8,5,0.88)";
    roundRect(ctx, 40, boxY, W - 80, boxH, 10);
    ctx.fill();
    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 2;
    roundRect(ctx, 40, boxY, W - 80, boxH, 10);
    ctx.stroke();
    const txt = this.text.substring(0, this.shown);
    ctx.fillStyle = "#e8d8a0";
    ctx.font = "16px Georgia, serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const maxW = W - 120;
    const words = txt.split(" ");
    let line = "", ly = boxY + 14;
    for (const w of words) {
      const test = line + (line ? " " : "") + w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, 60, ly); line = w; ly += 22;
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
    this.active = false;
    if (this.onDone) { const cb = this.onDone; this.onDone = null; cb(); }
    return true;
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
  scarecrow = null;
  bowChest = null;

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
    if (swordChestOpened) { chest.state = "picked"; }
  } else if (currentRoom === 1) {
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
  } else if (currentRoom === 2) {
    torches = [
      new Torch(W * 0.08, level.groundY * 0.18, 2.0),
      new Torch(W * 0.30, level.groundY * 0.25, 1.8),
      new Torch(W * 0.60, level.groundY * 0.15, 2.1),
      new Torch(W * 0.88, level.groundY * 0.22, 1.9),
    ];
    furniture = [
      new Furniture("crate", W * 0.12, level.groundY, 1.7),
      new Furniture("barrel", W * 0.25, level.groundY, 1.8),
      new Furniture("candelabra", W * 0.45, level.groundY, 1.9),
      new Furniture("crate", W * 0.68, level.groundY, 1.6),
      new Furniture("barrel", W * 0.82, level.groundY, 1.7),
    ];
    chest = null;
    scarecrow = new Scarecrow(W * 0.55, level.groundY, 1.25);
    if (scarecrow2Dead) { scarecrow.hp = 0; scarecrow.dead = true; }
  } else if (currentRoom === 3) {
    torches = [
      new Torch(W * 0.10, level.groundY * 0.20, 2.0),
      new Torch(W * 0.35, level.groundY * 0.28, 1.9),
      new Torch(W * 0.65, level.groundY * 0.16, 2.1),
      new Torch(W * 0.90, level.groundY * 0.24, 1.8),
    ];
    furniture = [
      new Furniture("crate", W * 0.10, level.groundY, 1.7),
      new Furniture("barrel", W * 0.22, level.groundY, 1.8),
      new Furniture("candelabra", W * 0.40, level.groundY, 1.9),
      new Furniture("crate", W * 0.72, level.groundY, 1.6),
    ];
    chest = null;
    scarecrow = new Scarecrow(W * 0.58, level.groundY, 1.25);
    if (scarecrow3Dead) { scarecrow.hp = 0; scarecrow.dead = true; }
    bowChest = new Chest(W * 0.25, level.groundY, 2.0);
    bowChest.sound = sound;
    bowChest.itemType = "bow";
    if (bowPickedUp) { bowChest.state = "picked"; }
  } else if (currentRoom === 4) {
    torches = [
      new Torch(W * 0.08, level.groundY * 0.22, 2.0),
      new Torch(W * 0.50, level.groundY * 0.18, 1.9),
      new Torch(W * 0.85, level.groundY * 0.28, 2.1),
    ];
    furniture = [
      new Furniture("crate", W * 0.15, level.groundY, 1.7),
      new Furniture("barrel", W * 0.35, level.groundY, 1.8),
      new Furniture("candelabra", W * 0.70, level.groundY, 1.9),
    ];
    chest = null;
    stairs = new Stairs(W * 0.58, level.groundY, 8, 70, 38);
  } else if (currentRoom === 5) {
    nightSky = new NightSky(W, H);
    torches = [];
    furniture = [];
    chest = null;
    trap = new Trap(W * 0.38, level.groundY, 64);
    if (trapTriggered) trap.trigger();
    armorStand = null;
    stairs = null;
  } else if (currentRoom === 6) {
    torches = [
      new Torch(W * 0.12, level.groundY * 0.20, 2.0),
      new Torch(W * 0.40, level.groundY * 0.32, 1.9),
      new Torch(W * 0.68, level.groundY * 0.18, 2.1),
      new Torch(W * 0.88, level.groundY * 0.26, 1.8),
    ];
    furniture = [
      new Furniture("tapestry", W * 0.45, level.groundY * 0.04, 1.7),
      new Furniture("crate", W * 0.12, level.groundY, 1.7),
      new Furniture("candelabra", W * 0.35, level.groundY, 1.9),
      new Furniture("barrel", W * 0.78, level.groundY, 1.8),
    ];
    chest = new Chest(W * 0.30, level.groundY, 2.0);
    chest.sound = sound;
    chest.itemType = "food";
    if (foodChestUsed) { chest.state = "picked"; }
    stairs = null;
    nightSky = null;
    trap = null;
    armorStand = new ArmorStand(W * 0.65, level.groundY, 1.2);
    if (armorCollected) { armorStand.collected = true; }
    hasArmor = armorCollected;
  } else if (currentRoom === 7) {
    torches = [
      new Torch(W * 0.10, level.groundY * 0.18, 2.2),
      new Torch(W * 0.30, level.groundY * 0.25, 2.0),
      new Torch(W * 0.70, level.groundY * 0.25, 2.0),
      new Torch(W * 0.90, level.groundY * 0.18, 2.2),
    ];
    furniture = [
      new Furniture("crate", W * 0.05, level.groundY, 1.6),
      new Furniture("barrel", W * 0.92, level.groundY, 1.6),
    ];
    chest = null;
    stairs = null;
    nightSky = null;
    trap = null;
    armorStand = null;
    if (!bossDefeated) {
      if (!boss || boss.dead) {
        boss = new Boss(W * 0.75, level.groundY, 2.0);
      }
    } else {
      boss = null;
    }
  }

  if (!inventory) inventory = new Inventory();

  dust = new Dust(W, H);
  if (!lighting) lighting = new Lighting();
  if (!battleMusic) battleMusic = new BattleMusic();
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
  if (gameOver) {
    gameOver = false;
    currentRoom = 0;
    bossDefeated = false;
    bossIntroShown = false;
    boss = null;
    armorCollected = false;
    foodChestUsed = false;
    swordChestOpened = false;
    bowPickedUp = false;
    scarecrow2Dead = false;
    scarecrow3Dead = false;
    hasArmor = false;
    trapTriggered = false;
    inventory.hp = 100;
    inventory.hunger = 100;
    inventory.items = [];
    inventory.selectedSlot = 0;
    king.x = W * 0.07 - king.w / 2;
    king.y = level.groundY - king.h;
    king.sleeping = false;
    king.heldItem = null;
    scarecrow = null;
    bowChest = null;
    arrows = [];
    trainingPhase = "none";
    buildWorld();
    return;
  }
  if (trainingMenuActive) { trainingMenuActive = false; return; }
  if (dialogue.active) { dialogue.advance(); return; }

  if (king.heldItem === "bow" && !dialogue.active && !king.sleeping && !king.sneezing && !king.swinging && bowCooldown <= 0) {
    const fromX = king.x + king.w / 2 + king.facing * 20;
    const fromY = king.y + king.h * 0.45;
    shootArrow(fromX, fromY, e.clientX, e.clientY);
    bowCooldown = 0.4;
    if (sound) sound.play("bow", 1, 0.5);
    return;
  }

    if (king.heldItem === "sword" && !dialogue.active && !king.sleeping && !king.sneezing && !king.swinging) {
      king.startSwing();
      if (sound) sound.play("sword_swing", 1, 0.5);
      if (currentRoom === 7 && boss && !boss.dead) {
        const bcx = boss.centerX;
        const kcx = king.x + king.w / 2;
        const dist = Math.abs(bcx - kcx);
        if (dist < 160) {
          const dmg = boss.takeDamage(20);
          if (dmg > 0) {
            spawnDamageNumber(boss.centerX, boss.y - 10, dmg);
            if (sound) sound.play("sword_hit", 1, 0.6);
            if (boss.dead) {
              bossDefeated = true;
              if (battleMusic) battleMusic.stop();
              setTimeout(() => {
                const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
                dialogue.show(L.bossDefeated);
              }, 1200);
            }
          }
        }
      } else if (scarecrow && !scarecrow.dead && (currentRoom === 2 || currentRoom === 3)) {
      const scx = scarecrow.x + scarecrow.w / 2;
      const kcx = king.x + king.w / 2;
      const dist = Math.abs(scx - kcx);
      if (dist < 160) {
        const dmg = scarecrow.takeDamage(20);
        if (dmg > 0) {
          spawnDamageNumber(scarecrow.x + scarecrow.w / 2, scarecrow.y - 10, dmg);
          if (sound) sound.play("sword_hit", 1, 0.6);
          if (scarecrow.dead) {
            if (currentRoom === 2) scarecrow2Dead = true;
            if (currentRoom === 3) scarecrow3Dead = true;
            const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
            trainingPhase = "done";
            setTimeout(() => {
              dialogue.show(currentRoom === 3 ? L.bowDone : L.trainingDone);
            }, 300);
          }
        }
      }
    }
    return;
  }
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

  if (currentRoom === 7 && boss && !bossIntroShown && !bossDefeated && !dialogue.active) {
    bossIntroShown = true;
    const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
    dialogue.show(L.bossIntro);
    dialogue.onDone = () => {
      if (sound && sound.ctx && battleMusic) {
        battleMusic.load(sound.ctx);
        battleMusic.play(sound.ctx);
      }
    };
  }

  if (!dialogue.active) {
    king.update(dt, input, level, dust);
    if (currentRoom === 0 && chest) chest.update(dt, king.x, king.w);
    if (currentRoom === 6 && chest) chest.update(dt, king.x, king.w);
    if (currentRoom === 1 && knight) knight.update(dt, king.x, king.w);
    if ((currentRoom === 2 || currentRoom === 3) && scarecrow) scarecrow.update(dt, king.x, king.w);
    if (currentRoom === 3 && bowChest) bowChest.update(dt, king.x, king.w);
    if (currentRoom === 6 && armorStand) armorStand.update(dt, king.x, king.w);
    if (currentRoom === 7 && boss && !boss.dead) {
      boss.update(dt, king.x, king.w, king.y);
      const dmg = boss.canDamage(king.x, king.w, king.y);
      if (dmg > 0 && inventory) {
        const finalDmg = hasArmor ? Math.floor(dmg * 0.5) : dmg;
        inventory.hp = Math.max(0, inventory.hp - finalDmg);
        spawnDamageNumber(king.x + king.w / 2, king.y - 10, finalDmg);
        king.knockback = boss.facing * 180;
        if (sound) sound.play("hit", 1, 0.5);
      }
    }
    if (currentRoom === 7 && boss && boss.dying) {
      boss.update(dt, king.x, king.w, king.y);
    }
    updateDamageNumbers(dt);
    updateArrows(dt);
    if (bowCooldown > 0) bowCooldown -= dt;
    if (inventory) {
      const hungerDrain = king.sprinting ? 0.3 : 0.167;
      inventory.hunger = Math.max(0, inventory.hunger - hungerDrain * dt);
      if (inventory.hunger <= 0) {
        if (!inventory._starveTimer) inventory._starveTimer = 0;
        inventory._starveTimer += dt;
        if (inventory._starveTimer >= 10) {
          inventory._starveTimer = 0;
          inventory.hp = Math.max(0, inventory.hp - 1);
        }
      } else {
        inventory._starveTimer = 0;
      }
    }
    if (currentRoom === 5 && trap && !trapTriggered && !king.sleeping && !king.sneezing) {
      if (trap.checkCollision(king.x, king.w, king.y, king.h)) {
        trap.trigger();
        trapTriggered = true;
        inventory.hp = Math.max(0, inventory.hp - 60);
        spawnDamageNumber(king.x + king.w / 2, king.y - 10, 60);
        if (sound) sound.play("trap", 1, 0.7);
        setTimeout(() => {
          const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
          dialogue.show(L.trapDialogue);
        }, 400);
      }
    }
    if (trap) trap.update(dt);
    if (inventory && inventory.hp <= 0 && !gameOver) {
      gameOver = true;
      if (battleMusic) battleMusic.stop();
      if (nightSoundId) { if (sound) sound.stopLoop(nightSoundId); nightSoundId = null; }
    }
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#c0392b";
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOU DIED", W / 2, H / 2 - 40);
    ctx.fillStyle = "#888";
    ctx.font = "20px sans-serif";
    ctx.fillText("Click to try again", W / 2, H / 2 + 30);
    requestAnimationFrame(frame);
    return;
  }

  if (!dialogue.active && !king.sleeping && !king.sneezing && !king.swinging && !trainingMenuActive) {
    const canLeaveRoom = currentRoom !== 7 || bossDefeated;
    if (king.x + king.w >= W - 2 && currentRoom < 7 && canLeaveRoom) {
      fadeDir = 1;
      fadeCallback = () => {
        currentRoom++;
        king.x = 2;
        king.y = level.groundY - king.h;
        scarecrow = null;
        bowChest = null;
        stairs = null;
        nightSky = null;
        trap = null;
        armorStand = null;
        if (currentRoom !== 7 && battleMusic) battleMusic.stop();
        if (currentRoom === 7 && battleMusic) {
          if (sound && sound.ctx) battleMusic.load(sound.ctx);
          setTimeout(() => { if (sound && sound.ctx && currentRoom === 7) battleMusic.play(sound.ctx); }, 500);
        }
        if (nightSoundId) { if (sound) sound.stopLoop(nightSoundId); nightSoundId = null; }
        buildWorld();
        if (currentRoom === 5 && sound && sound.ctx) {
          nightSoundId = sound.loop("night", 0.35);
        }
        fadeDir = -1;
      };
    } else if (king.x <= 2 && currentRoom > 0 && canLeaveRoom) {
      fadeDir = 1;
      fadeCallback = () => {
        currentRoom--;
        king.x = W - king.w - 2;
        king.y = level.groundY - king.h;
        scarecrow = null;
        bowChest = null;
        stairs = null;
        nightSky = null;
        trap = null;
        armorStand = null;
        if (battleMusic) battleMusic.stop();
        if (nightSoundId) { if (sound) sound.stopLoop(nightSoundId); nightSoundId = null; }
        buildWorld();
        if (currentRoom === 5 && sound && sound.ctx) {
          nightSoundId = sound.loop("night", 0.35);
        }
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
      if (result === "sword") { inventory.add("sword"); swordChestOpened = true; }
    }
    if (currentRoom === 1 && knight && knight.promptAlpha > 0.5 && !npcTalked) {
      npcTalked = true;
      const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
      dialogue.show(L.knightDialogue);
    }
    if ((currentRoom === 2 || currentRoom === 3) && scarecrow && scarecrow.promptAlpha > 0.5 && !scarecrow.dead) {
      if (trainingPhase === "none" || trainingPhase === "done") {
        const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
        if (!scarecrowTalked) {
          scarecrowTalked = true;
          trainingPhase = "dialogue";
          dialogue.show(currentRoom === 3 ? L.bowDialogue : L.scarecrowDialogue);
          dialogue.onDone = () => {
            trainingPhase = "menu";
            trainingMenuActive = true;
          };
        } else {
          trainingPhase = "menu";
          trainingMenuActive = true;
        }
      }
    }
    if (currentRoom === 3 && bowChest && !inventory.hasItem("bow")) {
      const result = bowChest.interact();
      if (result === "bow") { inventory.add("bow"); bowPickedUp = true; }
    }
    if (currentRoom === 6 && armorStand && !hasArmor) {
      if (armorStand.interact()) {
        hasArmor = true;
        armorCollected = true;
        const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
        dialogue.show(L.armorDialogue);
      }
    }
    if (currentRoom === 6 && chest && chest.itemType === "food") {
      if (chest.state === "closed" && chest.near) {
        chest.interact();
      } else if (chest.state === "sword_out" && chest.near) {
        if (chest.useFood(inventory)) {
          foodChestUsed = true;
          spawnDamageNumber(king.x + king.w / 2, king.y - 10, "+40HP");
        }
      }
    }
  }
  if (!sneezeTriggered && currentRoom === 0 && chest && chest.state !== "closed" && king.x > W * 0.78 && !king.sneezing && !king.sleeping) {
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

  if (currentRoom === 5 && nightSky) {
    nightSky.draw(ctx, performance.now() / 1000, level.floorH);
    nightSky.drawFloor(ctx, level.groundY, level.floorH, W);
    nightSky.drawBalcony(ctx, level.groundY);
  } else {
    wall.draw(ctx);
    level.draw(ctx);
  }
  for (const f of furniture) f.draw(ctx);
  if (chest) chest.drawBody(ctx);
  if (currentRoom === 4 && stairs) stairs.draw(ctx);
  if (currentRoom === 5 && trap) trap.drawIndicator(ctx);

  if (currentRoom === 5 && nightSky) {
    const moonLights = [{
      x: nightSky.moonX,
      y: nightSky.moonY,
      r: nightSky.moonR * 6,
    }];
    moonLights.push({
      x: king.x + king.w / 2,
      y: level.groundY - king.h * 0.5,
      r: Math.max(250, W * 0.18),
    });
    lighting.apply(ctx, W, H, moonLights);
    lighting.glow(ctx, W, H, []);
  } else {
    lighting.apply(ctx, W, H, allLights);
    lighting.glow(ctx, W, H, torchLights);
  }
  for (const torch of torches) torch.draw(ctx);
  dust.draw(ctx);
  lighting.vignette(ctx, W, H);
  if (currentRoom === 5 && trap) trap.draw(ctx);

  if (chest) chest.drawGlow(ctx);
  if (currentRoom === 1 && knight) knight.draw(ctx);
  if (currentRoom === 6 && armorStand) armorStand.draw(ctx);
  if (currentRoom === 7 && boss) boss.draw(ctx);
  if ((currentRoom === 2 || currentRoom === 3) && scarecrow) scarecrow.draw(ctx);
  if (currentRoom === 3 && bowChest) {
    bowChest.drawBody(ctx);
    bowChest.drawGlow(ctx);
  }
  king.draw(ctx, level);

  if ((currentRoom === 2 || currentRoom === 3) && scarecrow) {
    const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
    const promptText = currentRoom === 3 ? L.bowPrompt : L.scarecrowPrompt;
    if (scarecrow.promptAlpha > 0.05 && !scarecrow.dead) {
      ctx.save();
      ctx.globalAlpha = scarecrow.promptAlpha;
      ctx.fillStyle = "#e8d8a0";
      ctx.font = "bold 16px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(promptText, scarecrow.x + scarecrow.w / 2, scarecrow.y - 30);
      ctx.restore();
    }
  }

  drawDamageNumbers(ctx);
  drawArrows(ctx);

  dialogue.update(dt);
  dialogue.draw(ctx, W, H);

  if (currentRoom === 0 && chest) chest.drawHUD(ctx);
  if (currentRoom === 3 && bowChest) bowChest.drawHUD(ctx);
  if (currentRoom === 6 && armorStand) armorStand.drawPrompt(ctx);
  if (currentRoom === 6 && chest) chest.drawHUD(ctx);
  inventory.draw(ctx, W, H);
  if (currentRoom === 7 && boss) boss.drawHealthBar(ctx);

  drawStamina(ctx);

  if ((currentRoom === 2 || currentRoom === 3) && !dialogue.active) {
    const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
    const panelText = currentRoom === 3 ? L.roomBow : L.roomTraining;
    drawWallPanel(ctx, W * 0.05, level.groundY * 0.35, 180, 40, panelText);
  }

  drawTrainingMenu(ctx, W, H);

  if (fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha.toFixed(2)})`;
    ctx.fillRect(0, 0, W, H);
  }

  requestAnimationFrame(frame);
}

function drawStamina(ctx) {
  const bw = Math.min(260, W * 0.3);
  const bh = 13;
  const bx = 18;
  const by = H - 58 - 18 - 74;
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
  ctx.textAlign = "left";
  ctx.fillText("STAMINA", bx + 4, by - 7);

  if (hasArmor) {
    const ax = bx + bw + 12;
    const ay = by - 2;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(ctx, ax - 3, ay - 3, 50 + 6, 17 + 6, 6);
    ctx.fill();
    ctx.fillStyle = "#6090c0";
    roundRect(ctx, ax, ay, 50, 17, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    roundRect(ctx, ax, ay, 50, 8, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ARMOR", ax + 25, ay + 12);
  }
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

function spawnDamageNumber(x, y, amount) {
  damageNumbers.push({
    x: x + (Math.random() - 0.5) * 20,
    y: y,
    amount: amount,
    timer: 0,
    duration: 0.8,
    vy: -120,
  });
}

function updateDamageNumbers(dt) {
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const d = damageNumbers[i];
    d.timer += dt;
    d.y += d.vy * dt;
    d.vy += 80 * dt;
    if (d.timer >= d.duration) damageNumbers.splice(i, 1);
  }
}

function drawDamageNumbers(ctx) {
  for (const d of damageNumbers) {
    const alpha = 1 - d.timer / d.duration;
    const scale = 1 + d.timer * 2;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ff4444";
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 3;
    ctx.font = `bold ${Math.round(22 * scale)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(`-${d.amount}`, d.x, d.y);
    ctx.fillText(`-${d.amount}`, d.x, d.y);
    ctx.restore();
  }
}

function shootArrow(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const g = 600;
  const tFlight = Math.max(0.35, Math.min(1.0, dist / 600));
  const vx = dx / tFlight;
  const vy = (dy - 0.5 * g * tFlight * tFlight) / tFlight;

  arrows.push({
    x: fromX,
    y: fromY,
    vx: vx,
    vy: vy,
    gravity: g,
    time: 0,
    maxTime: tFlight + 0.15,
    active: true,
    stuck: false,
    stuckTimer: 0,
    angle: 0,
    trail: [],
  });
}

function updateArrows(dt) {
  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i];
    if (!a.active) { arrows.splice(i, 1); continue; }
    if (a.stuck) {
      a.stuckTimer += dt;
      if (a.stuckTimer > 2.5) { a.active = false; }
      continue;
    }
    a.time += dt;
    a.x += a.vx * dt;
    a.vy += a.gravity * dt;
    a.y += a.vy * dt;
    a.angle = Math.atan2(a.vy, a.vx);
    a.trail.push({ x: a.x, y: a.y, t: 0 });
    if (a.trail.length > 12) a.trail.shift();
    for (const tr of a.trail) tr.t += dt;

    if (scarecrow && !scarecrow.dead && (currentRoom === 2 || currentRoom === 3)) {
      const sx = scarecrow.x, sy = scarecrow.y, sw = scarecrow.w, sh = scarecrow.h;
      if (a.x > sx && a.x < sx + sw && a.y > sy && a.y < sy + sh) {
        const dmg = scarecrow.takeDamage(15);
        if (dmg > 0) spawnDamageNumber(a.x, a.y - 10, dmg);
        a.stuck = true;
        a.vx = 0;
        a.vy = 0;
        if (scarecrow.dead) {
          if (currentRoom === 2) scarecrow2Dead = true;
          if (currentRoom === 3) scarecrow3Dead = true;
          const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
          trainingPhase = "done";
          setTimeout(() => {
            dialogue.show(currentRoom === 3 ? L.bowDone : L.trainingDone);
          }, 300);
        }
        continue;
      }
    }

    if (boss && !boss.dead && currentRoom === 7) {
      const bx = boss.x, by = boss.y, bw = boss.w, bh = boss.h;
      if (a.x > bx && a.x < bx + bw && a.y > by && a.y < by + bh) {
        const dmg = boss.takeDamage(15);
        if (dmg > 0) {
          spawnDamageNumber(a.x, a.y - 10, dmg);
          if (sound) sound.play("sword_hit", 1, 0.5);
          if (boss.dead) {
            bossDefeated = true;
            if (battleMusic) battleMusic.stop();
            setTimeout(() => {
              const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
              dialogue.show(L.bossDefeated);
            }, 1200);
          }
        }
        a.stuck = true;
        a.vx = 0;
        a.vy = 0;
        continue;
      }
    }

    if (a.y >= level.groundY - 2 || a.time >= a.maxTime || a.x < -50 || a.x > W + 50) {
      a.stuck = true;
      a.y = Math.min(a.y, level.groundY - 2);
      a.vx = 0;
      a.vy = 0;
    }
  }
}

function drawArrows(ctx) {
  for (const a of arrows) {
    if (!a.active) continue;

    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < a.trail.length; i++) {
      const tr = a.trail[i];
      const ta = Math.max(0, 0.3 - tr.t * 0.8);
      if (ta <= 0) continue;
      ctx.globalAlpha = ta;
      ctx.fillStyle = "#c8a040";
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);

    ctx.strokeStyle = "#5a3a18";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(14, 0);
    ctx.stroke();

    ctx.strokeStyle = "#7a5428";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-28, 0);
    ctx.stroke();

    ctx.fillStyle = "#c8a848";
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(12, -4);
    ctx.lineTo(10, 0);
    ctx.lineTo(12, 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#b8922e";
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(6, -3);
    ctx.lineTo(4, 0);
    ctx.lineTo(6, 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#d44030";
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-28, -5);
    ctx.lineTo(-26, 0);
    ctx.lineTo(-28, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#a03020";
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.lineTo(-30, -3);
    ctx.lineTo(-32, 0);
    ctx.lineTo(-30, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }
}

function drawTrainingMenu(ctx, W, H) {
  if (!trainingMenuActive) return;
  const L = LANG[menu ? menu.lang : "ro"] || LANG.ro;
  const menuData = currentRoom === 3 ? L.bowMenu : L.trainingMenu;

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, H);

  const mw = 400, mh = 200;
  const mx = (W - mw) / 2, my = (H - mh) / 2;

  ctx.fillStyle = "rgba(15,10,5,0.92)";
  roundRect(ctx, mx, my, mw, mh, 12);
  ctx.fill();
  ctx.strokeStyle = "#b8922e";
  ctx.lineWidth = 2.5;
  roundRect(ctx, mx, my, mw, mh, 12);
  ctx.stroke();

  ctx.fillStyle = "#e8d8a0";
  ctx.font = "bold 24px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(menuData.title, W / 2, my + 40);

  ctx.fillStyle = "#b0a068";
  ctx.font = "16px Georgia, serif";
  ctx.fillText(menuData.instruction, W / 2, my + 85);

  ctx.fillStyle = "#a09060";
  ctx.font = "14px Georgia, serif";
  ctx.fillText(menu.lang === "en" ? "Press [E] to talk to the mannequin" : "Apasa [E] pentru a vorbi cu manechinul", W / 2, my + 120);

  const bw = 140, bh = 42;
  const bx = (W - bw) / 2, by = my + mh - 60;
  const hover = mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh;
  ctx.fillStyle = hover ? "rgba(50,40,20,0.85)" : "rgba(25,20,10,0.75)";
  roundRect(ctx, bx, by, bw, bh, 8);
  ctx.fill();
  ctx.strokeStyle = hover ? "#e8c84a" : "#b8922e";
  ctx.lineWidth = hover ? 2.5 : 1.8;
  roundRect(ctx, bx, by, bw, bh, 8);
  ctx.stroke();
  ctx.fillStyle = hover ? "#fff8e0" : "#e8d8a0";
  ctx.font = "bold 17px Georgia, serif";
  ctx.fillText(menuData.close, W / 2, by + bh / 2 + 1);
}

function drawWallPanel(ctx, x, y, w, h, text) {
  ctx.fillStyle = "#2a1e12";
  ctx.strokeStyle = "#4a3820";
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  roundRect(ctx, x, y, w, h, 6);
  ctx.stroke();

  ctx.fillStyle = "#e8d8a0";
  ctx.font = "bold 16px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2);
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
      trainingMenuActive = false;
      damageNumbers = [];
      arrows = [];
    });
    _pauseBtn(ctx, W/2 - bw/2, H*0.66, bw, bh, L.restart, () => {
      paused = false;
      gameStarted = false;
      dialogue.active = false;
      sneezeTriggered = false;
      currentRoom = 0;
      npcTalked = false;
      scarecrowTalked = false;
      trainingPhase = "none";
      trainingMenuActive = false;
      damageNumbers = [];
      arrows = [];
      bowCooldown = 0;
      inventory = null;
      buildWorld();
      if (inventory) { inventory.hp = 100; inventory.hunger = 100; }
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
