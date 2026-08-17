class Boss {
  constructor(x, groundY, scale) {
    this.x = x;
    this.groundY = groundY;
    this.scale = scale || 2.0;
    this.baseW = 44;
    this.baseH = 99;
    this.w = this.baseW * this.scale;
    this.h = this.baseH * this.scale;
    this.hp = 500;
    this.maxHp = 500;
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
    this.moveSpeed = 120;
    this.attackCooldown = 0;
    this.attackDamage = 25;
    this.attacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.55;
    this.chargeSpeed = 380;
    this.charging = false;
    this.chargeTimer = 0;
    this.chargeDuration = 0.45;
    this.pulseGlow = 0;
    this.armorGlow = 0;
    this.breathT = 0;
    this.legT = 0;
    this.swingAngle = 0;
    this.enraged = false;
    this.slamming = false;
    this.slamTimer = 0;
    this.slamDuration = 0.8;
    this.slamDamage = 35;
    this.slamShockwave = 0;
    this.swordTrail = [];
    this.enrageGlow = 0;
    this.auraParticles = [];
    this.stompTimer = 0;
    this.jumpAttack = false;
    this.jumpAttackTimer = 0;
    this.jumpAttackDuration = 0.6;
    this.jumpY = 0;
    this.jumpVY = 0;
    this.kingY = 0;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }
  get y() { return this.groundY - this.h; }

  takeDamage(dmg, fromArrow) {
    if (this.dead || this.dying) return 0;
    const actual = Math.min(this.hp, dmg);
    this.hp -= actual;
    this.hitFlash = 0.25;
    this.shakeX = (Math.random() - 0.5) * 16;
    this.knockback = fromArrow ? this.facing * -8 : this.facing * -35;

    if (!this.enraged && this.hp <= this.maxHp * 0.5) {
      this.enraged = true;
      this.moveSpeed = 170;
      this.chargeSpeed = 450;
      this.attackDamage = 30;
      this.attackDuration = 0.45;
    }

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
    this.kingY = kingY;
    this.armorGlow = Math.sin(this.t * 2) * 0.15 + 0.3;
    if (this.enraged) this.enrageGlow = 0.3 + Math.sin(this.t * 5) * 0.2;

    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.shakeX !== 0) this.shakeX *= 0.85;
    if (Math.abs(this.shakeX) < 0.3) this.shakeX = 0;
    if (this.knockback !== 0) {
      this.x += this.knockback * dt * 10;
      this.knockback *= 0.88;
      if (Math.abs(this.knockback) < 1) this.knockback = 0;
    }

    if (this.slamShockwave > 0) this.slamShockwave -= dt * 3;

    if (this.swordTrail.length > 0) {
      for (let i = this.swordTrail.length - 1; i >= 0; i--) {
        this.swordTrail[i].life -= dt;
        if (this.swordTrail[i].life <= 0) this.swordTrail.splice(i, 1);
      }
    }

    if (Math.random() < 0.15 && !this.dead && !this.dying) {
      this.auraParticles.push({
        x: this.x + Math.random() * this.w,
        y: this.y + Math.random() * this.h * 0.5,
        vx: (Math.random() - 0.5) * 20,
        vy: -30 - Math.random() * 40,
        life: 0.6 + Math.random() * 0.5,
        maxLife: 1,
        size: 2 + Math.random() * 3,
      });
    }
    for (let i = this.auraParticles.length - 1; i >= 0; i--) {
      const p = this.auraParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.auraParticles.splice(i, 1);
    }

    if (this.dying) {
      this.deathTimer += dt;
      this.knockback *= 0.9;
      if (Math.abs(this.knockback) > 0.5) {
        this.x += this.knockback * dt * 10;
      }
      return;
    }

    if (this.dead) return;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const kcx = kingX + kingW / 2;
    const bcx = this.centerX;
    const dist = Math.abs(kcx - bcx);
    this.facing = kcx > bcx ? 1 : -1;

    if (this.jumpAttack) {
      this.jumpAttackTimer += dt;
      this.jumpY += this.jumpVY * dt;
      this.jumpVY += 1400 * dt;
      this.x += this.facing * this.moveSpeed * 2.5 * dt;
      if (this.jumpY >= 0) {
        this.jumpY = 0;
        this.jumpVY = 0;
        this.jumpAttack = false;
        this.jumpAttackTimer = 0;
        this.slamShockwave = 1;
        this.attackCooldown = this.enraged ? 0.4 + Math.random() * 0.3 : 0.7 + Math.random() * 0.4;
      }
      return;
    }

    if (this.slamming) {
      this.slamTimer += dt;
      if (this.slamTimer > this.slamDuration * 0.3 && this.slamTimer < this.slamDuration * 0.35) {
        this.slamShockwave = 1;
      }
      if (this.slamTimer >= this.slamDuration) {
        this.slamming = false;
        this.slamTimer = 0;
        this.attackCooldown = 1.0 + Math.random() * 0.5;
      }
      return;
    }

    if (this.charging) {
      this.chargeTimer += dt;
      this.x += this.facing * this.chargeSpeed * dt;
      this.stompTimer += dt;
      if (this.stompTimer > 0.12) {
        this.stompTimer = 0;
      }
      if (this.chargeTimer >= this.chargeDuration) {
        this.charging = false;
        this.chargeTimer = 0;
        this.attackCooldown = 0.6 + Math.random() * 0.4;
      }
    } else if (this.attacking) {
      this.attackTimer += dt;
      this.swingAngle = Math.min(1, this.attackTimer / (this.attackDuration * 0.4)) * 1.8;

      if (this.swingAngle > 0.2) {
        const sx = this.x + this.w / 2 + this.facing * 30 * this.scale;
        const sy = this.y + this.h * 0.35;
        this.swordTrail.push({
          x: sx + (Math.random() - 0.5) * 8,
          y: sy + (Math.random() - 0.5) * 8,
          life: 0.3,
          maxLife: 0.3,
        });
      }

      if (this.attackTimer >= this.attackDuration) {
        this.attacking = false;
        this.attackTimer = 0;
        this.swingAngle = 0;
        this.attackCooldown = this.enraged ? 0.4 + Math.random() * 0.5 : 0.6 + Math.random() * 0.7;
      }
    } else if (dist < 220 * this.scale && this.attackCooldown <= 0) {
      const kingInAir = kingY < this.groundY - 120;
      const roll = Math.random();
      if (kingInAir && roll < 0.55) {
        this.jumpAttack = true;
        this.jumpAttackTimer = 0;
        this.jumpY = 0;
        this.jumpVY = -700;
        this.state = "jump";
      } else if (roll < 0.28) {
        this.charging = true;
        this.chargeTimer = 0;
        this.state = "charge";
      } else if (roll < 0.5) {
        this.attacking = true;
        this.attackTimer = 0;
        this.state = "attack";
      } else if (this.enraged) {
        this.slamming = true;
        this.slamTimer = 0;
        this.state = "slam";
      } else {
        this.attacking = true;
        this.attackTimer = 0;
        this.state = "attack";
      }
    } else if (dist > 300 * this.scale || Math.random() < 0.03) {
      this.state = "walk";
    }

    if (!this.attacking && !this.charging && !this.slamming) {
      if (this.state === "walk" || dist > 180 * this.scale) {
        this.x += this.facing * this.moveSpeed * dt;
        this.legT += dt * 10;
      } else if (this.state === "idle") {
        this.x += this.facing * this.moveSpeed * 0.3 * dt;
      }
    }

    this.x = Math.max(this.w / 2, this.x);
  }

  canDamage(kingX, kingW, kingY) {
    if (this.dead || this.dying) return 0;

    if (this.jumpAttack) {
      const progress = this.jumpAttackTimer / this.jumpAttackDuration;
      if (progress > 0.3 && progress < 0.8) {
        const kcx = kingX + kingW / 2;
        const bcx = this.centerX;
        const dx = Math.abs(kcx - bcx);
        if (dx < this.w * 2.0) {
          return this.enraged ? 40 : 30;
        }
      }
      return 0;
    }

    if (this.slamming) {
      const slamProgress = this.slamTimer / this.slamDuration;
      if (slamProgress > 0.28 && slamProgress < 0.38) {
        const kcx = kingX + kingW / 2;
        const dx = Math.abs(kcx - this.centerX);
        if (dx < this.w * 2.2) {
          return this.enraged ? this.slamDamage : 25;
        }
      }
      return 0;
    }

    if (this.charging) {
      const kcx = kingX + kingW / 2;
      const bcx = this.centerX;
      const dx = Math.abs(kcx - bcx);
      if (dx < (this.w / 2 + kingW / 2 + 20) * 1.3) {
        return this.enraged ? 30 : 20;
      }
      return 0;
    }

    if (!this.attacking) return 0;
    const progress = this.attackTimer / this.attackDuration;
    if (progress < 0.25 || progress > 0.75) return 0;
    const kcx = kingX + kingW / 2;
    const bcx = this.centerX;
    const dx = Math.abs(kcx - bcx);
    if (dx < (this.w / 2 + kingW / 2 + 25) * 1.2) {
      return this.attackDamage;
    }
    return 0;
  }

  draw(ctx) {
    ctx.save();
    const sx = this.x + this.shakeX;
    const jumpOffset = this.jumpY || 0;
    const sy = this.y - jumpOffset;
    const sc = this.scale;

    if (this.dead && !this.dying) {
      ctx.save();
      ctx.translate(sx + this.w / 2, this.groundY);
      ctx.rotate(Math.PI / 2 * this.facing);
      ctx.translate(-(sx + this.w / 2), -(this.groundY));
      ctx.globalAlpha = 0.7;
    } else if (this.dying) {
      const fallAngle = Math.min(1, this.deathTimer / 0.8);
      ctx.save();
      ctx.translate(sx + this.w / 2, sy + this.h);
      ctx.rotate(fallAngle * (Math.PI / 2) * this.facing);
      ctx.translate(-(sx + this.w / 2), -(sy + this.h));
    }

    for (const p of this.auraParticles) {
      const a = Math.max(0, p.life / p.maxLife) * 0.6;
      ctx.fillStyle = this.enraged
        ? `rgba(255,60,40,${a.toFixed(2)})`
        : `rgba(200,120,60,${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }

    for (const st of this.swordTrail) {
      const a = (st.life / st.maxLife) * 0.5;
      ctx.strokeStyle = this.enraged
        ? `rgba(255,120,80,${a.toFixed(2)})`
        : `rgba(180,200,255,${a.toFixed(2)})`;
      ctx.lineWidth = 3 * (st.life / st.maxLife);
      ctx.beginPath();
      ctx.arc(st.x, st.y, 4 * (st.life / st.maxLife), 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,100,80,${(this.hitFlash * 5).toFixed(2)})`;
      ctx.fillRect(sx - 5, sy - 5, this.w + 10, this.h + 10);
    }

    ctx.save();
    ctx.translate(sx + this.w / 2, sy + this.h);
    ctx.scale(this.facing, 1);
    ctx.translate(-this.w / 2, -this.h);

    const isSlamming = this.slamming && this.slamTimer < this.slamDuration * 0.3;
    const bodySquash = isSlamming ? 1 + Math.sin(this.slamTimer * 20) * 0.03 : 1;
    const breathe = Math.sin(this.breathT * 2.5) * 2;

    ctx.fillStyle = "#3a3228";
    ctx.fillRect(8 * sc, 70 * sc, 10 * sc, 29 * sc);
    ctx.fillRect(26 * sc, 70 * sc, 10 * sc, 29 * sc);
    ctx.fillStyle = "#4a4238";
    ctx.fillRect(10 * sc, 70 * sc, 6 * sc, 28 * sc);
    ctx.fillRect(28 * sc, 70 * sc, 6 * sc, 28 * sc);
    ctx.fillStyle = "#2a2218";
    ctx.fillRect(6 * sc, 94 * sc, 14 * sc, 6 * sc);
    ctx.fillRect(24 * sc, 94 * sc, 14 * sc, 6 * sc);

    const armorBase = this.hitFlash > 0 ? 180 : (this.enraged ? 130 : 120);
    const ab = armorBase;
    const armorColor = this.enraged
      ? `rgb(${ab},${ab - 25},${ab - 30})`
      : `rgb(${ab - 20},${ab - 15},${ab + 10})`;
    const armorHighlight = this.enraged
      ? `rgb(${ab + 10},${ab - 15},${ab - 20})`
      : `rgb(${ab},${ab + 5},${ab + 25})`;
    const armorDark = this.enraged
      ? `rgb(${ab - 35},${ab - 40},${ab - 35})`
      : `rgb(${ab - 40},${ab - 35},${ab - 10})`;

    ctx.save();
    ctx.translate(this.w / 2, 55 * sc);
    ctx.scale(1, bodySquash);
    ctx.translate(-this.w / 2, -55 * sc);

    ctx.fillStyle = armorDark;
    ctx.fillRect(2 * sc, (56 + breathe * 0.3) * sc, 40 * sc, 20 * sc);
    ctx.fillStyle = armorColor;
    ctx.fillRect(4 * sc, (58 + breathe * 0.3) * sc, 36 * sc, 16 * sc);
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(6 * sc, (58 + breathe * 0.3) * sc, 32 * sc, 6 * sc);

    ctx.fillStyle = armorDark;
    ctx.fillRect(6 * sc, (30 + breathe) * sc, 32 * sc, 30 * sc);
    ctx.fillStyle = armorColor;
    ctx.fillRect(8 * sc, (32 + breathe) * sc, 28 * sc, 26 * sc);
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(10 * sc, (32 + breathe) * sc, 24 * sc, 8 * sc);

    ctx.restore();

    ctx.fillStyle = armorDark;
    ctx.fillRect(0, 34 * sc, 6 * sc, 24 * sc);
    ctx.fillRect(38 * sc, 34 * sc, 6 * sc, 24 * sc);
    ctx.fillStyle = armorColor;
    ctx.fillRect(1 * sc, 36 * sc, 4 * sc, 20 * sc);
    ctx.fillRect(39 * sc, 36 * sc, 4 * sc, 20 * sc);

    ctx.fillStyle = armorDark;
    ctx.beginPath();
    ctx.arc(22 * sc, (22 + breathe) * sc, 18 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.arc(22 * sc, (22 + breathe) * sc, 16 * sc, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1a1210";
    ctx.fillRect(10 * sc, (18 + breathe) * sc, 24 * sc, 6 * sc);
    const eyeColor = this.enraged ? "#ff2010" : "#c03030";
    ctx.fillStyle = eyeColor;
    const eyeGlow = this.enraged
      ? 0.8 + Math.sin(this.t * 6) * 0.2
      : 0.6 + Math.sin(this.t * 3) * 0.3;
    ctx.globalAlpha = eyeGlow;
    ctx.beginPath();
    ctx.arc(16 * sc, (20 + breathe) * sc, this.enraged ? 3.5 * sc : 3 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(28 * sc, (20 + breathe) * sc, this.enraged ? 3.5 * sc : 3 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (this.enraged) {
      ctx.shadowColor = "#ff2010";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ff2010";
      ctx.globalAlpha = 0.3 + Math.sin(this.t * 8) * 0.15;
      ctx.beginPath();
      ctx.arc(16 * sc, (20 + breathe) * sc, 6 * sc, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(28 * sc, (20 + breathe) * sc, 6 * sc, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = armorHighlight;
    ctx.fillRect(10 * sc, (10 + breathe) * sc, 24 * sc, 4 * sc);
    ctx.fillStyle = armorDark;
    ctx.fillRect(14 * sc, (6 + breathe) * sc, 16 * sc, 6 * sc);

    ctx.fillStyle = armorDark;
    ctx.beginPath();
    ctx.moveTo(18 * sc, (26 + breathe) * sc);
    ctx.lineTo(26 * sc, (26 + breathe) * sc);
    ctx.lineTo(28 * sc, (30 + breathe) * sc);
    ctx.lineTo(16 * sc, (30 + breathe) * sc);
    ctx.closePath();
    ctx.fill();

    const swingAngle = this.attacking ? this.swingAngle * this.facing : 0;
    const slamArmAngle = this.slamming
      ? (this.slamTimer / this.slamDuration) * Math.PI * 0.6 * this.facing
      : 0;
    ctx.save();
    ctx.translate(38 * sc, (40 + breathe * 0.5) * sc);
    ctx.rotate(swingAngle + slamArmAngle);

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

    if (this.enraged) {
      ctx.fillStyle = `rgba(255,60,30,${0.3 + Math.sin(this.t * 6) * 0.15})`;
      ctx.fillRect(30 * sc, -12 * sc, 6 * sc, 24 * sc);
    }

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

    if (this.slamShockwave > 0) {
      const swAlpha = this.slamShockwave * 0.5;
      const swRadius = (1 - this.slamShockwave) * this.w * 2;
      ctx.strokeStyle = this.enraged
        ? `rgba(255,80,40,${swAlpha.toFixed(2)})`
        : `rgba(200,180,100,${swAlpha.toFixed(2)})`;
      ctx.lineWidth = 4 * this.slamShockwave;
      ctx.beginPath();
      ctx.ellipse(
        sx + this.w / 2,
        this.groundY,
        swRadius,
        swRadius * 0.15,
        0, 0, Math.PI * 2
      );
      ctx.stroke();

      ctx.strokeStyle = this.enraged
        ? `rgba(255,40,20,${(swAlpha * 0.5).toFixed(2)})`
        : `rgba(200,180,100,${(swAlpha * 0.5).toFixed(2)})`;
      ctx.lineWidth = 2 * this.slamShockwave;
      ctx.beginPath();
      ctx.ellipse(
        sx + this.w / 2,
        this.groundY,
        swRadius * 1.3,
        swRadius * 0.2,
        0, 0, Math.PI * 2
      );
      ctx.stroke();
    }

    if (!this.dead && !this.dying) {
      const glowF = this.enraged ? this.enrageGlow + 0.2 : this.armorGlow;
      ctx.strokeStyle = this.enraged
        ? `rgba(255,60,30,${glowF.toFixed(2)})`
        : `rgba(200,80,60,${glowF.toFixed(2)})`;
      ctx.lineWidth = this.enraged ? 3 : 2;
      ctx.beginPath();
      ctx.ellipse(sx + this.w / 2, sy + this.h * 0.4, this.w * 0.55, this.h * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    if (this.dying || (this.dead && !this.dying)) {
      ctx.restore();
    }
  }

  drawHealthBar(ctx) {
    if (this.dead && !this.dying) return;
    if (this.dying && this.deathTimer > 0.8) return;
    const barW = 220;
    const barH = 18;
    const bx = (ctx.canvas.width / (window.devicePixelRatio || 1) - barW) / 2;
    const by = 30;
    const p = Math.max(0, this.hp / this.maxHp);

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    roundRect(ctx, bx - 4, by - 4, barW + 8, barH + 8, 6);
    ctx.fill();
    ctx.strokeStyle = this.enraged ? "rgba(255,80,40,0.5)" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, bx - 4, by - 4, barW + 8, barH + 8, 6);
    ctx.stroke();

    if (this.enraged) {
      ctx.fillStyle = p > 0.3 ? "#e03020" : "#ff2010";
    } else {
      ctx.fillStyle = p > 0.3 ? "#c04030" : "#ff3020";
    }
    if (p > 0.01) {
      roundRect(ctx, bx, by, barW * p, barH, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      roundRect(ctx, bx, by, barW * p, barH * 0.4, 4);
      ctx.fill();
    }

    ctx.fillStyle = this.enraged ? "#ff6050" : "#fff";
    ctx.font = "bold 13px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const name = this.enraged ? "Cavalerul Mutant (ENRAGED)" : "Cavalerul Mutant";
    ctx.fillText(name, bx + barW / 2, by - 14);
    ctx.fillStyle = "#fff";
    ctx.fillText(`${this.hp} / ${this.maxHp}`, bx + barW / 2, by + barH / 2 + 1);
  }
}
