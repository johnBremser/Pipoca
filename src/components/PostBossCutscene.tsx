import {
  ArrowRight,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import React, {useEffect, useState} from 'react';
import {soundEngine} from '../game/audio';
import {
  POST_BOSS_CUTSCENES,
  speakPortuguese,
  stopPortugueseSpeech,
} from '../game/cutscenes';
import type {BossKind, WorldConfig} from '../game/types';
import {OswaldaoSvgGroup} from './OswaldaoSvg';

interface PostBossCutsceneProps {
  world: WorldConfig;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onFinish: () => void;
}

export const PostBossCutscene: React.FC<PostBossCutsceneProps> = ({
  world,
  voiceEnabled,
  onToggleVoice,
  onFinish,
}) => {
  const script = POST_BOSS_CUTSCENES[world.id] ?? POST_BOSS_CUTSCENES[1];
  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = script.steps[stepIdx];
  const isFinale = world.id === 8;

  useEffect(() => {
    const pitch =
      currentStep.speaker === 'baby'
        ? 1.35
        : currentStep.speaker === 'oswaldao'
        ? 0.78
        : currentStep.speaker === 'boss'
        ? 0.88
        : 1.1;
    speakPortuguese(currentStep.text, voiceEnabled, pitch);
    return () => stopPortugueseSpeech();
  }, [currentStep.speaker, currentStep.text, stepIdx, voiceEnabled]);

  const handleNext = () => {
    soundEngine.unlock();
    soundEngine.playCollect(stepIdx);
    if (stepIdx < script.steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      stopPortugueseSpeech();
      onFinish();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto p-3 sm:p-6 landscape-short:py-2 landscape-short:px-4"
      style={{
        background: `linear-gradient(180deg, ${world.skyTop} 0%, ${world.skyBottom} 65%, ${world.hillNear} 100%)`,
      }}
    >
      {/* Top Bar: Voice Toggle + Timeline Dots + Skip */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2.5 landscape-short:gap-1.5 pt-safe shrink-0">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              onToggleVoice();
            }}
            className="inline-flex min-h-[44px] landscape-short:min-h-[38px] items-center gap-2 rounded-2xl bg-white/90 px-3.5 py-2 landscape-short:py-1.5 font-display text-xs sm:text-sm font-bold text-slate-800 shadow-md active:scale-95 whitespace-nowrap shrink-0"
          >
            {voiceEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <VolumeX className="h-4 w-4 text-rose-500" />
            )}
            <span>{voiceEnabled ? 'Voz: Ligada' : 'Voz: Desligada'}</span>
          </button>

          <div className="hidden sm:block rounded-2xl bg-slate-950/60 px-4 py-1.5 landscape-short:py-1 font-display text-sm landscape-short:text-xs font-bold text-white truncate max-w-xs">
            {isFinale
              ? 'Grande Final na Festa da Lagoa!'
              : `Resgate de ${world.babyName} · ${world.name}`}
          </div>

          <button
            type="button"
            onClick={() => {
              stopPortugueseSpeech();
              onFinish();
            }}
            className="inline-flex min-h-[44px] landscape-short:min-h-[38px] items-center gap-2 rounded-2xl bg-white/90 px-3.5 py-2 landscape-short:py-1.5 font-display text-xs sm:text-sm font-bold text-slate-800 shadow-md active:scale-95 whitespace-nowrap shrink-0"
          >
            <span>Pular</span>
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Step timeline bar */}
        <div className="flex gap-2">
          {script.steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-full transition-colors ${
                idx <= stepIdx ? 'bg-amber-400 shadow' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Responsive Stage: Stacked in portrait, 2-Column side-by-side on short phone landscape */}
      <div className="mx-auto my-auto grid w-full max-w-5xl grid-cols-1 items-center gap-3 py-2 landscape-short:grid-cols-[1.12fr_0.88fr] landscape-short:gap-4 landscape-short:py-1">
        {/* Left / Top: Animated Characters SVG Scene */}
        <div className="w-full overflow-hidden rounded-3xl border-4 border-white/90 bg-white/20 shadow-xl">
          <svg
            viewBox="0 0 760 270"
            preserveAspectRatio="xMidYMid meet"
            className="h-44 w-full sm:h-60 landscape-short:h-[min(64dvh,235px)]"
          >
            {/* Biome ground */}
            <rect x="0" y="210" width="760" height="60" fill={world.groundTop} />
            <rect x="0" y="226" width="760" height="44" fill={world.groundFill} />

            {/* Finale only: Papai Oswaldão joins Pipoca & all rescued babies! */}
            {isFinale && (
              <motion.g
                initial={{x: -90, opacity: 0}}
                animate={{
                  x: 0,
                  opacity: 1,
                  y: currentStep.speaker === 'oswaldao' ? [0, -12, 0] : [0, -4, 0],
                }}
                transition={{
                  x: {duration: 0.6},
                  y: {repeat: Infinity, duration: 1.1},
                }}
              >
                <OswaldaoSvgGroup transform="translate(88, 178) scale(0.76)" />
              </motion.g>
            )}

            {/* Left: Hero Pipoca */}
            <motion.g
              animate={
                currentStep.speaker === 'pipoca'
                  ? {y: [0, -10, 0]}
                  : {y: [0, -3, 0]}
              }
              transition={{repeat: Infinity, duration: 1.2}}
              transform={isFinale ? 'translate(210, 180) scale(0.92)' : 'translate(150, 178)'}
            >
              <ellipse cx="0" cy="0" rx="52" ry="36" fill="#B47644" stroke="#452512" strokeWidth="4.5" />
              <circle cx="40" cy="-22" r="28" fill="#B47644" stroke="#452512" strokeWidth="4.5" />
              <ellipse cx="54" cy="-18" rx="13" ry="10" fill="#D49A6A" />
              <circle cx="18" cy="-42" r="8" fill="#8C522B" stroke="#452512" strokeWidth="3.5" />
              <circle cx="38" cy="-25" r="4" fill="#1E1108" />
              <circle cx="40" cy="-54" r="13" fill="#FF7A1A" stroke="#7C2D12" strokeWidth="3.5" />
              <ellipse cx="45" cy="-68" rx="8" ry="4" transform="rotate(-25 45 -68)" fill="#22C55E" />
            </motion.g>

            {/* Middle: Rescued Baby Capybara */}
            <motion.g
              animate={
                currentStep.speaker === 'baby'
                  ? {y: [0, -16, 0]}
                  : {y: [0, -5, 0]}
              }
              transition={{repeat: Infinity, duration: 0.95, delay: 0.15}}
              transform={isFinale ? 'translate(345, 196)' : 'translate(295, 195)'}
            >
              <ellipse cx="0" cy="0" rx="26" ry="20" fill="#C08552" stroke="#452512" strokeWidth="3.5" />
              <circle cx="-13" cy="-16" r="6" fill="#8C522B" stroke="#452512" strokeWidth="2.5" />
              <circle cx="13" cy="-16" r="6" fill="#8C522B" stroke="#452512" strokeWidth="2.5" />
              <path d="M-9 -3 Q-6 -7 -3 -3" fill="none" stroke="#1E1108" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M3 -3 Q6 -7 9 -3" fill="none" stroke="#1E1108" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="0" cy="-23" r="7.5" fill="#FF7A1A" stroke="#7C2D12" strokeWidth="2.5" />
            </motion.g>

            {/* Right: Defeated Bandaged Boss */}
            <motion.g
              animate={
                currentStep.speaker === 'boss'
                  ? {rotate: [-3, 3, -3]}
                  : {y: [0, 3, 0]}
              }
              transition={{repeat: Infinity, duration: 1.4}}
              style={{transformOrigin: '585px 180px'}}
              transform={isFinale ? 'translate(590, 175)' : 'translate(560, 175)'}
            >
              <DefeatedBossAvatar
                kind={world.boss.kind}
                primary={world.boss.primaryColor}
                secondary={world.boss.secondaryColor}
              />
              {/* Cute White X-Bandage */}
              <g transform="translate(-12, -55) rotate(-12)">
                <rect x="-18" y="-7" width="36" height="14" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                <line x1="-6" y1="-4" x2="6" y2="4" stroke="#FB7185" strokeWidth="2.5" />
                <line x1="6" y1="-4" x2="-6" y2="4" stroke="#FB7185" strokeWidth="2.5" />
              </g>
              {/* Dizzy Stars */}
              <motion.text
                x="-28"
                y="-78"
                fontSize="24"
                fill="#FACC15"
                stroke="#854D0E"
                strokeWidth="1"
                animate={{y: [-78, -86, -78]}}
                transition={{repeat: Infinity, duration: 1.2}}
              >
                ★ ★
              </motion.text>
            </motion.g>
          </svg>
        </div>

        {/* Right / Bottom: Speech Bubble + Advance CTA (always reachable!) */}
        <div className="flex flex-col gap-3 landscape-short:gap-2.5 pb-safe">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIdx}
              initial={{opacity: 0, y: -8, scale: 0.97}}
              animate={{opacity: 1, y: 0, scale: 1}}
              exit={{opacity: 0, y: 6}}
              transition={{duration: 0.22}}
              className="relative w-full rounded-3xl border-4 border-slate-900 bg-white p-4 sm:p-6 landscape-short:p-3.5 shadow-2xl landscape-short:max-h-[calc(100dvh-165px)] landscape-short:overflow-y-auto"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`font-display text-sm sm:text-base font-bold ${
                    currentStep.speaker === 'pipoca'
                      ? 'text-orange-600'
                      : currentStep.speaker === 'oswaldao'
                      ? 'text-sky-700'
                      : currentStep.speaker === 'baby'
                      ? 'text-emerald-600'
                      : 'text-violet-700'
                  }`}
                >
                  {currentStep.speakerName}
                </span>
                <span className="text-xs font-bold text-slate-400 tabular-nums">
                  {stepIdx + 1}/{script.steps.length}
                </span>
              </div>
              <p className="mt-1.5 font-display text-base sm:text-xl landscape-short:text-sm font-bold leading-snug text-slate-900">
                “{currentStep.text}”
              </p>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex min-h-[54px] landscape-short:min-h-[46px] w-full items-center justify-center gap-3 rounded-3xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3 landscape-short:py-2 font-display text-lg sm:text-xl landscape-short:text-base font-bold text-white shadow-xl transition-transform active:scale-95 hover:bg-emerald-400"
          >
            {stepIdx < script.steps.length - 1 ? (
              <>
                <span>Continuar Conversa</span>
                <ArrowRight className="h-6 w-6 landscape-short:h-5 landscape-short:w-5 stroke-[3]" />
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6 landscape-short:h-5 landscape-short:w-5" />
                <span>
                  {script.nextStageName
                    ? `Seguir para ${script.nextStageName}!`
                    : 'Comemorar Grande Vitória!'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DefeatedBossAvatar: React.FC<{
  kind: BossKind;
  primary: string;
  secondary: string;
}> = ({kind, primary, secondary}) => {
  return (
    <g>
      {kind === 'baron_fox' && (
        <path d="M12 -45 L75 35 L-15 35 Z" fill="#6D28D9" stroke="#2E1065" strokeWidth="4" />
      )}
      <rect
        x="-52"
        y="-56"
        width="104"
        height="90"
        rx="28"
        fill={primary}
        stroke="#1E293B"
        strokeWidth="4.5"
      />
      <ellipse cx="-6" cy="4" rx="28" ry="22" fill={secondary} />
      {kind === 'baron_fox' && (
        <>
          <polygon points="-36,-48 -46,-82 -14,-54" fill="#EA580C" stroke="#1E293B" strokeWidth="3.5" />
          <polygon points="14,-54 44,-82 36,-48" fill="#EA580C" stroke="#1E293B" strokeWidth="3.5" />
        </>
      )}
      {/* Dizzy >< Eyes */}
      <path d="M-28 -26 L-14 -18 L-28 -10" fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 -26 L-2 -18 L12 -10" fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
      <path d="M-24 14 Q-8 4 8 14" fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  );
};
