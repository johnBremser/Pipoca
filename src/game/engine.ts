import {soundEngine} from './audio';
import {generateLevel} from './levelGenerator';
import {renderGameScene} from './renderer';
import type {
  BossProjectile,
  BossState,
  DifficultyMode,
  FloatingText,
  HudSnapshot,
  InputState,
  LevelData,
  Particle,
  PlayerState,
} from './types';

export interface EngineCallbacks {
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onVictory: (summary: {
    score: number;
    tangerines: number;
    goldenSecrets: [boolean, boolean, boolean];
    elapsedSec: number;
  }) => void;
  onGameOver: (summary: {score: number; tangerines: number}) => void;
}

export class GameEngine {
  private level: LevelData;
  private mode: DifficultyMode;
  private callbacks: EngineCallbacks;

  private player: PlayerState;
  private boss: BossState;
  private projectiles: BossProjectile[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  private score = 0;
  private tangerines = 0;
  private goldenSecrets: [boolean, boolean, boolean] = [false, false, false];
  private comboCount = 0;
  private comboTimer = 0;
  private elapsedSec = 0;
  private totalTime = 0;
  private hitstopTimer = 0;
  private shakeTimer = 0;
  private shakeMag = 0;
  private bannerText: string | null = null;
  private bannerTimer = 0;
  private paused = false;
  private finished = false;
  private fountainUsed = false;

  private cameraX = 0;
  private cameraY = 120;
  private hudThrottle = 0;

  constructor(
    stageId: number,
    mode: DifficultyMode,
    callbacks: EngineCallbacks,
    seed?: number
  ) {
    this.mode = mode;
    this.callbacks = callbacks;
    this.level = generateLevel(stageId, mode, seed);

    const maxHearts = mode === 'pequenos' ? 6 : 4;
    this.player = {
      x: 90,
      y: this.level.floorY - 46,
      w: 44,
      h: 44,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      jumpsLeft: 2,
      maxJumps: 2,
      rolling: false,
      rollTimer: 0,
      rollCooldown: 0,
      spinAngle: 0,
      invulnTimer: 0,
      shieldTimer: 0,
      flashTimer: 0,
      squashX: 1,
      squashY: 1,
      animTime: 0,
      blinkTimer: 2,
      happyTimer: 0,
      hearts: maxHearts,
      maxHearts,
      checkpointX: 90,
      checkpointY: this.level.floorY - 46,
      rescueBalloon: {
        active: false,
        targetX: 90,
        targetY: this.level.floorY - 46,
        timer: 0,
      },
    };

    const bossCfg = this.level.world.boss;
    const bossHp = mode === 'pequenos' ? bossCfg.hpPequenos : bossCfg.hpAventura;
    const isFlyerBoss =
      bossCfg.kind === 'owl_maestro' || bossCfg.kind === 'thunder_cloud';

    this.boss = {
      active: false,
      defeated: false,
      kind: bossCfg.kind,
      name: bossCfg.name,
      x: this.level.bossArenaX + 680,
      y: isFlyerBoss ? this.level.floorY - 220 : this.level.floorY - 110,
      w: bossCfg.kind === 'croc' ? 132 : bossCfg.kind === 'tractor' ? 128 : 112,
      h: bossCfg.kind === 'croc' ? 84 : 110,
      vx: 0,
      vy: 0,
      facing: -1,
      hp: bossHp,
      maxHp: bossHp,
      phase: 'IDLE',
      timer: 1.5,
      attackPattern: 0,
      invulnTimer: 0,
      flashTimer: 0,
      arenaLeft: this.level.bossArenaX,
      arenaRight: this.level.bossArenaX + 940,
      arenaFloorY: this.level.floorY,
      armored: false,
      teleportAlpha: 1,
    };

    this.showBanner(`${this.level.world.name} — Ato 1`, 2.8);
    this.emitHud(true);
  }

  public setPaused(paused: boolean) {
    this.paused = paused;
  }

  public respawnAtCheckpoint() {
    this.finished = false;
    this.player.hearts = this.player.maxHearts;
    this.player.x = this.player.checkpointX;
    this.player.y = this.player.checkpointY - 12;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.invulnTimer = 2.0;
    this.player.rescueBalloon.active = false;
    if (this.boss.active && !this.boss.defeated) {
      this.boss.hp = this.boss.maxHp;
      this.boss.phase = 'IDLE';
      this.boss.timer = 1.4;
      this.boss.armored = false;
      this.boss.teleportAlpha = 1;
      this.projectiles = [];
    }
    this.emitHud(true);
  }

  private showBanner(text: string, duration = 2.4) {
    this.bannerText = text;
    this.bannerTimer = duration;
  }

  public update(rawDt: number, input: InputState, viewW: number, viewH: number) {
    if (this.paused || this.finished) return;

    const dt = Math.min(rawDt, 0.05);
    this.totalTime += dt;
    this.elapsedSec += dt;

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.bannerText = null;
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }

    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateParticles(dt * 0.35);
      return;
    }

