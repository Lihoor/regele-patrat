class Scarecrow {
  constructor(x, groundY, scale) {
    this.w = 108;
    this.bodyH = 115;
    this.h = this.bodyH;
    this.x = x;
    this.y = groundY - this.h;
    this.groundY = groundY;
    this.scale = scale || 1;
    this.time = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.dead = false;
    this.hitFlash = 0;
    this.promptAlpha = 0;
    this.shakeX = 0;
  }

  update(dt, kingX, kingW) {
    this.time += dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.shakeX !== 0) {
      this.shakeX *= 0.85;
      if (Math.abs(this.shakeX) < 0.5) this.shakeX = 0;
    }
    const kcx = kingX + kingW / 2;
    const ncx = this.x + this.w / 2;
    const dist = Math.abs(kcx - ncx);
    const near = dist < 120;
    if (near) this.promptAlpha = Math.min(1, this.promptAlpha + dt * 4);
    else this.promptAlpha = Math.max(0, this.promptAlpha - dt * 3);
  }

  takeDamage(amount) {
    if (this.dead) return 0;
    const actual = Math.min(amount, this.health);
    this.health -= actual;
    this.hitFlash = 0.25;
    this.shakeX = (Math.random() - 0.5) * 14;
    if (this.health <= 0) {
      this.dead = true;
      this.health = 0;
    }
    return actual;
  }

  draw(ctx) {
    const bx = this.x + this.w / 2 + this.shakeX;
    const by = this.y + this.h;
    const s = (this.bodyH / 84) * this.scale;

    this._drawShadow(ctx, bx, this.groundY, s);

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(s, s);

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.5 + Math.sin(this.time * 60) * 0.5;
    }

    const W = 84, B = 84;

    if (this.dead) {
      this._drawDead(ctx, W, B);
    } else {
      const sway = Math.sin(this.time * 2.5) * 2;
      this._drawBody(ctx, W, B, sway);
      this._drawHead(ctx, W, B);
      this._drawArms(ctx, W, B, sway);
      this._drawLegs(ctx);
    }

    ctx.restore();

    if (!this.dead && this.health < this.maxHealth) {
      this._drawHealthBar(ctx, bx, this.y - 12);
    }
  }

  _drawShadow(ctx, bx, gy, sc) {
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.beginPath();
    ctx.ellipse(bx, gy + 2, 36 * sc, 6 * sc, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawBody(ctx, W, B, sway) {
    const g = ctx.createLinearGradient(0, -B + 30, 0, 0);
    g.addColorStop(0, "#c4a44a");
    g.addColorStop(0.5, "#a88a32");
    g.addColorStop(1, "#8a7020");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(60,45,10,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-W / 2 + 4, -B + 36);
    ctx.lineTo(-W / 2 + 2, -4);
    ctx.lineTo(-W / 2 + 8, 0);
    ctx.lineTo(W / 2 - 8, 0);
    ctx.lineTo(W / 2 - 2, -4);
    ctx.lineTo(W / 2 - 4, -B + 36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#6a5418";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const y = -B + 42 + i * 22;
      ctx.beginPath();
      ctx.moveTo(-W / 2 + 8, y + sway * 0.3);
      ctx.lineTo(W / 2 - 8, y + sway * 0.3);
      ctx.stroke();
    }

    ctx.strokeStyle = "#7a6420";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const x = -W / 2 + 14 + i * 20;
      ctx.beginPath();
      ctx.moveTo(x, -B + 36);
      ctx.lineTo(x + sway * 0.2, -4);
      ctx.stroke();
    }

    ctx.fillStyle = "#8a6a20";
    ctx.beginPath();
    ctx.arc(0, -B + 40, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6a5418";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#c8a848";
    ctx.beginPath();
    ctx.moveTo(-3, -B + 34);
    ctx.lineTo(3, -B + 34);
    ctx.lineTo(0, -B + 42);
    ctx.closePath();
    ctx.fill();
  }

  _drawHead(ctx, W, B) {
    const headSize = 52;
    const top = -B - headSize + 10;
    const bot = top + headSize;
    const hw = headSize;

    const g = ctx.createLinearGradient(0, top, 0, bot);
    g.addColorStop(0, "#c4a44a");
    g.addColorStop(1, "#a08830");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(60,45,10,0.5)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-hw / 2 + 10, top + 6);
    ctx.quadraticCurveTo(-hw / 2, top + 2, -hw / 2 + 4, top - 6);
    ctx.lineTo(0, top - 10);
    ctx.lineTo(hw / 2 - 4, top - 6);
    ctx.quadraticCurveTo(hw / 2, top + 2, hw / 2 - 10, top + 6);
    ctx.lineTo(hw / 2 - 2, bot - 8);
    ctx.arcTo(hw / 2, bot, hw / 2 - 6, bot, 6);
    ctx.lineTo(-hw / 2 + 6, bot);
    ctx.arcTo(-hw / 2, bot, -hw / 2, bot - 8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#7a6420";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-hw / 2 + 12, top + 16);
    ctx.lineTo(-6, top + 10);
    ctx.lineTo(-6, top + 20);
    ctx.moveTo(-6, top + 10);
    ctx.lineTo(6, top + 20);
    ctx.lineTo(6, top + 10);
    ctx.lineTo(hw / 2 - 12, top + 16);
    ctx.stroke();

    ctx.strokeStyle = "#5a4418";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, top + 30);
    ctx.lineTo(4, top + 30);
    ctx.moveTo(-4, top + 30);
    ctx.lineTo(-6, top + 32);
    ctx.moveTo(4, top + 30);
    ctx.lineTo(6, top + 32);
    ctx.stroke();

    ctx.strokeStyle = "#7a6420";
    ctx.lineWidth = 1;
    const strawLen = 8;
    for (let i = 0; i < 5; i++) {
      const angle = -0.6 + i * 0.3;
      const sx = -hw / 2 + 6 + i * 10;
      ctx.beginPath();
      ctx.moveTo(sx, top - 6);
      ctx.lineTo(sx + Math.cos(angle) * strawLen, top - 6 - Math.abs(Math.sin(angle)) * strawLen);
      ctx.stroke();
    }
  }

  _drawArms(ctx, W, B, sway) {
    ctx.strokeStyle = "#a08830";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-W / 2 + 4, -B + 48);
    ctx.lineTo(-W / 2 - 18, -B + 58 + sway);
    ctx.lineTo(-W / 2 - 24, -B + 72 + sway);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(W / 2 - 4, -B + 48);
    ctx.lineTo(W / 2 + 18, -B + 58 + sway);
    ctx.lineTo(W / 2 + 24, -B + 72 + sway);
    ctx.stroke();

    ctx.strokeStyle = "#7a6420";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const t = (i + 1) / 4;
      const lx = -W / 2 - 4 - t * 20;
      const ly = -B + 52 + t * 20 + sway * t;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + (Math.random() - 0.5) * 6, ly + 8);
      ctx.stroke();

      const rx = W / 2 + 4 + t * 20;
      ctx.beginPath();
      ctx.moveTo(rx, ly);
      ctx.lineTo(rx + (Math.random() - 0.5) * 6, ly + 8);
      ctx.stroke();
    }
  }

  _drawLegs(ctx) {
    ctx.fillStyle = "#8a7020";
    ctx.strokeStyle = "rgba(60,45,10,0.4)";
    ctx.lineWidth = 1.5;

    ctx.fillRect(-16, -14, 12, 14);
    ctx.strokeRect(-16, -14, 12, 14);
    ctx.fillRect(4, -14, 12, 14);
    ctx.strokeRect(4, -14, 12, 14);

    ctx.fillStyle = "#7a6420";
    ctx.fillRect(-18, -2, 16, 2);
    ctx.fillRect(2, -2, 16, 2);
  }

  _drawDead(ctx, W, B) {
    ctx.globalAlpha = 0.6;

    ctx.fillStyle = "#a08830";
    ctx.strokeStyle = "rgba(60,45,10,0.4)";
    ctx.lineWidth = 2;

    ctx.save();
    ctx.translate(-8, -8);
    ctx.rotate(0.3);
    ctx.beginPath();
    ctx.ellipse(0, -20, 22, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#8a7020";
    ctx.fillRect(-W / 2 + 10, -10, W - 20, 10);

    ctx.strokeStyle = "#6a5418";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-W / 2 + 14, -6);
    ctx.lineTo(W / 2 - 14, -6);
    ctx.stroke();
  }

  _drawHealthBar(ctx, cx, y) {
    const bw = 70, bh = 8;
    const bx = cx - bw / 2;
    const p = Math.max(0, this.health / this.maxHealth);

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.roundRect(bx - 2, y - 2, bw + 4, bh + 4, 4);
    ctx.fill();

    ctx.fillStyle = p > 0.3 ? "#c8a830" : "#e05030";
    if (p > 0.01) {
      ctx.beginPath();
      ctx.roundRect(bx, y, bw * p, bh, 3);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    if (p > 0.01) {
      ctx.beginPath();
      ctx.roundRect(bx, y, bw * p, bh * 0.45, 3);
      ctx.fill();
    }
  }
}
