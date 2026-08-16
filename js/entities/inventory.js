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

  draw(ctx, W, H) {
    const hasItems = this.slots.some((s) => s !== null);
    if (!hasItems) return;

    const total = this.slots.length;
    const gap = 6;
    const totalW = total * this.slotSize + (total - 1) * gap;
    const startX = W / 2 - totalW / 2;
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
      }

      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(String(i + 1), x + 4, y + 3);
    }
  }
}
