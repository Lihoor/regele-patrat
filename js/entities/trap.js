class Trap {
  constructor(x, groundY, w) {
    this.x = x;
    this.groundY = groundY;
    this.w = w || 64;
    this.h = 6;
    this.triggered = false;
    this.animTimer = 0;
    this.animDuration = 1.2;
    this.spikes = [];
    this.active = true;
  }

  checkCollision(kingX, kingW, kingY, kingH) {
    if (this.triggered || !this.active) return false;
    const kcx = kingX + kingW / 2;
    const ky = kingY + kingH;
    return (
      kcx > this.x + 8 &&
      kcx < this.x + this.w - 8 &&
      ky >= this.groundY - 4 &&
      ky <= this.groundY + 12
    );
  }

  trigger() {
    if (this.triggered) return;
    this.triggered = true;
    this.animTimer = 0;
    this.spikes = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      this.spikes.push({
        x: this.x + (this.w / (count + 1)) * (i + 1),
        height: 0,
        maxHeight: 35 + Math.random() * 20,
        delay: i * 0.04,
        speed: 300 + Math.random() * 80,
      });
    }
  }

  update(dt) {
    if (!this.triggered) return;
    this.animTimer += dt;
    for (const s of this.spikes) {
      if (this.animTimer < s.delay) continue;
      const t = this.animTimer - s.delay;
      if (t < 0.15) {
        s.height = Math.min(s.maxHeight, (t / 0.15) * s.maxHeight);
      } else if (t < 0.6) {
        s.height = s.maxHeight;
      } else {
        const retract = (t - 0.6) / 0.4;
        s.height = Math.max(0, s.maxHeight * (1 - retract));
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.triggered
      ? "rgba(80,40,20,0.5)"
      : "rgba(30,25,18,0.35)";
    ctx.fillRect(this.x, this.groundY - this.h, this.w, this.h);

    ctx.strokeStyle = this.triggered
      ? "rgba(140,60,30,0.6)"
      : "rgba(50,40,28,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.groundY - this.h, this.w, this.h);

    if (this.triggered && this.animTimer < 0.8) {
      for (const s of this.spikes) {
        if (s.height <= 0) continue;
        ctx.fillStyle = "#7a7a7a";
        ctx.beginPath();
        ctx.moveTo(s.x - 4, this.groundY);
        ctx.lineTo(s.x, this.groundY - s.height);
        ctx.lineTo(s.x + 4, this.groundY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#a0a0a0";
        ctx.beginPath();
        ctx.moveTo(s.x - 2, this.groundY);
        ctx.lineTo(s.x, this.groundY - s.height);
        ctx.lineTo(s.x + 1, this.groundY);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (this.triggered && this.animTimer > 0.8 && this.animTimer < 1.5) {
      const flash = Math.max(0, 1 - (this.animTimer - 0.8) / 0.7);
      ctx.fillStyle = `rgba(255,100,40,${(flash * 0.15).toFixed(2)})`;
      ctx.fillRect(this.x - 10, this.groundY - 60, this.w + 20, 60);
    }
  }

  drawIndicator(ctx) {
    if (this.triggered) return;
    const pulse = Math.sin(performance.now() / 800) * 0.15 + 0.15;
    ctx.fillStyle = `rgba(180,140,60,${pulse.toFixed(2)})`;
    ctx.fillRect(this.x + 2, this.groundY - this.h - 2, this.w - 4, 2);
  }
}
