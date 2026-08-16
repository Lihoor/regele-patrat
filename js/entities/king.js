class King {
  constructor(level, width) {
    this.w = 60;
    this.bodyH = 50;
    this.crownH = 18;
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
    const rot = air ? this.clamp(this.vy * 0.00012 * this.facing, -0.10, 0.10) : 0;

    const hAir = Math.max(0, level.groundY - by);
    const sk = this.clamp(1 - hAir / 320, 0.25, 1);

    this.drawShadow(ctx, bx, level.groundY, sk);

    ctx.save();
    ctx.translate(bx, by - bob);
    ctx.rotate(rot);
    ctx.scale(this.facing * sx, sy);

    const W = this.w;
    const H = this.bodyH;

    this.drawCape(ctx, W, H, flutter);
    this.drawBody(ctx, W, H);
    this.drawFace(ctx, W, H);
    this.drawCrown(ctx, W, H);

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

  drawCape(ctx, W, H, flutter) {
    const g = ctx.createLinearGradient(0, -H, 0, 0);
    g.addColorStop(0, "#b02a30");
    g.addColorStop(1, "#5f1016");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(-W / 2 + 3, -H + 3);
    ctx.lineTo(-W / 2 - 10, -H + 9);
    ctx.quadraticCurveTo(-W / 2 - 14, -H + 20 + flutter, -W / 2 - 10, -H + 28);
    ctx.lineTo(-W / 2 - 7, -8);

    let x = -W / 2 - 7;
    while (x < W / 2 - 8) {
      x = Math.min(x + 6, W / 2 - 2);
      ctx.lineTo(x, -13);
      x = Math.min(x + 6, W / 2 - 2);
      ctx.lineTo(x, -8);
    }

    ctx.lineTo(W / 2 + 10, -H + 28);
    ctx.quadraticCurveTo(W / 2 + 14, -H + 20 + flutter, W / 2 + 10, -H + 9);
    ctx.lineTo(W / 2 - 3, -H + 3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawBody(ctx, W, H) {
    ctx.save();

    const g = ctx.createLinearGradient(0, -H, 0, 0);
    g.addColorStop(0, "#d3d6db");
    g.addColorStop(0.5, "#9a9ea6");
    g.addColorStop(1, "#6f737b");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#3f4349";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -W / 2, -H, W, H, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(-W / 2 + 2, -H + 2, W - 4, 4);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(-W / 2 + 2, -H + 7, W - 4, 2);

    ctx.fillStyle = "#e3b83a";
    ctx.fillRect(-W / 2 + 3, -H + 4, W - 6, 5);
    ctx.strokeStyle = "#a8831f";
    ctx.lineWidth = 1;
    ctx.strokeRect(-W / 2 + 3, -H + 4, W - 6, 5);

    ctx.fillStyle = "#5a4630";
    ctx.fillRect(-W / 2 + 3, -H + 43, W - 6, 5);
    ctx.fillStyle = "#e0b83c";
    ctx.fillRect(-W / 2 + 3, -H + 43, W - 6, 1.6);

    ctx.fillStyle = "#e0b83c";
    this.roundRect(ctx, -6, -H + 41.5, 12, 8, 1.5);
    ctx.fill();
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1;
    this.roundRect(ctx, -6, -H + 41.5, 12, 8, 1.5);
    ctx.stroke();
    ctx.fillStyle = "#5d3d12";
    ctx.fillRect(-2.5, -H + 44.5, 5, 3);

    const pg = ctx.createLinearGradient(0, -H - 4, 0, -H + 8);
    pg.addColorStop(0, "#f0cf57");
    pg.addColorStop(1, "#c99a22");
    ctx.fillStyle = pg;
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1.4;
    this.roundRect(ctx, -W / 2 + 1, -H - 3, 11, 10, 3);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, W / 2 - 12, -H - 3, 11, 10, 3);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawFace(ctx, W, H) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-8, -H + 24, 3.5, 0, Math.PI * 2);
    ctx.arc(8, -H + 24, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(60,64,72,0.5)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(-8, -H + 24, 3.5, 0, Math.PI * 2);
    ctx.arc(8, -H + 24, 3.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#202328";
    ctx.beginPath();
    ctx.arc(-7.6, -H + 24, 1.9, 0, Math.PI * 2);
    ctx.arc(8.4, -H + 24, 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-8.4, -H + 23.2, 0.7, 0, Math.PI * 2);
    ctx.arc(7.6, -H + 23.2, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#202328";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -H + 30.5, 3.4, 0.25, Math.PI - 0.25);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,140,120,0.35)";
    ctx.beginPath();
    ctx.arc(-13, -H + 28, 2.6, 0, Math.PI * 2);
    ctx.arc(13, -H + 28, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCrown(ctx, W, H) {
    const cw = 32;
    const bandY = -H - 5;

    const g = ctx.createLinearGradient(0, bandY - 13, 0, -H);
    g.addColorStop(0, "#ffe88f");
    g.addColorStop(0.55, "#e0ad2a");
    g.addColorStop(1, "#a87f1f");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#7a5a16";
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

    ctx.fillStyle = "#e3b83a";
    ctx.fillRect(-cw / 2, bandY, cw, 4);
    ctx.strokeStyle = "#7a5a16";
    ctx.lineWidth = 1;
    ctx.strokeRect(-cw / 2, bandY, cw, 4);

    ctx.fillStyle = "#d93636";
    ctx.beginPath();
    ctx.arc(0, bandY + 2, 2, 0, Math.PI * 2);
    ctx.arc(-cw / 2 + 8, bandY - 6, 1.5, 0, Math.PI * 2);
    ctx.arc(cw / 2 - 8, bandY - 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(-0.6, bandY + 1.2, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  roundRect(ctx, x, y, w, h, r) {
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
