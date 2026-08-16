class Player {
  constructor(level) {
    this.w = 34;
    this.h = 36;
    this.x = level.width / 2 - this.w / 2;
    this.y = level.groundY - this.h;
    this.speed = 260;
    this.facing = 1;
    this.moving = false;
    this.time = 0;
  }

  update(dt, input, level) {
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
    this.time += dt;
  }

  draw(ctx) {
    const bx = this.x + this.w / 2;
    const by = this.y + this.h;
    const bob = this.moving ? Math.abs(Math.sin(this.time * 12)) * 2.5 : Math.sin(this.time * 3) * 1.2;
    const flutter = Math.sin(this.time * 6) * 1.5;
    const gy = by - bob;

    ctx.save();
    ctx.translate(bx, gy);
    ctx.scale(this.facing, 1);

    const W = this.w;
    const H = 30;

    this.drawCape(ctx, W, H, flutter);
    this.drawBody(ctx, W, H);
    this.drawCrown(ctx, W, H);

    ctx.restore();
  }

  drawCape(ctx, W, H, flutter) {
    ctx.fillStyle = "#a3232b";
    ctx.beginPath();
    ctx.moveTo(-W / 2, -H);
    ctx.lineTo(-W / 2 - 7, -H + 6);
    ctx.quadraticCurveTo(-W / 2 - 11, -H + 14 + flutter, -W / 2 - 8, -H + 22);
    ctx.lineTo(-W / 2 - 4, -6);
    ctx.lineTo(-W / 2 + 2, -3);
    ctx.lineTo(-W / 2 + 6, -6);
    ctx.lineTo(W / 2 - 6, -6);
    ctx.lineTo(W / 2 - 2, -3);
    ctx.lineTo(W / 2 + 4, -6);
    ctx.lineTo(W / 2 + 8, -H + 22);
    ctx.quadraticCurveTo(W / 2 + 11, -H + 14 + flutter, W / 2 + 7, -H + 6);
    ctx.lineTo(W / 2, -H);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#7c1a21";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#c9b458";
    ctx.beginPath();
    ctx.arc(0, -H + 9, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBody(ctx, W, H) {
    ctx.fillStyle = "#a2a6ad";
    ctx.strokeStyle = "#777b82";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -W / 2, -H, W, H, 3);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    this.roundRect(ctx, -W / 2, -H, W, H, 3);
    ctx.clip();

    ctx.fillStyle = "#c9b458";
    ctx.beginPath();
    ctx.moveTo(-W / 2 + 5, -H + 7);
    ctx.lineTo(W / 2 - 5, -H + 21);
    ctx.lineTo(W / 2 - 5, -H + 25);
    ctx.lineTo(-W / 2 + 5, -H + 11);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#6e6050";
    ctx.fillRect(-W / 2, -H + 24, W, 3);

    ctx.restore();

    ctx.fillStyle = "#26282c";
    ctx.beginPath();
    ctx.arc(-5, -H + 14, 2, 0, Math.PI * 2);
    ctx.arc(5, -H + 14, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8d9198";
    ctx.beginPath();
    ctx.arc(-5, -H + 14.5, 0.8, 0, Math.PI * 2);
    ctx.arc(5, -H + 14.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3a3d42";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -H + 19, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  drawCrown(ctx, W, H) {
    const cw = 22;
    ctx.fillStyle = "#f0c23b";
    ctx.strokeStyle = "#b8912a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-cw / 2, -H);
    ctx.lineTo(-cw / 2, -H - 7);
    ctx.lineTo(-cw / 2 + 4, -H - 3);
    ctx.lineTo(-cw / 2 + 7, -H - 9);
    ctx.lineTo(-cw / 2 + 11, -H - 4);
    ctx.lineTo(cw / 2, -H - 8);
    ctx.lineTo(cw / 2, -H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e05d5d";
    ctx.beginPath();
    ctx.arc(-cw / 2 + 7, -H - 6.5, 1.6, 0, Math.PI * 2);
    ctx.arc(cw / 2 - 6, -H - 6, 1.6, 0, Math.PI * 2);
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
}
