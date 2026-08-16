class Dust {
  constructor(width, height) {
    this.time = 0;
    this.motes = [];
    this.bursts = [];
    for (let i = 0; i < 46; i++) {
      this.motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        s: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 8,
        vy: -4 - Math.random() * 10,
        ph: Math.random() * 6.28,
      });
    }
  }

  burst(x, y, n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      pts.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - Math.random() * 4,
        vx: (Math.random() - 0.5) * 130,
        vy: -20 - Math.random() * 70,
        s: 1 + Math.random() * 2,
        life: 0.35 + Math.random() * 0.3,
      });
    }
    this.bursts.push({ life: 0.65, pts: pts });
  }

  update(dt, width, height) {
    this.time += dt;
    for (const p of this.motes) {
      p.x += p.vx * dt + Math.sin(this.time * 0.8 + p.ph) * 4 * dt;
      p.y += p.vy * dt;
      if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
      if (p.x < -4) p.x = width + 4;
      if (p.x > width + 4) p.x = -4;
    }
    for (const b of this.bursts) {
      b.life -= dt;
      for (const q of b.pts) {
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        q.vy += 260 * dt;
      }
    }
    this.bursts = this.bursts.filter((b) => b.life > 0);
  }

  draw(ctx) {
    const t = this.time;
    for (const p of this.motes) {
      const a = 0.05 + 0.07 * Math.abs(Math.sin(t * 1.5 + p.ph));
      ctx.fillStyle = `rgba(255,190,120,${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const b of this.bursts) {
      const k = Math.max(0, b.life / 0.65);
      for (const q of b.pts) {
        ctx.fillStyle = `rgba(160,150,135,${0.35 * k * Math.min(1, q.life)})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.s * (1 + (1 - k) * 1.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
