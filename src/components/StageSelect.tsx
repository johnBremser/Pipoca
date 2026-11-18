import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Crown,
  Lock,
  Play,
  Sparkles,
  Unlock,
} from 'lucide-react';
import {motion} from 'motion/react';
import React from 'react';
import {soundEngine} from '../game/audio';
import type {SaveData} from '../game/types';
import {WORLDS} from '../game/worlds';

interface StageSelectProps {
  saveData: SaveData;
  onSelectStage: (stageId: number) => void;
  onToggleUnlockAll: () => void;
  onOpenStory: () => void;
  onBack: () => void;
}

export const StageSelect: React.FC<StageSelectProps> = ({
  saveData,
  onSelectStage,
  onToggleUnlockAll,
  onOpenStory,
  onBack,
}) => {
  const rescuedCount = WORLDS.filter(
    (w) => saveData.records[w.id]?.completed
  ).length;

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100 overflow-hidden">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 pt-safe px-safe bg-white/85 border-b border-sky-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2 font-display text-sm font-bold text-slate-800 hover:bg-slate-200 active:scale-95 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Início</span>
          </button>
          <div>
            <h1 className="font-display text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
              Linha do Tempo &amp; 8 Mundos
            </h1>
            <p className="text-xs font-bold text-slate-600 tabular-nums">
              Filhotinhos resgatados: {rescuedCount}/8 · Modo{' '}
              {saveData.mode === 'pequenos' ? 'Pequenos (3–5)' : 'Aventura (6–8)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenStory}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-amber-100 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-200 active:scale-95 whitespace-nowrap shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            <span>Ver Animação da História</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              onToggleUnlockAll();
            }}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-transform active:scale-95 whitespace-nowrap shrink-0 ${
              saveData.unlockAll
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {saveData.unlockAll ? (
              <Unlock className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span>
              {saveData.unlockAll ? 'Todas Liberadas' : 'Liberar Todas'}
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable Saga Timeline + 8-World Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-safe px-safe space-y-5">
        {/* Interactive Saga Timeline Strip */}
        <div className="mx-auto max-w-6xl rounded-3xl border-2 border-white bg-white/85 p-4 shadow-md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="font-display text-sm sm:text-base font-bold text-slate-900">
              Jornada pelo Resgate dos 8 Filhotinhos
            </span>
            <span className="text-xs font-bold text-orange-600 tabular-nums">
              {Math.round((rescuedCount / 8) * 100)}% Concluído
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {/* Story Start Node */}
            <button
              type="button"
              onClick={onOpenStory}
              className="flex min-h-[52px] min-w-[96px] flex-col items-center justify-center rounded-2xl bg-violet-600 px-3 py-1.5 text-white shadow active:scale-95 shrink-0"
            >
              <span className="font-display text-xs font-bold">Início</span>
              <span className="text-[11px] font-bold text-violet-100">
                O Rapto
              </span>
            </button>

            {WORLDS.map((w) => {
              const completed = Boolean(saveData.records[w.id]?.completed);
              const unlocked =
                saveData.unlockAll || w.id <= saveData.highestUnlockedStage;
              const isCurrent =
                !completed && w.id === saveData.highestUnlockedStage;

              return (
                <React.Fragment key={w.id}>
                  <div
                    className={`h-1 w-4 shrink-0 rounded-full ${
                      completed ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                  <motion.button
                    type="button"
                    disabled={!unlocked}
                    animate={isCurrent ? {y: [0, -3, 0]} : undefined}
                    transition={
                      isCurrent
                        ? {repeat: Infinity, duration: 1.6, ease: 'easeInOut'}
                        : undefined
                    }
                    onClick={() => {
                      soundEngine.unlock();
                      soundEngine.playJump(1);
                      onSelectStage(w.id);
                    }}
                    className={`flex min-h-[52px] min-w-[104px] flex-col items-center justify-center rounded-2xl border-2 px-3 py-1.5 transition-transform active:scale-95 shrink-0 ${
                      completed
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        : unlocked
                        ? 'border-orange-400 bg-orange-50 text-orange-950 shadow-sm'
                        : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="font-display text-xs font-bold">
                      {w.id === 8 ? 'Final · F8' : `Fase ${w.id}`}
                    </span>
                    <span className="text-[11px] font-bold truncate max-w-[90px]">
                      {completed ? `✓ ${w.babyName}` : w.babyName}
                    </span>
                  </motion.button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 8-World Cards */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORLDS.map((w, idx) => {
            const unlocked =
              saveData.unlockAll || w.id <= saveData.highestUnlockedStage;
            const rec = saveData.records[w.id];
            const goldenCount = rec
              ? rec.goldenSecrets.filter(Boolean).length
              : 0;

            return (
              <motion.button
                key={w.id}
                type="button"
                disabled={!unlocked}
                initial={{opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: idx * 0.04, duration: 0.25}}
                onClick={() => {
                  soundEngine.unlock();
                  soundEngine.playJump(1);
                  onSelectStage(w.id);
                }}
                className={`group relative flex flex-col justify-between rounded-3xl border-4 p-4 text-left shadow-lg transition-transform ${
                  unlocked
                    ? 'border-white bg-white hover:-translate-y-0.5 active:scale-[0.98]'
                    : 'border-white/50 bg-white/60 opacity-75 cursor-not-allowed'
                }`}
              >
                <div>
                  <div
                    className="flex h-20 items-center justify-between rounded-2xl px-4 text-white shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${w.skyTop}, ${w.hillNear})`,
                    }}
                  >
                    <div>
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-white/90">
                        Fase {w.id}
                      </span>
                      <div className="font-display text-lg font-bold leading-tight drop-shadow-sm">
                        {w.name}
                      </div>
                    </div>
                    {!unlocked ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/40">
                        <Lock className="h-5 w-5" />
                      </div>
                    ) : rec?.completed ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 shadow">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 shadow">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-xs font-bold text-slate-600 leading-snug">
                    {w.subtitle}
                  </p>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{w.boss.name}</span>
                    </span>
                    <span className="tabular-nums text-amber-600 shrink-0">
                      {goldenCount}/3 ★
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span
                      className={
                        rec?.completed ? 'text-emerald-600' : 'text-orange-600'
                      }
                    >
                      {rec?.completed
                        ? `Resgatado: ${w.babyName}`
                        : `A resgatar: ${w.babyName}`}
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
