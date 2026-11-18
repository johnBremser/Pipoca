import {
  Heart,
  Maximize2,
  Minimize2,
  Pause,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React from 'react';
import type {HudSnapshot} from '../game/types';

interface HudOverlayProps {
  stageName: string;
  hud: HudSnapshot;
  muted: boolean;
  isFullscreen: boolean;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onPause: () => void;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  stageName,
  hud,
  muted,
  isFullscreen,
  onToggleMute,
  onToggleFullscreen,
  onPause,
}) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex flex-col gap-2 px-3 pt-safe px-safe sm:px-5">
      {/* Compact top bar (< 12% height, no backdrop-filter over canvas) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Hearts + Tangerines + Golden Secrets */}
        <div className="flex items-center gap-2 sm:gap-3 rounded-2xl bg-slate-950/65 px-3 py-1.5 text-white shadow-md">
          <div className="flex items-center gap-1" aria-label="Corações">
            {Array.from({length: hud.maxHearts}).map((_, idx) => (
              <Heart
                key={idx}
                className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform ${
                  idx < hud.hearts
                    ? 'fill-rose-400 text-rose-200 scale-100'
                    : 'fill-slate-700 text-slate-600 scale-90'
                }`}
              />
            ))}
          </div>

          {hud.hasShield && (
            <Shield className="h-5 w-5 fill-sky-400 text-sky-200" />
          )}

          <div className="h-5 w-px bg-white/25" />

          {/* Tangerines Counter */}
          <div className="flex items-center gap-1.5 font-display text-base sm:text-lg font-bold tabular-nums">
            <span
              className="inline-block h-4 w-4 rounded-full bg-orange-500 border-2 border-amber-200"
              aria-hidden="true"
            />
            <span>{hud.tangerines}</span>
          </div>

          <div className="h-5 w-px bg-white/25" />

          {/* 3 Secret Golden Tangerines */}
          <div className="flex items-center gap-1" aria-label="Tangerinas Douradas Secretas">
            {hud.goldenSecrets.map((found, i) => (
              <span
                key={i}
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  found
                    ? 'bg-amber-400 text-amber-950 shadow'
                    : 'bg-white/20 text-white/50'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Center: Stage & Act Progress (Hidden on very narrow screens if needed, compact on tablet) */}
        <div className="hidden md:flex flex-col items-center rounded-2xl bg-slate-950/60 px-4 py-1.5 text-white shadow-md min-w-[230px]">
          <div className="flex w-full items-center justify-between gap-3 text-xs font-bold">
            <span className="truncate">{stageName}</span>
            <span className="tabular-nums text-amber-300">
              {hud.currentAct === 4 ? 'Chefão' : `Ato ${hud.currentAct}/3`}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-500 transition-all duration-200"
              style={{width: `${hud.progressPct}%`}}
            />
          </div>
        </div>

        {/* Right: Mute, Fullscreen, Pause */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Ativar som' : 'Silenciar'}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md active:scale-95"
          >
            {muted ? (
              <VolumeX className="h-5 w-5 text-rose-500" />
            ) : (
              <Volume2 className="h-5 w-5 text-emerald-600" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md active:scale-95"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={onPause}
            aria-label="Pausar jogo"
            className="flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-2xl bg-amber-400 px-3 font-display text-sm font-bold text-slate-900 shadow-md active:scale-95"
          >
            <Pause className="h-5 w-5 fill-current" />
            <span className="hidden sm:inline">Pausa</span>
          </button>
        </div>
      </div>

      {/* Boss Health Bar when inside Boss Arena */}
      {hud.bossActive && (
        <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl bg-slate-950/75 px-4 py-2 text-white shadow-lg">
          <div className="flex w-full items-center justify-between text-xs sm:text-sm font-display font-bold">
            <span>{hud.bossName}</span>
            <span className="tabular-nums text-amber-300">
              {hud.bossHp}/{hud.bossMaxHp}
            </span>
          </div>
          <div className="mt-1.5 flex w-full gap-1.5">
            {Array.from({length: hud.bossMaxHp}).map((_, idx) => (
              <div
                key={idx}
                className={`h-3 flex-1 rounded-full transition-colors ${
                  idx < hud.bossHp ? 'bg-rose-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Non-blocking Act / Boss Banner */}
      {hud.bannerText && (
        <div className="mx-auto rounded-2xl bg-amber-400 px-5 py-2 text-center font-display text-base sm:text-xl font-bold text-slate-900 shadow-xl">
          {hud.bannerText}
        </div>
      )}
    </div>
  );
};
