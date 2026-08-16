function drawSword(ctx, x, y, sc, rot) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(sc, sc);

  ctx.fillStyle = "#c0c8d8";
  ctx.beginPath();
  ctx.moveTo(-3.2, 0);
  ctx.lineTo(-2.5, -44);
  ctx.lineTo(-1, -55);
  ctx.lineTo(0, -60);
  ctx.lineTo(1, -55);
  ctx.lineTo(2.5, -44);
  ctx.lineTo(3.2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#98a0b4";
  ctx.lineWidth = 0.7;
  ctx.stroke();

  ctx.strokeStyle = "#dce4f4";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(0, -54);
  ctx.stroke();

  ctx.fillStyle = "#c49a2a";
  roundRect(ctx, -11, -2.5, 22, 5.5, 2);
  ctx.fill();
  ctx.strokeStyle = "#8a6e18";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = "#5c3a1e";
  roundRect(ctx, -3, 3, 6, 15, 1.5);
  ctx.fill();
  ctx.strokeStyle = "#3a2210";
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.fillStyle = "#c49a2a";
  ctx.beginPath();
  ctx.arc(0, 20, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a6e18";
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.restore();
}

class Chest {
  constructor(x, y, scale) {
    this.x = x;
    this.y = y;
    this.scale = scale || 1;
    this.state = "closed";
    this.lidAngle = 0;
    this.swordOffset = 0;
    this.t = 0;
    this.near = false;
    this.promptAlpha = 0;
  }

  update(dt, kingX, kingW) {
    this.t += dt;
    const cx = this.x;
    const dx = Math.abs((kingX + kingW / 2) - cx);
    this.near = dx < 110;

    if (this.state === "opening") {
      this.lidAngle = Math.max(this.lidAngle - dt * 2.8, -1.15);
      if (this.lidAngle <= -1.15) {
        this.lidAngle = -1.15;
        this.state = "open";
      }
    }
    if (this.state === "open") {
      this.swordOffset = Math.max(this.swordOffset - dt * 55, -42);
      if (this.swordOffset <= -42) {
        this.swordOffset = -42;
        this.state = "sword_out";
      }
    }

    const canAct =
      (this.state === "closed" && this.near) ||
      (this.state === "sword_out" && this.near);
    const target = canAct ? 1 : 0;
    this.promptAlpha += (target - this.promptAlpha) * Math.min(1, dt * 6);
    if (this.promptAlpha < 0.01) this.promptAlpha = 0;
    if (this.promptAlpha > 0.99) this.promptAlpha = 1;
  }

  interact() {
    if (this.state === "closed" && this.near) {
      this.state = "opening";
      return null;
    }
    if (this.state === "sword_out" && this.near) {
      this.state = "picked";
      return "sword";
    }
    return null;
  }

  lightInfo() {
    if (this.state === "closed" || this.state === "picked") return null;
    const flicker = 0.85 + Math.sin(this.t * 11) * 0.06 + Math.sin(this.t * 17) * 0.04;
    return { x: this.x, y: this.y - 50 * this.scale, r: 130 * this.scale * flicker };
  }

  drawBody(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.lineJoin = "round";

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 3, 26, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6b4020";
    roundRect(ctx, -24, -26, 48, 26, 4);
    ctx.fill();
    ctx.strokeStyle = "#4a2c12";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = "#7a4c28";
    roundRect(ctx, -22, -25, 44, 24, 3);
    ctx.fill();

    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-24, -10);
    ctx.lineTo(24, -10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-24, -20);
    ctx.lineTo(24, -20);
    ctx.stroke();

    ctx.fillStyle = "#b8922e";
    roundRect(ctx, -3.5, -15, 7, 10, 1.5);
    ctx.fill();
    ctx.strokeStyle = "#8a6e18";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = "#4a2c12";
    ctx.beginPath();
    ctx.arc(0, -11, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(-24, -26);
    ctx.rotate(this.lidAngle);

    ctx.fillStyle = "#7a4c28";
    roundRect(ctx, 0, -10, 48, 10, 3);
    ctx.fill();
    ctx.strokeStyle = "#4a2c12";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, -5);
    ctx.lineTo(46, -5);
    ctx.stroke();

    ctx.restore();

    if (this.state !== "closed" && this.state !== "picked" && this.swordOffset < 0) {
      const sy = -26 + this.swordOffset;
      drawSword(ctx, 0, sy, 0.95, 0);
    }

    ctx.restore();
  }

  drawHUD(ctx) {
    if (this.promptAlpha <= 0) return;

    const sc = this.scale;
    const chestTop = this.y - 26 * sc;
    const promptY = chestTop - (this.state === "sword_out" ? 72 * sc : 18 * sc);
    const promptX = this.x;

    ctx.save();
    ctx.globalAlpha = this.promptAlpha;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.arc(promptX, promptY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("E", promptX, promptY + 1);
    ctx.restore();

    if (this.state === "sword_out" && this.promptAlpha > 0.5) {
      const sy = this.y + this.swordOffset * sc - 55 * sc;
      const shimmer = 0.6 + Math.sin(this.t * 4) * 0.4;
      ctx.save();
      ctx.globalAlpha = shimmer * this.promptAlpha;
      ctx.fillStyle = "rgba(200,180,100,0.15)";
      ctx.beginPath();
      ctx.arc(this.x, sy - 30, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
