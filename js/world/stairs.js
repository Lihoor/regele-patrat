class Stairs {
  constructor(x, groundY, numSteps, stepW, stepH) {
    this.x = x;
    this.groundY = groundY;
    this.numSteps = numSteps || 8;
    this.stepW = stepW || 70;
    this.stepH = stepH || 38;
    this.totalW = this.numSteps * this.stepW;
    this.totalH = this.numSteps * this.stepH;
  }

  draw(ctx) {
    for (let i = 0; i < this.numSteps; i++) {
      const sx = this.x + i * this.stepW;
      const sy = this.groundY - (i + 1) * this.stepH;

      const g = 55 + Math.sin(i * 0.7) * 12;

      ctx.fillStyle = `rgb(${g + 8},${g + 6},${g + 2})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + this.stepW, sy);
      ctx.lineTo(sx + this.stepW, sy + this.stepH);
      ctx.lineTo(sx, sy + this.stepH);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgb(${g + 16},${g + 14},${g + 8})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + this.stepW, sy);
      ctx.lineTo(sx + this.stepW - 4, sy + 5);
      ctx.lineTo(sx + 4, sy + 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgb(${g - 4},${g - 6},${g - 10})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy + this.stepH);
      ctx.lineTo(sx + this.stepW, sy + this.stepH);
      ctx.lineTo(sx + this.stepW, sy + this.stepH + 4);
      ctx.lineTo(sx, sy + this.stepH + 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(8,10,14,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, this.stepW, this.stepH);

      if (Math.random() < 0.12) {
        ctx.fillStyle = "rgba(64,84,46,0.35)";
        ctx.beginPath();
        ctx.ellipse(sx + this.stepW * 0.5, sy + this.stepH * 0.8, this.stepW * 0.15, this.stepH * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const railW = 6;
    const rx = this.x - 4;
    const ry1 = this.groundY;
    const ry2 = this.groundY - this.totalH;

    ctx.strokeStyle = "#3a2e22";
    ctx.lineWidth = railW;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rx, ry1);
    ctx.lineTo(rx, ry2);
    ctx.stroke();

    ctx.strokeStyle = "#4a3e32";
    ctx.lineWidth = railW - 2;
    ctx.beginPath();
    ctx.moveTo(rx, ry1);
    ctx.lineTo(rx, ry2);
    ctx.stroke();

    for (let i = 0; i < this.numSteps; i += 2) {
      const postY = this.groundY - (i + 1) * this.stepH;
      const pw = 10, ph = this.stepH * 2.5;
      ctx.fillStyle = "#3a2e22";
      ctx.fillRect(rx - pw / 2, postY - ph + this.stepH, pw, ph);
      ctx.fillStyle = "#4a3e32";
      ctx.fillRect(rx - pw / 2 + 2, postY - ph + this.stepH, pw - 4, ph - 2);
    }

    const topPostH = 30;
    ctx.fillStyle = "#3a2e22";
    ctx.fillRect(rx - 8, ry2 - topPostH, 16, topPostH + 8);
    ctx.fillStyle = "#5a4e3a";
    ctx.fillRect(rx - 10, ry2 - topPostH, 20, 6);
  }
}
