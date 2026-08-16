class King {
  constructor(level, width) {
    this.w = 56;
    this.bodyH = 48;
    this.crownH = 16;
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
    g.addColorStop(0, "#961f29");
    g.addColorStop(1, "#440b10");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(-W / 2 + 2, -H + 4);
    ctx.lineTo(-W / 2 - 9, -H + 10);
    ctx.quadraticCurveTo(-W / 2 - 13, -H + 20 + flutter, -W / 2 - 10, -H + 28);
    ctx.lineTo(-W / 2 - 7, -8);

    let x = -W / 2 - 7;
    while (x < W / 2 - 8) {
      x = Math.min(x + 6, W / 2 - 2);
      ctx.lineTo(x, -13);
      x = Math.min(x + 6, W / 2 - 2);
      ctx.lineTo(x, -8);
    }

    ctx.lineTo(W / 2 + 10, -H + 28);
    ctx.quadraticCurveTo(W / 2 + 13, -H + 20 + flutter, W / 2 + 9, -H + 10);
    ctx.lineTo(W / 2 - 2, -H + 4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(-W / 2 - 9, -H + 10, 4, H * 0.6);
  }

  drawBody(ctx, W, H) {
    const g = ctx.createLinearGradient(-W / 2, -H, W / 2, 0);
    g.addColorStop(0, "#b9bcc3");
    g.addColorStop(0.5, "#898d95");
    g.addColorStop(1, "#5d6068");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#33363c";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -W / 2, -H, W, H, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(-W / 2 + 2, -H + 2, W - 4, 4);
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(-W / 2 + 2, -H + 6, W - 4, 2);

    ctx.fillStyle = "#4a3a26";
    ctx.fillRect(-W / 2 + 2, -H + 40, W - 4, 5);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(-W / 2 + 2, -H + 40, W - 4, 1.6);

    ctx.fillStyle = "#d9b23a";
    this.roundRect(ctx, -6, -H + 38, 12, 8, 1.5);
    ctx.fill();
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1;
    this.roundRect(ctx, -6, -H + 38, 12, 8, 1.5);
    ctx.stroke();
    ctx.fillStyle = "#5d3d12";
    ctx.fillRect(-2.5, -H + 41, 5, 3);
  }

  drawFace(ctx, W, H) {
    ctx.fillStyle = "#26282d";
    ctx.beginPath();
    ctx.arc(-7, -H + 20, 2.5, 0, Math.PI * 2);
    ctx.arc(7, -H + 20, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.arc(-7.9, -H + 19.2, 0.9, 0, Math.PI * 2);
    ctx.arc(6.1, -H + 19.2, 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#26282d";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -H + 24.5, 3, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }

  drawCrown(ctx, W, H) {
    const cw = 28;
    const bandY = -H - 4;

    const g = ctx.createLinearGradient(0, bandY - 10, 0, -H);
    g.addColorStop(0, "#ffe79a");
    g.addColorStop(0.5, "#e6b832");
    g.addColorStop(1, "#a87f1f");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#7a5a16";
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.moveTo(-cw / 2, bandY);
    ctx.lineTo(-cw / 2 + 4, bandY - 10);
    ctx.lineTo(-cw / 2 + 7, bandY - 2);
    ctx.lineTo(-4, bandY - 2);
    ctx.lineTo(0, bandY - 12);
    ctx.lineTo(4, bandY - 2);
    ctx.lineTo(cw / 2 - 7, bandY - 2);
    ctx.lineTo(cw / 2 - 4, bandY - 10);
    ctx.lineTo(cw / 2, bandY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(-cw / 2 + 1.5, bandY - 9.5, 2.5, 9.5);

    ctx.fillStyle = "#c8302f";
    ctx.beginPath();
    ctx.arc(0, bandY + 1.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(-0.7, bandY + 0.8, 0.8, 0, Math.PI * 2);
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
