class Floor {
  constructor(width, height) {
    this.build(width, height);
  }

  build(width, height) {
    this.width = width;
    this.height = height;
    this.floorH = Math.max(84, Math.round(height * 0.15));
    this.groundY = height - this.floorH;
    this.edge = [];
    for (let x = 0; x <= width; x += 8) {
      this.edge.push([x, this.groundY + (Math.random() - 0.5) * 6]);
    }
    this.pebbles = [];
    for (let i = 0; i < width / 26; i++) {
      this.pebbles.push({
        x: Math.random() * width,
        y: this.groundY + 10 + Math.random() * (this.floorH - 20),
        r: 1.5 + Math.random() * 3,
        shade: 0.6 + Math.random() * 0.7,
      });
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#2b2015";
    ctx.beginPath();
    ctx.moveTo(this.edge[0][0], this.edge[0][1]);
    for (const p of this.edge) ctx.lineTo(p[0], p[1]);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.edge[0][0], this.edge[0][1]);
    for (const p of this.edge) ctx.lineTo(p[0], p[1]);
    ctx.stroke();

    ctx.fillStyle = "#3f2f1e";
    for (let x = 0; x < this.width; x += 46) {
      ctx.fillRect(x, this.groundY, 2, this.floorH);
    }

    ctx.fillStyle = "rgba(255,225,180,0.03)";
    for (let y = this.groundY; y < this.height; y += 7) {
      ctx.fillRect(0, y, this.width, 1);
    }

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, this.height - 5, this.width, 5);

    for (const p of this.pebbles) {
      ctx.fillStyle = `rgba(40,30,20,${0.5 * p.shade})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,220,170,${0.08 * p.shade})`;
      ctx.beginPath();
      ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
