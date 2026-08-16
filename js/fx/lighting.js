class Lighting {
  constructor() {
    this.darkness = "rgba(5,4,10,0.87)";
  }

  apply(ctx, width, height, lights) {
    ctx.save();
    ctx.fillStyle = this.darkness;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "destination-out";
    for (const l of lights) {
      const r = l.r;
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, r);
      g.addColorStop(0, "rgba(255,255,255,0.98)");
      g.addColorStop(0.45, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(l.x, l.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  glow(ctx, width, height, lights) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const l of lights) {
      const r = l.r;
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, r);
      g.addColorStop(0, "rgba(255,160,60,0.16)");
      g.addColorStop(0.5, "rgba(255,110,30,0.06)");
      g.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(l.x, l.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  vignette(ctx, width, height) {
    const g = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.35, width / 2, height / 2, Math.max(width, height) * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
}
