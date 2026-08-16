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

    ctx.save();
    ctx.scale(this.facing, 1);
    this.drawHead(ctx, W, B);
    this.drawClothes(ctx, W, B);
    this.drawCrown(ctx, W, B);
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
    const hw = 84;
    const hh = 44;
    const top = -B;
    const bot = top + hh;

    const faceGrad = ctx.createLinearGradient(0, top, 0, bot);
    faceGrad.addColorStop(0, "#dcb894");
    faceGrad.addColorStop(1, "#b18963");
    ctx.fillStyle = faceGrad;
    ctx.strokeStyle = "rgba(40,26,15,0.6)";
    ctx.lineWidth = 2;

    this.roundRect(ctx, -hw / 2, top, hw, hh, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#b18963";
    ctx.fillRect(-13, bot - 6, 26, 10);

    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(-hw / 2, top, hw, 6);

    ctx.fillStyle = "#3a2c1f";
    ctx.beginPath();
    ctx.moveTo(-hw / 2, bot - 6);
    ctx.lineTo(-hw / 2, top);
    ctx.lineTo(28, top);
    ctx.quadraticCurveTo(42, top, 42, top + 6);
    ctx.lineTo(36, top + 11);
    ctx.quadraticCurveTo(18, top + 9, 2, top + 10);
    ctx.lineTo(-28, top + 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#c9a37f";
    ctx.beginPath();
    ctx.arc(-hw / 2 + 2, top + 22, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.arc(-hw / 2 + 2, top + 23, 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#241f1b";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(10, top + 14);
    ctx.quadraticCurveTo(16, top + 15.5, 23, top + 14);
    ctx.moveTo(-12, top + 15);
    ctx.quadraticCurveTo(-8, top + 16.5, -5, top + 15);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(16, top + 22, 6.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5c6f8a";
    ctx.beginPath();
    ctx.arc(18, top + 22, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#14161a";
    ctx.beginPath();
    ctx.arc(18, top + 22, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(17, top + 21, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(30,26,22,0.8)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(9, top + 19);
    ctx.quadraticCurveTo(16, top + 16, 23, top + 19);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-8, top + 23, 3.2, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5c6f8a";
    ctx.beginPath();
    ctx.arc(-8, top + 23, 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#14161a";
    ctx.beginPath();
    ctx.arc(-8, top + 23, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(30,26,22,0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-11, top + 20);
    ctx.quadraticCurveTo(-8, top + 18, -5, top + 20);
    ctx.stroke();

    ctx.strokeStyle = "#9a7a5c";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-4, top + 18);
    ctx.quadraticCurveTo(12, top + 18, 20, top + 24);
    ctx.quadraticCurveTo(26, top + 27, 26, top + 31);
    ctx.lineTo(21, top + 31);
    ctx.stroke();
    ctx.fillStyle = "rgba(90,60,40,0.28)";
    ctx.beginPath();
    ctx.arc(23, top + 31, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.beginPath();
    ctx.ellipse(14, top + 34, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#5a4636";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(8, top + 37);
    ctx.quadraticCurveTo(15, top + 39, 23, top + 37);
    ctx.stroke();

    ctx.fillStyle = "#3a2c1f";
    ctx.beginPath();
    ctx.moveTo(-28, top + 11);
    ctx.quadraticCurveTo(-12, top + 5, 8, top + 7);
    ctx.quadraticCurveTo(22, top + 8, 28, top + 9);
    ctx.lineTo(31, top + 16);
    ctx.lineTo(25, top + 10);
    ctx.lineTo(21, top + 17);
    ctx.lineTo(15, top + 10);
    ctx.lineTo(10, top + 16);
    ctx.lineTo(5, top + 10);
    ctx.lineTo(-4, top + 12);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255,200,140,0.18)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-hw / 2 + 4, top + 4);
    ctx.quadraticCurveTo(0, top - 1, 30, top + 3);
    ctx.stroke();
  }

  drawClothes(ctx, W, B) {
    const top = -B + 44;
    const ch = 40;

    const tun = ctx.createLinearGradient(0, top, 0, 0);
    tun.addColorStop(0, "#512f63");
    tun.addColorStop(1, "#2c1838");
    ctx.fillStyle = tun;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;

    this.roundRect(ctx, -42, top, 84, ch, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#b18963";
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.lineTo(-13, top + 13);
    ctx.lineTo(13, top + 13);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#e0b83c";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.lineTo(-13, top + 13);
    ctx.moveTo(0, top);
    ctx.lineTo(13, top + 13);
    ctx.stroke();

    ctx.fillStyle = "#e0b83c";
    ctx.beginPath();
    ctx.arc(0, top + 22, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "#a8872c";
    ctx.beginPath();
    ctx.arc(0, top + 22, 3.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3c2f22";
    ctx.fillRect(-42, top + 25, 84, 6);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(-42, top + 25, 84, 1.6);

    ctx.fillStyle = "#d9b23a";
    this.roundRect(ctx, -6, top + 23.5, 12, 9, 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1;
    this.roundRect(ctx, -6, top + 23.5, 12, 9, 2);
    ctx.stroke();
    ctx.fillStyle = "#5d3d12";
    ctx.fillRect(-2.5, top + 26.5, 5, 3);

    ctx.fillStyle = "#e0b83c";
    ctx.fillRect(-42, top + 34, 84, 2.5);

    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(-42, top + 2, 84, 3);
  }

  drawCrown(ctx, W, B) {
    const cw = 44;
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
