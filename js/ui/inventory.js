class Inventory {
  constructor() {
    this.slots = [null, null, null];
    this.equipped = -1;
    this.slotSize = 42;
    this.padding = 6;
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
    const gap = 6;
    const totalW = total * this.slotSize + (total - 1) * gap;
    const startX = 18;
    const startY = H - 62;

    for (let i = 0; i < total; i++) {
      const x = startX + i * (this.slotSize + gap);
      const y = startY;
      const item = this.slots[i];

      const isEquipped = this.equipped === i;

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      roundRect(ctx, x - 1, y - 1, this.slotSize + 2, this.slotSize + 2, 5);
      ctx.fill();

      ctx.fillStyle = isEquipped ? "rgba(220,190,90,0.35)" : "rgba(60,50,40,0.5)";
      roundRect(ctx, x, y, this.slotSize, this.slotSize, 4);
      ctx.fill();

      ctx.strokeStyle = isEquipped ? "#e8c84a" : "rgba(180,160,120,0.4)";
      ctx.lineWidth = isEquipped ? 2 : 1;
      roundRect(ctx, x, y, this.slotSize, this.slotSize, 4);
      ctx.stroke();

      if (item === "sword") {
        const cx = x + this.slotSize / 2;
        const cy = y + this.slotSize / 2 + 12;
        drawSword(ctx, cx, cy, 0.55, 0);
      } else if (item === "bow") {
        const cx = x + this.slotSize / 2;
        const cy = y + this.slotSize / 2;
        this.drawBow(ctx, cx, cy, 0.7);
      }

      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(String(i + 1), x + 4, y + 3);
    }
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
