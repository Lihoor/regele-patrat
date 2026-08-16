class Player {
  constructor(level, width) {
    this.w = 56;
    this.bodyH = 46;
    this.h = this.bodyH + 16;
    this.x = (width - this.w) / 2;
    this.y = level.groundY - this.h;
    this.speed = 280;
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
    const bob = this.moving ? Math.abs(Math.sin(this.time * 12)) * 3 : Math.sin(this.time * 3) * 1.3;
    const flutter = Math.sin(this.time * 6) * 1.8;
    const gy = by - bob;

    this.drawShadow(ctx, bx, by);

    ctx.save();
    ctx.translate(bx, gy);
    ctx.scale(this.facing, 1);

    const W = this.w;
    const H = this.bodyH;

    this.drawCape(ctx, W, H, flutter);
    this.drawBody(ctx, W, H);
    this.drawFace(ctx, W, H);
    this.drawCrown(ctx, W, H);

    ctx.restore();
  }

  drawShadow(ctx, bx, by) {
    const wob = this.moving ? 0.85 : 1;
    const g = ctx.createRadialGradient(bx, by, 2, bx, by, this.w * 0.62 * wob);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(bx, by + 3, this.w * 0.62 * wob, this.w * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCape(ctx, W, H, flutter) {
    const g = ctx.createLinearGradient(0, -H, 0, 0);
    g.addColorStop(0, "#8f1d26");
    g.addColorStop(1, "#4a0d12");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(-W / 2, -H + 2);
    ctx.lineTo(-W / 2 - 9, -H + 10);
    ctx.quadraticCurveTo(-W / 2 - 13, -H + 22 + flutter, -W / 2 - 9, -H + 30);
    ctx.lineTo(-W / 2 - 6, -8);
    ctx.lineTo(-W / 2 - 1, -4);
    ctx.lineTo(-W / 2 + 4, -8);
    ctx.lineTo(W / 2 - 4, -8);
    ctx.lineTo(W / 2 + 1, -4);
    ctx.lineTo(W / 2 + 6, -8);
    ctx.lineTo(W / 2 + 9, -H + 30);
    ctx.quadraticCurveTo(W / 2 + 13, -H + 22 + flutter, W / 2 + 9, -H + 10);
    ctx.lineTo(W / 2, -H + 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-W / 2 - 1, -H + 14);
    ctx.quadraticCurveTo(0, -H + 18 + flutter * 0.5, W / 2 + 1, -H + 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-W / 2 + 8, -H + 24);
    ctx.quadraticCurveTo(0, -H + 29 + flutter * 0.7, W / 2 - 8, -H + 24);
    ctx.stroke();

    ctx.fillStyle = "#c9b458";
    ctx.beginPath();
    ctx.arc(0, -H + 12, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a7a35";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -H + 12, 4.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#5c1014";
    ctx.beginPath();
    ctx.arc(0, -H + 12, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBody(ctx, W, H) {
    const g = ctx.createLinearGradient(-W / 2, -H, W / 2, 0);
    g.addColorStop(0, "#b8bcc2");
    g.addColorStop(0.5, "#8b8f96");
    g.addColorStop(1, "#5d6067");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#3d4046";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -W / 2, -H, W, H, 4);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    this.roundRect(ctx, -W / 2, -H, W, H, 4);
    ctx.clip();

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(-W / 2, -H, W, 5);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(-W / 2, -H + 5, W, 3);

    ctx.fillStyle = "#c9b458";
    ctx.beginPath();
    ctx.moveTo(-W / 2 + 7, -H + 8);
    ctx.lineTo(W / 2 - 7, -H + 30);
    ctx.lineTo(W / 2 - 7, -H + 36);
    ctx.lineTo(-W / 2 + 7, -H + 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#9a8430";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#7d7050";
    ctx.fillRect(-W / 2, -H + 37, W, 3.5);
    ctx.fillStyle = "rgba(255,220,150,0.25)";
    ctx.fillRect(-W / 2, -H + 37, W, 1.2);

    ctx.fillStyle = "#a1872f";
    ctx.fillRect(-W / 2 + W / 2 - 5, -H + 37, 10, 3.5);
    ctx.fillStyle = "#e8cf6a";
    ctx.fillRect(-W / 2 + W / 2 - 5, -H + 37, 3.5, 3.5);

    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.20)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-W / 2 + 3, -H + 3);
    ctx.lineTo(-W / 2 + 3, -4);
    ctx.stroke();
  }

  drawFace(ctx, W, H) {
    ctx.fillStyle = "#e9e4da";
    ctx.beginPath();
    ctx.arc(-7, -H + 18, 3.2, 0, Math.PI * 2);
    ctx.arc(7, -H + 18, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1b1d20";
    ctx.beginPath();
    ctx.arc(-6.6, -H + 18, 1.7, 0, Math.PI * 2);
    ctx.arc(7.4, -H + 18, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(-7.3, -H + 17.4, 0.7, 0, Math.PI * 2);
    ctx.arc(6.7, -H + 17.4, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#2a2c30";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-10, -H + 11.5);
    ctx.quadraticCurveTo(-7, -H + 9.5, -4.5, -H + 11);
    ctx.moveTo(10, -H + 11.5);
    ctx.quadraticCurveTo(7, -H + 9.5, 4.5, -H + 11);
    ctx.stroke();

    ctx.fillStyle = "#55585e";
    ctx.beginPath();
    ctx.ellipse(0, -H + 25.5, 4.5, 2.4, 0, 0, Math.PI);
    ctx.fill();

    ctx.strokeStyle = "#3a3d42";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, -H + 22.5, 2.6, 0.25, Math.PI - 0.25);
    ctx.stroke();
  }

  drawCrown(ctx, W, H) {
    const cw = 30;
    const top = -H - 13;

    const g = ctx.createLinearGradient(0, top, 0, -H);
    g.addColorStop(0, "#ffe79a");
    g.addColorStop(0.5, "#e6b832");
    g.addColorStop(1, "#a87f1f");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#7a5a16";
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(-cw / 2, -H);
    ctx.lineTo(-cw / 2, top + 3);
    ctx.lineTo(-cw / 2 + 5, -H - 5);
    ctx.lineTo(-cw / 2 + 10, top + 1);
    ctx.lineTo(-cw / 2 + 15, -H - 5);
    ctx.lineTo(cw / 2, top + 2);
    ctx.lineTo(cw / 2, -H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.moveTo(-cw / 2 + 2, -H + 2);
    ctx.lineTo(-cw / 2 + 2, top + 2);
    ctx.lineTo(-cw / 2 + 7, -H - 4);
    ctx.lineTo(-cw / 2 + 7, -H + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#c8302f";
    ctx.beginPath();
    ctx.arc(-cw / 2 + 5, -H - 4, 2, 0, Math.PI * 2);
    ctx.arc(cw / 2 - 5, -H - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(-cw / 2 + 5.6, -H - 4.6, 0.7, 0, Math.PI * 2);
    ctx.arc(cw / 2 - 4.4, -H - 4.6, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-cw / 2, -H + 2);
    ctx.lineTo(cw / 2, -H + 2);
    ctx.stroke();
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
