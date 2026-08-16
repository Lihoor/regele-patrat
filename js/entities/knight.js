class Knight {
  constructor(x, groundY) {
    this.w = 108;
    this.bodyH = 108;
    this.h = this.bodyH;
    this.x = x;
    this.y = groundY - this.h;
    this.groundY = groundY;
    this.facing = -1;
    this.time = 0;
    this.promptAlpha = 0;
  }

  update(dt, kingX, kingW) {
    this.time += dt;
    const kcx = kingX + kingW / 2;
    const ncx = this.x + this.w / 2;
    const dist = Math.abs(kcx - ncx);
    const near = dist < 120;
    if (near) this.promptAlpha = Math.min(1, this.promptAlpha + dt * 4);
    else this.promptAlpha = Math.max(0, this.promptAlpha - dt * 3);
  }

  draw(ctx) {
    const bx = this.x + this.w / 2;
    const by = this.y + this.h;
    const s = this.bodyH / 84;

    const sk = 1;
    this._drawShadow(ctx, bx, this.groundY, sk);

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(s, s);

    const W = 84, B = 84;
    const flutter = Math.sin(this.time * 5) * 2;

    this._drawCape(ctx, W, B, flutter);

    ctx.save();
    ctx.scale(this.facing, 1);
    this._drawBody(ctx, W, B);
    this._drawMask(ctx, W, B);
    this._drawLegs(ctx, 0);
    this._drawHelmet(ctx, W, B);
    ctx.restore();

    this._drawSpear(ctx);

    ctx.restore();

    if (this.promptAlpha > 0.05) {
      ctx.save();
      ctx.globalAlpha = this.promptAlpha;
      ctx.fillStyle = "#e8d8a0";
      ctx.font = "bold 16px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("[E] Vorbeste", bx, this.y - 30);
      ctx.restore();
    }
  }

  _drawShadow(ctx, bx, gy, sk) {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(bx, gy + 2, 36 * sk, 6 * sk, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawCape(ctx, W, B, flutter) {
    const shY = -B * 0.35;
    const segs = 7;
    const amp = 10;
    const sway = flutter;
    const x0 = -18, x1 = 18;

    ctx.fillStyle = "#2a2035";
    ctx.strokeStyle = "rgba(60,45,70,0.5)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-W / 2 + 6, shY - 4);
    ctx.quadraticCurveTo(x0, shY + 10, x0 + 3, -16 + sway);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const x = x0 + t * (x1 - x0);
      const y = -16 + Math.sin(this.time * 7 + i * 1.5) * amp + sway * (1 - Math.abs(t - 0.5) * 1.4);
      ctx.lineTo(x, y);
    }
    ctx.quadraticCurveTo(x1, shY + 10, W / 2 - 6, shY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 1;
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const x = x0 + t * (x1 - x0);
      const y = -16 + Math.sin(this.time * 7 + i * 1.5) * amp + sway * (1 - Math.abs(t - 0.5) * 1.4);
      ctx.beginPath();
      ctx.moveTo(x, shY + 2);
      ctx.lineTo(x, y - 8);
      ctx.stroke();
    }

    ctx.fillStyle = "#eae2d2";
    ctx.beginPath();
    ctx.moveTo(-26, shY - 4);
    ctx.quadraticCurveTo(-18, shY - 10, -6, shY - 6);
    ctx.quadraticCurveTo(2, shY - 12, 10, shY - 6);
    ctx.quadraticCurveTo(20, shY - 10, 26, shY - 4);
    ctx.quadraticCurveTo(14, shY + 2, 6, shY - 1);
    ctx.quadraticCurveTo(0, shY + 3, -6, shY - 1);
    ctx.quadraticCurveTo(-14, shY + 2, -26, shY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  _drawBody(ctx, W, B) {
    const g = ctx.createLinearGradient(0, -B + 38, 0, 0);
    g.addColorStop(0, "#4a4a52");
    g.addColorStop(0.5, "#3a3a42");
    g.addColorStop(1, "#2e2e36");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(30,30,36,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-W / 2, -B + 44);
    ctx.lineTo(-W / 2, -4);
    ctx.lineTo(-W / 2 + 7, 0);
    ctx.lineTo(W / 2 - 7, 0);
    ctx.lineTo(W / 2, -4);
    ctx.lineTo(W / 2, -B + 44);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(100,100,110,0.35)";
    ctx.fillRect(-W / 2 + 4, -B + 50, W - 8, 3);
    ctx.fillRect(-W / 2 + 4, -B + 62, W - 8, 2);

    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-W / 2, -B + 44);
    ctx.lineTo(-W / 2, -4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2, -B + 44);
    ctx.lineTo(W / 2, -4);
    ctx.stroke();

    ctx.fillStyle = "rgba(160,140,80,0.55)";
    ctx.beginPath();
    ctx.arc(0, -B + 50, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-W / 2 + 8, -B + 50, 1.8, 0, Math.PI * 2);
    ctx.arc(W / 2 - 8, -B + 50, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c8b060";
    ctx.beginPath();
    ctx.moveTo(2, -B + 44);
    ctx.lineTo(-2, -B + 44);
    ctx.lineTo(0, -B + 50);
    ctx.closePath();
    ctx.fill();
  }

  _drawMask(ctx, W, B) {
    const hw = 84;
    const hh = 44;
    const top = -B;
    const bot = top + hh;

    const faceGrad = ctx.createLinearGradient(0, top, 0, bot);
    faceGrad.addColorStop(0, "#5a5a62");
    faceGrad.addColorStop(1, "#3a3a42");
    ctx.fillStyle = faceGrad;
    ctx.strokeStyle = "rgba(30,30,36,0.6)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-hw / 2 + 14, top);
    ctx.lineTo(hw / 2 - 14, top);
    ctx.arcTo(hw / 2, top, hw / 2, top + 14, 14);
    ctx.lineTo(hw / 2, bot - 7);
    ctx.arcTo(hw / 2, bot, hw / 2 - 7, bot, 7);
    ctx.lineTo(-hw / 2 + 7, bot);
    ctx.arcTo(-hw / 2, bot, -hw / 2, bot - 7, 7);
    ctx.lineTo(-hw / 2, top + 14);
    ctx.arcTo(-hw / 2, top, -hw / 2 + 14, top, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(-13, bot - 6, 26, 10);

    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(-hw / 2, top, hw, 6);

    ctx.fillStyle = "#33333c";
    ctx.beginPath();
    ctx.moveTo(-hw / 2, bot - 7);
    ctx.lineTo(-hw / 2, top - 1);
    ctx.quadraticCurveTo(-26, top - 4, -6, top - 2);
    ctx.lineTo(24, top - 2);
    ctx.quadraticCurveTo(38, top - 1, 40, top + 6);
    ctx.lineTo(36, top + 12);
    ctx.quadraticCurveTo(20, top + 9, 0, top + 11);
    ctx.lineTo(-26, top + 11);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(30, top + 8);
    ctx.lineTo(35, top + 15);
    ctx.lineTo(39, top + 8);
    ctx.moveTo(16, top + 10);
    ctx.lineTo(22, top + 17);
    ctx.lineTo(28, top + 10);
    ctx.moveTo(2, top + 11);
    ctx.lineTo(8, top + 16);
    ctx.lineTo(13, top + 11);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#28282e";
    ctx.fillRect(-hw / 2 + 6, top + 24, hw - 12, 18);
    ctx.strokeStyle = "rgba(60,60,68,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-hw / 2 + 6, top + 24, hw - 12, 18);

    ctx.fillStyle = "#0a0a10";
    ctx.beginPath();
    ctx.ellipse(-13, top + 30, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(13, top + 30, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(180,60,50,0.55)";
    ctx.beginPath();
    ctx.arc(-13, top + 30, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(13, top + 30, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(180,160,80,0.35)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      const y = top + 28 + i * 3.5;
      ctx.beginPath();
      ctx.moveTo(-hw / 2 + 8, y);
      ctx.lineTo(hw / 2 - 8, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#c9a37f";
    ctx.beginPath();
    ctx.arc(-hw / 2 + 2, top + 22, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.arc(-hw / 2 + 2, top + 23, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawLegs(ctx, leg) {
    const foot = 12;
    const legW = 17;
    const legH = 12;

    ctx.fillStyle = "#2e2e36";
    ctx.strokeStyle = "rgba(20,20,24,0.4)";
    ctx.lineWidth = 1.4;

    ctx.fillRect(-foot / 2 - 14, -legH, foot, legH);
    ctx.strokeRect(-foot / 2 - 14, -legH, foot, legH);
    ctx.fillRect(14 - foot / 2, -legH, foot, legH);
    ctx.strokeRect(14 - foot / 2, -legH, foot, legH);

    ctx.fillStyle = "#3a3a42";
    ctx.fillRect(-legW / 2 - 12, -legH * 2.4, legW, legH * 1.5);
    ctx.strokeRect(-legW / 2 - 12, -legH * 2.4, legW, legH * 1.5);
    ctx.fillRect(12 - legW / 2, -legH * 2.4, legW, legH * 1.5);
    ctx.strokeRect(12 - legW / 2, -legH * 2.4, legW, legH * 1.5);

    ctx.fillStyle = "#28282e";
    ctx.beginPath();
    ctx.arc(-12, -legH * 2.4, legW / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -legH * 2.4, legW / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawHelmet(ctx, W, B) {
    const hw = 42;
    const hh = 28;
    const top = -B - 5;
    const bot = top + hh;

    const g = ctx.createLinearGradient(0, top, 0, bot);
    g.addColorStop(0, "#5a5a62");
    g.addColorStop(1, "#3a3a42");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(30,30,36,0.6)";
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(-hw / 2 + 8, bot);
    ctx.lineTo(-hw / 2 + 4, top + 8);
    ctx.quadraticCurveTo(-hw / 2, top, 0, top - 4);
    ctx.quadraticCurveTo(hw / 2, top, hw / 2 - 4, top + 8);
    ctx.lineTo(hw / 2 - 8, bot);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#b8922e";
    ctx.fillRect(-hw / 2, bot - 2, hw, 3);

    ctx.fillStyle = "#28282e";
    ctx.beginPath();
    ctx.ellipse(-8, top + 14, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, top + 14, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(180,60,50,0.5)";
    ctx.beginPath();
    ctx.arc(-8, top + 14, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, top + 14, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawSpear(ctx) {
    const spearX = 50;
    const tipY = -120;
    const baseY = 8;

    ctx.strokeStyle = "#5a4a30";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(spearX, tipY + 18);
    ctx.lineTo(spearX, baseY);
    ctx.stroke();

    ctx.strokeStyle = "#3a2a18";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(spearX - 6, tipY + 18);
    ctx.lineTo(spearX + 6, tipY + 18);
    ctx.stroke();

    const tg = ctx.createLinearGradient(0, tipY, 0, tipY + 20);
    tg.addColorStop(0, "#c0c0cc");
    tg.addColorStop(1, "#808090");
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(spearX, tipY);
    ctx.lineTo(spearX - 7, tipY + 20);
    ctx.lineTo(spearX + 7, tipY + 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.moveTo(spearX - 1, tipY + 2);
    ctx.lineTo(spearX - 4, tipY + 18);
    ctx.lineTo(spearX, tipY + 14);
    ctx.closePath();
    ctx.fill();
  }
}
