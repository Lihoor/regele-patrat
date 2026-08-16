class StoneWall {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.rowH = 30;
    this.stones = [];
    this.build();
  }

  build() {
    let y = -this.rowH;
    let row = 0;
    while (y < this.height + this.rowH) {
      const offset = row % 2 === 0 ? 0 : this.rowH;
      for (let x = -offset; x < this.width + this.rowH; x += this.rowH * 2) {
        this.stones.push({
          x: x,
          y: y,
          w: this.rowH * 2 - 4,
          h: this.rowH - 4,
          shade: 0.85 + Math.random() * 0.3
        });
      }
      y += this.rowH;
      row++;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#5b6068";
    ctx.fillRect(0, 0, this.width, this.height);

    for (const s of this.stones) {
      const base = 138 + (s.shade - 0.85) * 200;
      ctx.fillStyle = `rgb(${base}, ${base + 4}, ${base + 12})`;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeStyle = "#4a4e55";
      ctx.lineWidth = 2;
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = "rgba(255,255,255,.06)";
      ctx.fillRect(s.x + 2, s.y + 2, s.w - 4, 3);
    }
  }
}
