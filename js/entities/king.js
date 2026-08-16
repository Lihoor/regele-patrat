class King {
  constructor(level, width) {
    this.w = 64;
    this.bodyH = 56;
    this.headH = 26;
    this.crownH = 14;
    this.h = this.bodyH + this.headH + this.crownH;
    this.x = (width - this.w) / 2;
    this.y = level.groundY - this.h;
    this.vy = 0;
    this.onGround = true;
    this.speed = 300;
    this.jumpV = -660;
    this.gravity = 1550;
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
    const rot = air ? this.clamp(this.vy * 0.00012 * this.facing, -0.10, 0.10) : 0;

    const hAir = Math.max(0, level.groundY - by);
    const sk = this.clamp(1 - hAir / 320, 0.25, 1);

    this.drawShadow(ctx, bx, level.groundY, sk);

    ctx.save();
    ctx.translate(bx, by - bob);
    ctx.rotate(rot);
    ctx.scale(this.facing * sx, sy);

    const W = this.w;
    const B = this.bodyH;

    this.drawCape(ctx, W, B, flutter);
    this.drawArmor(ctx, W, B);
    this.drawScabbard(ctx, W, B);
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
    const H = B;
    const g = ctx.createLinearGradient(0, -H, 0, 0);
    g.addColorStop(0, "#5e1218");
    g.addColorStop(1, "#2b0709");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(-W / 2 + 4, -H + 2);
    ctx.lineTo(-W / 2 - 12, -H + 10);
    ctx.quadraticCurveTo(-W / 2 - 16, -H + 24 + flutter, -W / 2 - 12, -H + 36);
    ctx.lineTo(-W / 2 - 9, -8);

    let x = -W / 2 - 9;
    while (x < W / 2 - 9) {
      x = Math.min(x + 6, W / 2 - 3);
      ctx.lineTo(x, -13);
      x = Math.min(x + 6, W / 2 - 3);
      ctx.lineTo(x, -8);
    }

    ctx.lineTo(W / 2 + 12, -H + 36);
    ctx.quadraticCurveTo(W / 2 + 16, -H + 24 + flutter, W / 2 + 12, -H + 10);
    ctx.lineTo(W / 2 - 4, -H + 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawArmor(ctx, W, B) {
    const H = B;

    const steel = ctx.createLinearGradient(0, -H, 0, 0);
    steel.addColorStop(0, "#5d6167");
    steel.addColorStop(1, "#33363c");

    ctx.fillStyle = steel;
    ctx.strokeStyle = "#191b1f";
    ctx.lineWidth = 2;

    this.roundRect(ctx, -W / 2 + 2, -H + 40, 16, 16, 3);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, W / 2 - 18, -H + 40, 16, 16, 3);
    ctx.fill();
    ctx.stroke();

    this.roundRect(ctx, -W / 2, -H, W, H, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(-W / 2 + 2, -H + 2, W - 4, 4);

    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, -H + 8);
    ctx.lineTo(-11, -H + 36);
    ctx.moveTo(11, -H + 8);
    ctx.lineTo(11, -H + 36);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, -H + 8);
    ctx.lineTo(-12, -H + 36);
    ctx.moveTo(12, -H + 8);
    ctx.lineTo(12, -H + 36);
    ctx.stroke();

    ctx.fillStyle = "#8a8f96";
    for (const [rx, ry] of [[-W / 2 + 8, -H + 11], [W / 2 - 8, -H + 11], [-W / 2 + 8, -H + 33], [W / 2 - 8, -H + 33]]) {
      ctx.beginPath();
      ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const pdg = ctx.createLinearGradient(0, -H - 4, 0, -H + 14);
    pdg.addColorStop(0, "#6b7076");
    pdg.addColorStop(1, "#3a3d43");
    ctx.fillStyle = pdg;
    ctx.strokeStyle = "#191b1f";
    ctx.lineWidth = 2;

    this.roundRect(ctx, -W / 2 - 5, -H - 2, 20, 18, 5);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, W / 2 - 15, -H - 2, 20, 18, 5);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-W / 2 - 4, -H + 4);
    ctx.quadraticCurveTo(-W / 2 + 3, -H + 9, -W / 2 + 13, -H + 6);
    ctx.moveTo(-W / 2 - 4, -H + 10);
    ctx.quadraticCurveTo(-W / 2 + 3, -H + 15, -W / 2 + 13, -H + 12);
    ctx.moveTo(W / 2 - 13, -H + 6);
    ctx.quadraticCurveTo(W / 2 - 3, -H + 9, W / 2 + 4, -H + 4);
    ctx.moveTo(W / 2 - 13, -H + 12);
    ctx.quadraticCurveTo(W / 2 - 3, -H + 15, W / 2 + 4, -H + 10);
    ctx.stroke();

    ctx.fillStyle = "#3c2f22";
    ctx.fillRect(-W / 2 + 2, -H + 44, W - 4, 6);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(-W / 2 + 2, -H + 44, W - 4, 1.6);

    ctx.fillStyle = "#d9b23a";
    this.roundRect(ctx, -6, -H + 42.5, 12, 9, 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1;
    this.roundRect(ctx, -6, -H + 42.5, 12, 9, 2);
    ctx.stroke();
    ctx.fillStyle = "#5d3d12";
    ctx.fillRect(-2.5, -H + 45.5, 5, 3);

    ctx.fillStyle = steel;
    ctx.strokeStyle = "#191b1f";
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, -15, -H - 4, 30, 7, 2.5);
    ctx.fill();
    ctx.stroke();
  }

  drawScabbard(ctx, W, B) {
    ctx.save();
    ctx.translate(-W / 2 + 4, -B + 38);
    ctx.rotate(0.55);
    const g = ctx.createLinearGradient(0, 0, 0, 30);
    g.addColorStop(0, "#3a3026");
    g.addColorStop(1, "#241c14");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#0f0c08";
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, -4, 0, 8, 30, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#a8872c";
    this.roundRect(ctx, -4, 26, 8, 5, 2);
    ctx.fill();
    ctx.restore();
  }

  drawHead(ctx, W, B) {
    const hb = -B;
    const hh = this.headH;
    const hw = 40;

    const faceGrad = ctx.createLinearGradient(0, hb - hh, 0, hb);
    faceGrad.addColorStop(0, "#d7b392");
    faceGrad.addColorStop(1, "#b8936f");
    ctx.fillStyle = faceGrad;
    ctx.strokeStyle = "rgba(60,40,25,0.5)";
    ctx.lineWidth = 1;

    this.roundRect(ctx, -hw / 2, hb - hh, hw, hh, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#33291f";
    this.roundRect(ctx, -hw / 2 - 1, hb - hh + 2, 6, hh - 4, 3);
    ctx.fill();
    this.roundRect(ctx, hw / 2 - 5, hb - hh + 2, 6, hh - 4, 3);
    ctx.fill();

    ctx.fillStyle = "#c9a37f";
    ctx.beginPath();
    ctx.arc(-hw / 2 - 1, hb - 14, 3.2, 0, Math.PI * 2);
    ctx.arc(hw / 2 + 1, hb - 14, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.beginPath();
    ctx.arc(-hw / 2 - 1, hb - 13, 1.5, 0, Math.PI * 2);
    ctx.arc(hw / 2 + 1, hb - 13, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(-hw / 2, hb - hh, hw, 5);

    ctx.strokeStyle = "#241f1b";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-13, hb - 20);
    ctx.quadraticCurveTo(-9, hb - 16.5, -3.5, hb - 17.5);
    ctx.moveTo(13, hb - 20);
    ctx.quadraticCurveTo(9, hb - 16.5, 3.5, hb - 17.5);
    ctx.stroke();

    for (const ex of [-8.5, 8.5]) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(ex, hb - 13.5, 2.9, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5c6f8a";
      ctx.beginPath();
      ctx.arc(ex, hb - 13.2, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#14161a";
      ctx.beginPath();
      ctx.arc(ex, hb - 13.2, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex - 0.6, hb - 13.8, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(30,26,22,0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ex - 3, hb - 14.5);
      ctx.quadraticCurveTo(ex, hb - 16, ex + 3, hb - 14.5);
      ctx.stroke();
    }

    ctx.strokeStyle = "#9a7a5c";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-1.5, hb - 21);
    ctx.lineTo(-0.5, hb - 13.5);
    ctx.stroke();
    ctx.fillStyle = "rgba(90,60,40,0.25)";
    ctx.beginPath();
    ctx.arc(1.8, hb - 12.5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath();
    ctx.ellipse(-11, hb - 16, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(11, hb - 16, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(110,104,94,0.5)";
    this.roundRect(ctx, -13, hb - 12, 26, 12, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(90,84,74,0.6)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const bx = -10 + i * 5;
      ctx.moveTo(bx, hb - 9);
      ctx.lineTo(bx + 2, hb - 4);
    }
    ctx.stroke();

    ctx.strokeStyle = "#5a4636";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, hb - 6.5);
    ctx.quadraticCurveTo(0, hb - 9.5, 6, hb - 6.5);
    ctx.stroke();
  }

  drawCrown(ctx, W, B) {
    const hb = -B - this.headH;
    const cw = 30;
    const bandY = hb - 2;

    const g = ctx.createLinearGradient(0, bandY - 13, 0, bandY);
    g.addColorStop(0, "#d8b04a");
    g.addColorStop(1, "#9a7620");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#6b5313";
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.moveTo(-cw / 2 + 2, bandY);
    ctx.lineTo(-cw / 2 + 6, bandY - 11);
    ctx.lineTo(-cw / 2 + 11, bandY);
    ctx.lineTo(-3, bandY);
    ctx.lineTo(0, bandY - 13);
    ctx.lineTo(3, bandY);
    ctx.lineTo(cw / 2 - 11, bandY);
    ctx.lineTo(cw / 2 - 6, bandY - 11);
    ctx.lineTo(cw / 2 - 2, bandY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#b58d26";
    ctx.fillRect(-cw / 2, bandY, cw, 4);
    ctx.strokeRect(-cw / 2, bandY, cw, 4);

    ctx.fillStyle = "#d93636";
    ctx.beginPath();
    ctx.arc(0, bandY + 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(-0.6, bandY + 1.2, 0.8, 0, Math.PI * 2);
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
