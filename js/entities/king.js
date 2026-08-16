class King {
  constructor(level, width) {
    this.w = 84;
    this.bodyH = 84;
    this.crownH = 18;
    this.h = this.bodyH + this.crownH;
    this.x = (width - this.w) / 2;
    this.y = level.groundY - this.h;
    this.vy = 0;
    this.onGround = true;
    this.speed = 380;
    this.jumpV = -800;
    this.gravity = 1750;
    this.facing = 1;
    this.moving = false;
    this.time = 0;
    this.squashT = 0;
  }

  update(dt, input, level, fx) {
    this.moving = false;
    if (input.left) {
      this.x -= this.speed * dt;
      this.facing = -1;
      this.moving = true;
    }
    if (input.right) {
      this.x += this.speed * dt;
      this.facing = 1;
      this.moving = true;
    }
    this.x = Math.max(0, Math.min(level.width - this.w, this.x));

    if (input.consumeJump()) this.jump();

    this.vy += this.gravity * dt;
    this.y += this.vy * dt;

    if (this.y + this.h >= level.groundY) {
      this.y = level.groundY - this.h;
      if (!this.onGround && fx) fx.burst(this.x + this.w / 2, level.groundY, 7);
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

    const air = !this.onGround;
    let sx = 1, sy = 1, bob = 0;

    if (air) {
      const k = Math.min(1, Math.abs(this.vy) / 2200);
      sy = 1 + k * 0.16;
      sx = 1 - k * 0.12;
    } else if (this.squashT > 0) {
      const k = Math.max(0, this.squashT / 0.14);
      sy = 1 - k * 0.18;
      sx = 1 + k * 0.16;
    } else {
      bob = this.moving ? Math.abs(Math.sin(this.time * 12)) * 3 : Math.sin(this.time * 3) * 1.3;
    }

    const flutter = air ? Math.sin(this.time * 10) * 3 : Math.sin(this.time * 6) * 1.8;
    const rot = air ? this.clamp(this.vy * 0.00006, -0.05, 0.05) : 0;

    const hAir = Math.max(0, level.groundY - by);
    const sk = this.clamp(1 - hAir / 320, 0.25, 1);

    this.drawShadow(ctx, bx, level.groundY, sk);

    ctx.save();
    ctx.translate(bx, by - bob);
    ctx.rotate(rot);

    const W = this.w;
    const B = this.bodyH;

    this.drawCape(ctx, W, B, flutter);
    this.drawHead(ctx, W, B);
    this.drawCrown(ctx, W, B);

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

    const g = ctx.createLinearGradient(0, -B, 0, 0);
    g.addColorStop(0, "#6a141a");
    g.addColorStop(1, "#2f080b");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(-W / 2 + 8, -B + 6);
    ctx.lineTo(-W / 2 - 14, -B + 12);
    ctx.quadraticCurveTo(-W / 2 - 20, -B + 30 + flutter, -W / 2 - 15, -B + 44);
    ctx.lineTo(-W / 2 - 12, -10);

    let x = -W / 2 - 12;
    while (x < W / 2 - 12) {
      x = Math.min(x + 7, W / 2 - 4);
      ctx.lineTo(x, -15);
      x = Math.min(x + 7, W / 2 - 4);
      ctx.lineTo(x, -9);
    }

    ctx.lineTo(W / 2 + 15, -B + 44);
    ctx.quadraticCurveTo(W / 2 + 20, -B + 30 + flutter, W / 2 + 14, -B + 12);
    ctx.lineTo(W / 2 - 8, -B + 6);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(-W / 2 - 14, -B + 12, 4, B * 0.55);

    ctx.restore();
  }

  drawHead(ctx, W, B) {
    const faceGrad = ctx.createLinearGradient(0, -B, 0, 0);
    faceGrad.addColorStop(0, "#dcb894");
    faceGrad.addColorStop(0.6, "#c49b76");
    faceGrad.addColorStop(1, "#a57954");
    ctx.fillStyle = faceGrad;
    ctx.strokeStyle = "rgba(40,26,15,0.7)";
    ctx.lineWidth = 2;

    this.roundRect(ctx, -W / 2, -B, W, B, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(-W / 2, -B, W, 14);
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(-W / 2, -B + 14, 7, B - 21);
    ctx.fillRect(W / 2 - 7, -B + 14, 7, B - 21);

    ctx.fillStyle = "#2e2419";
    this.roundRect(ctx, -W / 2, -B + 2, 11, B - 6, 5);
    ctx.fill();
    this.roundRect(ctx, W / 2 - 11, -B + 2, 11, B - 6, 5);
    ctx.fill();
    this.roundRect(ctx, -W / 2 + 2, -B, W - 4, 13, 6);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,200,140,0.15)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const hy = -B + 18 + i * 10;
      ctx.moveTo(-W / 2 + 3, hy);
      ctx.lineTo(-W / 2 + 9, hy - 4);
      ctx.moveTo(W / 2 - 3, hy);
      ctx.lineTo(W / 2 - 9, hy - 4);
    }
    ctx.stroke();

    ctx.fillStyle = "#c9a37f";
    ctx.beginPath();
    ctx.arc(-W / 2 + 1, -50, 5, 0, Math.PI * 2);
    ctx.arc(W / 2 - 1, -50, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.arc(-W / 2 + 1, -49, 2.4, 0, Math.PI * 2);
    ctx.arc(W / 2 - 1, -49, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#241f1b";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-26, -62);
    ctx.quadraticCurveTo(-18, -56, -7, -58);
    ctx.moveTo(26, -62);
    ctx.quadraticCurveTo(18, -56, 7, -58);
    ctx.stroke();

    for (const ex of [-16, 16]) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(ex, -52, 6, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5c6f8a";
      ctx.beginPath();
      ctx.arc(ex, -51.5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#14161a";
      ctx.beginPath();
      ctx.arc(ex, -51.5, 1.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex - 1, -52.8, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(30,26,22,0.8)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ex - 6, -54);
      ctx.quadraticCurveTo(ex, -57, ex + 6, -54);
      ctx.stroke();
    }

    ctx.strokeStyle = "#9a7a5c";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-2, -58);
    ctx.lineTo(-1, -42);
    ctx.stroke();
    ctx.fillStyle = "rgba(90,60,40,0.28)";
    ctx.beginPath();
    ctx.arc(3, -41, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.ellipse(-22, -44, 5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(22, -44, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(110,104,94,0.55)";
    this.roundRect(ctx, -17, -34, 34, 34, 9);
    ctx.fill();
    ctx.strokeStyle = "rgba(95,88,78,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const bx = -15 + i * 5;
      ctx.moveTo(bx, -30);
      ctx.lineTo(bx + 2, -4);
    }
    ctx.stroke();

    ctx.strokeStyle = "#5a4636";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-12, -26);
    ctx.quadraticCurveTo(0, -32, 12, -26);
    ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(-W / 2 + 8, -8, W - 16, 8);
  }

  drawCrown(ctx, W, B) {
    const cw = 42;
    const bandY = -B;

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
