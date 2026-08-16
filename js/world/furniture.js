class Furniture {
  constructor(type, x, y, scale) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.scale = scale || 1;
    this.t = Math.random() * 10;
  }

  update(dt) {
    this.t += dt;
  }

  lightInfo() {
    if (this.type === "candelabra") {
      const f = 1 + Math.sin(this.t * 9) * 0.07 + Math.sin(this.t * 23) * 0.05;
      return { x: this.x, y: this.y - 52 * this.scale, r: 190 * f * this.scale };
    }
    if (this.type === "table") {
      const f = 1 + Math.sin(this.t * 11) * 0.06;
      return { x: this.x + 10 * this.scale, y: this.y - 33 * this.scale, r: 140 * f * this.scale };
    }
    return null;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.lineJoin = "round";
    switch (this.type) {
      case "throne": this.drawThrone(ctx); break;
      case "table": this.drawTable(ctx); break;
      case "barrel": this.drawBarrel(ctx); break;
      case "candelabra": this.drawCandelabra(ctx); break;
      case "tapestry": this.drawTapestry(ctx); break;
      case "crate": this.drawCrate(ctx); break;
    }
    ctx.restore();
  }

  drawThrone(ctx) {
    const g = ctx.createLinearGradient(0, -96, 0, 0);
    g.addColorStop(0, "#6b4326");
    g.addColorStop(1, "#3a2212");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -34, -96, 68, 86, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#8a1a20";
    this.roundRect(ctx, -24, -88, 48, 58, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    this.roundRect(ctx, -24, -88, 48, 58, 8);
    ctx.stroke();

    ctx.fillStyle = "#4a2c18";
    this.roundRect(ctx, -36, -24, 72, 18, 6);
    ctx.fill();

    ctx.fillStyle = "#a1242e";
    this.roundRect(ctx, -30, -26, 60, 12, 5);
    ctx.fill();

    ctx.fillStyle = "#4a2c16";
    this.roundRect(ctx, -40, -40, 16, 34, 5);
    ctx.fill();
    this.roundRect(ctx, 24, -40, 16, 34, 5);
    ctx.fill();
    ctx.fillStyle = "#a1242e";
    this.roundRect(ctx, -42, -42, 20, 8, 4);
    ctx.fill();
    this.roundRect(ctx, 22, -42, 20, 8, 4);
    ctx.fill();

    ctx.fillStyle = "#2e1a0e";
    ctx.fillRect(-30, -8, 11, 8);
    ctx.fillRect(19, -8, 11, 8);

    ctx.strokeStyle = "#e0b83c";
    ctx.lineWidth = 1.8;
    this.roundRect(ctx, -34, -96, 68, 86, 10);
    ctx.stroke();

    ctx.fillStyle = "#f0c64f";
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-8, -70);
    ctx.lineTo(-6, -78);
    ctx.lineTo(-2, -70);
    ctx.lineTo(0, -82);
    ctx.lineTo(2, -70);
    ctx.lineTo(6, -78);
    ctx.lineTo(8, -70);
    ctx.lineTo(0, -72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawTable(ctx) {
    ctx.fillStyle = "#6b4527";
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -52, -30, 104, 10, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,225,170,0.10)";
    this.roundRect(ctx, -52, -30, 104, 3, 2);
    ctx.fill();

    ctx.fillStyle = "#4a2f18";
    ctx.fillRect(-44, -20, 9, 20);
    ctx.fillRect(35, -20, 9, 20);
    ctx.fillStyle = "#33200f";
    ctx.fillRect(-44, -6, 9, 6);
    ctx.fillRect(35, -6, 9, 6);

    ctx.fillStyle = "#8a8a96";
    ctx.beginPath();
    ctx.ellipse(-16, -30, 10, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    this.candle(ctx, 10, -32, 0.9);
  }

  drawBarrel(ctx) {
    ctx.fillStyle = "#7a542c";
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -40);
    ctx.quadraticCurveTo(-20, -20, -16, 0);
    ctx.lineTo(16, 0);
    ctx.quadraticCurveTo(20, -20, 16, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#8a622f";
    ctx.beginPath();
    ctx.ellipse(0, -40, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = "#4a3118";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-17.5, -30);
    ctx.quadraticCurveTo(0, -32, 17.5, -30);
    ctx.moveTo(-18.5, -16);
    ctx.quadraticCurveTo(0, -18, 18.5, -16);
    ctx.moveTo(-17.5, -2);
    ctx.quadraticCurveTo(0, -4, 17.5, -2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,220,170,0.12)";
    ctx.beginPath();
    ctx.ellipse(-6, -28, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCrate(ctx) {
    ctx.fillStyle = "#6b4a28";
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -20, -32, 40, 32, 3);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#3a2816";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, -32);
    ctx.lineTo(20, 0);
    ctx.moveTo(20, -32);
    ctx.lineTo(-20, 0);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,220,170,0.12)";
    this.roundRect(ctx, -20, -32, 40, 3, 1.5);
    ctx.fill();
  }

  drawCandelabra(ctx) {
    ctx.fillStyle = "#5a5a66";
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -16, -6, 32, 8, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#6a6a76";
    this.roundRect(ctx, -3, -40, 6, 36, 3);
    ctx.fill();
    ctx.fillStyle = "#7a7a88";
    this.roundRect(ctx, -5, -42, 10, 6, 2);
    ctx.fill();

    ctx.strokeStyle = "#6a6a76";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.quadraticCurveTo(-8, -46, -17, -52);
    ctx.moveTo(0, -38);
    ctx.quadraticCurveTo(8, -46, 17, -52);
    ctx.stroke();

    ctx.strokeStyle = "#7a7a88";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-17, -52);
    ctx.lineTo(-17, -56);
    ctx.moveTo(17, -52);
    ctx.lineTo(17, -56);
    ctx.stroke();

    this.candle(ctx, 0, -40, 0.8);
    this.candle(ctx, -17, -56, 0.8);
    this.candle(ctx, 17, -56, 0.8);
  }

  drawTapestry(ctx) {
    const w = 120;
    const h = 170;

    ctx.fillStyle = "#3a2412";
    this.roundRect(ctx, -w / 2 - 6, -8, w + 12, 9, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, -w / 2 - 6, -8, w + 12, 9, 3);
    ctx.stroke();

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#5c1620");
    g.addColorStop(1, "#38080c");
    ctx.fillStyle = g;
    this.roundRect(ctx, -w / 2, 0, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, -w / 2, 0, w, h, 4);
    ctx.stroke();

    ctx.strokeStyle = "#e0b83c";
    ctx.lineWidth = 3;
    this.roundRect(ctx, -w / 2 + 6, 6, w - 12, h - 12, 3);
    ctx.stroke();

    ctx.fillStyle = "#f0c64f";
    ctx.strokeStyle = "#8a6d1c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-18, h * 0.30);
    ctx.lineTo(-12, h * 0.30 - 24);
    ctx.lineTo(-4, h * 0.30 - 4);
    ctx.lineTo(0, h * 0.30 - 30);
    ctx.lineTo(4, h * 0.30 - 4);
    ctx.lineTo(12, h * 0.30 - 24);
    ctx.lineTo(18, h * 0.30);
    ctx.quadraticCurveTo(0, h * 0.30 + 10, -18, h * 0.30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#7a6a4a";
    ctx.lineWidth = 2;
    for (const rx of [-w / 2 + 8, w / 2 - 8]) {
      ctx.beginPath();
      ctx.arc(rx, -4, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#e0b83c";
    for (let i = -4; i <= 4; i++) {
      ctx.fillRect(i * 12 - 1, h - 6, 2, 9);
    }
  }

  candle(ctx, x, y, s) {
    ctx.fillStyle = "#e8dcc0";
    this.roundRect(ctx, x - 3 * s, y - 10 * s, 6 * s, 10 * s, 2 * s);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    this.roundRect(ctx, x - 3 * s, y - 10 * s, 6 * s, 2 * s, 1);
    ctx.fill();
    this.flame(ctx, x, y, s);
  }

  flame(ctx, x, y, s) {
    const f = 1 + Math.sin(this.t * 9) * 0.12 + Math.sin(this.t * 23.5) * 0.07;
    const g = ctx.createRadialGradient(x, y - 4, 1, x, y, 34 * s * f);
    g.addColorStop(0, "rgba(255,190,90,0.5)");
    g.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 34 * s, y - 38 * s, 68 * s, 68 * s);

    const h = 15 * s * f;
    ctx.fillStyle = "#ffb347";
    this.teardrop(ctx, x, y, h, 5.5 * s);
    ctx.fillStyle = "#ffe08a";
    this.teardrop(ctx, x, y - h * 0.2, h * 0.55, 3.4 * s);
    ctx.fillStyle = "#fff6d8";
    this.teardrop(ctx, x, y - h * 0.35, h * 0.3, 2 * s);
  }

  teardrop(ctx, cx, baseY, h, w) {
    ctx.fillStyle = "inherit";
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, baseY);
    ctx.quadraticCurveTo(cx - w / 2, baseY - h * 0.72, cx, baseY - h);
    ctx.quadraticCurveTo(cx + w / 2, baseY - h * 0.72, cx + w / 2, baseY);
    ctx.quadraticCurveTo(cx, baseY + h * 0.16, cx - w / 2, baseY);
    ctx.closePath();
    ctx.fill();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
