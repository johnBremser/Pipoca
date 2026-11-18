import type {
  BossProjectile,
  BossState,
  BouncePad,
  BreakableCrate,
  CannonPad,
  Checkpoint,
  Collectible,
  Enemy,
  FloatingText,
  Geyser,
  LevelData,
  Particle,
  Platform,
  PlayerState,
  SlopeRamp,
  SupportStation,
  WorldConfig,
} from './types';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function renderGameScene(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  cameraX: number,
  cameraY: number,
  shakeX: number,
  shakeY: number,
  time: number,
  level: LevelData,
  player: PlayerState,
  boss: BossState,
  projectiles: BossProjectile[],
  particles: Particle[],
  floatingTexts: FloatingText[]
) {
  const {world} = level;
  ctx.save();

  // 1. Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
  skyGrad.addColorStop(0, world.skyTop);
  skyGrad.addColorStop(1, world.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, viewW, viewH);

  // Sun / Glowing Moon
  const sunX = viewW * 0.82 - (cameraX * 0.015) % 120;
  const sunY = viewH * 0.17;
  ctx.save();
  ctx.fillStyle = world.biome === 'crystal' ? 'rgba(224, 231, 255, 0.25)' : 'rgba(254, 240, 138, 0.35)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 68, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = world.biome === 'crystal' ? '#E0E7FF' : '#FEF08A';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Parallax Clouds & Biome Silhouettes
  drawParallaxBackground(ctx, viewW, viewH, cameraX, time, world);

  // Scale world coordinates cleanly to screen height (virtual height ~ 680)
  const scale = Math.max(0.75, Math.min(1.25, viewH / 680));
  ctx.save();
  ctx.scale(scale, scale);
  const vW = viewW / scale;
  const vH = viewH / scale;

  ctx.translate(-cameraX + shakeX, -cameraY + shakeY);

  // Subtle decorative background water / mist below main floor
  drawBottomAtmosphere(ctx, cameraX, vW, cameraY + vH, level.floorY + 135, world, time);

  // 3. Geysers (behind platforms)
  for (const g of level.geysers) {
    if (g.x + g.w < cameraX - 80 || g.x > cameraX + vW + 80) continue;
    drawGeyser(ctx, g, time);
  }

  // 4. Platforms
  for (const p of level.platforms) {
    if (p.x + p.w < cameraX - 100 || p.x > cameraX + vW + 100) continue;
    drawPlatform(ctx, p, world, time);
  }

  // 5. Sonic-style Ramps
  for (const r of level.ramps) {
    if (r.x + r.w < cameraX - 80 || r.x > cameraX + vW + 80) continue;
    drawRamp(ctx, r, world, time);
  }

  // 6. Bounce Pads & Confetti Cannons
  for (const b of level.bouncePads) {
    if (b.x + b.w < cameraX - 60 || b.x > cameraX + vW + 60) continue;
    drawBouncePad(ctx, b);
  }
  for (const cannon of level.cannons) {
    if (cannon.x + cannon.w < cameraX - 60 || cannon.x > cameraX + vW + 60) continue;
    drawCannonPad(ctx, cannon, time);
  }

  // 7. Heart Fountain before Boss Gate
  if (
    level.heartFountainX > cameraX - 120 &&
    level.heartFountainX < cameraX + vW + 120
  ) {
    drawHeartFountain(ctx, level.heartFountainX, level.heartFountainY, time);
  }

  // 8. Checkpoints & Papai Oswaldão Support Stations
  for (const cp of level.checkpoints) {
    if (cp.x < cameraX - 100 || cp.x > cameraX + vW + 100) continue;
    drawCheckpoint(ctx, cp, time);
  }
  for (const st of level.supportStations) {
    if (st.x < cameraX - 180 || st.x > cameraX + vW + 180) continue;
    drawOswaldaoStation(ctx, st, player, time);
  }

  // 9. Breakable Crates
  for (const c of level.crates) {
    if (c.broken) continue;
    if (c.x + c.w < cameraX - 60 || c.x > cameraX + vW + 60) continue;
    drawCrate(ctx, c);
  }

  // 10. Collectibles
  for (const item of level.collectibles) {
    if (item.collected) continue;
    if (item.x < cameraX - 60 || item.x > cameraX + vW + 60) continue;
    drawCollectible(ctx, item, time);
  }

  // 11. Enemies
  for (const enemy of level.enemies) {
    if (!enemy.alive && enemy.squishTimer <= 0) continue;
    if (enemy.x + enemy.w < cameraX - 80 || enemy.x > cameraX + vW + 80) continue;
    drawEnemy(ctx, enemy, time);
  }

  // 12. Boss & Boss Projectiles
  if (boss.active || boss.x < cameraX + vW + 250) {
    drawBoss(ctx, boss, world, time);
  }
  for (const proj of projectiles) {
    drawBossProjectile(ctx, proj, time);
  }

  // 13. Player (Pipoca the Capybara!)
  drawCapybara(ctx, player, time);

  // 14. Particles & Floating Texts
  drawParticles(ctx, particles);
  drawFloatingTexts(ctx, floatingTexts);

  ctx.restore();
  ctx.restore();
}

