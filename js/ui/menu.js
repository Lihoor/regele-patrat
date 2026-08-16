class Menu {
  constructor(W, H) {
    this.active = true;
    this.state = "main";
    this.volume = 0.5;
    this.buttons = [];
    this.mx = 0;
    this.my = 0;
    this.sliderDrag = false;
    this.music = new MedievalMusic();
    this.time = 0;

    this.stars = [];
    for (let i = 0; i < 110; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random() * 0.52,
        r: 0.3 + Math.random() * 1.4,
        ph: Math.random() * Math.PI * 2,
      });
    }
  }

  initMusic() {
    this.music.init();
  }

  handleMove(x, y) {
    this.mx = x;
    this.my = y;
    if (this.sliderDrag && this.state === "settings") {
      this._updateSlider(x);
    }
  }

  handleDown() {
    if (this.state === "settings") {
      const W = this._W || 1280;
      const sx = W * 0.28, sw = W * 0.44;
      if (this.mx >= sx && this.mx <= sx + sw &&
          this.my >= this._sliderY - 16 && this.my <= this._sliderY + 16) {
        this.sliderDrag = true;
        this._updateSlider(this.mx);
      }
    }
  }

  handleUp() {
    this.sliderDrag = false;
  }

  _updateSlider(x) {
    const W = this._W || 1280;
    const sx = W * 0.28, sw = W * 0.44;
    this.volume = Math.max(0, Math.min(1, (x - sx) / sw));
    this.music.setVolume(this.volume);
  }

  handleClick(x, y, W, H) {
    if (!this.active) return false;
    this._W = W;
    this.initMusic();

    for (const b of this.buttons) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        b.fn();
        return true;
      }
    }
    return true;
  }

  getCursor() {
    for (const b of this.buttons) {
      if (this.mx >= b.x && this.mx <= b.x + b.w &&
          this.my >= b.y && this.my <= b.y + b.h) return "pointer";
    }
    return "default";
  }

  draw(ctx, W, H) {
    this._W = W;
    this.time += 0.016;
    this.buttons = [];

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#04041a");
    g.addColorStop(0.45, "#0a0a30");
    g.addColorStop(1, "#12123a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (const s of this.stars) {
      const a = 0.25 + Math.sin(this.time * 1.8 + s.ph) * 0.35;
      ctx.fillStyle = `rgba(255,255,230,${Math.max(0, a)})`;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    this._drawMoon(ctx, W * 0.83, H * 0.12, 30);
    this._drawCastle(ctx, W, H);

    ctx.save();
    ctx.shadowColor = "rgba(200,170,80,0.3)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#e8d8a0";
    ctx.font = "bold 48px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Regele Patrat", W / 2, H * 0.20);
    ctx.restore();

    ctx.fillStyle = "rgba(180,160,100,0.5)";
    ctx.font = "italic 15px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("The Square King", W / 2, H * 0.255);

    if (this.state === "main") {
      this._btn(ctx, W/2 - 115, H*0.36, 230, 54, "PLAY", () => { this.active = false; });
      this._btn(ctx, W/2 - 115, H*0.47, 230, 54, "SETTINGS", () => { this.state = "settings"; });
      this._btn(ctx, W/2 - 115, H*0.58, 230, 54, "HOW TO PLAY", () => { this.state = "howto"; });
      this._btn(ctx, W/2 - 115, H*0.69, 230, 54, "CREDITS", () => { this.state = "credits"; });
    } else if (this.state === "settings") {
      this._drawSettings(ctx, W, H);
    } else if (this.state === "howto") {
      this._drawHowTo(ctx, W, H);
    } else if (this.state === "credits") {
      this._drawCredits(ctx, W, H);
    }
  }

  _btn(ctx, x, y, w, h, label, fn) {
    this.buttons.push({ x, y, w, h, fn });
    const hover = this.mx >= x && this.mx <= x+w && this.my >= y && this.my <= y+h;
    ctx.fillStyle = hover ? "rgba(50,40,20,0.85)" : "rgba(25,20,10,0.75)";
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = hover ? "#e8c84a" : "#b8922e";
    ctx.lineWidth = hover ? 2.5 : 1.8;
    roundRect(ctx, x, y, w, h, 8);
    ctx.stroke();
    ctx.fillStyle = hover ? "#fff8e0" : "#e8d8a0";
    ctx.font = "bold 20px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w/2, y + h/2 + 1);
  }

  _drawMoon(ctx, x, y, r) {
    const glow = ctx.createRadialGradient(x, y, r*0.3, x, y, r*3.5);
    glow.addColorStop(0, "rgba(220,210,170,0.08)");
    glow.addColorStop(1, "rgba(220,210,170,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r*3.5, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "#f0e8c0";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "#04041a";
    ctx.beginPath();
    ctx.arc(x + r*0.38, y - r*0.12, r*0.82, 0, Math.PI*2);
    ctx.fill();
  }

  _drawCastle(ctx, W, H) {
    const gy = H * 0.87;
    ctx.fillStyle = "#06061a";

    ctx.fillRect(0, gy, W, H - gy);

    ctx.fillStyle = "#080818";
    ctx.fillRect(W*0.18, gy - H*0.20, W*0.64, H*0.20);
    ctx.fillRect(W*0.13, gy - H*0.33, W*0.07, H*0.33);
    ctx.fillRect(W*0.80, gy - H*0.33, W*0.07, H*0.33);
    ctx.fillRect(W*0.46, gy - H*0.28, W*0.08, H*0.28);

    ctx.fillStyle = "#060614";
    ctx.fillRect(W*0.32, gy - H*0.16, W*0.06, H*0.16);
    ctx.fillRect(W*0.62, gy - H*0.16, W*0.06, H*0.16);

    const cw = 9;
    ctx.fillStyle = "#080818";
    for (let x = W*0.18; x < W*0.82; x += cw*2) ctx.fillRect(x, gy - H*0.20 - 6, cw, 6);
    for (let x = W*0.13; x < W*0.20; x += cw*2) ctx.fillRect(x, gy - H*0.33 - 6, cw, 6);
    for (let x = W*0.80; x < W*0.87; x += cw*2) ctx.fillRect(x, gy - H*0.33 - 6, cw, 6);
    for (let x = W*0.46; x < W*0.54; x += cw*2) ctx.fillRect(x, gy - H*0.28 - 6, cw, 6);

    ctx.fillStyle = "#03030c";
    const gateW = W*0.065, gateH = H*0.12;
    ctx.beginPath();
    ctx.moveTo(W/2 - gateW/2, gy);
    ctx.lineTo(W/2 - gateW/2, gy - gateH);
    ctx.arc(W/2, gy - gateH, gateW/2, Math.PI, 0);
    ctx.lineTo(W/2 + gateW/2, gy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,210,80,0.45)";
    const wr = 2.2;
    ctx.beginPath();
    ctx.arc(W*0.165, gy - H*0.26, wr, 0, Math.PI*2);
    ctx.arc(W*0.835, gy - H*0.26, wr, 0, Math.PI*2);
    ctx.arc(W*0.50, gy - H*0.22, wr, 0, Math.PI*2);
    ctx.arc(W*0.35, gy - H*0.12, wr*0.8, 0, Math.PI*2);
    ctx.arc(W*0.65, gy - H*0.12, wr*0.8, 0, Math.PI*2);
    ctx.fill();
  }

  _drawSettings(ctx, W, H) {
    ctx.fillStyle = "#c8b880";
    ctx.font = "bold 30px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Settings", W/2, H*0.32);

    ctx.fillStyle = "#a09060";
    ctx.font = "16px Georgia, serif";
    ctx.fillText("Music Volume", W/2, H*0.41);

    const sx = W*0.28, sw = W*0.44, sh = 8;
    this._sliderY = H*0.48;

    ctx.fillStyle = "rgba(25,20,10,0.7)";
    roundRect(ctx, sx, this._sliderY - sh/2, sw, sh, 4);
    ctx.fill();

    ctx.fillStyle = "#b8922e";
    roundRect(ctx, sx, this._sliderY - sh/2, sw * this.volume, sh, 4);
    ctx.fill();

    ctx.fillStyle = "#e8d8a0";
    ctx.beginPath();
    ctx.arc(sx + sw * this.volume, this._sliderY, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#a09060";
    ctx.font = "14px Georgia, serif";
    ctx.fillText(Math.round(this.volume * 100) + "%", W/2, H*0.54);

    this._btn(ctx, W/2 - 85, H*0.66, 170, 48, "BACK", () => { this.state = "main"; });
  }

  _drawHowTo(ctx, W, H) {
    ctx.fillStyle = "#c8b880";
    ctx.font = "bold 30px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("How to Play", W/2, H*0.10);

    const keys = [
      ["A / D   or   Left / Right", "Move left and right"],
      ["Space   or   Up", "Jump"],
      ["Shift", "Sprint (uses stamina)"],
      ["E", "Interact with chest"],
      ["1", "Equip / unequip sword"],
    ];

    let y = H * 0.20;
    for (const [key, desc] of keys) {
      ctx.fillStyle = "#d4b84a";
      ctx.font = "bold 15px Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText(key, W/2 - 24, y);
      ctx.fillStyle = "#a09060";
      ctx.font = "15px Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(desc, W/2 + 24, y);
      y += H * 0.08;
    }

    this._btn(ctx, W/2 - 85, y + H*0.04, 170, 48, "BACK", () => { this.state = "main"; });
  }

  _drawCredits(ctx, W, H) {
    ctx.fillStyle = "#c8b880";
    ctx.font = "bold 30px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Credits", W/2, H*0.32);

    ctx.fillStyle = "#b0a070";
    ctx.font = "17px Georgia, serif";
    ctx.fillText("Made by Lihoor", W/2, H*0.43);

    ctx.fillStyle = "#8a7a50";
    ctx.font = "italic 14px Georgia, serif";
    ctx.fillText("A Medieval Square Adventure", W/2, H*0.50);

    this._btn(ctx, W/2 - 85, H*0.63, 170, 48, "BACK", () => { this.state = "main"; });
  }
}
