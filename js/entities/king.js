class King {
  constructor(level, width) {
    this.w = 64;
    this.bodyH = 64;
    this.crownH = 14;
    this.h = this.bodyH + this.crownH;
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
    this.drawBody(ctx, W, B);
    this.drawFace(ctx, W, B);
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
    const backOff = -this.facing * 15;

    ctx.save();
    ctx.translate(backOff, 0);

    const g = ctx.createLinearGradient(0, -B, 0, 0);
    g.addColorStop(0, "#6a141a");
    g.addColorStop(1, "#2f080b");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(-W / 2 + 6, -B + 4);
    ctx.lineTo(-W / 2 - 12, -B + 10);
    ctx.quadraticCurveTo(-W / 2 - 17, -B + 26 + flutter, -W / 2 - 13, -B + 38);
    ctx.lineTo(-W / 2 - 10, -8);

    let x = -W / 2 - 10;
    while (x < W / 2 - 10) {
      x = Math.min(x + 6, W / 2 - 3);
      ctx.lineTo(x, -13);
      x = Math.min(x + 6, W / 2 - 3);
      ctx.lineTo(x, -8);
    }

    ctx.lineTo(W / 2 + 13, -B + 38);
    ctx.quadraticCurveTo(W / 2 + 17, -B + 26 + flutter, W / 2 + 12, -B + 10);
    ctx.lineTo(W / 2 - 6, -B + 4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(-W / 2 - 12, -B + 10, 4, B * 0.55);

    ctx.restore();
  }

  drawBody(ctx, W, B) {
    const steel = ctx.createLinearGradient(0, -B, 0, 0);
    steel.addColorStop(0, "#5d6167");
    steel.addColorStop(1, "#2f3238");

    ctx.fillStyle = steel;
    ctx.strokeStyle = "#1a1c20";
    ctx.lineWidth = 2;

    this.roundRect(ctx, -W / 2, -B, W, B, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(-W / 2 + 2, -B + 2, W - 4, 4);

    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -B + 10);
    ctx.lineTo(-12, -B + 38);
    ctx.moveTo(12, -B + 10);
    ctx.lineTo(12, -B + 38);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-13, -B + 10);
    ctx.lineTo(-13, -B + 38);
    ctx.moveTo(13, -B + 10);
    ctx.lineTo(13, -B + 38);
    ctx.stroke();

    ctx.fillStyle = "#8a8f96";
    for (const [rx, ry] of [[-W / 2 + 10, -B + 13], [W / 2 - 10, -B + 13], [-W / 2 + 10, -B + 42], [W / 2 - 10, -B + 42]]) {
      ctx.beginPath();
      ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const pdg = ctx.createLinearGradient(0, -B + 2, 0, -B + 15);
    pdg.addColorStop(0, "#6b7076");
    pdg.addColorStop(1, "#3a3d43");
    ctx.fillStyle = pdg;
    ctx.strokeStyle = "#191b1f";
    ctx.lineWidth = 1.6;

    this.roundRect(ctx, -W / 2 + 1, -B + 3, 16, 13, 4);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, W / 2 - 17, -B + 3, 16, 13, 4);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-W / 2 + 3, -B + 9);
    ctx.quadraticCurveTo(-W / 2 + 9, -B + 13, -W / 2 + 15, -B + 10);
    ctx.moveTo(W / 2 - 15, -B + 10);
    ctx.quadraticCurveTo(W / 2 - 9, -B + 13, W / 2 - 3, -B + 9);
    ctx.stroke();

    ctx.fillStyle = "#3c2f22";
    ctx.fillRect(-W / 2 + 2, -B + 46, W - 4, 6);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(-W / 2 + 2, -B + 46, W - 4, 1.6);

    ctx.fillStyle = "#d9b23a";
    this.roundRect(ctx, -6, -B + 44.5, 12, 9, 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1;
    this.roundRect(ctx, -6, -B + 44.5, 12, 9, 2);
    ctx.stroke();
    ctx.fillStyle = "#5d3d12";
    ctx.fillRect(-2.5, -B + 47.5, 5, 3);
  }

  drawFace(ctx, W, B) {
    const fy = -B + 10;
    const fw = 34;
    const fh = 30;

    const faceGrad = ctx.createLinearGradient(0, fy, 0, fy + fh);
    faceGrad.addColorStop(0, "#d7b392");
    faceGrad.addColorStop(1, "#b8936f");
    ctx.fillStyle = faceGrad;
    ctx.strokeStyle = "rgba(50,32,18,0.6)";
    ctx.lineWidth = 1;

    this.roundRect(ctx, -fw / 2, fy, fw, fh, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(-fw / 2, fy, fw, 5);

    ctx.fillStyle = "#33291f";
    this.roundRect(ctx, -fw / 2, fy + 2, 6, fh - 4, 3);
    ctx.fill();
    this.roundRect(ctx, fw / 2 - 6, fy + 2, 6, fh - 4, 3);
    ctx.fill();

    ctx.fillStyle = "#c9a37f";
    ctx.beginPath();
    ctx.arc(-fw / 2 - 2, fy + 14, 3.2, 0, Math.PI * 2);
    ctx.arc(fw / 2 + 2, fy + 14, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.beginPath();
    ctx.arc(-fw / 2 - 2, fy + 15, 1.5, 0, Math.PI * 2);
    ctx.arc(fw / 2 + 2, fy + 15, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#241f1b";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-12, fy + 10);
    ctx.quadraticCurveTo(-8, fy + 13.5, -2.5, fy + 12.5);
    ctx.moveTo(12, fy + 10);
    ctx.quadraticCurveTo(8, fy + 13.5, 2.5, fy + 12.5);
    ctx.stroke();

    for (const ex of [-7.5, 7.5]) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(ex, fy + 16.5, 2.8, 2.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5c6f8a";
      ctx.beginPath();
      ctx.arc(ex, fy + 16.8, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#14161a";
      ctx.beginPath();
      ctx.arc(ex, fy + 16.8, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex - 0.5, fy + 16.2, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(30,26,22,0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ex - 2.8, fy + 15.2);
      ctx.quadraticCurveTo(ex, fy + 13.8, ex + 2.8, fy + 15.2);
      ctx.stroke();
    }

    ctx.strokeStyle = "#9a7a5c";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-1, fy + 11);
    ctx.lineTo(0, fy + 19);
    ctx.stroke();
    ctx.fillStyle = "rgba(90,60,40,0.25)";
    ctx.beginPath();
    ctx.arc(2, fy + 20, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.beginPath();
    ctx.ellipse(-10, fy + 15, 2.8, 1.9, 0, 0, Math.PI * 2);
    ctx.ellipse(10, fy + 15, 2.8, 1.9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(110,104,94,0.5)";
    this.roundRect(ctx, -11, fy + 20, 22, 10, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(90,84,74,0.6)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const bx = -9 + i * 4.5;
      ctx.moveTo(bx, fy + 23);
      ctx.lineTo(bx + 1.5, fy + 28);
    }
    ctx.stroke();

    ctx.strokeStyle = "#5a4636";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-5, fy + 25.5);
    ctx.quadraticCurveTo(0, fy + 23, 5, fy + 25.5);
    ctx.stroke();
  }

  drawCrown(ctx, W, B) {
    const cw = 30;
    const bandY = -B;

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
