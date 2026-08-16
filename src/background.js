class StoneWall {
  constructor(width, height) {
    this.build(width, height);
  }

  build(width, height) {
    this.width = width;
    this.height = height;
    this.stones = [];
    let y = -70;
    let row = 0;
    while (y < height + 70) {
      const rowH = 46 + Math.random() * 28;
      const offset = (row % 2 === 0 ? 0 : 60) + (Math.random() * 40 - 20);
      for (let x = -offset; x < width + 80; x += 90 + Math.random() * 70) {
        const sw = 70 + Math.random() * 85;
        const sh = rowH - 3;
        const j = [];
        for (let i = 0; i < 4; i++) {
          j.push((Math.random() - 0.5) * 4);
          j.push((Math.random() - 0.5) * 3);
        }
        this.stones.push({
          x: x,
          y: y,
          w: sw,
          h: sh,
          rot: (Math.random() - 0.5) * 0.045,
          g: 34 + Math.random() * 42,
          j: j,
          crack: Math.random() < 0.16 ? this.makeCrack(sw, sh) : null,
          stain: Math.random() < 0.14,
          moss: Math.random() < 0.10,
          chip: Math.random() < 0.22,
        });
      }
      y += rowH;
      row++;
    }
  }

  makeCrack(w, h) {
    const pts = [];
    let x = -w * 0.3;
    let y = -h * 0.35;
    for (let i = 0; i < 5; i++) {
      x += w * (0.12 + Math.random() * 0.1);
      y += (Math.random() - 0.5) * h * 0.6;
      pts.push([x, y]);
    }
    return pts;
  }

  draw(ctx) {
    ctx.fillStyle = "#13151c";
    ctx.fillRect(0, 0, this.width, this.height);

    for (const s of this.stones) {
      ctx.save();
      ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
      ctx.rotate(s.rot);

      const g = s.g;
      ctx.fillStyle = `rgb(${g + 5},${g + 6},${g + 11})`;
      this.roughFill(ctx, -s.w / 2, -s.h / 2, s.w, s.h, s.j);

      ctx.fillStyle = "rgba(255,255,255,0.045)";
      this.roughFill(ctx, -s.w / 2 + 1, -s.h / 2 + 1, s.w - 2, 2.5, s.j);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      this.roughFill(ctx, -s.w / 2, s.h / 2 - 3.5, s.w, 3.5, s.j);

      ctx.strokeStyle = "rgba(8,10,14,0.85)";
      ctx.lineWidth = 2;
      this.roughStroke(ctx, -s.w / 2, -s.h / 2, s.w, s.h, s.j);

      if (s.crack) this.drawCrack(ctx, s.crack);
      if (s.stain) this.drawStain(ctx, s.w, s.h);
      if (s.moss) this.drawMoss(ctx, s.w, s.h);
      if (s.chip) this.drawChip(ctx, s.w, s.h);

      ctx.restore();
    }

    ctx.fillStyle = "rgba(20,24,34,0.5)";
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.ellipse(
        (i * 197 + 61) % this.width,
        (i * 151) % this.height,
        50 + Math.random() * 90,
        30 + Math.random() * 50,
        i, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  roughFill(ctx, x, y, w, h, j) {
    ctx.beginPath();
    ctx.moveTo(x + j[0], y + j[1]);
    ctx.lineTo(x + w + j[2], y + j[3]);
    ctx.lineTo(x + w + j[4], y + h + j[5]);
    ctx.lineTo(x + j[6], y + h + j[7]);
    ctx.closePath();
    ctx.fill();
  }

  roughStroke(ctx, x, y, w, h, j) {
    ctx.beginPath();
    ctx.moveTo(x + j[0], y + j[1]);
    ctx.lineTo(x + w + j[2], y + j[3]);
    ctx.lineTo(x + w + j[4], y + h + j[5]);
    ctx.lineTo(x + j[6], y + h + j[7]);
    ctx.closePath();
    ctx.stroke();
  }

  drawCrack(ctx, pts) {
    ctx.strokeStyle = "rgba(6,8,12,0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts) ctx.lineTo(p[0], p[1]);
    ctx.stroke();
  }

  drawStain(ctx, w, h) {
    ctx.fillStyle = "rgba(28,18,12,0.34)";
    ctx.beginPath();
    ctx.ellipse((Math.random() - 0.5) * w * 0.4, (Math.random() - 0.5) * h * 0.4, w * 0.16, h * 0.22, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMoss(ctx, w, h) {
    ctx.fillStyle = "rgba(64,84,46,0.42)";
    ctx.beginPath();
    ctx.ellipse((Math.random() - 0.5) * w * 0.5, -h * 0.3, w * 0.2, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawChip(ctx, w, h) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.moveTo(-w / 2 + w * 0.5, h / 2);
    ctx.lineTo(-w / 2 + w * 0.62, h / 2 - h * 0.28);
    ctx.lineTo(-w / 2 + w * 0.74, h / 2 - h * 0.08);
    ctx.closePath();
    ctx.fill();
  }
}
