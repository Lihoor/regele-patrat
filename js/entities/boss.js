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
    this.attackDamage = 18;
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
    this.slamDamage = 22;
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
    this.harpoons = [];
    this.harpoonCooldown = 0;
    this.throwingHarpoon = false;
    this.throwTimer = 0;
    this.throwDuration = 0.5;
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
      this.attackDamage = 22;
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

    if (this.throwingHarpoon) {
      this.throwTimer += dt;
      if (this.throwTimer >= this.throwDuration) {
        this.throwingHarpoon = false;
        this.harpoons.push({
          x: this.x + this.w / 2 + this.facing * this.w * 0.5,
          y: this.y + this.h * 0.38,
          vx: this.facing * 450,
          damage: this.enraged ? 18 : 14,
          life: 0,
          maxLife: 2.5,
        });
        this.harpoonCooldown = this.enraged ? 1.2 + Math.random() * 0.8 : 1.8 + Math.random() * 1.0;
        this.attackCooldown = 0.5;
      }
      return;
    }

    for (let i = this.harpoons.length - 1; i >= 0; i--) {
      const h = this.harpoons[i];
      h.x += h.vx * dt;
      h.life += dt;
      if (h.life > h.maxLife || h.x < -100 || h.x > W + 100) {
        this.harpoons.splice(i, 1);
      }
    }
    if (this.harpoonCooldown > 0) this.harpoonCooldown -= dt;

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
      if (kingInAir && roll < 0.5) {
        this.jumpAttack = true;
        this.jumpAttackTimer = 0;
        this.jumpY = 0;
        this.jumpVY = -700;
        this.state = "jump";
      } else if (roll < 0.25) {
        this.charging = true;
        this.chargeTimer = 0;
        this.state = "charge";
      } else if (roll < 0.48) {
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
    } else if (dist >= 220 * this.scale && dist < 600 && this.harpoonCooldown <= 0 && this.attackCooldown <= 0) {
      this.throwingHarpoon = true;
      this.throwTimer = 0;
      this.state = "harpoon";
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
          return this.enraged ? 28 : 22;
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
          return this.enraged ? this.slamDamage : 18;
        }
      }
      return 0;
    }

    if (this.charging) {
      const kcx = kingX + kingW / 2;
      const bcx = this.centerX;
      const dx = Math.abs(kcx - bcx);
      if (dx < (this.w / 2 + kingW / 2 + 20) * 1.3) {
        return this.enraged ? 22 : 15;
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

  checkHarpoonHit(kingX, kingW, kingY, kingH) {
    if (this.dead || this.dying) return 0;
    for (let i = this.harpoons.length - 1; i >= 0; i--) {
      const h = this.harpoons[i];
      if (h.x > kingX && h.x < kingX + kingW && h.y > kingY && h.y < kingY + kingH) {
        const dmg = h.damage;
        this.harpoons.splice(i, 1);
        return dmg;
      }
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
      const a = Math.max(0, p.life / p.maxLife) * 0.5;
      ctx.fillStyle = this.enraged
        ? `rgba(180,50,40,${a.toFixed(2)})`
        : `rgba(120,90,50,${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }

    for (const st of this.swordTrail) {
      const a = (st.life / st.maxLife) * 0.4;
      ctx.strokeStyle = this.enraged
        ? `rgba(200,150,100,${a.toFixed(2)})`
        : `rgba(160,170,200,${a.toFixed(2)})`;
      ctx.lineWidth = 2 * (st.life / st.maxLife);
      ctx.beginPath();
      ctx.arc(st.x, st.y, 3 * (st.life / st.maxLife), 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${(this.hitFlash * 4).toFixed(2)})`;
      ctx.fillRect(sx - 5, sy - 5, this.w + 10, this.h + 10);
    }

    ctx.save();
    ctx.translate(sx + this.w / 2, sy + this.h);
    ctx.scale(this.facing, 1);
    ctx.translate(-this.w / 2, -this.h);

    const isSlamming = this.slamming && this.slamTimer < this.slamDuration * 0.3;
    const bodySquash = isSlamming ? 1 + Math.sin(this.slamTimer * 20) * 0.02 : 1;
    const breathe = Math.sin(this.breathT * 2.5) * 1.5;

    const steelBase = this.hitFlash > 0 ? 170 : (this.enraged ? 100 : 110);
    const steelR = steelBase - 10;
    const steelG = steelBase - 8;
    const steelB = steelBase + 15;
    const steel = `rgb(${steelR},${steelG},${steelB})`;
    const steelDark = `rgb(${steelR - 30},${steelG - 28},${steelB - 15})`;
    const steelLight = `rgb(${steelR + 20},${steelG + 22},${steelB + 30})`;
    const steelEdge = `rgb(${steelR + 35},${steelG + 38},${steelB + 45})`;
    const leather = "#4a3825";
    const leatherDark = "#322418";
    const tabardRed = this.enraged ? "#8b2020" : "#7a2828";
    const tabardRedLight = this.enraged ? "#a83030" : "#963030";

    ctx.fillStyle = leatherDark;
    ctx.fillRect(8 * sc, 70 * sc, 11 * sc, 30 * sc);
    ctx.fillRect(25 * sc, 70 * sc, 11 * sc, 30 * sc);
    ctx.fillStyle = leather;
    ctx.fillRect(10 * sc, 70 * sc, 7 * sc, 28 * sc);
    ctx.fillRect(27 * sc, 70 * sc, 7 * sc, 28 * sc);
    ctx.fillStyle = steelDark;
    ctx.fillRect(6 * sc, 94 * sc, 15 * sc, 7 * sc);
    ctx.fillRect(23 * sc, 94 * sc, 15 * sc, 7 * sc);
    ctx.fillStyle = steel;
    ctx.fillRect(8 * sc, 95 * sc, 11 * sc, 5 * sc);
    ctx.fillRect(25 * sc, 95 * sc, 11 * sc, 5 * sc);
    ctx.fillStyle = steelEdge;
    ctx.fillRect(9 * sc, 95 * sc, 9 * sc, 2 * sc);
    ctx.fillRect(26 * sc, 95 * sc, 9 * sc, 2 * sc);

    ctx.save();
    ctx.translate(this.w / 2, 55 * sc);
    ctx.scale(1, bodySquash);
    ctx.translate(-this.w / 2, -55 * sc);

    ctx.fillStyle = steelDark;
    ctx.fillRect(2 * sc, (56 + breathe * 0.3) * sc, 40 * sc, 22 * sc);
    ctx.fillStyle = steel;
    ctx.fillRect(4 * sc, (58 + breathe * 0.3) * sc, 36 * sc, 18 * sc);
    ctx.fillStyle = steelLight;
    ctx.fillRect(6 * sc, (58 + breathe * 0.3) * sc, 32 * sc, 5 * sc);

    ctx.fillStyle = tabardRed;
    ctx.fillRect(8 * sc, (32 + breathe) * sc, 28 * sc, 26 * sc);
    ctx.fillStyle = tabardRedLight;
    ctx.fillRect(10 * sc, (32 + breathe) * sc, 24 * sc, 4 * sc);

    ctx.fillStyle = "#c8a840";
    ctx.fillRect(18 * sc, (38 + breathe) * sc, 8 * sc, 14 * sc);
    ctx.fillStyle = "#b09830";
    ctx.fillRect(20 * sc, (38 + breathe) * sc, 4 * sc, 14 * sc);
    ctx.fillRect(18 * sc, (42 + breathe) * sc, 8 * sc, 6 * sc);

    ctx.fillStyle = steelDark;
    ctx.fillRect(6 * sc, (28 + breathe) * sc, 32 * sc, 8 * sc);
    ctx.fillStyle = leather;
    ctx.fillRect(10 * sc, (30 + breathe) * sc, 24 * sc, 4 * sc);
    ctx.fillStyle = steel;
    ctx.fillRect(18 * sc, (29 + breathe) * sc, 8 * sc, 6 * sc);

    ctx.restore();

    ctx.fillStyle = steelDark;
    ctx.fillRect(0, 34 * sc, 6 * sc, 24 * sc);
    ctx.fillRect(38 * sc, 34 * sc, 6 * sc, 24 * sc);
    ctx.fillStyle = steel;
    ctx.fillRect(1 * sc, 36 * sc, 4 * sc, 20 * sc);
    ctx.fillRect(39 * sc, 36 * sc, 4 * sc, 20 * sc);

    ctx.fillStyle = leatherDark;
    ctx.beginPath();
    ctx.arc(22 * sc, (20 + breathe) * sc, 18 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = steel;
    ctx.beginPath();
    ctx.arc(22 * sc, (20 + breathe) * sc, 16 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = steelLight;
    ctx.beginPath();
    ctx.arc(22 * sc, (17 + breathe) * sc, 14 * sc, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = "#2a2218";
    ctx.beginPath();
    ctx.arc(22 * sc, (20 + breathe) * sc, 15 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = steel;
    ctx.beginPath();
    ctx.arc(22 * sc, (20 + breathe) * sc, 14 * sc, 0, Math.PI * 2);
    ctx.fill();

    const visorSlitY = (19 + breathe) * sc;
    ctx.fillStyle = "#1a1210";
    ctx.fillRect(12 * sc, visorSlitY - 1, 20 * sc, 4 * sc);
    const visorColor = this.enraged
      ? `rgba(180,60,40,${0.5 + Math.sin(this.t * 4) * 0.2})`
      : "rgba(12,8,5,0.9)";
    ctx.fillStyle = visorColor;
    ctx.fillRect(13 * sc, visorSlitY, 18 * sc, 2 * sc);

    if (this.enraged) {
      ctx.shadowColor = "#a03020";
      ctx.shadowBlur = 6;
      ctx.fillStyle = `rgba(180,60,40,${0.15 + Math.sin(this.t * 5) * 0.1})`;
      ctx.fillRect(12 * sc, visorSlitY - 2, 20 * sc, 6 * sc);
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = steelLight;
    ctx.fillRect(10 * sc, (8 + breathe) * sc, 24 * sc, 4 * sc);
    ctx.fillStyle = steelDark;
    ctx.fillRect(14 * sc, (5 + breathe) * sc, 16 * sc, 5 * sc);
    ctx.fillStyle = steel;
    ctx.fillRect(15 * sc, (5 + breathe) * sc, 14 * sc, 3 * sc);

    ctx.fillStyle = steel;
    ctx.beginPath();
    ctx.moveTo(18 * sc, (34 + breathe) * sc);
    ctx.lineTo(26 * sc, (34 + breathe) * sc);
    ctx.lineTo(28 * sc, (37 + breathe) * sc);
    ctx.lineTo(16 * sc, (37 + breathe) * sc);
    ctx.closePath();
    ctx.fill();

    const swingAngle = this.attacking ? this.swingAngle * this.facing : 0;
    const slamArmAngle = this.slamming
      ? (this.slamTimer / this.slamDuration) * Math.PI * 0.6 * this.facing
      : 0;
    ctx.save();
    ctx.translate(38 * sc, (40 + breathe * 0.5) * sc);
    ctx.rotate(swingAngle + slamArmAngle);

    ctx.fillStyle = steelDark;
    ctx.fillRect(0, -4 * sc, 30 * sc, 8 * sc);
    ctx.fillStyle = steel;
    ctx.fillRect(2 * sc, -3 * sc, 26 * sc, 6 * sc);

    ctx.fillStyle = "#5a5a6a";
    ctx.fillRect(28 * sc, -12 * sc, 3 * sc, 24 * sc);
    ctx.fillStyle = "#7a7a8a";
    ctx.fillRect(30 * sc, -10 * sc, 2 * sc, 20 * sc);
    ctx.fillStyle = "#9a9aaa";
    ctx.fillRect(31 * sc, -8 * sc, 1 * sc, 16 * sc);

    ctx.fillStyle = "#8a8a9a";
    ctx.fillRect(27 * sc, -14 * sc, 8 * sc, 3 * sc);
    ctx.fillRect(27 * sc, 11 * sc, 8 * sc, 3 * sc);

    ctx.fillStyle = "#4a3a28";
    ctx.fillRect(26 * sc, -3 * sc, 4 * sc, 6 * sc);
    ctx.fillStyle = "#c8a040";
    ctx.fillRect(30 * sc, -2 * sc, 3 * sc, 4 * sc);

    ctx.restore();

    ctx.fillStyle = steelDark;
    ctx.fillRect(-8 * sc, 36 * sc, 8 * sc, 20 * sc);
    ctx.fillStyle = steel;
    ctx.fillRect(-6 * sc, 38 * sc, 4 * sc, 16 * sc);

    ctx.fillStyle = leather;
    ctx.fillRect(10 * sc, 36 * sc, 24 * sc, 3 * sc);
    ctx.fillStyle = "#c8a040";
    ctx.beginPath();
    ctx.arc(22 * sc, 37.5 * sc, 3 * sc, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (this.slamShockwave > 0) {
      const swAlpha = this.slamShockwave * 0.5;
      const swRadius = (1 - this.slamShockwave) * this.w * 2;
      ctx.strokeStyle = this.enraged
        ? `rgba(180,100,60,${swAlpha.toFixed(2)})`
        : `rgba(160,150,120,${swAlpha.toFixed(2)})`;
      ctx.lineWidth = 3 * this.slamShockwave;
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
        ? `rgba(150,60,40,${(swAlpha * 0.4).toFixed(2)})`
        : `rgba(140,130,100,${(swAlpha * 0.4).toFixed(2)})`;
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
      const glowF = this.enraged ? this.enrageGlow + 0.15 : this.armorGlow;
      ctx.strokeStyle = this.enraged
        ? `rgba(180,60,40,${glowF.toFixed(2)})`
        : `rgba(140,120,80,${glowF.toFixed(2)})`;
      ctx.lineWidth = this.enraged ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.ellipse(sx + this.w / 2, sy + this.h * 0.4, this.w * 0.55, this.h * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    if (this.throwingHarpoon) {
      const progress = this.throwTimer / this.throwDuration;
      const armX = sx + this.w / 2 + this.facing * 20 * sc;
      const armY = sy + this.h * 0.38;
      ctx.save();
      ctx.translate(armX, armY);
      ctx.rotate(this.facing * progress * 0.8);
      ctx.fillStyle = steelDark;
      ctx.fillRect(0, -2, 35 * sc, 4);
      ctx.fillStyle = "#5a5a6a";
      ctx.fillRect(33 * sc, -3, 2, 6);
      ctx.fillStyle = "#7a7a8a";
      ctx.fillRect(35 * sc, -2, 2, 4);
      ctx.fillStyle = this.enraged ? "#8b3020" : "#7a5030";
      ctx.beginPath();
      ctx.moveTo(37 * sc, -5);
      ctx.lineTo(44 * sc, 0);
      ctx.lineTo(37 * sc, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    for (const h of this.harpoons) {
      const alpha = Math.max(0, 1 - h.life / h.maxLife * 0.3);
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.vx > 0 ? 0 : Math.PI);

      ctx.fillStyle = "#4a3a28";
      ctx.fillRect(-12, -1.5, 24, 3);
      ctx.fillStyle = "#5a5a6a";
      ctx.fillRect(-2, -2.5, 5, 5);

      ctx.fillStyle = this.enraged
        ? `rgba(160,60,40,${alpha.toFixed(2)})`
        : `rgba(120,90,60,${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(12, -5);
      ctx.lineTo(18, 0);
      ctx.lineTo(12, 5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = this.enraged
        ? `rgba(140,50,30,${(alpha * 0.3).toFixed(2)})`
        : `rgba(100,80,50,${(alpha * 0.25).toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-28, 0);
      ctx.stroke();

      ctx.restore();
    }

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
