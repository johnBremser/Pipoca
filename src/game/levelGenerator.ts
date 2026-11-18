import type {
  BouncePad,
  BreakableCrate,
  CannonPad,
  Checkpoint,
  Collectible,
  DifficultyMode,
  Enemy,
  EnemyKind,
  Geyser,
  LevelData,
  Platform,
  SlopeRamp,
} from './types';
import {getWorldConfig} from './worlds';

function createRng(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getEnemyBehavior(kind: EnemyKind): Enemy['behavior'] {
  switch (kind) {
    case 'frog':
    case 'fish':
    case 'plushbear':
    case 'springmimic':
    case 'spintop':
      return 'hopper';
    case 'toucan':
    case 'owl':
    case 'bee':
    case 'bat':
    case 'sneezecloud':
    case 'kitebird':
    case 'star':
    case 'royalbat':
      return 'flyer';
    case 'beetle':
    case 'armadillo':
    case 'chick':
      return 'roller';
    default:
      return 'patrol';
  }
}

export function generateLevel(
  stageId: number,
  mode: DifficultyMode,
  runSeed?: number
): LevelData {
  const world = getWorldConfig(stageId);
  const seed = runSeed ?? stageId * 9173 + (Date.now() % 100000);
  const rng = createRng(seed);

  const floorY = 560;
  const actLength = 5200;
  const bossGateX = actLength * 3; // 15600
  const bossArenaX = bossGateX + 120; // 15720
  const bossArenaWidth = 980;
  const totalWidth = bossArenaX + bossArenaWidth + 160;

  const platforms: Platform[] = [];
  const ramps: SlopeRamp[] = [];
  const bouncePads: BouncePad[] = [];
  const geysers: Geyser[] = [];
  const cannons: CannonPad[] = [];
  const crates: BreakableCrate[] = [];
  const collectibles: Collectible[] = [];
  const checkpoints: Checkpoint[] = [];
  const enemies: Enemy[] = [];

  let uid = 0;
  const nextId = (prefix: string) => `${prefix}_${++uid}`;

  const padStyle: BouncePad['style'] =
    world.biome === 'lagoon'
      ? 'lily'
      : world.biome === 'mushroom'
      ? 'mushroom'
      : world.biome === 'farm'
      ? 'hay'
      : world.biome === 'clouds'
      ? 'cloud'
      : world.biome === 'toyland'
      ? 'cushion'
      : 'spring';

  const geyserKind: Geyser['kind'] =
    world.biome === 'clouds'
      ? 'rainbow'
      : world.biome === 'castle' || world.biome === 'toyland'
      ? 'confetti'
      : 'water';

  const spawnEnemy = (
    x: number,
    surfaceY: number,
    minX: number,
    maxX: number,
    forceFlyer = false
  ) => {
    const pool = world.enemyPool;
    let kind = pool[Math.floor(rng() * pool.length)];
    if (forceFlyer) {
      const flyers = pool.filter((k) => getEnemyBehavior(k) === 'flyer');
      if (flyers.length > 0) kind = flyers[Math.floor(rng() * flyers.length)];
    }
    const behavior = getEnemyBehavior(kind);
    const speedBase = mode === 'pequenos' ? 56 : 88;
    const speed = speedBase + rng() * (mode === 'pequenos' ? 24 : 44);
    const w = 42;
    const h = 38;
    const y = behavior === 'flyer' ? surfaceY - 88 - rng() * 55 : surfaceY - h;

    enemies.push({
      id: nextId('enemy'),
      kind,
      x,
      y,
      w,
      h,
      vx: (rng() > 0.5 ? 1 : -1) * (behavior === 'roller' ? speed * 1.25 : speed),
      vy: 0,
      minX: Math.min(minX, x - 28),
      maxX: Math.max(maxX, x + 28),
      baseY: y,
      facing: 1,
      alive: true,
      squishTimer: 0,
      animPhase: rng() * Math.PI * 2,
      behavior,
      hopTimer: 0.6 + rng() * 1.4,
    });
  };

  const addTangerineArc = (
    startX: number,
    baseY: number,
    count: number,
    spacing = 50,
    arcHeight = 60
  ) => {
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0.5;
      const arcOffset = Math.sin(t * Math.PI) * arcHeight;
      collectibles.push({
        id: nextId('tang'),
        x: startX + i * spacing,
        y: baseY - arcOffset,
        r: 15,
        kind: 'tangerine',
        collected: false,
        bobPhase: i * 0.5 + rng(),
      });
    }
  };

  // Safe starting plaza
  platforms.push({
    id: nextId('plat'),
    x: -100,
    y: floorY,
    w: 660,
    h: 260,
    kind: 'solid',
    route: 'main',
  });
  addTangerineArc(230, floorY - 46, 5, 56, 36);

  // Build 3 Acts with BIOME-SPECIFIC ARCHITECTURE per Stage 1..8!
  for (let act = 1; act <= 3; act++) {
    const actStart = (act - 1) * actLength;
    const segCount = 6;
    const segWidth = (actLength - 560) / segCount;

    if (act > 1) {
      platforms.push({
        id: nextId('plat'),
        x: actStart - 60,
        y: floorY,
        w: 500,
        h: 260,
        kind: 'solid',
        route: 'main',
      });
      checkpoints.push({
        id: nextId('cp'),
        x: actStart + 110,
        y: floorY,
        actNumber: act as 2 | 3,
        label: `Ato ${act}`,
        activated: false,
        flagLift: 0,
      });
      collectibles.push({
        id: nextId('heart'),
        x: actStart + 240,
        y: floorY - 46,
        r: 18,
        kind: 'heart',
        collected: false,
        bobPhase: 0,
      });
    } else {
      checkpoints.push({
        id: nextId('cp'),
        x: 110,
        y: floorY,
        actNumber: 1,
        label: 'Ato 1',
        activated: true,
        flagLift: 1,
      });
    }

    for (let s = 0; s < segCount; s++) {
      const segX = actStart + 440 + s * segWidth;
      const mainY =
        world.biome === 'waterfall'
          ? floorY - ((s % 3) * 65 - 30) // Cascading stair cliffs!
          : world.biome === 'mushroom'
          ? floorY + (s % 2 === 0 ? 10 : -55) // Forest hills!
          : floorY + Math.round((rng() - 0.5) * 48);

      const groundStart = segX + (mode === 'pequenos' ? 70 : 90);
      const groundW = segWidth - 75;

      // Mid-Act checkpoint on segment 3 (always safe solid platform)
      if (s === 3) {
        platforms.push({
          id: nextId('plat'),
          x: groundStart,
          y: mainY,
          w: 220,
          h: 260,
          kind: 'solid',
          route: 'main',
        });
        checkpoints.push({
          id: nextId('cp'),
          x: groundStart + 90,
          y: mainY,
          actNumber: act as 1 | 2 | 3,
          label: `Meio Ato ${act}`,
          activated: false,
          flagLift: 0,
        });
      }

      // ================================================================
      // BIOME-SPECIFIC MAIN & SPECIALTY ROUTE ARCHITECTURES!
      // ================================================================
      if (world.biome === 'lagoon') {
        // STAGE 1: Floating Lilypad chains over sparkling water + wooden docks!
        if (s % 2 === 0 && s !== 3) {
          platforms.push({
            id: nextId('plat'),
            x: groundStart,
            y: mainY,
            w: 170,
            h: 240,
            kind: 'solid',
            route: 'main',
          });
          for (let l = 0; l < 3; l++) {
            platforms.push({
              id: nextId('lily'),
              x: groundStart + 210 + l * 145,
              y: mainY + 12 + (l % 2) * 18,
              w: 112,
              h: 24,
              kind: 'lilypad',
              route: 'main',
              sinkOffset: 0,
              stoodOn: false,
            });
            addTangerineArc(groundStart + 225 + l * 145, mainY - 36, 2, 42, 24);
          }
          platforms.push({
            id: nextId('plat'),
            x: groundStart + groundW - 140,
            y: mainY,
            w: 165,
            h: 240,
            kind: 'solid',
            route: 'main',
          });
        } else {
          platforms.push({
            id: nextId('plat'),
            x: groundStart,
            y: mainY,
            w: groundW,
            h: 250,
            kind: 'solid',
            route: 'main',
          });
          addTangerineArc(groundStart + 140, mainY - 42, 4, 52, 45);
          spawnEnemy(groundStart + groundW * 0.55, mainY, groundStart + 80, groundStart + groundW - 80);
        }
      } else if (world.biome === 'mushroom') {
        // STAGE 2: Vertical Multi-Tier Mushroom Canopy Towers!
        platforms.push({
          id: nextId('plat'),
          x: groundStart,
          y: mainY,
          w: groundW,
          h: 260,
          kind: 'solid',
          route: 'main',
        });
        // Stacked bouncy mushroom ladder up to mid & high tree canopy!
        bouncePads.push({
          id: nextId('pad'),
          x: groundStart + 70,
          y: mainY - 22,
          w: 72,
          h: 22,
          power: 760,
          style: 'mushroom',
          squashTimer: 0,
        });
        const midCanopyY = mainY - 150;
        platforms.push({
          id: nextId('plat'),
          x: groundStart + 170,
          y: midCanopyY,
          w: 220,
          h: 24,
          kind: 'oneway',
          route: 'upper',
        });
        bouncePads.push({
          id: nextId('pad'),
          x: groundStart + 260,
          y: midCanopyY - 22,
          w: 68,
          h: 22,
          power: 780,
          style: 'mushroom',
          squashTimer: 0,
        });
        addTangerineArc(groundStart + 210, midCanopyY - 42, 3, 46, 30);
        spawnEnemy(groundStart + groundW * 0.65, mainY, groundStart + 160, groundStart + groundW - 70);
      } else if (world.biome === 'waterfall') {
        // STAGE 3: Cascading Cliff Terraces & Towering Water Geysers!
        platforms.push({
          id: nextId('plat'),
          x: groundStart,
          y: mainY,
          w: 250,
          h: 320,
          kind: 'solid',
          route: 'main',
        });
        geysers.push({
          id: nextId('geyser'),
          x: groundStart + 290,
          y: mainY + 80,
          w: 74,
          height: 360,
          liftForce: 880,
          kind: 'water',
        });
        platforms.push({
          id: nextId('plat'),
          x: groundStart + 390,
          y: mainY - 75,
          w: 260,
          h: 24,
          kind: 'bridge',
          route: 'main',
        });
        addTangerineArc(groundStart + 420, mainY - 125, 4, 48, 40);
        spawnEnemy(groundStart + 490, mainY - 75, groundStart + 400, groundStart + 630);
      } else if (world.biome === 'farm') {
        // STAGE 4: Rotating 4-Blade Windmill Elevators + Deep Underground Burrows!
        platforms.push({
          id: nextId('plat'),
          x: groundStart,
          y: mainY,
          w: 200,
          h: 260,
          kind: 'solid',
          route: 'main',
        });
        if (s % 2 === 0) {
          // 4 rotating windmill platforms around a central barn hub!
          const hubX = groundStart + 360;
          const hubY = mainY - 75;
          for (let b = 0; b < 4; b++) {
            platforms.push({
              id: nextId('mill'),
              x: hubX,
              y: hubY,
              w: 98,
              h: 20,
              kind: 'windmill',
              route: 'main',
              centerX: hubX,
              centerY: hubY,
              orbitRadius: 115,
              orbitSpeed: 1.05,
              phase: (b * Math.PI) / 2,
            });
          }
          addTangerineArc(hubX - 75, hubY - 135, 4, 50, 20);
        } else {
          // Haybale ramp + bridge
          platforms.push({
            id: nextId('plat'),
            x: groundStart + 200,
            y: mainY,
            w: groundW - 200,
            h: 260,
            kind: 'solid',
            route: 'main',
          });
          bouncePads.push({
            id: nextId('pad'),
            x: groundStart + 280,
            y: mainY - 22,
            w: 72,
            h: 22,
            power: 800,
            style: 'hay',
            squashTimer: 0,
          });
          spawnEnemy(groundStart + 450, mainY, groundStart + 230, groundStart + groundW - 80);
        }
        platforms.push({
          id: nextId('plat'),
          x: groundStart + groundW - 180,
          y: mainY,
          w: 195,
          h: 260,
          kind: 'solid',
          route: 'main',
        });
      } else if (world.biome === 'crystal') {
        // STAGE 5: Sonic-Style Speed Crystal Rails + Steep Boost Ramps!
        platforms.push({
          id: nextId('plat'),
          x: groundStart,
          y: mainY,
          w: 220,
          h: 260,
          kind: 'solid',
          route: 'main',
        });
        platforms.push({
          id: nextId('rail'),
          x: groundStart + 215,
          y: mainY - 10,
          w: 320,
          h: 18,
          kind: 'speed_rail',
          route: 'main',
        });
        ramps.push({
          id: nextId('ramp'),
          x: groundStart + 520,
          y: mainY,
          w: 175,
          h: 72,
          direction: 'up',
          boost: true,
        });
        addTangerineArc(groundStart + 240, mainY - 52, 5, 54, 24);
        spawnEnemy(groundStart + 140, mainY, groundStart + 60, groundStart + 200, true);
      } else if (world.biome === 'clouds') {
        // STAGE 6: Pure Sky Adventure — Disappearing Vanish Clouds + Rainbow Ramps!
        platforms.push({
          id: nextId('plat'),
          x: groundStart,
          y: mainY,
          w: 155,
          h: 120,
          kind: 'solid',
          route: 'main',
        });
        for (let c = 0; c < 3; c++) {
          platforms.push({
            id: nextId('cloud'),
            x: groundStart + 195 + c * 145,
            y: mainY - c * 22,
            w: 112,
            h: 26,
            kind: 'vanish_cloud',
            route: 'main',
            vanishState: 'solid',
            vanishTimer: mode === 'pequenos' ? 1.6 : 1.15,
          });
          addTangerineArc(groundStart + 215 + c * 145, mainY - 55 - c * 22, 2, 42, 20);
        }
        geysers.push({
          id: nextId('geyser'),
          x: groundStart + 360,
          y: mainY + 120,
          w: 76,
          height: 360,
          liftForce: 840,
          kind: 'rainbow',
        });
        spawnEnemy(groundStart + 420, mainY - 40, groundStart + 200, groundStart + 600, true);
      } else if (world.biome === 'toyland') {
        // STAGE 7: Giant Stacked Toy Blocks + Horizontal Toy Trains + Cushions!
        platforms.push({
          id: nextId('plat'),
          x: groundStart,
          y: mainY,
          w: 185,
          h: 260,
          kind: 'solid',
          route: 'main',
        });
        // Giant elevated toy block tower
        platforms.push({
          id: nextId('plat'),
          x: groundStart + 220,
          y: mainY - 85,
          w: 150,
          h: 120,
          kind: 'solid',
          route: 'main',
        });
        // Moving toy train platform
        platforms.push({
          id: nextId('train'),
          x: groundStart + 420,
          y: mainY - 40,
          w: 140,
          h: 24,
          kind: 'moving',
          route: 'main',
          moveAxis: 'x',
          moveRange: 80,
          moveSpeed: 1.5,
          baseX: groundStart + 420,
          baseY: mainY - 40,
          phase: s,
        });
        bouncePads.push({
          id: nextId('pad'),
          x: groundStart + 260,
          y: mainY - 107,
          w: 70,
          h: 22,
          power: 810,
          style: 'cushion',
          squashTimer: 0,
        });
        addTangerineArc(groundStart + 235, mainY - 135, 3, 46, 30);
        spawnEnemy(groundStart + 295, mainY - 85, groundStart + 230, groundStart + 360);
      } else {
        // STAGE 8: Royal Castle Halls with Confetti Cannons & Red Carpet Speed Ramps!
        platforms.push({
          id: nextId('plat'),
          x: groundStart,
          y: mainY,
          w: 220,
          h: 260,
          kind: 'solid',
          route: 'main',
        });
        cannons.push({
          id: nextId('cannon'),
          x: groundStart + 150,
          y: mainY - 44,
          w: 52,
          h: 44,
          launchVx: 560,
          launchVy: -620,
          cooldown: 0,
        });
        platforms.push({
          id: nextId('plat'),
          x: groundStart + 430,
          y: mainY - 40,
          w: 250,
          h: 260,
          kind: 'solid',
          route: 'main',
        });
        ramps.push({
          id: nextId('ramp'),
          x: groundStart + 455,
          y: mainY - 40,
          w: 150,
          h: 58,
          direction: 'up',
          boost: true,
        });
        addTangerineArc(groundStart + 235, mainY - 190, 5, 48, 55);
        spawnEnemy(groundStart + 560, mainY - 40, groundStart + 450, groundStart + 660);
      }

      // ================================================================
      // LOWER SECRET CAVE / TUNNEL (Segments 2 & 4 in every Act)
      // ================================================================
      if (s === 2 || s === 4) {
        const lowerY = mainY + 180;
        platforms.push({
          id: nextId('plat'),
          x: groundStart + 120,
          y: lowerY,
          w: groundW - 190,
          h: 170,
          kind: 'solid',
          route: 'lower',
        });
        crates.push({
          id: nextId('crate'),
          x: groundStart + 200,
          y: lowerY - 46,
          w: 46,
          h: 46,
          broken: false,
          contains: 'tangerines',
        });
        crates.push({
          id: nextId('crate'),
          x: groundStart + 250,
          y: lowerY - 46,
          w: 46,
          h: 46,
          broken: false,
          contains: rng() > 0.45 ? 'heart' : 'tangerines',
        });
        bouncePads.push({
          id: nextId('pad'),
          x: groundStart + groundW - 180,
          y: lowerY - 22,
          w: 68,
          h: 22,
          power: 820,
          style: padStyle,
          squashTimer: 0,
        });
        addTangerineArc(groundStart + 320, lowerY - 40, 4, 46, 22);

        if (act === 2 && s === 4) {
          collectibles.push({
            id: nextId('gold'),
            x: groundStart + groundW * 0.5,
            y: lowerY - 64,
            r: 24,
            kind: 'golden_secret',
            secretIndex: 1,
            collected: false,
            bobPhase: 0,
          });
        }
      }

      // ================================================================
      // UPPER SKY / CANOPY PATH (Every segment has a rewarding high path!)
      // ================================================================
      const upperY = mainY - 230 - Math.round(rng() * 45);
      const upperW = 230 + Math.round(rng() * 100);
      const upperX = groundStart + 120 + Math.round(rng() * 80);

      platforms.push({
        id: nextId('plat'),
        x: upperX,
        y: upperY,
        w: upperW,
        h: 24,
        kind: world.biome === 'clouds' ? 'vanish_cloud' : 'oneway',
        route: 'upper',
        vanishState: 'solid',
        vanishTimer: mode === 'pequenos' ? 1.7 : 1.2,
      });
      addTangerineArc(upperX + 32, upperY - 42, 4, 48, 36);

      if (act === 1 && s === 4) {
        collectibles.push({
          id: nextId('gold'),
          x: upperX + upperW * 0.5,
          y: upperY - 68,
          r: 24,
          kind: 'golden_secret',
          secretIndex: 0,
          collected: false,
          bobPhase: 0.7,
        });
      } else if (act === 3 && s === 4) {
        collectibles.push({
          id: nextId('gold'),
          x: upperX + upperW * 0.5,
          y: upperY - 68,
          r: 24,
          kind: 'golden_secret',
          secretIndex: 2,
          collected: false,
          bobPhase: 1.3,
        });
      } else if (rng() > 0.4) {
        spawnEnemy(upperX + upperW * 0.55, upperY, upperX + 20, upperX + upperW - 20, rng() > 0.5);
      }

      if (s === 2) {
        collectibles.push({
          id: nextId('shield'),
          x: upperX + upperW * 0.5,
          y: upperY - 58,
          r: 18,
          kind: 'star_shield',
          collected: false,
          bobPhase: 0.4,
        });
      }
    }
  }

  // BOSS GATE PLAZA + HEART FOUNTAIN + ARENA
  platforms.push({
    id: nextId('plat'),
    x: bossGateX - 180,
    y: floorY,
    w: bossArenaWidth + 480,
    h: 280,
    kind: 'solid',
    route: 'boss',
  });

  checkpoints.push({
    id: nextId('cp'),
    x: bossGateX - 70,
    y: floorY,
    actNumber: 4,
    label: 'Chefão!',
    activated: false,
    flagLift: 0,
  });

  bouncePads.push({
    id: nextId('pad'),
    x: bossArenaX + 90,
    y: floorY - 22,
    w: 68,
    h: 22,
    power: 770,
    style: padStyle,
    squashTimer: 0,
  });
  bouncePads.push({
    id: nextId('pad'),
    x: bossArenaX + bossArenaWidth - 158,
    y: floorY - 22,
    w: 68,
    h: 22,
    power: 770,
    style: padStyle,
    squashTimer: 0,
  });
  platforms.push({
    id: nextId('plat'),
    x: bossArenaX + 190,
    y: floorY - 145,
    w: 170,
    h: 22,
    kind: 'oneway',
    route: 'boss',
  });
  platforms.push({
    id: nextId('plat'),
    x: bossArenaX + bossArenaWidth - 360,
    y: floorY - 145,
    w: 170,
    h: 22,
    kind: 'oneway',
    route: 'boss',
  });

  return {
    world,
    seed,
    width: totalWidth,
    floorY,
    bossArenaX,
    bossGateX,
    actBounds: [0, actLength, actLength * 2, bossGateX],
    platforms,
    ramps,
    bouncePads,
    geysers,
    cannons,
    crates,
    collectibles,
    checkpoints,
    enemies,
    heartFountainX: bossGateX - 135,
    heartFountainY: floorY,
  };
}