    // Update specialty biome platforms!
    for (const p of this.level.platforms) {
      if (p.kind === 'moving' && p.baseX !== undefined && p.baseY !== undefined) {
        const offset =
          Math.sin(this.totalTime * (p.moveSpeed ?? 1.4) + (p.phase ?? 0)) *
          (p.moveRange ?? 40);
        if (p.moveAxis === 'x') p.x = p.baseX + offset;
        else p.y = p.baseY + offset;
      } else if (
        p.kind === 'windmill' &&
        p.centerX !== undefined &&
        p.centerY !== undefined
      ) {
        const angle =
          this.totalTime * (p.orbitSpeed ?? 1.0) + (p.phase ?? 0);
        const prevX = p.x;
        const prevY = p.y;
        p.x = p.centerX + Math.cos(angle) * (p.orbitRadius ?? 110) - p.w * 0.5;
        p.y = p.centerY + Math.sin(angle) * (p.orbitRadius ?? 110) - p.h * 0.5;
        // Carry player smoothly if standing near/on windmill blade
        if (
          this.player.onGround &&
          this.player.x + this.player.w > prevX - 4 &&
          this.player.x < prevX + p.w + 4 &&
          Math.abs(this.player.y + this.player.h - prevY) < 12
        ) {
          this.player.x += p.x - prevX;
          this.player.y += p.y - prevY;
        }
      } else if (p.kind === 'lilypad') {
        const targetSink = p.stoodOn ? 18 : 0;
        const curr = p.sinkOffset ?? 0;
        p.sinkOffset = curr + (targetSink - curr) * Math.min(1, dt * 8);
        p.stoodOn = false;
      } else if (p.kind === 'vanish_cloud') {
        if (p.vanishState === 'shaking') {
          p.vanishTimer = (p.vanishTimer ?? 0.5) - dt;
          if ((p.vanishTimer ?? 0) <= 0) {
            p.vanishState = 'gone';
            p.vanishTimer = 2.0;
            this.spawnBurst(p.x + p.w * 0.5, p.y + 12, 8, '#FFFFFF', 'circle');
          }
        } else if (p.vanishState === 'gone') {
          p.vanishTimer = (p.vanishTimer ?? 1.5) - dt;
          if ((p.vanishTimer ?? 0) <= 0) {
            p.vanishState = 'solid';
            p.vanishTimer = this.mode === 'pequenos' ? 1.6 : 1.15;
          }
        }
      }
    }

    for (const c of this.level.cannons) {
      if (c.cooldown > 0) c.cooldown = Math.max(0, c.cooldown - dt);
    }

    for (const b of this.level.bouncePads) {
      if (b.squashTimer > 0) b.squashTimer = Math.max(0, b.squashTimer - dt);
    }

    const subSteps = 2;
    const subDt = dt / subSteps;
    for (let s = 0; s < subSteps; s++) {
      this.stepPlayer(
        subDt,
        s === 0
          ? input
          : {...input, jumpJustPressed: false, rollJustPressed: false}
      );
    }

    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateProjectiles(dt);
    this.updateParticles(dt);
    this.updateCamera(dt, viewW, viewH);

