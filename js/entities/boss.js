class Boss {
  constructor(x, groundY, scale) {
    this.x = x;
    this.groundY = groundY;
    this.scale = scale || 2.0;
    this.baseW = 44;
    this.baseH = 99;
    this.w = this.baseW * this.scale;
    this.h = this.baseH * this.scale;
    this.hp = 275;
    this.maxHp = 275;
    this.t = 0;
    this.facing = -1;
    this.dead = false;
    this.dying = false;
    this.deathTimer = 0;
    this.hitFlash = 0;
    this.shakeX = 0;
    this.knockback = 0;
    this.state = "idle";
    this.stateTimer = 0;
    this.moveDir = 0;
    this.moveSpeed = 80;
    this.attackCooldown = 0;
    this.attackDamage = 15;
    this.attacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.6;
    this.chargeSpeed = 250;
    this.charging = false;
    this.chargeTimer = 0;
    this.chargeDuration = 0.5;
    this.pulseGlow = 0;
    this.armorGlow = 0;
    this.breathT = 0;
    this.legT = 0;
    this.swingAngle = 0;
    this.knightX = 0;
    this.knightY = 0;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }
  get y() { return this.groundY - this.h; }

  takeDamage(dmg) {
    if (this.dead || this.dying) return 0;
    const actual = Math.min(this.hp, dmg);
    this.hp -= actual;
    this.hitFlash = 0.2;
    this.shakeX = (Math.random() - 0.5) * 12;
    this.knockback = this.facing * -30;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.dying = true;
      this.deathTimer = 0;
    }
    return actual;
  }

  update(dt, kingX, kingW, kingY) {
    this.t += dt;
    this.breathT += dt;
    this.legT += dt;
    this.pulseGlow += dt;
    this.armorGlow = Math.sin(this.t * 2) * 0.15 + 0.3;

    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.shakeX !== 0) this.shakeX *= 0.85;
    if (Math.abs(this.shakeX) < 0.3) this.shakeX = 0;
    if (this.knockback !== 0) {
      this.x += this.knockback * dt * 10;
      this.knockback *= 0.88;
      if (Math.abs(this.knockback) < 1) this.knockback = 0;
    }

    if (this.dying) {
      this.deathTimer += dt;
      if (this.deathTimer > 2.0) this.dying = false;
      return;
    }

    if (this.dead) return;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const kcx = kingX + kingW / 2;
    const bcx = this.centerX;
    const dist = Math.abs(kcx - bcx);
    this.facing = kcx > bcx ? 1 : -1;

    if (this.charging) {
      this.chargeTimer += dt;
      this.x += this.facing * this.chargeSpeed * dt;
      if (this.chargeTimer >= this.chargeDuration) {
        this.charging = false;
        this.chargeTimer = 0;
        this.attackCooldown = 0.8;
      }
    } else if (this.attacking) {
      this.attackTimer += dt;
      this.swingAngle = Math.min(1, this.attackTimer / (this.attackDuration * 0.4)) * 1.5;
      if (this.attackTimer >= this.attackDuration) {
        this.attacking = false;
        this.attackTimer = 0;
        this.swingAngle = 0;
        this.attackCooldown = 0.6 + Math.random() * 0.8;
      }
    } else if (dist < 160 * this.scale && this.attackCooldown <= 0) {
      if (Math.random() < 0.4) {
        this.charging = true;
        this.chargeTimer = 0;
        this.state = "charge";
      } else {
        this.attacking = true;
        this.attackTimer = 0;
        this.state = "attack";
      }
    } else if (dist > 300 * this.scale || Math.random() < 0.02) {
      this.state = "walk";
    }

    if (!this.attacking && !this.charging) {
      if (this.state === "walk" || dist > 180 * this.scale) {
        this.x += this.facing * this.moveSpeed * dt;
        this.legT += dt * 8;
      } else if (this.state === "idle") {
        this.x += this.facing * this.moveSpeed * 0.3 * dt;
      }
    }

    this.x = Math.max(this.w / 2, this.x);
  }

  canDamage(kingX, kingW, kingY) {
    if (this.dead || this.dying) return 0;
    if (!this.attacking) return 0;
    const progress = this.attackTimer / this.attackDuration;
    if (progress < 0.3 || progress > 0.7) return 0;
    const kcx = kingX + kingW / 2;
    const bcx = this.centerX;
    const dx = Math.abs(kcx - bcx);
    if (dx < (this.w / 2 + kingW / 2 + 15) * 1.1) {
      return this.attackDamage;
    }
    return 0;
  }

  draw(ctx) {
    ctx.save();
    const sx = this.x + this.shakeX;
    const sy = this.y;
    const sc = this.scale;

    if (this.dying) {
      const fade = Math.max(0, 1 - this.deathTimer / 2.0);
      ctx.globalAlpha = fade;
      ctx.save();
      ctx.translate(sx + this.w / 2, sy + this.h);
      ctx.rotate((this.deathTimer * 0.5) * this.facing);
      ctx.translate(-(sx + this.w / 2), -(sy + this.h));
    }

    if (this.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,100,80,${(this.hitFlash * 4).toFixed(2)})`;
      ctx.fillRect(sx - 5, sy - 5, this.w + 10, this.h + 10);
    }

    ctx.save();
    ctx.translate(sx + this.w / 2, sy + this.h);
    ctx.scale(this.facing, 1);
    ctx.translate(-this.w / 2, -this.h);

    const legSwing = Math.sin(this.legT) * 12;
    ctx.fillStyle = "#3a3228";
    ctx.fillRect(8 * sc, 70 * sc, 10 * sc, 29 * sc);
    ctx.fillRect(26 * sc, 70 * sc, 10 * sc, 29 * sc);
    ctx.fillStyle = "#4a4238";
    ctx.fillRect(10 * sc, 70 * sc, 6 * sc, 28 * sc);
    ctx.fillRect(28 * sc, 70 * sc, 6 * sc, 28 * sc);

    ctx.fillStyle = "#2a2218";
    ctx.fillRect(6 * sc, 94 * sc, 14 * sc, 6 * sc);
    ctx.fillRect(24 * sc, 94 * sc, 14 * sc, 6 * sc);

    const armorBase = this.hitFlash > 0 ? 180 : 120;
    const ab = armorBase;
    const armorColor = `rgb(${ab - 20},${ab - 15},${ab + 10})`;
    const armorHighlight = `rgb(${ab},${ab + 5},${ab + 25})`;
    const armorDark = `rgb(${ab - 40},${ab - 35},${ab - 10})`;

    ctx.fillStyle = armorDark;
    ctx.fillRect(2 * sc, 56 * sc, 40 * sc, 20 * sc);
    ctx.fillStyle = armorColor;
    ctx.fillRect(4 * sc, 58 * sc, 36 * sc, 16 * sc);
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(6 * sc, 58 * sc, 32 * sc, 6 * sc);

    ctx.fillStyle = armorDark;
    ctx.fillRect(6 * sc, 30 * sc, 32 * sc, 30 * sc);
    ctx.fillStyle = armorColor;
    ctx.fillRect(8 * sc, 32 * sc, 28 * sc, 26 * sc);
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(10 * sc, 32 * sc, 24 * sc, 8 * sc);

    ctx.fillStyle = armorDark;
    ctx.fillRect(0, 34 * sc, 6 * sc, 24 * sc);
    ctx.fillRect(38 * sc, 34 * sc, 6 * sc, 24 * sc);
    ctx.fillStyle = armorColor;
    ctx.fillRect(1 * sc, 36 * sc, 4 * sc, 20 * sc);
    ctx.fillRect(39 * sc, 36 * sc, 4 * sc, 20 * sc);

    ctx.fillStyle = armorDark;
    ctx.beginPath();
    ctx.arc(22 * sc, 22 * sc, 18 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.arc(22 * sc, 22 * sc, 16 * sc, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1a1210";
    ctx.fillRect(10 * sc, 18 * sc, 24 * sc, 6 * sc);
    ctx.fillStyle = "#c03030";
    const eyeGlow = 0.6 + Math.sin(this.t * 3) * 0.3;
    ctx.globalAlpha = eyeGlow;
    ctx.beginPath();
    ctx.arc(16 * sc, 20 * sc, 3 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(28 * sc, 20 * sc, 3 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = armorHighlight;
    ctx.fillRect(10 * sc, 10 * sc, 24 * sc, 4 * sc);
    ctx.fillStyle = armorDark;
    ctx.fillRect(14 * sc, 6 * sc, 16 * sc, 6 * sc);

    ctx.fillStyle = armorDark;
    ctx.beginPath();
    ctx.moveTo(18 * sc, 26 * sc);
    ctx.lineTo(26 * sc, 26 * sc);
    ctx.lineTo(28 * sc, 30 * sc);
    ctx.lineTo(16 * sc, 30 * sc);
    ctx.closePath();
    ctx.fill();

    const swingAngle = this.attacking ? this.swingAngle * this.facing : 0;
    ctx.save();
    ctx.translate(38 * sc, 40 * sc);
    ctx.rotate(swingAngle);

    ctx.fillStyle = armorDark;
    ctx.fillRect(0, -4 * sc, 30 * sc, 8 * sc);
    ctx.fillStyle = armorColor;
    ctx.fillRect(2 * sc, -3 * sc, 26 * sc, 6 * sc);

    ctx.fillStyle = "#5a5a6a";
    ctx.fillRect(28 * sc, -10 * sc, 8 * sc, 20 * sc);
    ctx.fillStyle = "#8a8a9a";
    ctx.fillRect(30 * sc, -8 * sc, 4 * sc, 16 * sc);
    ctx.fillStyle = "#aaaabc";
    ctx.fillRect(31 * sc, -6 * sc, 2 * sc, 12 * sc);

    ctx.fillStyle = "#4a3a28";
    ctx.fillRect(26 * sc, -3 * sc, 4 * sc, 6 * sc);

    ctx.restore();

    ctx.fillStyle = armorDark;
    ctx.fillRect(-8 * sc, 36 * sc, 8 * sc, 20 * sc);
    ctx.fillStyle = armorColor;
    ctx.fillRect(-6 * sc, 38 * sc, 4 * sc, 16 * sc);

    ctx.fillStyle = "#c8b060";
    ctx.fillRect(10 * sc, 36 * sc, 24 * sc, 3 * sc);
    ctx.fillStyle = "#a08830";
    ctx.beginPath();
    ctx.arc(22 * sc, 37.5 * sc, 3 * sc, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (!this.dead && !this.dying) {
      const glowF = this.armorGlow;
      ctx.strokeStyle = `rgba(200,80,60,${glowF.toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx + this.w / 2, sy + this.h * 0.4, this.w * 0.55, this.h * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    if (this.dying) {
      ctx.restore();
    }
  }

  drawHealthBar(ctx) {
    if (this.dead && !this.dying) return;
    const barW = 200;
    const barH = 16;
    const bx = (ctx.canvas.width / (window.devicePixelRatio || 1) - barW) / 2;
    const by = 30;
    const p = Math.max(0, this.hp / this.maxHp);

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    roundRect(ctx, bx - 4, by - 4, barW + 8, barH + 8, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    roundRect(ctx, bx - 4, by - 4, barW + 8, barH + 8, 6);
    ctx.stroke();

    ctx.fillStyle = p > 0.3 ? "#c04030" : "#ff3020";
    if (p > 0.01) {
      roundRect(ctx, bx, by, barW * p, barH, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      roundRect(ctx, bx, by, barW * p, barH * 0.4, 4);
      ctx.fill();
    }

    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Cavalerul Mutant", bx + barW / 2, by - 14);
    ctx.fillText(`${this.hp} / ${this.maxHp}`, bx + barW / 2, by + barH / 2 + 1);
  }
}
