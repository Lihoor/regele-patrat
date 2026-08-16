class Torch {
  constructor(x, y, scale) {
    this.x = x;
    this.y = y;
    this.scale = scale || 1;
    this.t = Math.random() * 20;
    this.fx = x - 14 * this.scale;
    this.fy = y - 8 * this.scale;
    this.sparks = [];
  }

  update(dt) {
    this.t += dt;
    if (Math.random() < 0.4) {
      this.sparks.push({
        x: this.fx + (Math.random() - 0.5) * 6 * this.scale,
        y: this.fy - Math.random() * 10 * this.scale,
        vx: (Math.random() - 0.5) * 30,
        vy: -30 - Math.random() * 50,
        life: 0.5 + Math.random() * 0.4,
        max: 0.9,
      });
    }
    for (const s of this.sparks) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
    }
    this.sparks = this.sparks.filter((s) => s.life > 0);
  }

  lightInfo() {
    const f = 1 + Math.sin(this.t * 9) * 0.05 + Math.sin(this.t * 23.7) * 0.04 + (Math.random() - 0.5) * 0.05;
    return {
      x: this.fx,
      y: this.fy,
      r: (Math.max(220, this.x * 0.17) * f + Math.random() * 8) * this.scale,
    };
  }

  draw(ctx) {
    const s = this.scale;

    ctx.strokeStyle = "#18100a";
    ctx.lineWidth = 6 * s;
    ctx.beginPath();
    ctx.moveTo(this.x + 18 * s, this.y - 10 * s);
    ctx.lineTo(this.x - 9 * s, this.y + 9 * s);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    ctx.save();
    ctx.translate(this.x - 9 * s, this.y + 9 * s);
    ctx.rotate(-0.28);
    ctx.fillStyle = "#33231766";
    ctx.fillRect(-3 * s, 0, 6 * s, 20 * s);
    ctx.fillStyle = "rgba(255,200,120,0.10)";
    ctx.fillRect(-1.2 * s, 2 * s, 2.4 * s, 15 * s);
    ctx.restore();

    ctx.fillStyle = "#241911";
    ctx.beginPath();
    ctx.arc(this.fx, this.fy, 5.2 * s, 0, Math.PI * 2);
    ctx.fill();

    this.drawFlame(ctx, s);
    this.drawSparks(ctx);
  }

  drawFlame(ctx, s) {
    const t = this.t;
    const flick = 1 + Math.sin(t * 9) * 0.07 + Math.sin(t * 23.7) * 0.05;
    const sway = Math.sin(t * 7.3) * 4 * s;
    const h = 44 * s * flick;

    const g = ctx.createRadialGradient(this.fx, this.fy - h * 0.3, 2, this.fx, this.fy, h * 1.6);
    g.addColorStop(0, "rgba(255,160,60,0.5)");
    g.addColorStop(0.5, "rgba(255,100,25,0.2)");
    g.addColorStop(1, "rgba(255,70,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(this.fx - h * 1.6, this.fy - h * 1.9, h * 3.2, h * 3.2);

    this.teardrop(ctx, this.fx + sway * 0.4, this.fy, h, 14 * s, "#ff8a2a");
    this.teardrop(ctx, this.fx + sway * 0.6, this.fy - h * 0.18, h * 0.62, 9.5 * s, "#ffd23d");
    this.teardrop(ctx, this.fx + sway * 0.8, this.fy - h * 0.32, h * 0.34, 5 * s, "#fff9e0");
  }

  drawSparks(ctx) {
    for (const sp of this.sparks) {
      const a = Math.max(0, sp.life / sp.max);
      ctx.fillStyle = `rgba(255,${Math.round(120 + 120 * a)},${Math.round(40 * a)},${0.9 * a})`;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 1.2 + a * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
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
