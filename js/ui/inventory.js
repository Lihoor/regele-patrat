class Inventory {
  constructor() {
    this.slots = [null, null, null];
    this.equipped = -1;
    this.slotSize = 58;
    this.padding = 8;
    this.hp = 100;
    this.maxHp = 100;
    this.hunger = 100;
    this.maxHunger = 100;
  }

  add(item) {
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i]) {
        this.slots[i] = item;
        return i;
      }
    }
    return -1;
  }

  toggleEquip(index) {
    if (index < 0 || index >= this.slots.length || !this.slots[index]) return false;
    this.equipped = this.equipped === index ? -1 : index;
    return true;
  }

  getEquipped() {
    if (this.equipped < 0) return null;
    return this.slots[this.equipped];
  }

  hasItem(name) {
    return this.slots.includes(name);
  }

  draw(ctx, W, H) {
    const hasItems = this.slots.some((s) => s !== null);
    if (!hasItems) return;

    const total = this.slots.length;
    const gap = this.padding;
    const startX = 18;
    const slotY = H - this.slotSize - 18;
    const barW = total * this.slotSize + (total - 1) * gap;
    const barX = startX;

    this._drawBar(ctx, barX, slotY - 52, barW, 18, this.hp, this.maxHp, "#c03030", "#8a1818", "HP");
    this._drawBar(ctx, barX, slotY - 30, barW, 18, this.hunger, this.maxHunger, "#7a9a30", "#4a6018", "FOOD");

    for (let i = 0; i < total; i++) {
      const x = startX + i * (this.slotSize + gap);
      const y = slotY;
      const item = this.slots[i];

      const isEquipped = this.equipped === i;

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      roundRect(ctx, x - 2, y - 2, this.slotSize + 4, this.slotSize + 4, 7);
      ctx.fill();

      ctx.fillStyle = isEquipped ? "rgba(220,190,90,0.4)" : "rgba(50,40,30,0.55)";
      roundRect(ctx, x, y, this.slotSize, this.slotSize, 5);
      ctx.fill();

      ctx.strokeStyle = isEquipped ? "#e8c84a" : "rgba(160,140,100,0.4)";
      ctx.lineWidth = isEquipped ? 2.5 : 1.2;
      roundRect(ctx, x, y, this.slotSize, this.slotSize, 5);
      ctx.stroke();

      if (item === "sword") {
        const cx = x + this.slotSize / 2;
        const cy = y + this.slotSize / 2 + 14;
        drawSword(ctx, cx, cy, 0.7, 0);
      } else if (item === "bow") {
        const cx = x + this.slotSize / 2;
        const cy = y + this.slotSize / 2;
        this.drawBow(ctx, cx, cy, 0.9);
      }

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(String(i + 1), x + 5, y + 4);
    }
  }

  _drawBar(ctx, x, y, w, h, val, max, colorDark, colorLight, label) {
    const p = Math.max(0, Math.min(1, val / max));

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 5);
    ctx.fill();

    ctx.fillStyle = colorDark;
    roundRect(ctx, x, y, w, h, 4);
    ctx.fill();

    if (p > 0.01) {
      ctx.fillStyle = colorLight;
      roundRect(ctx, x, y, w * p, h, 4);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.2)";
      roundRect(ctx, x, y, w * p, h * 0.4, 4);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, w, h, 4);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + 8, y + h / 2);

    ctx.textAlign = "right";
    ctx.fillText(Math.round(val) + "/" + max, x + w - 8, y + h / 2);
  }

  drawBow(ctx, cx, cy, sc) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sc, sc);

    ctx.strokeStyle = "#6b4a28";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, -18);
    ctx.quadraticCurveTo(-14, 0, -8, 18);
    ctx.stroke();

    ctx.strokeStyle = "#c4a44a";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-8, -17);
    ctx.lineTo(-8, 17);
    ctx.stroke();

    ctx.strokeStyle = "#b8922e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, -17);
    ctx.lineTo(6, 0);
    ctx.lineTo(-8, 17);
    ctx.stroke();

    ctx.fillStyle = "#8a6420";
    ctx.beginPath();
    ctx.arc(6, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
