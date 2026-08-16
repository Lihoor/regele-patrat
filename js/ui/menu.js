const LANG = {
  ro: {
    title: "Regele Adormit",
    subtitle: "O Aventura Medievala",
    play: "JOACA",
    settings: "SETARI",
    howToPlay: "CUM SE JOACA",
    credits: "CREDITE",
    back: "INAPOI",
    settingsTitle: "Setari",
    musicVolume: "Volum Muzica",
    language: "Limba",
    howToTitle: "Cum se Joaca",
    keys: [
      ["A / D  sau  Stanga / Dreapta", "Misca stanga-dreapta"],
      ["Space  sau  Sus", "Sare"],
      ["Shift", "Alearga (consuma stamina)"],
      ["E", "Interactioneaza cu cufarul"],
      ["1", "Echipeaza / dezechipeaza sabia"],
    ],
    creditsTitle: "Credite",
    madeBy: "Creat de Lihoor",
    adventure: "O Aventura Medievala Patrata",
    langRO: "Romana",
    langEN: "Engleza",
    dialogue: "Wow, ce s-a intamplat aici? De ce totul e asa vechi si prafuit? Doar am dormit si eu un pic...",
    pauseTitle: "PAUZA",
    returnToLobby: "INAPOI LA MENIU",
    restart: "RESTART",
    knightDialogue: [
      "Rege: Dar ce s-a intamplat aici? De ce totul e asa vechi si prafuit?",
      "Cavalerul: Ati dormit 30 de ani, Maiestate. Multe s-au schimbat.",
      "Cavalerul: Sunt ultimul cavaler al acestui regat.",
      "Cavalerul: Regatul este acum acaparat de oameni ai intunericului.",
      "Cavalerul: Treziti-va, Majestate. Regatul are nevoie de voi."
    ],
  },
  en: {
    title: "The Sleeping King",
    subtitle: "A Medieval Adventure",
    play: "PLAY",
    settings: "SETTINGS",
    howToPlay: "HOW TO PLAY",
    credits: "CREDITS",
    back: "BACK",
    settingsTitle: "Settings",
    musicVolume: "Music Volume",
    language: "Language",
    howToTitle: "How to Play",
    keys: [
      ["A / D  or  Left / Right", "Move left and right"],
      ["Space  or  Up", "Jump"],
      ["Shift", "Sprint (uses stamina)"],
      ["E", "Interact with chest"],
      ["1", "Equip / unequip sword"],
    ],
    creditsTitle: "Credits",
    madeBy: "Made by Lihoor",
    adventure: "A Medieval Square Adventure",
    langRO: "Romanian",
    langEN: "English",
    dialogue: "Wow, what happened here? Why is everything so old and dusty? I just slept for a bit...",
    pauseTitle: "PAUSED",
    returnToLobby: "RETURN TO MENU",
    restart: "RESTART",
    knightDialogue: [
      "King: What happened here? Why is everything so old and dusty?",
      "Knight: You slept 30 years, Your Majesty. Many things have changed.",
      "Knight: I am the last knight of this kingdom.",
      "Knight: The kingdom is now overrun by servants of darkness.",
      "Knight: Wake up, Your Majesty. The kingdom needs you."
    ],
  },
};

