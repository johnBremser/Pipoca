import {
  ArrowRight,
  Gamepad2,
  Home,
  Map,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {motion} from 'motion/react';
import React from 'react';
import type {WorldConfig} from '../game/types';
import {OswaldaoSvgGroup} from './OswaldaoSvg';

interface PauseModalProps {
  world: WorldConfig;
  showTouchControls: boolean;
  onResume: () => void;
  onRestart: () => void;
  onStageMap: () => void;
  onHome: () => void;
  onToggleTouchControls: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  world,
  showTouchControls,
  onResume,
  onRestart,
  onStageMap,
  onHome,
  onToggleTouchControls,
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/65 p-4">
    <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl border-4 border-white bg-white p-6 text-slate-900 shadow-2xl">
      <h2 className="font-display text-2xl font-bold text-center text-slate-900">
        Jogo Pausado
      </h2>
      <p className="mt-1 text-center text-sm font-bold text-slate-500">
        Fase {world.id}: {world.name}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={onResume}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-5 py-3 font-display text-lg font-bold text-white active:scale-95"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>Continuar</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-2.5 font-display text-base font-bold text-slate-900 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Reiniciar Fase</span>
        </button>

        <button
          type="button"
          onClick={onToggleTouchControls}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-sky-100 px-5 py-2.5 font-display text-sm font-bold text-sky-900 active:scale-95"
        >
          <Gamepad2 className="h-5 w-5" />
          <span>
            Botões na Tela: {showTouchControls ? 'Visíveis' : 'Ocultos'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onStageMap}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 font-display text-sm font-bold text-slate-800 active:scale-95"
          >
            <Map className="h-4 w-4" />
            <span>Fases</span>
          </button>

          <button
            type="button"
            onClick={onHome}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 font-display text-sm font-bold text-slate-800 active:scale-95"
          >
            <Home className="h-4 w-4" />
            <span>Início</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface VictoryModalProps {
  world: WorldConfig;
  score: number;
  tangerines: number;
  goldenSecrets: [boolean, boolean, boolean];
  elapsedSec: number;
  hasNextStage: boolean;
  onNextStage: () => void;
  onReplay: () => void;
  onStageMap: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  world,
  score,
  tangerines,
  goldenSecrets,
  elapsedSec,
  hasNextStage,
  onNextStage,
  onReplay,
  onStageMap,
}) => {
  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const isFinal = world.id === 8;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4">
      <motion.div
        initial={{scale: 0.9, opacity: 0, y: 16}}
        animate={{scale: 1, opacity: 1, y: 0}}
        transition={{duration: 0.3, ease: [0.16, 1, 0.3, 1]}}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl border-4 border-amber-300 bg-white p-5 sm:p-6 text-center text-slate-900 shadow-2xl"
      >
        <div className="mx-auto flex items-center justify-center gap-3">
          {isFinal && (
            <motion.svg
              viewBox="0 0 180 140"
              className="h-16 w-24"
              animate={{y: [0, -7, 0]}}
              transition={{repeat: Infinity, duration: 1.3, ease: 'easeInOut'}}
              aria-label="Papai Oswaldão"
            >
              <OswaldaoSvgGroup transform="translate(80, 92) scale(0.72)" />
            </motion.svg>
          )}

          <motion.div
            animate={{y: [0, -8, 0]}}
            transition={{repeat: Infinity, duration: 1.4, ease: 'easeInOut'}}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-lg"
          >
            <Trophy className="h-9 w-9" />
          </motion.div>

          {/* Animated rescued baby capybara hopping happily */}
          <motion.svg
            viewBox="0 0 80 70"
            className="h-16 w-20"
            animate={{y: [0, -10, 0]}}
            transition={{repeat: Infinity, duration: 1.1, delay: 0.2, ease: 'easeInOut'}}
            aria-label={`Filhotinho ${world.babyName}`}
          >
            <ellipse cx="40" cy="44" rx="22" ry="17" fill="#C08552" stroke="#452512" strokeWidth="3.5" />
            <circle cx="26" cy="28" r="6" fill="#8C522B" stroke="#452512" strokeWidth="2.5" />
            <circle cx="54" cy="28" r="6" fill="#8C522B" stroke="#452512" strokeWidth="2.5" />
            <path d="M31 40 Q34 36 37 40" fill="none" stroke="#1E1108" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M43 40 Q46 36 49 40" fill="none" stroke="#1E1108" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="40" cy="21" r="8" fill="#FF7A1A" stroke="#7C2D12" strokeWidth="2.5" />
          </motion.svg>
        </div>

        <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
          {isFinal
            ? 'Família Reunida com a Liz!'
            : `Filhotinho ${world.babyName} Resgatado!`}
        </h2>

        <p className="mt-1.5 text-sm sm:text-base font-bold text-emerald-600">
          {isFinal
            ? 'Pipoca, Papai Oswaldão e todos os 8 filhotinhos agora estão salvos e prontos para se juntar à Liz!'
            : `Você venceu ${world.boss.name} e salvou ${world.babyName}!`}
        </p>

        {/* Golden Secrets */}
        <div className="mt-4 flex items-center justify-center gap-3">
          {goldenSecrets.map((found, idx) => (
            <div
              key={idx}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-2xl font-bold ${
                found
                  ? 'border-amber-400 bg-amber-100 text-amber-500 shadow'
                  : 'border-slate-200 bg-slate-50 text-slate-300'
              }`}
            >
              ★
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs font-bold text-slate-500">
          Tangerinas Douradas Secretas ({goldenSecrets.filter(Boolean).length}/3)
        </p>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-3 text-center">
          <div>
            <div className="text-xs font-bold text-slate-500">Tangerinas</div>
            <div className="font-display text-xl font-bold text-orange-600 tabular-nums">
              {tangerines}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Pontos</div>
            <div className="font-display text-xl font-bold text-slate-900 tabular-nums">
              {score}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Tempo</div>
            <div className="font-display text-xl font-bold text-sky-600 tabular-nums">
              {mins}:{secs.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {hasNextStage ? (
            <button
              type="button"
              onClick={onNextStage}
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3 font-display text-lg font-bold text-white active:scale-95"
            >
              <span>Próxima Fase</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStageMap}
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border-b-4 border-orange-700 bg-orange-500 px-6 py-3 font-display text-lg font-bold text-white active:scale-95"
            >
              <Sparkles className="h-5 w-5" />
              <span>Ver Todos os Mundos</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onReplay}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 font-display text-sm font-bold text-slate-900 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Jogar de Novo</span>
            </button>
            <button
              type="button"
              onClick={onStageMap}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 font-display text-sm font-bold text-slate-800 active:scale-95"
            >
              <Map className="h-4 w-4" />
              <span>Mapa</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  tangerines: number;
  onContinueCheckpoint: () => void;
  onRestart: () => void;
  onStageMap: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  tangerines,
  onContinueCheckpoint,
  onRestart,
  onStageMap,
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4">
    <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl border-4 border-white bg-white p-6 text-center text-slate-900 shadow-2xl">
      <h2 className="font-display text-2xl font-bold text-slate-900">
        Hora de Descansar um Pouquinho!
      </h2>
      <p className="mt-2 text-sm font-bold text-slate-600">
        Pipoca juntou <span className="tabular-nums text-orange-600">{tangerines}</span> tangerinas e fez{' '}
        <span className="tabular-nums text-slate-900">{score}</span> pontos.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={onContinueCheckpoint}
          className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3 font-display text-lg font-bold text-white active:scale-95"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>Continuar do Checkpoint</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 font-display text-sm font-bold text-slate-900 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Recomeçar</span>
          </button>
          <button
            type="button"
            onClick={onStageMap}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 font-display text-sm font-bold text-slate-800 active:scale-95"
          >
            <Map className="h-4 w-4" />
            <span>Mapa</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
