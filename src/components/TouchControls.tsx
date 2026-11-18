import {ArrowLeft, ArrowRight, ArrowUp, Disc} from 'lucide-react';
import React, {useRef, useState} from 'react';
import {soundEngine} from '../game/audio';

export interface TouchInputRef {
  left: boolean;
  right: boolean;
  jumpHeld: boolean;
  jumpJustPressed: boolean;
  rollHeld: boolean;
  rollJustPressed: boolean;
}

interface TouchControlsProps {
  visible: boolean;
  inputRef: React.MutableRefObject<TouchInputRef>;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  visible,
  inputRef,
}) => {
  const [activeLeft, setActiveLeft] = useState(false);
  const [activeRight, setActiveRight] = useState(false);
  const [activeJump, setActiveJump] = useState(false);
  const [activeRoll, setActiveRoll] = useState(false);

  const dpadRef = useRef<HTMLDivElement | null>(null);
  const dpadPointerId = useRef<number | null>(null);
  const jumpPointerId = useRef<number | null>(null);
  const rollPointerId = useRef<number | null>(null);

  if (!visible) return null;

  const updateDpadFromClientX = (clientX: number) => {
    const el = dpadRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = clientX - rect.left;
    const mid = rect.width * 0.5;
    const deadZone = 6;
    const goLeft = relX < mid - deadZone;
    const goRight = relX > mid + deadZone;

    inputRef.current.left = goLeft;
    inputRef.current.right = goRight;
    setActiveLeft(goLeft);
    setActiveRight(goRight);
  };

  const handleDpadDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    soundEngine.unlock();
    e.currentTarget.setPointerCapture(e.pointerId);
    dpadPointerId.current = e.pointerId;
    updateDpadFromClientX(e.clientX);
  };

  const handleDpadMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dpadPointerId.current !== e.pointerId) return;
    e.preventDefault();
    updateDpadFromClientX(e.clientX);
  };

  const handleDpadUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dpadPointerId.current !== e.pointerId) return;
    e.preventDefault();
    dpadPointerId.current = null;
    inputRef.current.left = false;
    inputRef.current.right = false;
    setActiveLeft(false);
    setActiveRight(false);
  };

  const handleJumpDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    soundEngine.unlock();
    e.currentTarget.setPointerCapture(e.pointerId);
    jumpPointerId.current = e.pointerId;
    inputRef.current.jumpHeld = true;
    inputRef.current.jumpJustPressed = true;
    setActiveJump(true);
  };

  const handleJumpUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (jumpPointerId.current !== e.pointerId) return;
    e.preventDefault();
    jumpPointerId.current = null;
    inputRef.current.jumpHeld = false;
    setActiveJump(false);
  };

  const handleRollDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    soundEngine.unlock();
    e.currentTarget.setPointerCapture(e.pointerId);
    rollPointerId.current = e.pointerId;
    inputRef.current.rollHeld = true;
    inputRef.current.rollJustPressed = true;
    setActiveRoll(true);
  };

  const handleRollUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (rollPointerId.current !== e.pointerId) return;
    e.preventDefault();
    rollPointerId.current = null;
    inputRef.current.rollHeld = false;
    setActiveRoll(false);
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between px-4 pb-safe md:px-7"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Left Thumb Zone: Continuous Slide D-Pad */}
      <div
        ref={dpadRef}
        onPointerDown={handleDpadDown}
        onPointerMove={handleDpadMove}
        onPointerUp={handleDpadUp}
        onPointerCancel={handleDpadUp}
        className="touch-game-area pointer-events-auto mb-2 flex items-center gap-3 rounded-3xl bg-slate-950/20 p-2"
      >
        <div
          aria-label="Mover para esquerda"
          className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 border-white/80 shadow-lg transition-transform duration-100 ${
            activeLeft
              ? 'scale-95 bg-amber-400 text-slate-900'
              : 'bg-white/75 text-slate-800'
          }`}
        >
          <ArrowLeft className="h-9 w-9 sm:h-10 sm:w-10 stroke-[3]" />
        </div>
        <div
          aria-label="Mover para direita"
          className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 border-white/80 shadow-lg transition-transform duration-100 ${
            activeRight
              ? 'scale-95 bg-amber-400 text-slate-900'
              : 'bg-white/75 text-slate-800'
          }`}
        >
          <ArrowRight className="h-9 w-9 sm:h-10 sm:w-10 stroke-[3]" />
        </div>
      </div>

      {/* Right Thumb Zone: Giant Jump & Speedy Roll Buttons */}
      <div className="pointer-events-auto mb-2 flex items-end gap-3 sm:gap-4">
        <button
          type="button"
          aria-label="Rolar rápido"
          onPointerDown={handleRollDown}
          onPointerUp={handleRollUp}
          onPointerCancel={handleRollUp}
          onContextMenu={(e) => e.preventDefault()}
          className={`touch-game-area flex h-16 w-16 sm:h-20 sm:w-20 flex-col items-center justify-center rounded-full border-4 border-white shadow-xl transition-transform duration-100 ${
            activeRoll
              ? 'scale-90 bg-orange-600 text-white'
              : 'bg-orange-500/90 text-white'
          }`}
        >
          <Disc className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.8]" />
          <span className="font-display text-[11px] font-bold tracking-wide leading-none mt-0.5">
            ROLAR
          </span>
        </button>

        <button
          type="button"
          aria-label="Pular"
          onPointerDown={handleJumpDown}
          onPointerUp={handleJumpUp}
          onPointerCancel={handleJumpUp}
          onContextMenu={(e) => e.preventDefault()}
          className={`touch-game-area flex h-20 w-20 sm:h-24 sm:w-24 flex-col items-center justify-center rounded-full border-4 border-white shadow-xl transition-transform duration-100 ${
            activeJump
              ? 'scale-90 bg-emerald-600 text-white'
              : 'bg-emerald-500/95 text-white'
          }`}
        >
          <ArrowUp className="h-9 w-9 sm:h-10 sm:w-10 stroke-[3.2]" />
          <span className="font-display text-xs sm:text-sm font-bold tracking-wide leading-none mt-0.5">
            PULAR
          </span>
        </button>
      </div>
    </div>
  );
};
