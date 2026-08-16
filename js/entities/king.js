class King {
  constructor(level, width) {
    this.w = 108;
    this.bodyH = 108;
    this.crownH = 23;
    this.h = this.bodyH + this.crownH;
    this.x = (width - this.w) / 2;
    this.y = level.groundY - this.h;
    this.vy = 0;
    this.onGround = true;
    this.speed = 300;
    this.jumpV = -800;
    this.gravity = 1750;
    this.facing = 1;
    this.moving = false;
    this.sprinting = false;
    this.stamina = 100;
    this.sprintBlocked = false;
    this.stepAcc = 0;
    this.sound = null;
    this.heldItem = null;
    this.time = 0;
    this.squashT = 0;
    this.walkT = 0;
    this.sleeping = false;
    this.sleepTimer = 0;
    this.sleepProgress = 1;
    this.onWakeUp = null;
    this.sneezing = false;
    this.sneezeTimer = 0;
  }

  update(dt, input, level, fx) {
    if (this.sleeping) {
      this.sleepTimer += dt;
      if (this.sleepTimer < 1.0) {
        this.sleepProgress = 0;
      } else if (this.sleepTimer < 1.8) {
        this.sleepProgress = (this.sleepTimer - 1.0) / 0.8;
      } else {
        this.sleepProgress = 1;
        this.sleeping = false;
        if (this.onWakeUp) this.onWakeUp();
      }
      this.time += dt;
      return;
    }

    if (this.sneezing) {
      this.sneezeTimer += dt;
      if (this.sneezeTimer > 0.6) { this.sneezing = false; this.sneezeTimer = 0; }
      this.time += dt;
      return;
    }

    this.moving = input.left || input.right;

    this.sprinting = this.moving && input.sprint && this.stamina > 0 && !this.sprintBlocked;
    if (this.sprinting) {
      this.stamina = Math.max(0, this.stamina - 40 * dt);
      if (this.stamina <= 0) this.sprintBlocked = true;
    } else {
      this.stamina = Math.min(100, this.stamina + 16 * dt);
      if (this.stamina >= 35) this.sprintBlocked = false;
    }

    const speed = this.sprinting ? this.speed * 1.7 : this.speed;

    if (input.left) {
      this.x -= speed * dt;
      this.facing = -1;
    }
    if (input.right) {
      this.x += speed * dt;
      this.facing = 1;
    }
    this.x = Math.max(0, Math.min(level.width - this.w, this.x));

    if (this.moving) this.walkT += dt * (this.sprinting ? 14.5 : 11);
    else this.walkT = 0;

    if (this.moving) {
      this.stepAcc += speed * dt;
      const stride = this.sprinting ? 170 : 135;
      if (this.stepAcc >= stride) {
        this.stepAcc -= stride;
        if (this.sound) this.sound.footstep(this.sprinting);
      }
    } else {
      this.stepAcc = 0;
    }

    if (input.consumeJump()) this.jump();

    this.vy += this.gravity * dt;
    this.y += this.vy * dt;

    if (this.y + this.h >= level.groundY) {
      const wasAir = !this.onGround;
      this.y = level.groundY - this.h;
      if (wasAir && fx) fx.burst(this.x + this.w / 2, level.groundY, 7);
      this.vy = 0;
      this.onGround = true;
      this.squashT = 0.14;
    } else {
      this.onGround = false;
    }

    if (this.squashT > 0) this.squashT -= dt;

    this.time += dt;
  }

  jump() {
    if (this.onGround) {
      this.vy = this.jumpV;
      this.onGround = false;
    }
  }

  draw(ctx, level) {
    const bx = this.x + this.w / 2;
    const by = this.y + this.h;

    if (this.sleeping || this.sleepProgress < 1) {
      const p = this.sleepProgress;
      const sleepRot = (1 - p) * 0.22;
      const sleepLean = (1 - p) * 12;
      const sk = this.clamp(1, 0.25, 1);
      this.drawShadow(ctx, bx, level.groundY, sk);
      const s = this.bodyH / 84;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(sleepRot);
      ctx.scale(s, s);
      const W = 84, B = 84;
      const flutter = Math.sin(this.time * 4) * 1.5;
      this.drawCape(ctx, W, B, flutter);
      ctx.save();
      ctx.scale(this.facing, 1);
      this.drawHead(ctx, W, B, true, sleepLean);
      this.drawClothes(ctx, W, B);
      this.drawLegs(ctx, 0);
      this.drawCrown(ctx, W, B, sleepLean);
      ctx.restore();
      ctx.restore();

      if (p === 0) {
        ctx.save();
        const zt = this.time * 1.2;
        for (let i = 0; i < 3; i++) {
          const phase = (zt + i * 1.1) % 3.3;
          const za = phase < 2.5 ? Math.min(1, phase * 0.8) * (1 - (phase - 1.8) / 0.7) : 0;
          if (za <= 0) continue;
          const zx = bx + 30 + i * 14 + Math.sin(zt * 2 + i) * 5;
          const zy = by - 60 - phase * 28;
          ctx.fillStyle = `rgba(200,190,150,${(za * 0.6).toFixed(2)})`;
          ctx.font = `bold ${11 + i * 2}px Georgia, serif`;
          ctx.textAlign = "center";
          ctx.fillText("z", zx, zy);
        }
        ctx.restore();
      }

      return;
    }

    if (this.sneezing) {
      const sp = Math.min(1, this.sneezeTimer / 0.6);
      const shake = sp < 0.5 ? Math.sin(sp * Math.PI * 8) * 5 : 0;
      const leanBack = sp < 0.35 ? sp / 0.35 * 0.18 : Math.max(0, (0.6 - sp) / 0.25) * 0.18;
      const sk = this.clamp(1, 0.25, 1);
      this.drawShadow(ctx, bx, level.groundY, sk);
      const s = this.bodyH / 84;
      ctx.save();
      ctx.translate(bx + shake, by);
      ctx.rotate(-leanBack);
      ctx.scale(s, s);
      const W = 84, B = 84;
      const flutter = Math.sin(this.time * 8) * 3;
      this.drawCape(ctx, W, B, flutter);
      ctx.save();
      ctx.scale(this.facing, 1);
      this.drawHead(ctx, W, B, false, 0);
      this.drawClothes(ctx, W, B);
      this.drawLegs(ctx, 0);
      this.drawCrown(ctx, W, B, 0);
      ctx.restore();
      ctx.restore();
      return;
    }

    const air = !this.onGround;
    let bob = 0;
    if (this.moving) bob = Math.abs(Math.sin(this.walkT)) * 3.5 * (this.sprinting ? 1.5 : 1);

    const flutter = air ? Math.sin(this.time * 10) * 3 : Math.sin(this.time * 6) * 1.8;

    let rot = 0;
    if (air) {
      rot = this.clamp(this.vy * 0.00006, -0.05, 0.05);
    } else if (this.moving) {
      rot = Math.sin(this.walkT) * 0.02 * (this.sprinting ? 1.6 : 1);
    }

    const hAir = Math.max(0, level.groundY - by);
    const sk = this.clamp(1 - hAir / 320, 0.25, 1);

    this.drawShadow(ctx, bx, level.groundY, sk);

    const s = this.bodyH / 84;
    const leg = this.moving ? Math.sin(this.walkT) : 0;

    ctx.save();
    ctx.translate(bx, by - bob);
    ctx.rotate(rot);
    ctx.scale(s, s);

    const W = 84;
    const B = 84;

    this.drawCape(ctx, W, B, flutter);

    ctx.save();
    ctx.scale(this.facing, 1);
    this.drawHead(ctx, W, B);
    this.drawClothes(ctx, W, B);
    this.drawLegs(ctx, leg);
    this.drawCrown(ctx, W, B);

    if (this.heldItem === "sword") {
      const handX = 38;
      const handY = -28;
      const swing = this.moving ? Math.sin(this.walkT) * 0.12 : 0;
      drawSword(ctx, handX, handY, 1.1, -0.25 + swing);
    }

    ctx.restore();

    ctx.restore();
  }

  drawShadow(ctx, cx, cy, k) {
    const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, this.w * 0.62 * k);
    g.addColorStop(0, `rgba(0,0,0,${0.5 * k})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, this.w * 0.62 * k, this.w * 0.17 * k, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCape(ctx, W, B, flutter) {
    const backOff = -this.facing * 18;

    ctx.save();
    ctx.translate(backOff, 0);

    const time = this.time;
    const moving = this.moving;
    const amp = (moving ? 4 : 2) + Math.abs(flutter);
    const sway = Math.sin(time * 5.5) * (moving ? 4 : 2.2);
    const shY = -B + 44;

    const g = ctx.createLinearGradient(0, shY, 0, -4);
    g.addColorStop(0, "#7d1c22");
    g.addColorStop(0.5, "#551018");
    g.addColorStop(1, "#2c070a");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1.5;

    const x0 = -W / 2 - 14;
    const x1 = W / 2 + 14;
    const segs = 8;

    ctx.beginPath();
    ctx.moveTo(-W / 2 + 6, shY - 4);
    ctx.quadraticCurveTo(x0, shY + 10, x0 + 3, -16 + sway);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const x = x0 + t * (x1 - x0);
      const y = -16 + Math.sin(time * 7 + i * 1.5) * amp + sway * (1 - Math.abs(t - 0.5) * 1.4);
      ctx.lineTo(x, y);
    }
    ctx.quadraticCurveTo(x1, shY + 10, W / 2 - 6, shY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1.2;
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const x = x0 + t * (x1 - x0);
      const y = -16 + Math.sin(time * 7 + i * 1.5) * amp + sway * (1 - Math.abs(t - 0.5) * 1.4);
      ctx.beginPath();
      ctx.moveTo(x, shY + 2);
      ctx.lineTo(x, y - 8);
      ctx.stroke();
    }

    ctx.fillStyle = "#eae2d2";
    ctx.beginPath();
    ctx.moveTo(-26, shY - 4);
    ctx.quadraticCurveTo(-18, shY - 10, -6, shY - 6);
    ctx.quadraticCurveTo(2, shY - 12, 10, shY - 6);
    ctx.quadraticCurveTo(20, shY - 10, 26, shY - 4);
    ctx.quadraticCurveTo(14, shY + 2, 6, shY - 1);
    ctx.quadraticCurveTo(0, shY + 3, -6, shY - 1);
    ctx.quadraticCurveTo(-14, shY + 2, -26, shY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  drawHead(ctx, W, B, closed, lean) {
    lean = lean || 0;
    const hw = 84;
    const hh = 44;
    const top = -B + lean;
    const bot = top + hh;

    const faceGrad = ctx.createLinearGradient(0, top, 0, bot);
    faceGrad.addColorStop(0, "#e2c19e");
    faceGrad.addColorStop(1, "#b18963");
    ctx.fillStyle = faceGrad;
    ctx.strokeStyle = "rgba(40,26,15,0.6)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-hw / 2 + 14, top);
    ctx.lineTo(hw / 2 - 14, top);
    ctx.arcTo(hw / 2, top, hw / 2, top + 14, 14);
    ctx.lineTo(hw / 2, bot - 7);
    ctx.arcTo(hw / 2, bot, hw / 2 - 7, bot, 7);
    ctx.lineTo(-hw / 2 + 7, bot);
    ctx.arcTo(-hw / 2, bot, -hw / 2, bot - 7, 7);
    ctx.lineTo(-hw / 2, top + 14);
    ctx.arcTo(-hw / 2, top, -hw / 2 + 14, top, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#b18963";
    ctx.fillRect(-13, bot - 6, 26, 10);

    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(-hw / 2, top, hw, 6);

    ctx.fillStyle = "#33281c";
    ctx.beginPath();
    ctx.moveTo(-hw / 2, bot - 7);
    ctx.lineTo(-hw / 2, top - 1);
    ctx.quadraticCurveTo(-26, top - 4, -6, top - 2);
    ctx.lineTo(24, top - 2);
    ctx.quadraticCurveTo(38, top - 1, 40, top + 6);
    ctx.lineTo(36, top + 12);
    ctx.quadraticCurveTo(20, top + 9, 0, top + 11);
    ctx.lineTo(-26, top + 11);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(30, top + 8);
    ctx.lineTo(35, top + 15);
    ctx.lineTo(39, top + 8);
    ctx.moveTo(16, top + 10);
    ctx.lineTo(22, top + 17);
    ctx.lineTo(28, top + 10);
    ctx.moveTo(2, top + 11);
    ctx.lineTo(8, top + 16);
    ctx.lineTo(13, top + 11);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255,200,140,0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw / 2 + 5, top + 3);
    ctx.quadraticCurveTo(0, top - 2, 34, top + 3);
    ctx.stroke();

    ctx.fillStyle = "#c9a37f";
    ctx.beginPath();
    ctx.arc(-hw / 2 + 2, top + 22, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.arc(-hw / 2 + 2, top + 23, 2.6, 0, Math.PI * 2);
    ctx.fill();

    if (closed) {
      ctx.strokeStyle = "#1f1a16";
      ctx.lineWidth = 2.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(7, top + 23);
      ctx.quadraticCurveTo(13, top + 19.5, 19, top + 23);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-7, top + 23);
      ctx.quadraticCurveTo(-13, top + 19.5, -19, top + 23);
      ctx.stroke();
    } else {
    ctx.strokeStyle = "#1f1a16";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(8, top + 19);
    ctx.quadraticCurveTo(13, top + 16.5, 20, top + 17.5);
    ctx.moveTo(-8, top + 19);
    ctx.quadraticCurveTo(-13, top + 16.5, -20, top + 17.5);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(8, top + 22.5);
    ctx.quadraticCurveTo(13, top + 20, 18, top + 22.5);
    ctx.quadraticCurveTo(13, top + 25, 8, top + 22.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5c6f8a";
    ctx.beginPath();
    ctx.arc(13, top + 22.5, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#14161a";
    ctx.beginPath();
    ctx.arc(13, top + 22.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(12, top + 21.5, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(30,26,22,0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(8, top + 22.5);
    ctx.quadraticCurveTo(13, top + 20, 18, top + 22.5);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(-8, top + 22.5);
    ctx.quadraticCurveTo(-13, top + 20, -18, top + 22.5);
    ctx.quadraticCurveTo(-13, top + 25, -8, top + 22.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5c6f8a";
    ctx.beginPath();
    ctx.arc(-13, top + 22.5, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#14161a";
    ctx.beginPath();
    ctx.arc(-13, top + 22.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-14, top + 21.5, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(30,26,22,0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-8, top + 22.5);
    ctx.quadraticCurveTo(-13, top + 20, -18, top + 22.5);
    ctx.stroke();
    }

    ctx.strokeStyle = "rgba(125,95,67,0.7)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, top + 14);
    ctx.lineTo(0, top + 22);
    ctx.stroke();
    ctx.fillStyle = "rgba(125,95,67,0.35)";
    ctx.beginPath();
    ctx.ellipse(0, top + 25, 2.4, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(90,60,40,0.45)";
    ctx.beginPath();
    ctx.arc(-2.4, top + 25, 1.1, 0, Math.PI * 2);
    ctx.arc(2.4, top + 25, 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.beginPath();
    ctx.ellipse(-15, top + 29, 7, 3.4, 0, 0, Math.PI * 2);
    ctx.ellipse(15, top + 29, 7, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.09)";
    ctx.beginPath();
    ctx.ellipse(0, top + 35, 13, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#33271e";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6, top + 37.5);
    ctx.lineTo(6, top + 37.5);
    ctx.moveTo(-6, top + 37.5);
    ctx.lineTo(-8, top + 38);
    ctx.moveTo(6, top + 37.5);
    ctx.lineTo(8, top + 38);
    ctx.stroke();
  }

  drawClothes(ctx, W, B) {
    const top = -B + 44;
    const ch = 40;

    const sk = ctx.createLinearGradient(0, top + 20, 0, 0);
    sk.addColorStop(0, "#4a111a");
    sk.addColorStop(1, "#26060a");
    ctx.fillStyle = sk;
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -42, top + 20, 84, 20, 5);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#e0b83c";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-14, top + 24);
    ctx.lineTo(-14, top + 37);
    ctx.moveTo(14, top + 24);
    ctx.lineTo(14, top + 37);
    ctx.stroke();

    ctx.fillStyle = "#e0b83c";
    ctx.fillRect(-42, top + 36, 84, 2.5);

    const mg = ctx.createLinearGradient(0, top, 0, top + 26);
    mg.addColorStop(0, "#4a4a54");
    mg.addColorStop(1, "#1e1e26");
    ctx.fillStyle = mg;
    ctx.strokeStyle = "rgba(0,0,0,0.75)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -42, top, 84, 26, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#b18963";
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.lineTo(-12, top + 9);
    ctx.lineTo(12, top + 9);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#e0b83c";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.lineTo(-12, top + 9);
    ctx.moveTo(0, top);
    ctx.lineTo(12, top + 9);
    ctx.stroke();

    ctx.fillStyle = "#5a5a66";
    ctx.strokeStyle = "#e0b83c";
    ctx.lineWidth = 1.6;
    this.roundRect(ctx, -42, top - 2, 14, 13, 5);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, 28, top - 2, 14, 13, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    this.roundRect(ctx, -40, top, 7, 7, 3);
    ctx.fill();
    this.roundRect(ctx, 33, top, 7, 7, 3);
    ctx.fill();

    ctx.fillStyle = "#e0b83c";
    ctx.beginPath();
    ctx.arc(0, top + 15, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#7d6114";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "#a8872c";
    ctx.beginPath();
    ctx.arc(0, top + 15, 3.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2a1c12";
    ctx.fillRect(-42, top + 24, 84, 6);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(-42, top + 24, 84, 1.5);

    ctx.fillStyle = "#d9b23a";
    this.roundRect(ctx, -6, top + 23, 12, 8, 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1;
    this.roundRect(ctx, -6, top + 23, 12, 8, 2);
    ctx.stroke();
    ctx.fillStyle = "#5d3d12";
    ctx.fillRect(-2.5, top + 26, 5, 2.5);

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(-6, -1);
    ctx.lineTo(-4, -16);
    ctx.quadraticCurveTo(0, -19, 4, -16);
    ctx.lineTo(6, -1);
    ctx.quadraticCurveTo(0, 1, -6, -1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawLegs(ctx, leg) {
    const a = leg;
    this.drawLeg(ctx, -13, -a * 5, a * 0.07, 0.9, true);
    this.drawLeg(ctx, 13, a * 5, -a * 0.07, 1, false);
  }

  drawLeg(ctx, cx, stride, rot, sc, far) {
    ctx.save();
    ctx.translate(cx + stride, -16);
    ctx.rotate(rot);
    ctx.scale(sc, sc);
    ctx.fillStyle = far ? "#23232b" : "#303038";
    this.roundRect(ctx, -8, -6, 16, 13, 5);
    ctx.fill();
    ctx.fillStyle = far ? "#1b1b21" : "#24242b";
    this.roundRect(ctx, -8, 4, 16, 7, 3);
    ctx.fill();
    ctx.fillStyle = far ? "#14141a" : "#19191f";
    this.roundRect(ctx, -9, 8, 19, 9, 3);
    ctx.fill();
    ctx.fillStyle = "#c9a227";
    this.roundRect(ctx, -9, 14, 19, 2.5, 1);
    ctx.fill();
    ctx.fillStyle = "#d9b23a";
    ctx.fillRect(-8, 4, 16, 1.2);
    ctx.restore();
  }

  drawCrown(ctx, W, B, lean) {
    lean = lean || 0;
    const cw = 44;
    const bandY = -B + lean;

    const g = ctx.createLinearGradient(0, bandY - 18, 0, bandY);
    g.addColorStop(0, "#d8b04a");
    g.addColorStop(1, "#9a7620");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#6b5313";
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(-cw / 2 + 2, bandY);
    ctx.lineTo(-cw / 2 + 6, bandY - 15);
    ctx.lineTo(-cw / 2 + 12, bandY - 3);
    ctx.lineTo(-3, bandY - 3);
    ctx.lineTo(0, bandY - 18);
    ctx.lineTo(3, bandY - 3);
    ctx.lineTo(cw / 2 - 12, bandY - 3);
    ctx.lineTo(cw / 2 - 6, bandY - 15);
    ctx.lineTo(cw / 2 - 2, bandY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#b58d26";
    ctx.fillRect(-cw / 2, bandY, cw, 5);
    ctx.strokeRect(-cw / 2, bandY, cw, 5);

    ctx.fillStyle = "#d93636";
    ctx.beginPath();
    ctx.arc(0, bandY + 2.5, 2.4, 0, Math.PI * 2);
    ctx.arc(-cw / 2 + 10, bandY - 9, 1.6, 0, Math.PI * 2);
    ctx.arc(cw / 2 - 10, bandY - 9, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(-0.7, bandY + 1.6, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
}
