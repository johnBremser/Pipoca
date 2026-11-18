import {
  BookOpen,
  Maximize2,
  Minimize2,
  Play,
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, {useEffect} from 'react';
import titleHeroBackdrop from '../assets/images/title_capybara_hero_1795012504331.jpg';
import {soundEngine} from '../game/audio';
import type {DifficultyMode} from '../game/types';
import {PWAInstallButton} from './PWAInstallButton';

interface TitleScreenProps {
  mode: DifficultyMode;
  muted: boolean;
  isFullscreen: boolean;
  onChangeMode: (mode: DifficultyMode) => void;
  onStart: () => void;
  onOpenStory: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  mode,
  muted,
  isFullscreen,
  onChangeMode,
  onStart,
  onOpenStory,
  onToggleMute,
  onToggleFullscreen,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        soundEngine.unlock();
        onStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart]);

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-y-auto overflow-x-hidden bg-gradient-to-br from-sky-400 via-sky-300 to-emerald-300">
      {/* Illustrated Key-Art Backdrop */}
      <img
        src={titleHeroBackdrop}
        alt="Pipoca, a Capivara Saltitante pulando sobre a lagoa"
        referrerPolicy="no-referrer"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover object-center"
      />

      {/* Directional contrast scrim on left negative space */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-r from-sky-950/75 via-sky-900/40 to-transparent" />

      {/* Top utility actions */}
      <div className="relative z-10 flex items-center justify-end gap-2.5 p-4 landscape-short:py-2 pt-safe px-safe shrink-0">
        <PWAInstallButton />

        <button
          type="button"
          onClick={() => {
            soundEngine.unlock();
            onOpenStory();
          }}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/90 px-3.5 py-2 text-sm font-bold text-slate-800 shadow-md transition-transform active:scale-95 hover:bg-white whitespace-nowrap shrink-0"
        >
          <BookOpen className="h-4 w-4 text-orange-500" />
          <span className="hidden sm:inline">História</span>
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md transition-transform active:scale-95 hover:bg-white"
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Ativar som' : 'Silenciar som'}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-md transition-transform active:scale-95 hover:bg-white"
        >
          {muted ? (
            <VolumeX className="h-5 w-5 text-rose-500" />
          ) : (
            <Volume2 className="h-5 w-5 text-emerald-600" />
          )}
        </button>
      </div>

      {/* Left-aligned Title Lockup + Mode Selector + Start CTA over calm negative space */}
      <div className="relative z-10 my-auto flex w-full max-w-xl flex-col gap-5 landscape-short:gap-2.5 px-5 sm:px-10">
        {/* Bespoke SVG Title Lockup */}
        <div className="max-w-md landscape-short:max-w-xs">
          <svg
            viewBox="0 0 460 155"
            className="h-auto w-full drop-shadow-lg"
            role="img"
            aria-label="Pipoca, a Capivara Saltitante"
          >
            <text
              x="8"
              y="72"
              fontFamily="Fredoka, sans-serif"
              fontWeight="700"
              fontSize="74"
              fill="#FACC15"
              stroke="#7C2D12"
              strokeWidth="12"
              paintOrder="stroke"
            >
              Pipoca
            </text>
            <text
              x="12"
              y="112"
              fontFamily="Fredoka, sans-serif"
              fontWeight="700"
              fontSize="32"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="7"
              paintOrder="stroke"
            >
              a Capivara Saltitante
            </text>
            <text
              x="12"
              y="142"
              fontFamily="Nunito, sans-serif"
              fontWeight="800"
              fontSize="17"
              fill="#FEF08A"
            >
              O Resgate dos 8 Filhotinhos contra o Barão Raposão
            </text>
          </svg>
        </div>

        {/* Dual Age Mode Selector */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playCollect(0);
              onChangeMode('pequenos');
            }}
            className={`flex min-h-[68px] flex-col items-start justify-center rounded-2xl border-3 p-3.5 text-left shadow-lg transition-transform active:scale-95 ${
              mode === 'pequenos'
                ? 'border-amber-300 bg-emerald-500 text-white'
                : 'border-white/60 bg-white/90 text-slate-800 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-display text-base font-bold">
              <HeartBadge />
              <span>Pequenos (3–5 anos)</span>
            </div>
            <span
              className={`mt-1 text-xs font-bold ${
                mode === 'pequenos' ? 'text-emerald-50' : 'text-slate-600'
              }`}
            >
              6 corações e balão mágico de resgate
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playCollect(2);
              onChangeMode('aventura');
            }}
            className={`flex min-h-[68px] flex-col items-start justify-center rounded-2xl border-3 p-3.5 text-left shadow-lg transition-transform active:scale-95 ${
              mode === 'aventura'
                ? 'border-amber-300 bg-orange-500 text-white'
                : 'border-white/60 bg-white/90 text-slate-800 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-display text-base font-bold">
              <Shield className="h-4 w-4 shrink-0" />
              <span>Aventura (6–8 anos)</span>
            </div>
            <span
              className={`mt-1 text-xs font-bold ${
                mode === 'aventura' ? 'text-orange-50' : 'text-slate-600'
              }`}
            >
              Mais velocidade, combos e desafio clássico
            </span>
          </button>
        </div>

        {/* Primary Start CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playJump(2);
              onStart();
            }}
            className="inline-flex min-h-[62px] flex-1 sm:flex-initial items-center justify-center gap-3 rounded-3xl border-b-4 border-orange-700 bg-orange-500 px-9 py-3.5 font-display text-2xl font-bold text-white shadow-2xl transition-transform active:scale-95 hover:bg-orange-400 whitespace-nowrap"
          >
            <Play className="h-7 w-7 fill-current" />
            <span>Jogar Agora</span>
          </button>
        </div>
      </div>

      {/* Single flat control hint line */}
      <div className="relative z-10 px-5 pb-safe pt-2 text-center sm:text-left sm:px-10">
        <p className="text-xs sm:text-sm font-bold text-white drop-shadow">
          Toque nos botões grandes da tela · Teclado: Setas / WASD Mover · Espaço Pular 2x · Shift Rolar
        </p>
      </div>
    </div>
  );
};

const HeartBadge = () => (
  <Sparkles className="h-4 w-4 shrink-0" />
);