    this.hudThrottle += dt;
    if (this.hudThrottle >= 0.08) {
      this.hudThrottle = 0;
      this.emitHud(false);
    }
  }

  private stepPlayer(dt: number, input: InputState) {
    const p = this.player;

    p.animTime += dt;
    if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    if (p.shieldTimer > 0) p.shieldTimer = Math.max(0, p.shieldTimer - dt);
    if (p.happyTimer > 0) p.happyTimer = Math.max(0, p.happyTimer - dt);
    if (p.rollCooldown > 0) p.rollCooldown = Math.max(0, p.rollCooldown - dt);

    p.blinkTimer -= dt;
    if (p.blinkTimer < -0.1) p.blinkTimer = 2.6 + Math.random() * 2.2;

    p.squashX += (1 - p.squashX) * Math.min(1, dt * 14);
    p.squashY += (1 - p.squashY) * Math.min(1, dt * 14);

    if (p.rescueBalloon.active) {
      p.x += (p.rescueBalloon.targetX - p.x) * Math.min(1, dt * 4.5);
      p.y += (p.rescueBalloon.targetY - p.y) * Math.min(1, dt * 4.5);
      p.vx = 0;
      p.vy = 0;
      p.rescueBalloon.timer -= dt;
      if (
        p.rescueBalloon.timer <= 0 ||
        (Math.abs(p.x - p.rescueBalloon.targetX) < 12 &&
          Math.abs(p.y - p.rescueBalloon.targetY) < 12)
      ) {
        p.rescueBalloon.active = false;
        p.x = p.rescueBalloon.targetX;
        p.y = p.rescueBalloon.targetY;
        p.invulnTimer = 1.5;
        p.jumpsLeft = p.maxJumps;
      }
      return;
    }

    if (input.jumpJustPressed) {
      p.jumpBufferTimer = 0.16;
    } else if (p.jumpBufferTimer > 0) {
      p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
    }

    if (p.onGround) {
      p.coyoteTimer = this.mode === 'pequenos' ? 0.18 : 0.12;
      p.jumpsLeft = p.maxJumps;
    } else if (p.coyoteTimer > 0) {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    if (input.rollJustPressed && p.rollCooldown <= 0) {
      p.rolling = true;
      p.rollTimer = 0.72;
      p.rollCooldown = 0.25;
      const rollSpeed = this.mode === 'pequenos' ? 470 : 535;
      p.vx = p.facing * Math.max(Math.abs(p.vx), rollSpeed);
      p.squashX = 1.25;
      p.squashY = 0.78;
      soundEngine.playRoll();
      this.spawnBurst(p.x + p.w * 0.5, p.y + p.h * 0.7, 7, '#FF7A1A', 'circle');
    }

    if (p.rolling) {
      p.rollTimer -= dt;
      p.spinAngle += p.facing * dt * 22;
      if (p.rollTimer <= 0 && !input.rollHeld) {
        p.rolling = false;
      }
    }

    const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (moveDir !== 0) p.facing = moveDir as 1 | -1;

    const maxSpeed = p.rolling
      ? this.mode === 'pequenos'
        ? 485
        : 545
      : this.mode === 'pequenos'
      ? 295
      : 335;
    const accel = p.onGround ? 1900 : 1350;
    const friction = p.rolling ? 340 : p.onGround ? 1750 : 420;

    if (moveDir !== 0) {
      p.vx += moveDir * accel * dt;
      if (Math.abs(p.vx) > maxSpeed && !p.rolling) {
        p.vx = moveDir * maxSpeed;
      }
    } else if (!p.rolling) {
      if (Math.abs(p.vx) <= friction * dt) p.vx = 0;
      else p.vx -= Math.sign(p.vx) * friction * dt;
    } else {
      p.vx *= 1 - Math.min(0.4, dt * 0.9);
      if (Math.abs(p.vx) < 120) p.rolling = false;
    }

    if (p.jumpBufferTimer > 0) {
      if (p.coyoteTimer > 0) {
        p.vy = -595;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        p.jumpsLeft = p.maxJumps - 1;
        p.squashX = 0.78;
        p.squashY = 1.28;
        soundEngine.playJump(1);
        this.spawnBurst(p.x + p.w * 0.5, p.y + p.h, 6, '#FFFFFF', 'circle');
      } else if (p.jumpsLeft > 0) {
        p.vy = -545;
        p.jumpsLeft -= 1;
        p.jumpBufferTimer = 0;
        p.squashX = 0.82;
        p.squashY = 1.24;
        p.happyTimer = 0.25;
        soundEngine.playJump(2);
        this.spawnBurst(p.x + p.w * 0.5, p.y + p.h, 9, '#BAE6FD', 'star');
      }
    }

    if (!input.jumpHeld && p.vy < -220) {
      p.vy += 1250 * dt;
    }

    const gravity = this.mode === 'pequenos' ? 1280 : 1420;
    p.vy = Math.min(820, p.vy + gravity * dt);

    const prevX = p.x;
    p.x += p.vx * dt;

    const minWorldX = this.boss.active ? this.boss.arenaLeft + 8 : 0;
    const maxWorldX = this.boss.active
      ? this.boss.arenaRight - p.w - 8
      : this.level.width - p.w;
    if (p.x < minWorldX) {
      p.x = minWorldX;
      p.vx = 0;
    } else if (p.x > maxWorldX) {
      p.x = maxWorldX;
      p.vx = 0;
    }

    for (const c of this.level.crates) {
      if (c.broken) continue;
      if (this.rectsOverlap(p.x, p.y, p.w, p.h, c.x, c.y, c.w, c.h)) {
        if (p.rolling || p.vy > 80) {
          c.broken = true;
          soundEngine.playCrateSmash();
          this.score += 50;
          this.spawnBurst(c.x + c.w * 0.5, c.y + c.h * 0.5, 12, '#F59E0B', 'confetti');
          this.addFloatingText(c.x + c.w * 0.5, c.y - 10, '+50', '#F59E0B');
          if (c.contains === 'heart') {
            this.healPlayer(1, c.x + c.w * 0.5, c.y);
          } else {
            this.tangerines += 3;
            this.score += 30;
            this.addFloatingText(c.x + c.w * 0.5, c.y - 34, '+3 Tangerinas!', '#FF7A1A');
          }
          if (p.vy > 80 && !p.rolling) p.vy = -440;
        } else {
          if (prevX + p.w <= c.x + 12) p.x = c.x - p.w;
          else if (prevX >= c.x + c.w - 12) p.x = c.x + c.w;
          p.vx = 0;
        }
      }
    }

    const prevBottom = p.y + p.h;
    p.y += p.vy * dt;
    p.onGround = false;

    for (const r of this.level.ramps) {
      const footX = p.x + p.w * 0.5;
      if (footX >= r.x && footX <= r.x + r.w) {
        const t = (footX - r.x) / r.w;
        const slopeY = r.y - t * r.h;
        if (p.y + p.h >= slopeY - 6 && prevBottom <= slopeY + 26 && p.vy >= -80) {
          p.y = slopeY - p.h;
          p.vy = 0;
          p.onGround = true;
          if (r.boost && p.vx > 80) {
            p.vx = Math.max(p.vx, this.mode === 'pequenos' ? 465 : 545);
            if (footX > r.x + r.w - 18) {
              p.vy = -520;
              p.onGround = false;
              soundEngine.playSpring();
            }
          }
        }
      }
    }

    for (const plat of this.level.platforms) {
      if (plat.kind === 'vanish_cloud' && plat.vanishState === 'gone') continue;
      if (p.x + p.w <= plat.x + 4 || p.x >= plat.x + plat.w - 4) continue;

      const platY = plat.y + (plat.sinkOffset ?? 0);
      const isOneWay = plat.kind !== 'solid';

      if (p.vy >= 0 && prevBottom <= platY + (isOneWay ? 18 : 24) && p.y + p.h >= platY) {
        if (p.vy > 220 && plat.kind === 'solid') {
          p.squashX = 1.22;
          p.squashY = 0.8;
        }
        p.y = platY - p.h;
        p.vy = 0;
        p.onGround = true;

        if (plat.kind === 'lilypad') {
          plat.stoodOn = true;
        } else if (plat.kind === 'vanish_cloud' && plat.vanishState === 'solid') {
          plat.vanishState = 'shaking';
        } else if (plat.kind === 'speed_rail') {
          p.vx = Math.max(p.vx, 480);
          p.facing = 1;
          if (Math.random() < 0.35) {
            this.spawnBurst(p.x + 12, p.y + p.h, 2, '#22D3EE', 'star');
          }
        }
      }
    }

    // Confetti Cannon Launchers (Stage 8 Castle!)
    for (const cannon of this.level.cannons) {
      if (
        cannon.cooldown <= 0 &&
        this.rectsOverlap(p.x, p.y, p.w, p.h, cannon.x, cannon.y, cannon.w, cannon.h)
      ) {
        cannon.cooldown = 0.8;
        p.vx = cannon.launchVx;
        p.vy = cannon.launchVy;
        p.onGround = false;
        p.jumpsLeft = 1;
        p.happyTimer = 0.6;
        p.rolling = true;
        p.rollTimer = 0.9;
        soundEngine.playSpring();
        this.spawnBurst(cannon.x + cannon.w * 0.6, cannon.y, 18, '#FACC15', 'confetti');
        this.addFloatingText(cannon.x + 26, cannon.y - 24, 'BUM!!', '#F43F5E');
      }
    }

    for (const pad of this.level.bouncePads) {
      if (this.rectsOverlap(p.x, p.y, p.w, p.h, pad.x, pad.y - 6, pad.w, pad.h + 10)) {
        if (p.vy >= -40) {
          p.vy = -pad.power;
          p.onGround = false;
          p.jumpsLeft = 1;
          p.squashX = 0.74;
          p.squashY = 1.32;
          p.happyTimer = 0.35;
          pad.squashTimer = 0.3;
          soundEngine.playSpring();
          this.spawnBurst(pad.x + pad.w * 0.5, pad.y, 10, '#FDE047', 'star');
        }
      }
    }

    for (const g of this.level.geysers) {
      if (
        p.x + p.w > g.x &&
        p.x < g.x + g.w &&
        p.y + p.h > g.y - g.height &&
        p.y < g.y
      ) {
        p.vy = Math.max(p.vy - g.liftForce * dt * 2.4, -560);
        p.onGround = false;
        p.jumpsLeft = 1;
      }
    }

    if (
      !this.fountainUsed &&
      Math.abs(p.x + p.w * 0.5 - this.level.heartFountainX) < 48 &&
      Math.abs(p.y + p.h - this.level.heartFountainY) < 60
    ) {
      this.fountainUsed = true;
      p.hearts = p.maxHearts;
      soundEngine.playHeart();
      this.spawnBurst(this.level.heartFountainX, this.level.heartFountainY - 40, 18, '#FB7185', 'star');
      this.addFloatingText(this.level.heartFountainX, this.level.heartFountainY - 70, 'Energia Cheia!', '#FB7185');
    }

    for (const cp of this.level.checkpoints) {
      if (cp.activated && cp.flagLift < 1) {
        cp.flagLift = Math.min(1, cp.flagLift + dt * 3);
      }
      if (!cp.activated && Math.abs(p.x + p.w * 0.5 - cp.x) < 48) {
        cp.activated = true;
        p.checkpointX = cp.x;
        p.checkpointY = cp.y - p.h;
        soundEngine.playCheckpoint();
        this.spawnBurst(cp.x, cp.y - 60, 16, '#10B981', 'confetti');
        this.addFloatingText(cp.x, cp.y - 95, `${cp.label} Salvo!`, '#10B981');
        if (cp.actNumber === 2 || cp.actNumber === 3) {
          this.showBanner(`${this.level.world.name} — Ato ${cp.actNumber}`, 2.5);
        } else if (cp.actNumber === 4) {
          this.showBanner(`Atenção: ${this.boss.name}!`, 2.8);
        }
      }
    }

    for (const item of this.level.collectibles) {
      if (item.collected) continue;
      const dx = p.x + p.w * 0.5 - item.x;
      const dy = p.y + p.h * 0.5 - item.y;
      const hitDist = p.w * 0.5 + item.r + 6;
      if (dx * dx + dy * dy <= hitDist * hitDist) {
        item.collected = true;
        if (item.kind === 'tangerine') {
          this.tangerines += 1;
          this.score += 10;
          this.comboCount += 1;
          this.comboTimer = 1.4;
          soundEngine.playCollect(this.comboCount);
          this.spawnBurst(item.x, item.y, 6, '#FF7A1A', 'circle');
          if (this.tangerines % 50 === 0 && p.hearts < p.maxHearts) {
            this.healPlayer(1, item.x, item.y);
          }
        } else if (item.kind === 'golden_secret') {
          const idx = item.secretIndex ?? 0;
          this.goldenSecrets[idx] = true;
          this.score += 500;
          p.happyTimer = 0.8;
          soundEngine.playGoldenSecret();
          this.spawnBurst(item.x, item.y, 24, '#FACC15', 'star');
          this.addFloatingText(item.x, item.y - 25, 'Tangerina Dourada!', '#FACC15');
        } else if (item.kind === 'heart') {
          this.healPlayer(1, item.x, item.y);
        } else if (item.kind === 'star_shield') {
          p.shieldTimer = 12;
          soundEngine.playGoldenSecret();
          this.spawnBurst(item.x, item.y, 16, '#38BDF8', 'star');
          this.addFloatingText(item.x, item.y - 20, 'Escudo Estrela!', '#38BDF8');
        }
      }
    }

    if (p.y > this.level.floorY + 340) {
      if (this.mode === 'pequenos') {
        p.rescueBalloon.active = true;
        p.rescueBalloon.targetX = Math.max(p.checkpointX, p.x - 160);
        p.rescueBalloon.targetY = this.level.floorY - 120;
        p.rescueBalloon.timer = 1.3;
        soundEngine.playBalloonRescue();
        this.addFloatingText(p.x, this.level.floorY + 120, 'Balão de Resgate!', '#FB7185');
      } else {
        this.damagePlayer(1);
        if (p.hearts > 0) {
          p.x = p.checkpointX;
          p.y = p.checkpointY - 40;
          p.vx = 0;
          p.vy = 0;
        }
      }
    }

    if (!this.boss.active && !this.boss.defeated && p.x >= this.level.bossArenaX + 40) {
      this.boss.active = true;
      this.boss.phase = 'INTRO';
      this.boss.timer = 1.1;
      this.showBanner(`${this.boss.name} — ${this.level.world.boss.title}!`, 3.0);
      soundEngine.playBossTelegraph();
    }
  }

  private healPlayer(amount: number, x: number, y: number) {
    this.player.hearts = Math.min(this.player.maxHearts, this.player.hearts + amount);
    this.player.happyTimer = 0.6;
    soundEngine.playHeart();
    this.spawnBurst(x, y, 12, '#FB7185', 'star');
    this.addFloatingText(x, y - 20, '+1 Coração!', '#FB7185');
  }

  private damagePlayer(amount: number) {
    const p = this.player;
    if (p.invulnTimer > 0 || p.rescueBalloon.active) return;

    if (p.shieldTimer > 0) {
      p.shieldTimer = 0;
      p.invulnTimer = 1.6;
      soundEngine.playCrateSmash();
      this.spawnBurst(p.x + p.w * 0.5, p.y + p.h * 0.5, 16, '#38BDF8', 'star');
      this.addFloatingText(p.x + p.w * 0.5, p.y - 16, 'Escudo Salvou!', '#38BDF8');
      return;
    }

    p.hearts = Math.max(0, p.hearts - amount);
    p.invulnTimer = this.mode === 'pequenos' ? 2.2 : 1.6;
    p.vy = -340;
    p.vx = -p.facing * 180;
    p.rolling = false;
    this.shakeTimer = 0.2;
    this.shakeMag = 7;
    soundEngine.playDamage();
    this.spawnBurst(p.x + p.w * 0.5, p.y + p.h * 0.5, 12, '#FB7185', 'circle');

    if (p.hearts <= 0) {
      if (this.mode === 'pequenos') {
        p.hearts = p.maxHearts;
        p.rescueBalloon.active = true;
        p.rescueBalloon.targetX = p.checkpointX;
        p.rescueBalloon.targetY = p.checkpointY - 40;
        p.rescueBalloon.timer = 1.5;
        soundEngine.playBalloonRescue();
        this.showBanner('Pipoca voltou descansada ao Checkpoint!', 2.5);
      } else {
        this.finished = true;
        this.emitHud(true);
        this.callbacks.onGameOver({
          score: this.score,
          tangerines: this.tangerines,
        });
      }
    }
  }

  private updateEnemies(dt: number) {
    const p = this.player;
    for (const e of this.level.enemies) {
      if (!e.alive) {
        if (e.squishTimer > 0) e.squishTimer = Math.max(0, e.squishTimer - dt);
        continue;
      }

      if (Math.abs(e.x - p.x) > 1300) continue;

      if (e.behavior === 'flyer') {
        e.x += e.vx * dt;
        e.y = e.baseY + Math.sin(this.totalTime * 2.8 + e.animPhase) * 26;
      } else if (e.behavior === 'hopper') {
        e.x += e.vx * dt;
        e.hopTimer -= dt;
        if (e.hopTimer <= 0 && e.y >= e.baseY - 1) {
          e.vy = -320;
          e.hopTimer = 1.2 + Math.random() * 0.8;
        }
        e.vy += 980 * dt;
        e.y += e.vy * dt;
        if (e.y > e.baseY) {
          e.y = e.baseY;
          e.vy = 0;
        }
      } else {
        e.x += e.vx * dt;
      }

      if (e.x <= e.minX) {
        e.x = e.minX;
        e.vx = Math.abs(e.vx);
      } else if (e.x + e.w >= e.maxX) {
        e.x = e.maxX - e.w;
        e.vx = -Math.abs(e.vx);
      }
      e.facing = e.vx >= 0 ? 1 : -1;

      const pad = this.mode === 'pequenos' ? 6 : 2;
      if (
        this.rectsOverlap(
          p.x - pad,
          p.y - pad,
          p.w + pad * 2,
          p.h + pad * 2,
          e.x,
          e.y,
          e.w,
          e.h
        )
      ) {
        const isStomp = p.vy > 0 && p.y + p.h * 0.72 <= e.y + e.h * 0.58;
        if (isStomp || p.rolling) {
          e.alive = false;
          e.squishTimer = 0.25;
          this.comboCount += 1;
          this.comboTimer = 2.0;
          const pts = 100 * Math.min(4, this.comboCount);
          this.score += pts;
          p.happyTimer = 0.35;
          this.hitstopTimer = 0.035;
          soundEngine.playBounce(this.comboCount);
          this.spawnBurst(e.x + e.w * 0.5, e.y + e.h * 0.5, 14, '#FACC15', 'star');
          this.addFloatingText(e.x + e.w * 0.5, e.y - 12, `+${pts}`, '#FACC15');

          if (isStomp) {
            p.vy = -520;
            p.jumpsLeft = 1;
            p.squashX = 1.2;
            p.squashY = 0.78;
          }
        } else {
          this.damagePlayer(1);
        }
      }
    }
  }

  // =========================================================================
  // 8 BESPOKE BOSS BEHAVIORS!
  // =========================================================================
  private updateBoss(dt: number) {
    const b = this.boss;
    if (!b.active || b.defeated) return;

    if (b.invulnTimer > 0) b.invulnTimer = Math.max(0, b.invulnTimer - dt);
    if (b.flashTimer > 0) b.flashTimer = Math.max(0, b.flashTimer - dt);

    const p = this.player;
    b.timer -= dt;
    const speedMult = this.mode === 'pequenos' ? 0.8 : 1.1;
    const isFlyer = b.kind === 'owl_maestro' || b.kind === 'thunder_cloud';

    if (b.phase === 'INTRO') {
      if (b.timer <= 0) {
        b.phase = 'IDLE';
        b.timer = 1.0;
      }
    } else if (b.phase === 'IDLE') {
      b.armored = false;
      b.facing = p.x < b.x + b.w * 0.5 ? -1 : 1;

      if (isFlyer) {
        // Hover smoothly high in figure-8 flight!
        const centerX = (b.arenaLeft + b.arenaRight) * 0.5 - b.w * 0.5;
        b.x += (centerX + Math.sin(this.totalTime * 1.6) * 260 - b.x) * Math.min(1, dt * 3);
        b.y = b.arenaFloorY - 235 + Math.cos(this.totalTime * 2.4) * 32;
      } else {
        b.x += b.facing * 75 * speedMult * dt;
        b.x = Math.max(b.arenaLeft + 40, Math.min(b.arenaRight - b.w - 40, b.x));
      }

      if (b.timer <= 0) {
        b.phase = 'TELEGRAPH';
        b.timer = this.mode === 'pequenos' ? 1.05 : 0.75;
        b.attackPattern = (b.attackPattern + 1) % 3;
        b.telegraphTargetX = p.x + p.w * 0.5;
        soundEngine.playBossTelegraph();
      }
    } else if (b.phase === 'TELEGRAPH') {
      if (b.timer <= 0) {
        b.phase = 'ATTACK';
        this.triggerBossAttack(speedMult);
      }
    } else if (b.phase === 'ATTACK') {
      b.x += b.vx * dt;
      if (!isFlyer) {
        b.vy += 1150 * dt;
        b.y += b.vy * dt;
        if (b.y + b.h >= b.arenaFloorY) {
          b.y = b.arenaFloorY - b.h;
          if (b.kind === 'croc' && b.vy > 200) {
            // Crocodile belly flop creates low water wave!
            this.spawnBossWave();
          }
          b.vy = 0;
        }
      } else {
        // Flyer swoop
        b.y += b.vy * dt;
        b.y = Math.min(b.arenaFloorY - b.h - 18, Math.max(b.arenaFloorY - 280, b.y));
      }

      if (b.x <= b.arenaLeft + 24) {
        b.x = b.arenaLeft + 24;
        if (b.kind === 'armadillo_king' && b.timer > 0.6) {
          b.vx = Math.abs(b.vx); // Ricochet once!
          b.facing = 1;
          this.shakeTimer = 0.14;
          this.shakeMag = 6;
        } else {
          b.vx = 0;
          b.armored = false;
          b.phase = 'DIZZY';
          b.timer = this.mode === 'pequenos' ? 2.8 : 2.0;
        }
      } else if (b.x + b.w >= b.arenaRight - 24) {
        b.x = b.arenaRight - b.w - 24;
        if (b.kind === 'armadillo_king' && b.timer > 0.6) {
          b.vx = -Math.abs(b.vx);
          b.facing = -1;
          this.shakeTimer = 0.14;
          this.shakeMag = 6;
        } else {
          b.vx = 0;
          b.armored = false;
          b.phase = 'DIZZY';
          b.timer = this.mode === 'pequenos' ? 2.8 : 2.0;
        }
      } else if (b.timer <= 0) {
        b.vx = 0;
        b.vy = 0;
        b.armored = false;
        b.phase = 'DIZZY';
        b.timer = this.mode === 'pequenos' ? 2.4 : 1.7;
      }
    } else if (b.phase === 'DIZZY' || b.phase === 'HURT') {
      b.armored = false;
      if (isFlyer && b.phase === 'DIZZY') {
        // Swoop down to reachable height so Pipoca can bounce!
        const restY = b.arenaFloorY - b.h - 24;
        b.y += (restY - b.y) * Math.min(1, dt * 4);
      } else if (!isFlyer) {
        b.vy += 1150 * dt;
        b.y = Math.min(b.arenaFloorY - b.h, b.y + b.vy * dt);
      }
      if (b.timer <= 0) {
        b.phase = 'IDLE';
        b.timer = 1.0;
      }
    }

    // Player vs Boss interaction
    if (
      b.invulnTimer <= 0 &&
      this.rectsOverlap(p.x, p.y, p.w, p.h, b.x + 8, b.y - 12, b.w - 16, b.h + 12)
    ) {
      const stompingTop = p.vy > 0 && p.y + p.h * 0.75 <= b.y + b.h * 0.5;
      if (stompingTop && !b.armored) {
        b.hp -= 1;
        b.invulnTimer = 1.1;
        b.flashTimer = 0.85;
        b.phase = 'HURT';
        b.timer = 0.9;
        p.vy = -590;
        p.jumpsLeft = 1;
        p.happyTimer = 0.6;
        this.score += 300;
        this.hitstopTimer = 0.055;
        this.shakeTimer = 0.25;
        this.shakeMag = 9;
        soundEngine.playBossHit();
        this.spawnBurst(b.x + b.w * 0.5, b.y, 22, '#FACC15', 'star');
        this.addFloatingText(b.x + b.w * 0.5, b.y - 30, 'BOING! +300', '#FACC15');

        if (b.hp <= 0) {
          b.defeated = true;
          b.phase = 'DEFEATED';
          this.finished = true;
          this.score += 1000;
          this.projectiles = [];
          soundEngine.playVictoryFanfare();
          this.spawnBurst(b.x + b.w * 0.5, b.y + b.h * 0.4, 52, '#FACC15', 'confetti');
          this.emitHud(true);
          window.setTimeout(() => {
            this.callbacks.onVictory({
              score: this.score,
              tangerines: this.tangerines,
              goldenSecrets: [...this.goldenSecrets] as [boolean, boolean, boolean],
              elapsedSec: Math.round(this.elapsedSec),
            });
          }, 850);
        }
      } else if (stompingTop && b.armored) {
        // Safely bounce off armored Armadillo shell with sparks!
        p.vy = -520;
        p.jumpsLeft = 1;
        soundEngine.playCrateSmash();
        this.spawnBurst(b.x + b.w * 0.5, b.y, 10, '#FACC15', 'star');
        this.addFloatingText(b.x + b.w * 0.5, b.y - 20, 'Casco Duro!', '#FACC15');
      } else if (b.phase !== 'DIZZY' && b.phase !== 'HURT') {
        this.damagePlayer(1);
      }
    }
  }

  private triggerBossAttack(speedMult: number) {
    const b = this.boss;
    const dir = b.facing;

    if (b.kind === 'croc') {
      if (b.attackPattern === 0) {
        // Belly flop splash!
        b.vx = dir * 120;
        b.vy = -480;
        b.timer = 1.3;
      } else {
        b.vx = dir * 320 * speedMult;
        b.vy = 0;
        b.timer = 1.4;
      }
    } else if (b.kind === 'owl_maestro') {
      if (b.attackPattern === 0) {
        // Swoop low across arena
        b.vx = dir * 320 * speedMult;
        b.vy = 180;
        b.timer = 1.4;
      } else {
        // Drop musical notes!
        b.vx = 0;
        b.vy = 0;
        const count = this.mode === 'pequenos' ? 2 : 3;
        for (let i = 0; i < count; i++) {
          this.projectiles.push({
            id: `note_${Date.now()}_${i}`,
            x: b.arenaLeft + 180 + i * 240,
            y: b.y + b.h,
            vx: (Math.random() - 0.5) * 60,
            vy: 60,
            r: 18,
            kind: 'note',
            bouncy: i === 1,
            gravity: 280,
            life: 3.5,
          });
        }
        b.timer = 1.1;
      }
    } else if (b.kind === 'octopus') {
      // Shoots bouncy pink bubble ladder!
      b.vx = dir * 160 * speedMult;
      b.vy = -340;
      const count = this.mode === 'pequenos' ? 3 : 4;
      for (let i = 0; i < count; i++) {
        this.projectiles.push({
          id: `bub_${Date.now()}_${i}`,
          x: b.x + b.w * 0.5,
          y: b.y + 30,
          vx: dir * (110 + i * 65),
          vy: -220 - i * 45,
          r: 22,
          kind: 'bubble',
          bouncy: true,
          gravity: 220,
          life: 4.5,
        });
      }
      b.timer = 1.35;
    } else if (b.kind === 'tractor') {
      if (b.attackPattern === 0) {
        // Fast turbo tractor charge!
        b.vx = dir * 410 * speedMult;
        b.vy = 0;
        b.timer = 1.5;
      } else {
        // Tosses bouncy golden haybales!
        b.vx = dir * 130;
        for (let i = 0; i < 2; i++) {
          this.projectiles.push({
            id: `hay_${Date.now()}_${i}`,
            x: b.x + b.w * 0.5,
            y: b.y + 10,
            vx: dir * (160 + i * 95),
            vy: -420,
            r: 22,
            kind: 'haybale',
            bouncy: true,
            gravity: 680,
            life: 4.0,
          });
        }
        b.timer = 1.25;
      }
    } else if (b.kind === 'armadillo_king') {
      // Curls into armored ball & ricochets off walls!
      b.armored = true;
      b.vx = dir * 430 * speedMult;
      b.vy = 0;
      b.timer = 2.4;
    } else if (b.kind === 'thunder_cloud') {
      // Drops lightning bolt at target + bouncy rainbow cloud!
      b.vx = 0;
      b.vy = 0;
      this.projectiles.push({
        id: `bolt_${Date.now()}`,
        x: b.telegraphTargetX ?? this.player.x + 22,
        y: b.y + b.h,
        vx: 0,
        vy: 140,
        r: 18,
        kind: 'lightning',
        bouncy: false,
        gravity: 340,
        life: 2.2,
      });
      this.projectiles.push({
        id: `cloud_pad_${Date.now()}`,
        x: b.arenaLeft + 260 + Math.random() * 380,
        y: b.arenaFloorY - 120,
        vx: 0,
        vy: -40,
        r: 24,
        kind: 'bubble',
        bouncy: true,
        gravity: 60,
        life: 4.0,
      });
      b.timer = 1.2;
    } else if (b.kind === 'jack_box') {
      // Huge jack-in-the-box spring jump + plush balls!
      b.vx = dir * 240 * speedMult;
      b.vy = -640;
      for (let i = 0; i < 2; i++) {
        this.projectiles.push({
          id: `plush_${Date.now()}_${i}`,
          x: b.x + b.w * 0.5,
          y: b.y + 20,
          vx: (i === 0 ? -1 : 1) * 190,
          vy: -360,
          r: 20,
          kind: 'plush',
          bouncy: true,
          gravity: 560,
          life: 4.2,
        });
      }
      b.timer = 1.4;
    } else {
      // Stage 8: BARÃO RAPOSÃO! Teleports across arena + purple magic bubbles!
      if (b.attackPattern === 0) {
        const goLeft = b.x > (b.arenaLeft + b.arenaRight) * 0.5;
        this.spawnBurst(b.x + b.w * 0.5, b.y + b.h * 0.5, 18, '#7C3AED', 'star');
        b.x = goLeft ? b.arenaLeft + 80 : b.arenaRight - b.w - 80;
        b.facing = goLeft ? 1 : -1;
        this.spawnBurst(b.x + b.w * 0.5, b.y + b.h * 0.5, 18, '#FACC15', 'star');
        b.vx = 0;
        b.vy = -260;
        for (let i = 0; i < (this.mode === 'pequenos' ? 2 : 3); i++) {
          this.projectiles.push({
            id: `fox_${Date.now()}_${i}`,
            x: b.x + b.w * 0.5,
            y: b.y + 40,
            vx: b.facing * (145 + i * 75),
            vy: -190 - i * 40,
            r: 22,
            kind: 'cage_bubble',
            bouncy: true,
            gravity: 220,
            life: 4.2,
          });
        }
        b.timer = 1.25;
      } else {
        // Swooping cape dash!
        b.vx = dir * 380 * speedMult;
        b.vy = -380;
        b.timer = 1.45;
      }
    }
  }

  private spawnBossWave() {
    const b = this.boss;
    this.projectiles.push({
      id: `wave_l_${Date.now()}`,
      x: b.x,
      y: b.arenaFloorY - 16,
      vx: -210,
      vy: 0,
      r: 16,
      kind: 'wave',
      bouncy: true,
      gravity: 0,
      life: 3.0,
    });
    this.projectiles.push({
      id: `wave_r_${Date.now()}`,
      x: b.x + b.w,
      y: b.arenaFloorY - 16,
      vx: 210,
      vy: 0,
      r: 16,
      kind: 'wave',
      bouncy: true,
      gravity: 0,
      life: 3.0,
    });
  }

  private updateProjectiles(dt: number) {
    const p = this.player;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.life -= dt;
      proj.x += proj.vx * dt;
      proj.vy += proj.gravity * dt;
      proj.y += proj.vy * dt;

      if (proj.gravity > 0 && proj.y + proj.r >= this.boss.arenaFloorY) {
        proj.y = this.boss.arenaFloorY - proj.r;
        proj.vy = proj.kind === 'lightning' ? 0 : -340;
      }

      const dx = p.x + p.w * 0.5 - proj.x;
      const dy = p.y + p.h * 0.5 - proj.y;
      const dist = Math.hypot(dx, dy);
      if (dist < proj.r + p.w * 0.45) {
        if (proj.bouncy && (p.vy > 0 || p.rolling || p.y + p.h * 0.65 < proj.y)) {
          p.vy = -590;
          p.jumpsLeft = 1;
          soundEngine.playSpring();
          this.spawnBurst(proj.x, proj.y, 10, '#F472B6', 'star');
          this.projectiles.splice(i, 1);
          continue;
        } else if (!proj.bouncy) {
          this.damagePlayer(1);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (proj.life <= 0) this.projectiles.splice(i, 1);
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += pt.gravity * dt;
      pt.rotation += pt.rotSpeed * dt;
      pt.alpha = pt.life / pt.maxLife;
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  private updateCamera(dt: number, viewW: number, viewH: number) {
    const scale = Math.max(0.75, Math.min(1.25, viewH / 680));
    const vW = viewW / scale;
    const vH = viewH / scale;

    let targetX =
      this.player.x + this.player.w * 0.5 - vW * 0.36 + this.player.facing * 55;
    if (this.boss.active) {
      targetX =
        this.boss.arenaLeft + (this.boss.arenaRight - this.boss.arenaLeft - vW) * 0.5;
    }
    targetX = Math.max(0, Math.min(this.level.width - vW, targetX));

    const targetY = Math.max(
      -80,
      Math.min(this.level.floorY + 260 - vH, this.player.y - vH * 0.56)
    );

    this.cameraX += (targetX - this.cameraX) * Math.min(1, dt * 6.5);
    this.cameraY += (targetY - this.cameraY) * Math.min(1, dt * 5.0);
  }

  public render(ctx: CanvasRenderingContext2D, viewW: number, viewH: number) {
    const sx = this.shakeTimer > 0 ? (Math.random() - 0.5) * 2 * this.shakeMag : 0;
    const sy = this.shakeTimer > 0 ? (Math.random() - 0.5) * 2 * this.shakeMag : 0;

    renderGameScene(
      ctx,
      viewW,
      viewH,
      this.cameraX,
      this.cameraY,
      sx,
      sy,
      this.totalTime,
      this.level,
      this.player,
      this.boss,
      this.projectiles,
      this.particles,
      this.floatingTexts
    );
  }

  private spawnBurst(
    x: number,
    y: number,
    count: number,
    color: string,
    shape: Particle['shape']
  ) {
    const confettiColors = ['#FF7A1A', '#FACC15', '#38BDF8', '#10B981', '#FB7185'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 70 + Math.random() * 210;
      const life = 0.4 + Math.random() * 0.45;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 70,
        size: 5 + Math.random() * 5,
        color:
          shape === 'confetti'
            ? confettiColors[i % confettiColors.length]
            : color,
        alpha: 1,
        life,
        maxLife: life,
        gravity: 480,
        shape,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 10,
      });
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      x,
      y,
      vy: -46,
      text,
      color,
      life: 1.0,
      maxLife: 1.0,
    });
  }

  private rectsOverlap(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    bx: number,
    by: number,
    bw: number,
    bh: number
  ): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  private emitHud(_force: boolean) {
    const px = this.player.x;
    const currentAct: 1 | 2 | 3 | 4 =
      px >= this.level.bossGateX
        ? 4
        : px >= this.level.actBounds[2]
        ? 3
        : px >= this.level.actBounds[1]
        ? 2
        : 1;

    const progressPct = Math.max(
      0,
      Math.min(100, Math.round((px / this.level.bossArenaX) * 100))
    );

    this.callbacks.onHudUpdate({
      hearts: this.player.hearts,
      maxHearts: this.player.maxHearts,
      tangerines: this.tangerines,
      score: this.score,
      goldenSecrets: [...this.goldenSecrets] as [boolean, boolean, boolean],
      currentAct,
      progressPct,
      elapsedSec: Math.round(this.elapsedSec),
      hasShield: this.player.shieldTimer > 0,
      comboCount: this.comboCount,
      bossActive: this.boss.active,
      bossName: this.boss.name,
      bossHp: this.boss.hp,
      bossMaxHp: this.boss.maxHp,
      bannerText: this.bannerText,
    });
  }
}
