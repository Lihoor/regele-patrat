class ArmorStand {
  constructor(x, groundY, scale) {
    this.x = x;
    this.groundY = groundY;
    this.scale = scale || 1.2;
    this.t = 0;
    this.near = false;
    this.promptAlpha = 0;
    this.collected = false;
    this.glowPulse = 0;
  }

  update(dt, kingX, kingW) {
    this.t += dt;
    this.glowPulse += dt;
    const dx = Math.abs((kingX + kingW / 2) - this.x);
    this.near = dx < 120 * this.scale;
    const canAct = this.near && !this.collected;
    const target = canAct ? 1 : 0;
    this.promptAlpha += (target - this.promptAlpha) * Math.min(1, dt * 6);
    if (this.promptAlpha < 0.01) this.promptAlpha = 0;
    if (this.promptAlpha > 0.99) this.promptAlpha = 1;
  }

  interact() {
    if (this.near && !this.collected) {
      this.collected = true;
      return true;
    }
    return false;
  }

  draw(ctx) {
    const sc = this.scale;
    ctx.save();
    ctx.translate(this.x, this.groundY);
    ctx.scale(sc, sc);

    const baseG = this.collected ? 30 : 50;
    ctx.fillStyle = `rgb(${baseG + 5},${baseG + 3},${baseG})`;
    ctx.fillRect(-20, -8, 40, 8);
    ctx.fillStyle = `rgb(${baseG + 12},${baseG + 10},${baseG + 5})`;
    ctx.fillRect(-18, -6, 36, 4);

    ctx.fillStyle = `rgb(${baseG + 18},${baseG + 16},${baseG + 10})`;
    ctx.fillRect(-3, -8, 6, -80);

    if (!this.collected) {
      const shimmer = 0.6 + Math.sin(this.glowPulse * 2) * 0.2;
      ctx.fillStyle = `rgba(180,200,240,${(shimmer * 0.12).toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(0, -55, 30, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const armorG = this.collected ? 60 : 140;
    const armorB = this.collected ? 60 : 160;

    ctx.fillStyle = `rgb(${armorG},${armorG + 5},${armorB})`;
    ctx.beginPath();
    ctx.moveTo(-18, -88);
    ctx.quadraticCurveTo(-22, -70, -20, -50);
    ctx.lineTo(20, -50);
    ctx.quadraticCurveTo(22, -70, 18, -88);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgb(${armorG + 15},${armorG + 18},${armorB + 15})`;
    ctx.beginPath();
    ctx.moveTo(-16, -86);
    ctx.quadraticCurveTo(-19, -70, -17, -52);
    ctx.lineTo(17, -52);
    ctx.quadraticCurveTo(19, -70, 16, -86);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgb(${armorG - 10},${armorG - 5},${armorB - 10})`;
    ctx.beginPath();
    ctx.moveTo(-22, -52);
    ctx.quadraticCurveTo(-30, -48, -32, -40);
    ctx.lineTo(-28, -20);
    ctx.lineTo(-16, -20);
    ctx.lineTo(-16, -50);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(22, -52);
    ctx.quadraticCurveTo(30, -48, 32, -40);
    ctx.lineTo(28, -20);
    ctx.lineTo(16, -20);
    ctx.lineTo(16, -50);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgb(${armorG + 5},${armorG + 8},${armorB + 5})`;
    ctx.fillRect(-14, -52, 28, 10);
    ctx.fillStyle = `rgb(${armorG - 5},${armorG},${armorB - 5})`;
    ctx.fillRect(-12, -42, 24, 22);

    ctx.fillStyle = `rgb(${armorG - 15},${armorG - 10},${armorB - 15})`;
    ctx.beginPath();
    ctx.moveTo(-12, -20);
    ctx.lineTo(-14, 10);
    ctx.lineTo(-4, 10);
    ctx.lineTo(-2, -20);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, -20);
    ctx.lineTo(14, 10);
    ctx.lineTo(4, 10);
    ctx.lineTo(2, -20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgb(${armorG + 10},${armorG + 12},${armorB + 10})`;
    ctx.beginPath();
    ctx.ellipse(0, -94, 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgb(${armorG - 5},${armorG},${armorB - 5})`;
    ctx.beginPath();
    ctx.ellipse(0, -94, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgb(${armorG - 20},${armorG - 15},${armorB - 20})`;
    ctx.fillRect(-8, -98, 16, 6);
    ctx.fillRect(-10, -102, 20, 6);

    ctx.fillStyle = `rgba(200,220,255,0.25)`;
    ctx.beginPath();
    ctx.ellipse(-4, -96, 3, 2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    if (!this.collected) {
      const glowF = 0.5 + Math.sin(this.glowPulse * 3) * 0.2;
      ctx.strokeStyle = `rgba(180,200,240,${glowF.toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, -55, 26, 50, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawPrompt(ctx) {
    if (this.promptAlpha <= 0) return;
    const sc = this.scale;
    const px = this.x;
    const py = this.groundY - 115 * sc;

    ctx.save();
    ctx.globalAlpha = this.promptAlpha;
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.beginPath();
    ctx.arc(px, py, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("E", px, py + 1);
    ctx.restore();
  }
}
