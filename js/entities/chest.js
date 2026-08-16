function drawSword(ctx, x, y, sc, rot) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(sc, sc);

  ctx.fillStyle = "rgba(180,200,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, -32, 7, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b8c4da";
  ctx.beginPath();
  ctx.moveTo(-3.8, 2);
  ctx.lineTo(-3, -42);
  ctx.lineTo(-1.5, -62);
  ctx.lineTo(-0.5, -72);
  ctx.lineTo(0, -76);
  ctx.lineTo(0.5, -72);
  ctx.lineTo(1.5, -62);
  ctx.lineTo(3, -42);
  ctx.lineTo(3.8, 2);
  ctx.closePath();
  ctx.fill();

  const bg = ctx.createLinearGradient(-3.5, 0, 3.5, 0);
  bg.addColorStop(0, "#8898b4");
  bg.addColorStop(0.35, "#e0e8f8");
  bg.addColorStop(0.5, "#f4f8ff");
  bg.addColorStop(0.65, "#e0e8f8");
  bg.addColorStop(1, "#8898b4");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(-3.5, 1);
  ctx.lineTo(-2.8, -40);
  ctx.lineTo(-1.3, -60);
  ctx.lineTo(0, -73);
  ctx.lineTo(1.3, -60);
  ctx.lineTo(2.8, -40);
  ctx.lineTo(3.5, 1);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#a0b0c8";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-3.6, 1);
  ctx.lineTo(-2.9, -41);
  ctx.lineTo(-1.4, -61);
  ctx.lineTo(0, -74);
  ctx.lineTo(1.4, -61);
  ctx.lineTo(2.9, -41);
  ctx.lineTo(3.6, 1);
  ctx.stroke();

  ctx.strokeStyle = "rgba(220,235,255,0.7)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(0, -68);
  ctx.stroke();

  ctx.fillStyle = "#d4a428";
  roundRect(ctx, -13, -3, 26, 6, 2.5);
  ctx.fill();
  const gg = ctx.createLinearGradient(-13, -3, -13, 3);
  gg.addColorStop(0, "#f0d050");
  gg.addColorStop(1, "#9a7418");
  ctx.fillStyle = gg;
  roundRect(ctx, -12, -2.5, 24, 5, 2);
  ctx.fill();
  ctx.strokeStyle = "#6e5214";
  ctx.lineWidth = 0.9;
  roundRect(ctx, -13, -3, 26, 6, 2.5);
  ctx.stroke();

  ctx.fillStyle = "#4c2a14";
  roundRect(ctx, -3.2, 3.5, 6.4, 17, 2);
  ctx.fill();
  ctx.strokeStyle = "#321a0a";
  ctx.lineWidth = 0.7;
  roundRect(ctx, -3.2, 3.5, 6.4, 17, 2);
  ctx.stroke();

  ctx.fillStyle = "#c89a24";
  ctx.beginPath();
  ctx.arc(0, 22, 4.5, 0, Math.PI * 2);
  ctx.fill();
  const pg = ctx.createRadialGradient(-1, 21, 0.5, 0, 22, 4.5);
  pg.addColorStop(0, "#f0d860");
  pg.addColorStop(1, "#8a6e18");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(0, 22, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6e5214";
  ctx.lineWidth = 0.7;
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
    const dx = Math.abs((kingX + kingW / 2) - this.x);
    this.near = dx < 140 * this.scale;

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
    if (this.state === "picked") return null;
    const f = 0.82 + Math.sin(this.t * 11) * 0.08 + Math.sin(this.t * 17) * 0.05;
    const base = this.state === "closed" ? 0.55 : 1;
    return { x: this.x, y: this.y - 40 * this.scale, r: 160 * this.scale * base * f };
  }

  drawBody(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.lineJoin = "round";

    const glow = 0.35 + Math.sin(this.t * 3.5) * 0.1 + Math.sin(this.t * 5.7) * 0.06;
    const gc = this.state === "picked" ? 0 : (this.state === "closed" ? 0.4 : 0.7);
    ctx.fillStyle = `rgba(255,210,90,${glow * gc})`;
    ctx.beginPath();
    ctx.ellipse(0, -16, 38, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 30, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#5c3818";
    roundRect(ctx, -28, -30, 56, 30, 5);
    ctx.fill();
    ctx.strokeStyle = "#3a2010";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = "#704828";
    roundRect(ctx, -26, -28, 52, 28, 4);
    ctx.fill();

    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-28, -12);
    ctx.lineTo(28, -12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-28, -22);
    ctx.lineTo(28, -22);
    ctx.stroke();

    ctx.fillStyle = "#b8922e";
    roundRect(ctx, -4.5, -18, 9, 12, 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6e18";
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.fillStyle = "#3a2010";
    ctx.beginPath();
    ctx.arc(0, -12, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8a6420";
    roundRect(ctx, -2, -28, 4, 30, 1);
    ctx.fill();

    ctx.save();
    ctx.translate(-28, -30);
    ctx.rotate(this.lidAngle);

    ctx.fillStyle = "#704828";
    roundRect(ctx, 0, -12, 56, 12, 4);
    ctx.fill();
    ctx.strokeStyle = "#3a2010";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(54, -6);
    ctx.stroke();

    ctx.restore();

    if (this.state !== "closed" && this.state !== "picked" && this.swordOffset < 0) {
      const sy = -30 + this.swordOffset;
      const shimmer = 0.8 + Math.sin(this.t * 5) * 0.2;
      ctx.save();
      ctx.globalAlpha = shimmer;
      ctx.fillStyle = "rgba(180,200,255,0.1)";
      ctx.beginPath();
      ctx.ellipse(0, sy - 38, 12, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawSword(ctx, 0, sy, 1.05, 0);
    }

    ctx.restore();
  }

  drawHUD(ctx) {
    if (this.promptAlpha <= 0) return;

    const sc = this.scale;
    const chestTop = this.y - 30 * sc;
    const promptY = chestTop - (this.state === "sword_out" ? 85 * sc : 22 * sc);
    const promptX = this.x;

    ctx.save();
    ctx.globalAlpha = this.promptAlpha;
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.beginPath();
    ctx.arc(promptX, promptY, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("E", promptX, promptY + 1);
    ctx.restore();
  }
}