function drawParallaxBackground(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  cameraX: number,
  time: number,
  world: WorldConfig
) {
  // Fluffy cartoon clouds
  ctx.save();
  const cloudColor =
    world.biome === 'crystal' ? 'rgba(196, 181, 253, 0.16)' : 'rgba(255, 255, 255, 0.78)';
  ctx.fillStyle = cloudColor;
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 340 - cameraX * 0.08 + time * 8) % (viewW + 340)) - 140;
    const cy = 62 + (i % 3) * 44;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.arc(cx + 26, cy - 10, 34, 0, Math.PI * 2);
    ctx.arc(cx + 56, cy, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // Far rolling hills
  ctx.fillStyle = world.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, viewH);
  for (let x = 0; x <= viewW + 40; x += 40) {
    const wx = x + cameraX * 0.18;
    const y = viewH * 0.62 + Math.sin(wx * 0.0032) * 38 + Math.cos(wx * 0.0014) * 24;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(viewW, viewH);
  ctx.closePath();
  ctx.fill();

  // Near rolling hills & biome props
  ctx.fillStyle = world.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, viewH);
  for (let x = 0; x <= viewW + 40; x += 40) {
    const wx = x + cameraX * 0.34;
    const y = viewH * 0.72 + Math.sin(wx * 0.0048 + 1.4) * 30;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(viewW, viewH);
  ctx.closePath();
  ctx.fill();

  // Biome-specific distant scenery silhouettes
  const propSpacing = 320;
  const startIdx = Math.floor((cameraX * 0.34) / propSpacing) - 1;
  for (let i = startIdx; i < startIdx + Math.ceil(viewW / propSpacing) + 3; i++) {
    const px = i * propSpacing - cameraX * 0.34 + 90;
    const basePy = viewH * 0.72 + Math.sin((i * propSpacing) * 0.0048 + 1.4) * 25;
    if (world.biome === 'waterfall') {
      // Distant shimmering waterfall ribbons
      ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
      drawRoundedRect(ctx, px, basePy - 90, 44, 150, 16);
      ctx.fill();
    } else if (world.biome === 'mushroom') {
      // Giant background silhouette mushrooms
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(px + 12, basePy - 45, 16, 55);
      ctx.beginPath();
      ctx.arc(px + 20, basePy - 45, 32, Math.PI, 0);
      ctx.fill();
    } else if (world.biome === 'crystal') {
      ctx.fillStyle = 'rgba(167, 139, 250, 0.35)';
      ctx.beginPath();
      ctx.moveTo(px, basePy + 10);
      ctx.lineTo(px + 18, basePy - 75);
      ctx.lineTo(px + 38, basePy + 10);
      ctx.closePath();
      ctx.fill();
    } else if (world.biome === 'castle' || world.biome === 'toyland') {
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(px, basePy - 70, 38, 80);
      ctx.beginPath();
      ctx.moveTo(px - 6, basePy - 70);
      ctx.lineTo(px + 19, basePy - 102);
      ctx.lineTo(px + 44, basePy - 70);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBottomAtmosphere(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  vW: number,
  viewBottom: number,
  waterY: number,
  world: WorldConfig,
  time: number
) {
  if (viewBottom < waterY) return;
  ctx.save();
  ctx.fillStyle = world.waterColor;
  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.moveTo(cameraX - 40, viewBottom + 60);
  for (let x = cameraX - 40; x <= cameraX + vW + 60; x += 48) {
    const wave = Math.sin(x * 0.025 + time * 3) * 6;
    ctx.lineTo(x, waterY + wave);
  }
  ctx.lineTo(cameraX + vW + 60, viewBottom + 60);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPlatform(
  ctx: CanvasRenderingContext2D,
  p: Platform,
  world: WorldConfig,
  time: number
) {
  if (p.kind === 'vanish_cloud' && p.vanishState === 'gone') return;

  ctx.save();
  if (p.kind === 'lilypad') {
    const py = p.y + (p.sinkOffset ?? 0);
    ctx.fillStyle = '#16A34A';
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, p.x, py, p.w, p.h, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4ADE80';
    drawRoundedRect(ctx, p.x + 6, py + 3, p.w - 12, 8, 6);
    ctx.fill();

    // Cute pink lotus blossom on the corner
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(p.x + p.w - 16, py - 2, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.kind === 'vanish_cloud') {
    const wobble = p.vanishState === 'shaking' ? Math.sin(time * 36) * 4 : 0;
    ctx.globalAlpha = p.vanishState === 'shaking' ? 0.65 : 0.96;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 3;
    const cx = p.x + p.w * 0.5 + wobble;
    const cy = p.y + 12;
    ctx.beginPath();
    ctx.arc(cx - p.w * 0.28, cy, 18, 0, Math.PI * 2);
    ctx.arc(cx, cy - 6, 22, 0, Math.PI * 2);
    ctx.arc(cx + p.w * 0.28, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (p.kind === 'windmill') {
    // Draw wooden arm from center hub to blade
    if (p.centerX !== undefined && p.centerY !== undefined) {
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(p.centerX, p.centerY);
      ctx.lineTo(p.x + p.w * 0.5, p.y + p.h * 0.5);
      ctx.stroke();

      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#7F1D1D';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.centerX, p.centerY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, p.x, p.y, p.w, p.h, 8);
    ctx.fill();
    ctx.stroke();
  } else if (p.kind === 'speed_rail') {
    // Glowing Neon-Cyan Sonic Crystal Rail!
    ctx.fillStyle = '#0E7490';
    ctx.strokeStyle = '#ECFEFF';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, p.x, p.y, p.w, p.h, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22D3EE';
    const shift = (time * 90) % 44;
    for (let rx = p.x + shift; rx < p.x + p.w - 18; rx += 44) {
      ctx.beginPath();
      ctx.moveTo(rx, p.y + 4);
      ctx.lineTo(rx + 12, p.y + p.h * 0.5);
      ctx.lineTo(rx, p.y + p.h - 4);
      ctx.fill();
    }
  } else if (p.kind === 'bridge') {
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, p.x, p.y, p.w, p.h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#D97706';
    for (let px = p.x + 8; px < p.x + p.w - 16; px += 28) {
      drawRoundedRect(ctx, px, p.y + 4, 20, p.h - 8, 4);
      ctx.fill();
    }
  } else if (p.kind === 'oneway' || p.kind === 'moving') {
    ctx.fillStyle = p.kind === 'moving' ? '#FDE047' : world.groundFill;
    ctx.strokeStyle = world.groundOutline;
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, p.x, p.y, p.w, p.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = world.groundTop;
    drawRoundedRect(ctx, p.x + 2, p.y + 1, p.w - 4, Math.min(12, p.h * 0.55), 10);
    ctx.fill();

    if (p.kind === 'moving') {
      const flap = Math.sin(time * 8) * 4;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(p.x - 6, p.y + p.h * 0.5 + flap, 10, 6, -0.3, 0, Math.PI * 2);
      ctx.ellipse(p.x + p.w + 6, p.y + p.h * 0.5 + flap, 10, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = world.groundFill;
    ctx.strokeStyle = world.groundOutline;
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, p.x, p.y, p.w, p.h, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = world.groundTop;
    drawRoundedRect(ctx, p.x + 2, p.y + 1, p.w - 4, 24, 14);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    for (let tx = p.x + 24; tx < p.x + p.w - 28; tx += 64) {
      drawRoundedRect(ctx, tx, p.y + 6, 26, 6, 3);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCannonPad(
  ctx: CanvasRenderingContext2D,
  c: CannonPad,
  time: number
) {
  ctx.save();
  ctx.translate(c.x + c.w * 0.5, c.y + c.h);

  // Wheels
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-10, -10, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tilted festive cannon barrel
  ctx.save();
  ctx.translate(0, -18);
  ctx.rotate(-0.55);
  ctx.fillStyle = '#312E81';
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3.5;
  drawRoundedRect(ctx, -18, -14, 44, 28, 10);
  ctx.fill();
  ctx.stroke();

  // Pulsing star emblem
  const pulse = 1 + Math.sin(time * 6) * 0.1;
  ctx.scale(pulse, pulse);
  drawStarShape(ctx, 2, 0, 5, 8, 4, '#FACC15');
  ctx.restore();

  ctx.restore();
}

function drawRamp(
  ctx: CanvasRenderingContext2D,
  r: SlopeRamp,
  world: WorldConfig,
  time: number
) {
  ctx.save();
  ctx.fillStyle = world.groundFill;
  ctx.strokeStyle = world.groundOutline;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(r.x, r.y);
  ctx.lineTo(r.x + r.w, r.y);
  ctx.lineTo(r.x + r.w, r.y - r.h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bright Sonic-style speed track strip along hypotenuse
  ctx.strokeStyle = r.boost ? '#FACC15' : world.groundTop;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(r.x + 4, r.y - 2);
  ctx.lineTo(r.x + r.w - 4, r.y - r.h + 2);
  ctx.stroke();

  // Animated directional speed chevrons
  if (r.boost) {
    const pulse = (time * 3) % 1;
    ctx.strokeStyle = '#FF7A1A';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const t = (i / 3 + pulse * 0.33) % 1;
      const cx = r.x + t * r.w;
      const cy = r.y - t * r.h - 14;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 6);
      ctx.lineTo(cx + 2, cy);
      ctx.lineTo(cx - 8, cy + 6);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBouncePad(ctx: CanvasRenderingContext2D, b: BouncePad) {
  ctx.save();
  const squash = b.squashTimer > 0 ? Math.sin(b.squashTimer * 24) * 5 : 0;
  const cx = b.x + b.w * 0.5;
  const topY = b.y + squash;

  // Stem / spring coil
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  drawRoundedRect(ctx, cx - 12, topY + 10, 24, b.h - 10 + 4, 6);
  ctx.fill();
  ctx.stroke();

  // Bouncy cap
  const capColor =
    b.style === 'mushroom'
      ? '#EF4444'
      : b.style === 'lily'
      ? '#22C55E'
      : b.style === 'hay'
      ? '#FACC15'
      : b.style === 'cloud'
      ? '#FFFFFF'
      : '#FF7A1A';

  ctx.fillStyle = capColor;
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, b.x, topY, b.w, 16, 9);
  ctx.fill();
  ctx.stroke();

  // Polka dots / shine
  ctx.fillStyle = b.style === 'cloud' ? '#F472B6' : '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx - 14, topY + 7, 4, 0, Math.PI * 2);
  ctx.arc(cx, topY + 6, 4.5, 0, Math.PI * 2);
  ctx.arc(cx + 14, topY + 7, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawGeyser(ctx: CanvasRenderingContext2D, g: Geyser, time: number) {
  ctx.save();
  const topY = g.y - g.height;
  const grad = ctx.createLinearGradient(0, g.y, 0, topY);
  if (g.kind === 'rainbow') {
    grad.addColorStop(0, 'rgba(244, 114, 182, 0.55)');
    grad.addColorStop(0.5, 'rgba(250, 204, 21, 0.45)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
  } else if (g.kind === 'confetti') {
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
    grad.addColorStop(1, 'rgba(244, 63, 94, 0.05)');
  } else {
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
    grad.addColorStop(1, 'rgba(224, 242, 254, 0.08)');
  }

  ctx.fillStyle = grad;
  drawRoundedRect(ctx, g.x + 6, topY, g.w - 12, g.height, 20);
  ctx.fill();

  // Rising bubbles/sparkles inside stream
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 6; i++) {
    const progress = ((time * 1.4 + i * 0.17) % 1);
    const by = g.y - progress * g.height;
    const bx = g.x + g.w * 0.5 + Math.sin(progress * 8 + i) * 12;
    ctx.beginPath();
    ctx.arc(bx, by, 5 + (1 - progress) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Base spout
  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.5;
  drawRoundedRect(ctx, g.x, g.y - 12, g.w, 14, 7);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawHeartFountain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  // Stone basin
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, x - 34, y - 22, 68, 22, 10);
  ctx.fill();
  ctx.stroke();

  // Floating glowing heart
  const bob = Math.sin(time * 3.5) * 6;
  drawHeartShape(ctx, x, y - 52 + bob, 16, '#FB7185', '#9F1239');
  ctx.restore();
}

function drawCheckpoint(
  ctx: CanvasRenderingContext2D,
  cp: Checkpoint,
  time: number
) {
  ctx.save();
  // Pole
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, cp.x - 4, cp.y - 94, 8, 94, 4);
  ctx.fill();
  ctx.stroke();

  // Flag
  const flagY = cp.y - 42 - cp.flagLift * 44;
  const wave = Math.sin(time * 5) * 3;
  ctx.fillStyle = cp.activated ? '#10B981' : '#FB923C';
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cp.x + 4, flagY);
  ctx.lineTo(cp.x + 56, flagY + 12 + wave);
  ctx.lineTo(cp.x + 4, flagY + 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top orb
  ctx.fillStyle = cp.activated ? '#FACC15' : '#94A3B8';
  ctx.beginPath();
  ctx.arc(cp.x, cp.y - 98, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Label sign
  ctx.font = '700 12px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1E293B';
  ctx.fillText(cp.label, cp.x, cp.y - 114);
  ctx.restore();
}

function drawOswaldaoStation(
  ctx: CanvasRenderingContext2D,
  st: SupportStation,
  player: PlayerState,
  time: number
) {
  const near = Math.abs(player.x + player.w * 0.5 - st.x) < 260;
  const bounce = st.cheerTimer > 0 ? Math.abs(Math.sin(time * 9)) * 7 : Math.sin(time * 3) * 2;
  const cx = st.x;
  const cy = st.y - 34 - bounce;

  ctx.save();
  // Ground shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, st.y - 2, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(cx, cy);

  // Strong dad capybara torso
  ctx.fillStyle = '#8D5524';
  ctx.strokeStyle = '#3B1D0A';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(0, 4, 34, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Warm chest
  ctx.fillStyle = '#C68642';
  ctx.beginPath();
  ctx.ellipse(-4, 9, 17, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Blue dad bandana
  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = '#0C4A6E';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-22, -8);
  ctx.quadraticCurveTo(-2, 2, 16, -8);
  ctx.lineTo(10, 4);
  ctx.quadraticCurveTo(-2, 10, -16, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Flexing cheering arm
  const armLift = st.cheerTimer > 0 ? Math.sin(time * 11) * 5 : 0;
  ctx.strokeStyle = '#3B1D0A';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.quadraticCurveTo(36, -12 - armLift, 28, -26 - armLift);
  ctx.stroke();
  ctx.strokeStyle = '#8D5524';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.quadraticCurveTo(36, -12 - armLift, 28, -26 - armLift);
  ctx.stroke();

  // Big head (facing left/towards incoming Pipoca or right at start)
  const dir = st.kind === 'start' ? 1 : -1;
  ctx.save();
  ctx.scale(dir, 1);

  ctx.fillStyle = '#8D5524';
  ctx.strokeStyle = '#3B1D0A';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(16, -20, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ear
  ctx.fillStyle = '#6B3E17';
  ctx.beginPath();
  ctx.arc(3, -36, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snout
  ctx.fillStyle = '#C68642';
  ctx.beginPath();
  ctx.ellipse(27, -15, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2A170B';
  ctx.beginPath();
  ctx.ellipse(34, -18, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#2A170B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(24, -11, 5, 0.15, Math.PI - 0.3);
  ctx.stroke();

  // Cool Sunglasses with gold frame & white shine
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 8, -29, 13, 9, 2.5);
  ctx.fill();
  ctx.stroke();
  drawRoundedRect(ctx, 22, -29, 12, 9, 2.5);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(11, -22);
  ctx.lineTo(16, -27);
  ctx.moveTo(25, -22);
  ctx.lineTo(30, -27);
  ctx.stroke();

  ctx.restore();

  // Name badge & cheer speech bubble
  ctx.font = '700 12px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0C4A6E';
  ctx.fillText('Oswaldão', 0, -52);

  if (near || st.cheerTimer > 0) {
    const text = st.message;
    ctx.font = '700 13px Nunito, sans-serif';
    const textW = Math.min(260, ctx.measureText(text).width + 24);
    const bx = -textW * 0.5;
    const by = -98;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, bx, by, textW, 30, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.fillText(text, 0, by + 19);
  }

  ctx.restore();
}

function drawCrate(ctx: CanvasRenderingContext2D, c: BreakableCrate) {
  ctx.save();
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, c.x, c.y, c.w, c.h, 8);
  ctx.fill();
  ctx.stroke();

  // Inner plank cross
  ctx.fillStyle = '#F59E0B';
  drawRoundedRect(ctx, c.x + 6, c.y + 6, c.w - 12, c.h - 12, 4);
  ctx.fill();
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(c.x + 8, c.y + 8);
  ctx.lineTo(c.x + c.w - 8, c.y + c.h - 8);
  ctx.moveTo(c.x + c.w - 8, c.y + 8);
  ctx.lineTo(c.x + 8, c.y + c.h - 8);
  ctx.stroke();
  ctx.restore();
}

function drawCollectible(
  ctx: CanvasRenderingContext2D,
  item: Collectible,
  time: number
) {
  const bob = Math.sin(time * 3.8 + item.bobPhase) * 5;
  const x = item.x;
  const y = item.y + bob;

  ctx.save();
  if (item.kind === 'tangerine') {
    ctx.fillStyle = '#FF7A1A';
    ctx.strokeStyle = '#7C2D12';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, item.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cute highlight & green leaf
    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.arc(x - 4, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.ellipse(x + 4, y - item.r - 1, 7, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'golden_secret') {
    // Rotating aura rays
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 1.6);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.fillRect(-4, -item.r - 10, 8, item.r * 2 + 20);
    }
    ctx.restore();

    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, item.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Star emblem inside
    drawStarShape(ctx, x, y, 5, 11, 5, '#FEF9C3');
  } else if (item.kind === 'heart') {
    drawHeartShape(ctx, x, y, 15, '#FB7185', '#9F1239');
  } else if (item.kind === 'star_shield') {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, item.r + 6, 0, Math.PI * 2);
    ctx.fill();
    drawStarShape(ctx, x, y, 5, item.r, item.r * 0.48, '#38BDF8', '#0C4A6E');
  }
  ctx.restore();
}

function drawHeartShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string,
  stroke?: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.6);
  ctx.bezierCurveTo(-size * 1.2, -size * 0.1, -size * 0.6, -size * 0.9, 0, -size * 0.3);
  ctx.bezierCurveTo(size * 0.6, -size * 0.9, size * 1.2, -size * 0.1, 0, size * 0.6);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawStarShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number,
  fill: string,
  stroke?: string
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawCapybara(
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  time: number
) {
  ctx.save();

  // Blink gently during invulnerability
  if (p.invulnTimer > 0 && Math.floor(time * 16) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }

  const cx = p.x + p.w * 0.5;
  const bottomY = p.y + p.h;

  // Rescue Balloon overhead if active!
  if (p.rescueBalloon.active) {
    ctx.save();
    const bx = cx;
    const by = p.y - 54;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx, p.y + 8);
    ctx.lineTo(bx, by + 26);
    ctx.stroke();

    ctx.fillStyle = '#FB7185';
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(bx, by, 26, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(bx, by, 10, 29, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Star shield aura
  if (p.shieldTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#38BDF8';
    ctx.fillStyle = 'rgba(125, 211, 252, 0.22)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, p.y + p.h * 0.5, 34 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.translate(cx, bottomY);
  ctx.scale(p.facing * p.squashX, p.squashY);

  if (p.rolling) {
    // Sonic-style cute spinning capybara ball!
    ctx.translate(0, -p.h * 0.48);
    ctx.rotate(p.spinAngle);

    // Motion blur ring
    ctx.fillStyle = 'rgba(255, 122, 26, 0.28)';
    ctx.beginPath();
    ctx.arc(0, 0, 29, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#B47644';
    ctx.strokeStyle = '#452512';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Swirl stripes
    ctx.strokeStyle = '#FF7A1A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 1.2);
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(10, -6, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Running leg swing
  const speedRatio = Math.min(1, Math.abs(p.vx) / 260);
  const legSwing = p.onGround ? Math.sin(p.animTime * 16) * 7 * speedRatio : 5;

  // Back paws
  ctx.fillStyle = '#7C4D2B';
  ctx.strokeStyle = '#452512';
  ctx.lineWidth = 2.8;
  drawRoundedRect(ctx, -14 - legSwing, -11, 10, 11, 5);
  ctx.fill();
  ctx.stroke();
  drawRoundedRect(ctx, 4 + legSwing, -11, 10, 11, 5);
  ctx.fill();
  ctx.stroke();

  // Chubby body
  ctx.fillStyle = '#B47644';
  ctx.strokeStyle = '#452512';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(-2, -23, 22, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Soft cream belly patch
  ctx.fillStyle = '#E5B285';
  ctx.beginPath();
  ctx.ellipse(2, -19, 13, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front paws
  ctx.fillStyle = '#9A5F33';
  drawRoundedRect(ctx, -8 + legSwing, -10, 10, 10, 5);
  ctx.fill();
  ctx.stroke();
  drawRoundedRect(ctx, 8 - legSwing, -10, 10, 10, 5);
  ctx.fill();
  ctx.stroke();

  // Capybara Head (round & expressive)
  const headBob = p.onGround ? Math.abs(Math.sin(p.animTime * 16)) * 2 * speedRatio : 0;
  ctx.translate(8, -36 - headBob);

  // Cute floppy ears
  const earFlap = !p.onGround && p.jumpsLeft === 0 ? Math.sin(time * 28) * 0.35 : 0;
  ctx.save();
  ctx.translate(-10, -10);
  ctx.rotate(earFlap);
  ctx.fillStyle = '#8C522B';
  ctx.strokeStyle = '#452512';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, 6.5, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Head base
  ctx.fillStyle = '#B47644';
  ctx.strokeStyle = '#452512';
  ctx.lineWidth = 3.2;
  drawRoundedRect(ctx, -15, -14, 33, 25, 13);
  ctx.fill();
  ctx.stroke();

  // Snout highlight
  ctx.fillStyle = '#D49A6A';
  ctx.beginPath();
  ctx.ellipse(12, 0, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose & happy smile
  ctx.fillStyle = '#452512';
  ctx.beginPath();
  ctx.ellipse(16, -2, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#452512';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(11, 3, 4.5, 0.1, Math.PI - 0.2);
  ctx.stroke();

  // Rosy cheek
  ctx.fillStyle = 'rgba(251, 113, 133, 0.55)';
  ctx.beginPath();
  ctx.arc(1, 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (blinking or joyful ^ ^)
  if (p.happyTimer > 0) {
    ctx.strokeStyle = '#2A170B';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(2, -4, 4, Math.PI, 0);
    ctx.stroke();
  } else if (p.blinkTimer > 0 && p.blinkTimer < 0.12) {
    ctx.strokeStyle = '#2A170B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-1, -4);
    ctx.lineTo(5, -4);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#1E1108';
    ctx.beginPath();
    ctx.arc(2, -4.5, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(3, -5.6, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Signature Tangerine balanced on Pipoca's head!
  const tangBounce = p.onGround ? 0 : Math.min(4, Math.abs(p.vy) * 0.008);
  ctx.save();
  ctx.translate(0, -19 - tangBounce);
  ctx.fillStyle = '#FF7A1A';
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FED7AA';
  ctx.beginPath();
  ctx.arc(-2.5, -2.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.ellipse(3, -8.5, 5, 2.8, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
  ctx.save();
  const cx = e.x + e.w * 0.5;
  const bottomY = e.y + e.h;

  ctx.translate(cx, bottomY);
  if (!e.alive) {
    ctx.scale(1.3, 0.35);
    ctx.globalAlpha = Math.max(0, e.squishTimer * 4);
  } else {
    ctx.scale(e.facing, 1);
  }

  const bob = Math.sin(time * 8 + e.animPhase) * 2.5;
  const colorMap: Record<string, {main: string; sec: string; outline: string}> = {
    crab: {main: '#EF4444', sec: '#FCA5A5', outline: '#7F1D1D'},
    frog: {main: '#22C55E', sec: '#BBF7D0', outline: '#14532D'},
    toucan: {main: '#1E293B', sec: '#FACC15', outline: '#0F172A'},
    ant: {main: '#B91C1C', sec: '#4ADE80', outline: '#450A0A'},
    owl: {main: '#7C3AED', sec: '#DDD6FE', outline: '#4C1D95'},
    beetle: {main: '#2563EB', sec: '#93C5FD', outline: '#1E3A8A'},
    duck: {main: '#FACC15', sec: '#FB923C', outline: '#713F12'},
    fish: {main: '#06B6D4', sec: '#BAE6FD', outline: '#164E63'},
    scarecrow: {main: '#D97706', sec: '#FDE047', outline: '#78350F'},
    chick: {main: '#FDE047', sec: '#FB923C', outline: '#854D0E'},
    bee: {main: '#FACC15', sec: '#1E293B', outline: '#422006'},
    bat: {main: '#6D28D9', sec: '#F472B6', outline: '#2E1065'},
    armadillo: {main: '#94A3B8', sec: '#E2E8F0', outline: '#334155'},
    snail: {main: '#EC4899', sec: '#FDE047', outline: '#831843'},
    sneezecloud: {main: '#E2E8F0', sec: '#38BDF8', outline: '#475569'},
    kitebird: {main: '#F43F5E', sec: '#FDE047', outline: '#881337'},
    star: {main: '#FACC15', sec: '#FEF08A', outline: '#854D0E'},
    windup: {main: '#0EA5E9', sec: '#F43F5E', outline: '#0C4A6E'},
    spintop: {main: '#EC4899', sec: '#FACC15', outline: '#831843'},
    plushbear: {main: '#A16207', sec: '#FDE68A', outline: '#451A03'},
    turtleknight: {main: '#10B981', sec: '#94A3B8', outline: '#064E3B'},
    royalbat: {main: '#4F46E5', sec: '#FACC15', outline: '#1E1B4B'},
    springmimic: {main: '#F59E0B', sec: '#FFFFFF', outline: '#78350F'},
  };

  const palette = colorMap[e.kind] ?? {main: '#F43F5E', sec: '#FECDD3', outline: '#881337'};

  // Cute round cartoon enemy body
  ctx.fillStyle = palette.main;
  ctx.strokeStyle = palette.outline;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, -e.w * 0.48, -e.h + bob, e.w * 0.96, e.h - 4, 16);
  ctx.fill();
  ctx.stroke();

  // Secondary belly / stripe
  ctx.fillStyle = palette.sec;
  ctx.beginPath();
  ctx.ellipse(2, -e.h * 0.35 + bob, e.w * 0.28, e.h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings for flyers
  if (e.behavior === 'flyer') {
    const wingY = -e.h * 0.55 + Math.sin(time * 18 + e.animPhase) * 8;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(-8, wingY, 13, 7, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Expressive silly eyes (never scary, friendly cartoon mischief!)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(4, -e.h * 0.62 + bob, 6, 0, Math.PI * 2);
  ctx.arc(15, -e.h * 0.62 + bob, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(6, -e.h * 0.62 + bob, 2.8, 0, Math.PI * 2);
  ctx.arc(16.5, -e.h * 0.62 + bob, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // Little feet
  const step = Math.sin(time * 12 + e.animPhase) * 4;
  ctx.fillStyle = palette.outline;
  ctx.beginPath();
  ctx.arc(-8 + step, -3, 4.5, 0, Math.PI * 2);
  ctx.arc(10 - step, -3, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBoss(
  ctx: CanvasRenderingContext2D,
  boss: BossState,
  world: WorldConfig,
  time: number
) {
  // Draw kidnapped baby capybara waiting in a bubble on the arena side!
  if (!boss.defeated) {
    ctx.save();
    const babyX = boss.arenaRight - 52;
    const babyY = boss.arenaFloorY - 96 + Math.sin(time * 2.5) * 6;
    // Little baby capybara inside glowing rescue bubble
    ctx.fillStyle = '#B47644';
    ctx.strokeStyle = '#452512';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(babyX, babyY + 4, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#8C522B';
    ctx.beginPath();
    ctx.arc(babyX - 8, babyY - 7, 4, 0, Math.PI * 2);
    ctx.arc(babyX + 8, babyY - 7, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E1108';
    ctx.beginPath();
    ctx.arc(babyX - 4, babyY + 2, 2, 0, Math.PI * 2);
    ctx.arc(babyX + 4, babyY + 2, 2, 0, Math.PI * 2);
    ctx.fill();
    // Tiny orange dot on head
    ctx.fillStyle = '#FF7A1A';
    ctx.beginPath();
    ctx.arc(babyX, babyY - 11, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Bubble enclosure
    ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(babyX, babyY, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = '700 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(world.babyName, babyX, babyY - 34);
    ctx.restore();
  }

  if (boss.defeated) return;
  ctx.save();

  // Telegraph target ring on floor if boss is telegraphing a drop/charge
  if (boss.phase === 'TELEGRAPH' && boss.telegraphTargetX !== undefined) {
    ctx.save();
    ctx.strokeStyle = '#FB7185';
    ctx.fillStyle = 'rgba(251, 113, 133, 0.25)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.ellipse(boss.telegraphTargetX, boss.arenaFloorY - 4, 48, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  const cx = boss.x + boss.w * 0.5;
  const bottomY = boss.y + boss.h;
  ctx.translate(cx, bottomY);

  if (boss.flashTimer > 0 && Math.floor(time * 24) % 2 === 0) {
    ctx.globalAlpha = 0.55;
  }

  ctx.scale(boss.facing, 1);

  const bob = boss.phase === 'DIZZY' ? Math.sin(time * 16) * 4 : Math.sin(time * 4) * 3;
  const dizzy = boss.phase === 'DIZZY' || boss.phase === 'HURT';

  // 8 BESPOKE CARTOON BOSS ANATOMIES!
  if (boss.kind === 'croc') {
    // 1. Rei Jacaré Soneca: long green crocodile with snout, tail & teeth!
    ctx.fillStyle = '#15803D';
    ctx.strokeStyle = '#052E16';
    ctx.lineWidth = 4;
    // Tail
    ctx.beginPath();
    ctx.moveTo(-boss.w * 0.35, -24 + bob);
    ctx.lineTo(-boss.w * 0.68, -36 + Math.sin(time * 6) * 6);
    ctx.lineTo(-boss.w * 0.35, -10 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Long body + snout
    drawRoundedRect(ctx, -boss.w * 0.45, -boss.h + bob, boss.w * 0.95, boss.h - 8, 24);
    ctx.fill();
    ctx.stroke();
    // Yellow belly scales
    ctx.fillStyle = '#FDE047';
    drawRoundedRect(ctx, -boss.w * 0.25, -24 + bob, boss.w * 0.55, 16, 8);
    ctx.fill();
    // Cute rounded snout teeth
    ctx.fillStyle = '#FFFFFF';
    for (let t = 0; t < 3; t++) {
      ctx.beginPath();
      ctx.moveTo(22 + t * 12, -26 + bob);
      ctx.lineTo(27 + t * 12, -16 + bob);
      ctx.lineTo(32 + t * 12, -26 + bob);
      ctx.fill();
    }
  } else if (boss.kind === 'owl_maestro') {
    // 2. Corujão Maestro: wide flapping purple wings + glasses + feather tufts!
    const wingFlap = Math.sin(time * 12) * 18;
    ctx.fillStyle = '#6D28D9';
    ctx.strokeStyle = '#2E1065';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(-42, -boss.h * 0.55 + wingFlap, 34, 18, -0.4, 0, Math.PI * 2);
    ctx.ellipse(42, -boss.h * 0.55 + wingFlap, 34, 18, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.ellipse(0, -boss.h * 0.5 + bob, boss.w * 0.44, boss.h * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Belly feathers
    ctx.fillStyle = '#DDD6FE';
    ctx.beginPath();
    ctx.ellipse(4, -boss.h * 0.34 + bob, boss.w * 0.28, boss.h * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    // Orange beak
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(14, -boss.h * 0.6 + bob);
    ctx.lineTo(28, -boss.h * 0.53 + bob);
    ctx.lineTo(14, -boss.h * 0.47 + bob);
    ctx.closePath();
    ctx.fill();
  } else if (boss.kind === 'octopus') {
    // 3. Polvo Bolha-Bolha: 6 undulating wavy tentacles + artist beret!
    ctx.fillStyle = '#DB2777';
    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 3.5;
    for (let t = -2; t <= 2; t++) {
      const wave = Math.sin(time * 8 + t) * 7;
      drawRoundedRect(ctx, t * 20 - 8, -32, 16, 30 + wave * 0.3, 8);
      ctx.fill();
      ctx.stroke();
    }
    // Round head
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.arc(0, -boss.h * 0.58 + bob, boss.w * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Artist beret
    ctx.fillStyle = '#FBCFE8';
    ctx.beginPath();
    ctx.ellipse(-4, -boss.h + 10 + bob, 36, 14, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (boss.kind === 'tractor') {
    // 4. Trator Maluco: red cartoon tractor + big back wheel + exhaust chimney!
    // Exhaust pipe
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 20, -boss.h - 14 + bob, 14, 34, 4);
    ctx.fill();
    ctx.stroke();
    // Cabin & Engine Hood
    ctx.fillStyle = '#DC2626';
    drawRoundedRect(ctx, -48, -boss.h + 12 + bob, 56, 66, 12);
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, 4, -boss.h * 0.62 + bob, 54, 46, 12);
    ctx.fill();
    ctx.stroke();
    // Windshield
    ctx.fillStyle = '#BAE6FD';
    drawRoundedRect(ctx, -34, -boss.h + 22 + bob, 36, 26, 6);
    ctx.fill();
    // Big rear wheel & small front wheel
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(-24, -24, 24, 0, Math.PI * 2);
    ctx.arc(36, -16, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(-24, -24, 11, 0, Math.PI * 2);
    ctx.arc(36, -16, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (boss.kind === 'armadillo_king') {
    // 5. Tatu-Rei Metálico: golden armored ball when rolling, segmented shell otherwise!
    if (boss.armored) {
      ctx.save();
      ctx.translate(0, -boss.h * 0.5);
      ctx.rotate(time * 18);
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 1.4);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -16 + bob, boss.w * 0.48, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Armor stripe bands
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-10, -16 + bob, 34, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
  } else if (boss.kind === 'thunder_cloud') {
    // 6. Nuvem Trovão Birrenta: puffy dark-gray storm cloud + electric zig-zag!
    ctx.fillStyle = '#64748B';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-28, -40 + bob, 32, 0, Math.PI * 2);
    ctx.arc(0, -64 + bob, 38, 0, Math.PI * 2);
    ctx.arc(30, -40 + bob, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Rosy grumpy cheeks & yellow lightning bolt
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.arc(-6, -34 + bob, 7, 0, Math.PI * 2);
    ctx.arc(32, -34 + bob, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.moveTo(-4, -14 + bob);
    ctx.lineTo(12, -14 + bob);
    ctx.lineTo(4, 2 + bob);
    ctx.lineTo(16, 2 + bob);
    ctx.lineTo(-4, 22 + bob);
    ctx.lineTo(2, 6 + bob);
    ctx.lineTo(-8, 6 + bob);
    ctx.closePath();
    ctx.fill();
  } else if (boss.kind === 'jack_box') {
    // 7. Robô-Caixa Surpresa: striped toy box + coiled spring + jester head!
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, -40, -56, 80, 52, 10);
    ctx.fill();
    ctx.stroke();
    // Yellow star on toy box
    drawStarShape(ctx, 0, -30, 5, 16, 7, '#FACC15');
    // Spring neck & Robot Head
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, -56);
    ctx.lineTo(0, -76 + bob);
    ctx.stroke();
    ctx.fillStyle = '#0EA5E9';
    ctx.strokeStyle = '#0C4A6E';
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, -32, -boss.h + bob, 64, 42, 14);
    ctx.fill();
    ctx.stroke();
  } else {
    // 8. BARÃO RAPOSÃO: Purple flowing villain cape, fox ears, bushy tail & top hat!
    // Bushy white-tipped fox tail
    ctx.fillStyle = '#EA580C';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(-48, -26 + bob, 24, 14, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Purple Villain Cape
    ctx.fillStyle = '#6D28D9';
    ctx.strokeStyle = '#2E1065';
    ctx.beginPath();
    ctx.moveTo(-12, -boss.h + 20 + bob);
    ctx.lineTo(-boss.w * 0.7, -10 + Math.sin(time * 7) * 5);
    ctx.lineTo(-8, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Fox body
    ctx.fillStyle = '#EA580C';
    ctx.strokeStyle = '#1E293B';
    drawRoundedRect(ctx, -44, -boss.h + 10 + bob, 88, boss.h - 14, 26);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.ellipse(8, -boss.h * 0.34 + bob, 26, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fox Ears
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(-28, -boss.h + 14 + bob);
    ctx.lineTo(-34, -boss.h - 14 + bob);
    ctx.lineTo(-10, -boss.h + 10 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, -boss.h + 10 + bob);
    ctx.lineTo(30, -boss.h - 14 + bob);
    ctx.lineTo(32, -boss.h + 14 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Golden Crown / Bouncy Target on top of EVERY boss (signals stomp spot!)
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = '#854D0E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-20, -boss.h + bob);
  ctx.lineTo(-14, -boss.h - 20 + bob);
  ctx.lineTo(-4, -boss.h - 7 + bob);
  ctx.lineTo(0, -boss.h - 24 + bob);
  ctx.lineTo(6, -boss.h - 7 + bob);
  ctx.lineTo(16, -boss.h - 20 + bob);
  ctx.lineTo(20, -boss.h + bob);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Expressive Eyes (or dizzy X eyes when stunned!)
  if (!boss.armored) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(8, -boss.h * 0.66 + bob, 10, 0, Math.PI * 2);
    ctx.arc(26, -boss.h * 0.66 + bob, 9.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    if (dizzy) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(3, -boss.h * 0.66 + bob);
      ctx.lineTo(13, -boss.h * 0.66 + bob);
      ctx.moveTo(21, -boss.h * 0.66 + bob);
      ctx.lineTo(31, -boss.h * 0.66 + bob);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(11, -boss.h * 0.66 + bob, 4.5, 0, Math.PI * 2);
      ctx.arc(28, -boss.h * 0.66 + bob, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Telegraph "!" bubble above boss
  if (boss.phase === 'TELEGRAPH') {
    ctx.save();
    ctx.scale(boss.facing, 1);
    ctx.fillStyle = '#FB7185';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -boss.h - 46, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 22px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, -boss.h - 45);
    ctx.restore();
  }

  // Dizzy spinning stars when stunned!
  if (boss.phase === 'DIZZY') {
    for (let i = 0; i < 3; i++) {
      const a = time * 5 + (i * Math.PI * 2) / 3;
      const sx = Math.cos(a) * 34;
      const sy = -boss.h - 36 + Math.sin(a) * 10;
      drawStarShape(ctx, sx, sy, 5, 9, 4, '#FACC15', '#854D0E');
    }
  }

  ctx.restore();
}

function drawBossProjectile(
  ctx: CanvasRenderingContext2D,
  proj: BossProjectile,
  time: number
) {
  ctx.save();
  if (proj.kind === 'wave') {
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.r + Math.sin(time * 12) * 2, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (proj.kind === 'haybale') {
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, proj.x - proj.r, proj.y - proj.r, proj.r * 2, proj.r * 2, 8);
    ctx.fill();
    ctx.stroke();
  } else if (proj.kind === 'note') {
    ctx.fillStyle = proj.bouncy ? '#34D399' : '#A78BFA';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 18px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', proj.x, proj.y + 1);
  } else if (proj.kind === 'lightning') {
    ctx.fillStyle = '#FDE047';
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.5;
    drawStarShape(ctx, proj.x, proj.y, 6, proj.r + 3, proj.r * 0.45, '#FDE047', '#B45309');
  } else if (proj.bouncy) {
    ctx.fillStyle =
      proj.kind === 'cage_bubble'
        ? 'rgba(167, 139, 250, 0.78)'
        : proj.kind === 'bubble'
        ? 'rgba(244, 114, 182, 0.72)'
        : '#F472B6';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.r + Math.sin(time * 10) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = '#FB7185';
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const pt of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.alpha);
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.rotation);
    ctx.fillStyle = pt.color;
    if (pt.shape === 'star') {
      drawStarShape(ctx, 0, 0, 5, pt.size, pt.size * 0.45, pt.color);
    } else if (pt.shape === 'confetti') {
      ctx.fillRect(-pt.size * 0.6, -pt.size * 0.35, pt.size * 1.2, pt.size * 0.7);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  ctx.save();
  ctx.font = '700 20px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  for (const ft of texts) {
    ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.restore();
}
