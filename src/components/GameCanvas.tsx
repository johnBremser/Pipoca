import React, {useEffect, useRef} from 'react';
import {soundEngine} from '../game/audio';
import {GameEngine} from '../game/engine';
import type {DifficultyMode, HudSnapshot} from '../game/types';
import type {TouchInputRef} from './TouchControls';

interface GameCanvasProps {
  stageId: number;
  mode: DifficultyMode;
  runKey: number;
  paused: boolean;
  touchInputRef: React.MutableRefObject<TouchInputRef>;
  respawnSignal: number;
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onVictory: (summary: {
    score: number;
    tangerines: number;
    goldenSecrets: [boolean, boolean, boolean];
    elapsedSec: number;
  }) => void;
  onGameOver: (summary: {score: number; tangerines: number}) => void;
  onTogglePause: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  stageId,
  mode,
  runKey,
  paused,
  touchInputRef,
  respawnSignal,
  onHudUpdate,
  onVictory,
  onGameOver,
  onTogglePause,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const sizeRef = useRef({w: 1280, h: 720});

  const keysHeld = useRef<Set<string>>(new Set());
  const jumpJustPressedKey = useRef(false);
  const rollJustPressedKey = useRef(false);

  const callbacksRef = useRef({
    onHudUpdate,
    onVictory,
    onGameOver,
    onTogglePause,
  });
  callbacksRef.current = {onHudUpdate, onVictory, onGameOver, onTogglePause};

  // Initialize / reset engine when stageId, mode, or runKey changes
  useEffect(() => {
    const engine = new GameEngine(stageId, mode, {
      onHudUpdate: (s) => callbacksRef.current.onHudUpdate(s),
      onVictory: (s) => callbacksRef.current.onVictory(s),
      onGameOver: (s) => callbacksRef.current.onGameOver(s),
    });
    engineRef.current = engine;
    soundEngine.startMusic(stageId);

    return () => {
      soundEngine.stopMusic();
      engineRef.current = null;
    };
  }, [stageId, mode, runKey]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPaused(paused);
    }
  }, [paused]);

  useEffect(() => {
    if (respawnSignal > 0 && engineRef.current) {
      engineRef.current.respawnAtCheckpoint();
    }
  }, [respawnSignal]);

  // Keyboard listeners + blur clearing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      soundEngine.unlock();
      if (e.code === 'Escape' || e.code === 'KeyP') {
        callbacksRef.current.onTogglePause();
        return;
      }
      if (!keysHeld.current.has(e.code)) {
        if (
          e.code === 'Space' ||
          e.code === 'ArrowUp' ||
          e.code === 'KeyW'
        ) {
          jumpJustPressedKey.current = true;
        }
        if (
          e.code === 'ShiftLeft' ||
          e.code === 'ShiftRight' ||
          e.code === 'ArrowDown' ||
          e.code === 'KeyS' ||
          e.code === 'KeyX'
        ) {
          rollJustPressedKey.current = true;
        }
      }
      keysHeld.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysHeld.current.delete(e.code);
    };

    const handleBlur = () => {
      keysHeld.current.clear();
      touchInputRef.current.left = false;
      touchInputRef.current.right = false;
      touchInputRef.current.jumpHeld = false;
      touchInputRef.current.rollHeld = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [touchInputRef]);

  // Isolated 60fps requestAnimationFrame loop + ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(240, Math.floor(rect.height));
      sizeRef.current = {w, h};
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      const engine = engineRef.current;
      if (engine) {
        const held = keysHeld.current;
        const touch = touchInputRef.current;

        const left =
          touch.left || held.has('ArrowLeft') || held.has('KeyA');
        const right =
          touch.right || held.has('ArrowRight') || held.has('KeyD');
        const jumpHeld =
          touch.jumpHeld ||
          held.has('Space') ||
          held.has('ArrowUp') ||
          held.has('KeyW');
        const rollHeld =
          touch.rollHeld ||
          held.has('ShiftLeft') ||
          held.has('ShiftRight') ||
          held.has('ArrowDown') ||
          held.has('KeyS') ||
          held.has('KeyX');

        const jumpJustPressed =
          touch.jumpJustPressed || jumpJustPressedKey.current;
        const rollJustPressed =
          touch.rollJustPressed || rollJustPressedKey.current;

        touch.jumpJustPressed = false;
        touch.rollJustPressed = false;
        jumpJustPressedKey.current = false;
        rollJustPressedKey.current = false;

        const {w, h} = sizeRef.current;
        engine.update(
          rawDt,
          {left, right, jumpHeld, jumpJustPressed, rollHeld, rollJustPressed},
          w,
          h
        );
        engine.render(ctx, w, h);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [touchInputRef]);

  return (
    <div
      ref={containerRef}
      className="touch-game-area relative h-full w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};
