class Torch {
  constructor(x, y, scale) {
    this.x = x;
    this.y = y;
    this.scale = scale || 1;
    this.t = Math.random() * 20;
    this.fx = x - 12 * this.scale;
    this.fy = y - 6 * this.scale;
  }

  update(dt) {
    this.t += dt;
  }

  lightInfo() {
    const f = 1 + Math.sin(this.t * 9) * 0.05 + Math.sin(this.t * 23.7) * 0.04 + (Math.random() - 0.5) * 0.05;
    return {
      x: this.fx,
      y: this.fy,
      r: (Math.max(190, this.x * 0.16) * f + Math.random() * 6) * this.scale,
    };
  }

  draw(ctx) {
    const s = this.scale;

    ctx.strokeStyle = "#18100a";
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(this.x + 16 * s, this.y - 8 * s);
    ctx.lineTo(this.x - 8 * s, this.y + 8 * s);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();

    ctx.save();
    ctx.translate(this.x - 8 * s, this.y + 8 * s);
    ctx.rotate(-0.28);
    ctx.fillStyle = "#2f2114";
    ctx.fillRect(-2.6 * s, 0, 5.2 * s, 18 * s);
    ctx.fillStyle = "rgba(255,200,120,0.08)";
    ctx.fillRect(-1 * s, 2 * s, 2 * s, 14 * s);
    ctx.restore();

    ctx.fillStyle = "#241911";
    ctx.beginPath();
    ctx.arc(this.fx, this.fy, 4.6 * s, 0, Math.PI * 2);
    ctx.fill();

    this.drawFlame(ctx, s);
  }

  drawFlame(ctx, s) {
    const t = this.t;
    const flick = 1 + Math.sin(t * 9) * 0.07 + Math.sin(t * 23.7) * 0.05;
    const sway = Math.sin(t * 7.3) * 3.4 * s;
    const h = 26 * s * flick;

    const g = ctx.createRadialGradient(this.fx, this.fy - h * 0.3, 1, this.fx, this.fy, h * 1.5);
    g.addColorStop(0, "rgba(255,150,50,0.30)");
    g.addColorStop(0.5, "rgba(255,90,20,0.12)");
    g.addColorStop(1, "rgba(255,60,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(this.fx - h * 1.5, this.fy - h * 1.8, h * 3, h * 3);

    this.teardrop(ctx, this.fx + sway * 0.4, this.fy, h, 11 * s, "#ff7a26");
    this.teardrop(ctx, this.fx + sway * 0.6, this.fy - h * 0.16, h * 0.62, 7.5 * s, "#ffc23d");
    this.teardrop(ctx, this.fx + sway * 0.8, this.fy - h * 0.3, h * 0.32, 4 * s, "#fff6cf");
  }

  teardrop(ctx, cx, baseY, h, w, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, baseY);
    ctx.quadraticCurveTo(cx - w / 2, baseY - h * 0.72, cx, baseY - h);
    ctx.quadraticCurveTo(cx + w / 2, baseY - h * 0.72, cx + w / 2, baseY);
    ctx.quadraticCurveTo(cx, baseY + h * 0.16, cx - w / 2, baseY);
    ctx.closePath();
    ctx.fill();
  }
}
