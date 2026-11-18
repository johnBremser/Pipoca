export type DifficultyMode = 'pequenos' | 'aventura';

export type GameScreen =
  | 'TITLE_MENU'
  | 'STAGE_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'CUTSCENE'
  | 'VICTORY'
  | 'GAME_OVER';

export type BiomeId =
  | 'lagoon'
  | 'mushroom'
  | 'waterfall'
  | 'farm'
  | 'crystal'
  | 'clouds'
  | 'toyland'
  | 'castle';

export type EnemyKind =
  | 'crab'
  | 'frog'
  | 'toucan'
  | 'ant'
  | 'owl'
  | 'beetle'
  | 'duck'
  | 'fish'
  | 'scarecrow'
  | 'chick'
  | 'bee'
  | 'bat'
  | 'armadillo'
  | 'snail'
  | 'sneezecloud'
  | 'kitebird'
  | 'star'
  | 'windup'
  | 'spintop'
  | 'plushbear'
  | 'turtleknight'
  | 'royalbat'
  | 'springmimic';

export type BossKind =
  | 'croc'
  | 'owl_maestro'
  | 'octopus'
  | 'tractor'
  | 'armadillo_king'
  | 'thunder_cloud'
  | 'jack_box'
  | 'baron_fox';

export interface WorldConfig {
  id: number; // 1..8
  biome: BiomeId;
  name: string;
  subtitle: string;
  gimmickLabel: string;
  babyName: string;
  skyTop: string;
  skyBottom: string;
  hillFar: string;
  hillNear: string;
  groundFill: string;
  groundTop: string;
  groundOutline: string;
  accentColor: string;
  waterColor: string;
  enemyPool: EnemyKind[];
  boss: {
    kind: BossKind;
    name: string;
    title: string;
    primaryColor: string;
    secondaryColor: string;
    hpPequenos: number;
    hpAventura: number;
  };
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind:
    | 'solid'
    | 'oneway'
    | 'moving'
    | 'bridge'
    | 'lilypad'
    | 'vanish_cloud'
    | 'windmill'
    | 'speed_rail';
  route: 'upper' | 'main' | 'lower' | 'boss';
  moveAxis?: 'x' | 'y';
  moveRange?: number;
  moveSpeed?: number;
  baseX?: number;
  baseY?: number;
  phase?: number;
  // Windmill circular orbit
  centerX?: number;
  centerY?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  // Lilypad sink
  sinkOffset?: number;
  stoodOn?: boolean;
  // Vanish cloud
  vanishState?: 'solid' | 'shaking' | 'gone';
  vanishTimer?: number;
}

export interface CannonPad {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  launchVx: number;
  launchVy: number;
  cooldown: number;
}

export interface SlopeRamp {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  direction: 'up' | 'down';
  boost?: boolean;
}

export interface BouncePad {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  power: number;
  style: 'lily' | 'mushroom' | 'hay' | 'spring' | 'cloud' | 'cushion';
  squashTimer: number;
}

export interface Geyser {
  id: string;
  x: number;
  y: number;
  w: number;
  height: number;
  liftForce: number;
  kind: 'water' | 'rainbow' | 'confetti';
}

export interface BreakableCrate {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  broken: boolean;
  contains: 'tangerines' | 'heart' | 'secret_path';
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  r: number;
  kind: 'tangerine' | 'golden_secret' | 'heart' | 'star_shield';
  secretIndex?: 0 | 1 | 2;
  collected: boolean;
  bobPhase: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  actNumber: 1 | 2 | 3 | 4;
  label: string;
  activated: boolean;
  flagLift: number;
}

export interface Enemy {
  id: string;
  kind: EnemyKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  minX: number;
  maxX: number;
  baseY: number;
  facing: 1 | -1;
  alive: boolean;
  squishTimer: number;
  animPhase: number;
  behavior: 'patrol' | 'hopper' | 'flyer' | 'roller';
  hopTimer: number;
}

export interface BossProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  kind:
    | 'bubble'
    | 'note'
    | 'wave'
    | 'haybale'
    | 'lightning'
    | 'plush'
    | 'cage_bubble';
  bouncy: boolean;
  gravity: number;
  life: number;
}

export interface BossState {
  active: boolean;
  defeated: boolean;
  kind: BossKind;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  phase: 'INTRO' | 'IDLE' | 'TELEGRAPH' | 'ATTACK' | 'DIZZY' | 'HURT' | 'DEFEATED';
  timer: number;
  attackPattern: number;
  invulnTimer: number;
  flashTimer: number;
  arenaLeft: number;
  arenaRight: number;
  arenaFloorY: number;
  telegraphTargetX?: number;
  armored?: boolean; // Armadillo curled state!
  teleportAlpha?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
  shape: 'circle' | 'star' | 'leaf' | 'confetti';
  rotation: number;
  rotSpeed: number;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface SupportStation {
  id: string;
  x: number;
  y: number;
  kind: 'start' | 'act' | 'boss_prep';
  message: string;
  heals: number;
  givesShield?: boolean;
  cheered: boolean;
  cheerTimer: number;
}

export interface LevelData {
  world: WorldConfig;
  seed: number;
  width: number;
  floorY: number;
  bossArenaX: number;
  bossGateX: number;
  actBounds: [number, number, number, number];
  platforms: Platform[];
  ramps: SlopeRamp[];
  bouncePads: BouncePad[];
  geysers: Geyser[];
  cannons: CannonPad[];
  crates: BreakableCrate[];
  collectibles: Collectible[];
  checkpoints: Checkpoint[];
  supportStations: SupportStation[];
  enemies: Enemy[];
  heartFountainX: number;
  heartFountainY: number;
}

export interface PlayerState {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  onGround: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  jumpsLeft: number;
  maxJumps: number;
  rolling: boolean;
  rollTimer: number;
  rollCooldown: number;
  spinAngle: number;
  invulnTimer: number;
  shieldTimer: number;
  flashTimer: number;
  squashX: number;
  squashY: number;
  animTime: number;
  blinkTimer: number;
  happyTimer: number;
  hearts: number;
  maxHearts: number;
  checkpointX: number;
  checkpointY: number;
  rescueBalloon: {
    active: boolean;
    targetX: number;
    targetY: number;
    timer: number;
  };
}

export interface InputState {
  left: boolean;
  right: boolean;
  jumpHeld: boolean;
  jumpJustPressed: boolean;
  rollHeld: boolean;
  rollJustPressed: boolean;
}

export interface HudSnapshot {
  hearts: number;
  maxHearts: number;
  tangerines: number;
  score: number;
  goldenSecrets: [boolean, boolean, boolean];
  currentAct: 1 | 2 | 3 | 4;
  progressPct: number;
  elapsedSec: number;
  hasShield: boolean;
  comboCount: number;
  bossActive: boolean;
  bossName: string;
  bossHp: number;
  bossMaxHp: number;
  bannerText: string | null;
}

export interface StageRecord {
  completed: boolean;
  bestScore: number;
  bestTangerines: number;
  goldenSecrets: [boolean, boolean, boolean];
  bestTimeSec: number | null;
}

export interface SaveData {
  mode: DifficultyMode;
  highestUnlockedStage: number;
  unlockAll: boolean;
  muted: boolean;
  voiceEnabled: boolean;
  showTouchControlsOnDesktop: boolean;
  records: Record<number, StageRecord>;
}