class Menu {
  constructor(W, H) {
    this.active = true;
    this.state = "main";
    this.volume = 0.5;
    this.lang = "ro";
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

  t() { return LANG[this.lang] || LANG.ro; }

  initMusic() { this.music.init(); }

  handleMove(x, y) {
    this.mx = x;
    this.my = y;
    if (this.sliderDrag && this.state === "settings") this._updateSlider(x);
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

  handleUp() { this.sliderDrag = false; }

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
    const L = this.t();

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
    ctx.fillText(L.title, W / 2, H * 0.19);
    ctx.restore();

    ctx.fillStyle = "rgba(180,160,100,0.5)";
    ctx.font = "italic 15px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(L.subtitle, W / 2, H * 0.245);

    if (this.state === "main") {
      this._btn(ctx, W/2 - 115, H*0.34, 230, 52, L.play, () => { this.active = false; });
      this._btn(ctx, W/2 - 115, H*0.44, 230, 52, L.settings, () => { this.state = "settings"; });
      this._btn(ctx, W/2 - 115, H*0.54, 230, 52, L.howToPlay, () => { this.state = "howto"; });
      this._btn(ctx, W/2 - 115, H*0.64, 230, 52, L.credits, () => { this.state = "credits"; });
    } else if (this.state === "settings") {
      this._drawSettings(ctx, W, H, L);
    } else if (this.state === "howto") {
      this._drawHowTo(ctx, W, H, L);
    } else if (this.state === "credits") {
      this._drawCredits(ctx, W, H, L);
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
    ctx.font = "bold 19px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w/2, y + h/2 + 1);
  }

  _langBtn(ctx, x, y, w, h, label, active, fn) {
    this.buttons.push({ x, y, w, h, fn });
    ctx.fillStyle = active ? "rgba(100,80,30,0.85)" : "rgba(25,20,10,0.65)";
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = active ? "#e8c84a" : "rgba(180,146,46,0.4)";
    ctx.lineWidth = active ? 2 : 1;
    roundRect(ctx, x, y, w, h, 6);
    ctx.stroke();
    ctx.fillStyle = active ? "#fff8e0" : "#a09060";
    ctx.font = (active ? "bold " : "") + "15px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w/2, y + h/2);
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

  _drawSettings(ctx, W, H, L) {
    ctx.fillStyle = "#c8b880";
    ctx.font = "bold 30px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(L.settingsTitle, W/2, H*0.25);

    ctx.fillStyle = "#a09060";
    ctx.font = "16px Georgia, serif";
    ctx.fillText(L.musicVolume, W/2, H*0.34);

    const sx = W*0.28, sw = W*0.44, sh = 8;
    this._sliderY = H*0.41;
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
    ctx.fillText(Math.round(this.volume * 100) + "%", W/2, H*0.46);

    ctx.fillStyle = "#a09060";
    ctx.font = "16px Georgia, serif";
    ctx.fillText(L.language, W/2, H*0.54);

    const bw = 130, bh = 38, by = H*0.58;
    this._langBtn(ctx, W/2 - bw - 8, by, bw, bh, L.langRO, this.lang === "ro", () => { this.lang = "ro"; });
    this._langBtn(ctx, W/2 + 8, by, bw, bh, L.langEN, this.lang === "en", () => { this.lang = "en"; });

    this._btn(ctx, W/2 - 85, H*0.70, 170, 48, L.back, () => { this.state = "main"; });
  }

  _drawHowTo(ctx, W, H, L) {
    ctx.fillStyle = "#c8b880";
    ctx.font = "bold 30px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(L.howToTitle, W/2, H*0.08);

    const keys = L.keys;
    const colKey = W * 0.12;
    const colDesc = W * 0.52;
    let y = H * 0.18;

    for (const [key, desc] of keys) {
      ctx.fillStyle = "#d4b84a";
      ctx.font = "bold 15px Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(key, colKey, y);
      ctx.fillStyle = "#b0a068";
      ctx.font = "15px Georgia, serif";
      ctx.fillText(desc, colDesc, y);
      y += H * 0.09;
    }

    this._btn(ctx, W/2 - 85, y + H*0.04, 170, 48, L.back, () => { this.state = "main"; });
  }

  _drawCredits(ctx, W, H, L) {
    ctx.fillStyle = "#c8b880";
    ctx.font = "bold 30px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(L.creditsTitle, W/2, H*0.30);

    ctx.fillStyle = "#b0a070";
    ctx.font = "17px Georgia, serif";
    ctx.fillText(L.madeBy, W/2, H*0.40);

    ctx.fillStyle = "#8a7a50";
    ctx.font = "italic 14px Georgia, serif";
    ctx.fillText(L.adventure, W/2, H*0.47);

    this._btn(ctx, W/2 - 85, H*0.60, 170, 48, L.back, () => { this.state = "main"; });
  }
}
