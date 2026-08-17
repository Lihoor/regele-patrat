class NightSky {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.65,
        r: 0.4 + Math.random() * 2.2,
        bright: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 1 + Math.random() * 3,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    this.moonX = width * 0.78;
    this.moonY = height * 0.15;
    this.moonR = Math.min(width, height) * 0.07;
    this.distantCastle = this._genCastle();
  }

  _genCastle() {
    const parts = [];
    let x = this.width * 0.05;
    while (x < this.width * 0.45) {
      const w = 20 + Math.random() * 50;
      const h = 30 + Math.random() * 90;
      const hasTower = Math.random() < 0.35;
      parts.push({ x, w, h, hasTower });
      x += w + Math.random() * 15;
    }
    return parts;
  }

  draw(ctx, time, floorH) {
    const skyH = this.height - floorH;

    const grad = ctx.createLinearGradient(0, 0, 0, skyH);
    grad.addColorStop(0, "#050510");
    grad.addColorStop(0.3, "#0a0a28");
    grad.addColorStop(0.6, "#0f1035");
    grad.addColorStop(1, "#141838");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, skyH);

    for (const star of this.stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.bright * twinkle;
      ctx.fillStyle = `rgba(255,255,240,${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
      if (star.r > 1.6) {
        ctx.fillStyle = `rgba(200,210,255,${(alpha * 0.25).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this._drawMoon(ctx, time);

    ctx.fillStyle = "rgba(10,12,25,0.7)";
    for (const p of this.distantCastle) {
      const baseY = skyH * 0.85;
      ctx.fillRect(p.x, baseY - p.h, p.w, p.h + 30);
      if (p.hasTower) {
        const tw = p.w * 0.4;
        ctx.fillRect(p.x + p.w / 2 - tw / 2, baseY - p.h - 35, tw, 35);
        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2 - tw / 2 - 4, baseY - p.h - 35);
        ctx.lineTo(p.x + p.w / 2, baseY - p.h - 55);
        ctx.lineTo(p.x + p.w / 2 + tw / 2 + 4, baseY - p.h - 35);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  _drawMoon(ctx, time) {
    const mx = this.moonX;
    const my = this.moonY;
    const r = this.moonR;

    const glow = ctx.createRadialGradient(mx, my, r * 0.5, mx, my, r * 5);
    glow.addColorStop(0, "rgba(180,190,220,0.12)");
    glow.addColorStop(0.5, "rgba(140,150,200,0.05)");
    glow.addColorStop(1, "rgba(100,110,180,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mx, my, r * 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d8dce8";
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#050510";
    ctx.beginPath();
    ctx.arc(mx + r * 0.35, my - r * 0.1, r * 0.82, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(100,110,150,0.15)";
    ctx.beginPath();
    ctx.arc(mx - r * 0.15, my + r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mx - r * 0.35, my - r * 0.25, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBalcony(ctx, floorY) {
    const railH = 70;
    const railY = floorY - railH;
    const balusterW = 14;
    const gap = 38;

    ctx.fillStyle = "#3a3228";
    ctx.fillRect(0, railY, this.width, 8);
    ctx.fillStyle = "#4a4238";
    ctx.fillRect(0, railY, this.width, 4);

    ctx.fillStyle = "#3a3228";
    ctx.fillRect(0, floorY - 6, this.width, 6);

    for (let x = 20; x < this.width; x += gap) {
      ctx.fillStyle = "#3a3228";
      ctx.fillRect(x, railY + 8, balusterW, railH - 16);
      ctx.fillStyle = "#4a4238";
      ctx.fillRect(x + 2, railY + 8, balusterW - 4, railH - 18);

      ctx.fillStyle = "#2a2218";
      ctx.fillRect(x, railY + 8, balusterW, 4);
      ctx.fillRect(x, floorY - 10, balusterW, 4);
    }

    ctx.fillStyle = "#3a3228";
    ctx.fillRect(0, railY - 4, this.width, 6);
    ctx.fillStyle = "#504840";
    ctx.fillRect(0, railY - 4, this.width, 3);
  }

  drawFloor(ctx, floorY, floorH, width) {
    ctx.fillStyle = "#2a2620";
    ctx.fillRect(0, floorY, width, floorH);

    ctx.fillStyle = "#332e28";
    for (let x = 0; x < width; x += 52) {
      ctx.fillRect(x, floorY, 2, floorH);
    }
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    for (let y = floorY; y < floorY + floorH; y += 8) {
      ctx.fillRect(0, y, width, 1);
    }

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, floorY + floorH - 4, width, 4);
  }
}
