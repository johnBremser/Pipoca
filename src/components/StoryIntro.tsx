import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import React, {useEffect, useState} from 'react';
import {soundEngine} from '../game/audio';

interface StoryIntroProps {
  onComplete: () => void;
  onBack: () => void;
}

interface StoryPage {
  title: string;
  subtitle: string;
  text: string;
  bgClass: string;
  scene: 'family' | 'kidnap' | 'quest';
  durationMs: number;
}

const PAGES: StoryPage[] = [
  {
    title: 'Capítulo 1 · Um Dia Feliz na Lagoa',
    subtitle: 'A família da Pipoca brincando ao sol',
    text: 'Pipoca vivia em paz na Lagoa das Laranjas cuidando dos seus 8 filhotinhos fofinhos: Laranjinha, Bolinha, Gotinha, Paçoca, Estrelinha, Pudim, Jujuba e Fofucho.',
    bgClass: 'from-sky-300 via-sky-200 to-emerald-200',
    scene: 'family',
    durationMs: 7500,
  },
  {
    title: 'Capítulo 2 · O Rapto do Barão Raposão!',
    subtitle: 'Um vilão de capa roxa apareceu no céu',
    text: 'De repente, o trapaceiro Barão Raposão surgiu girando sua capa roxa e prendeu os 8 filhotinhos em bolhas mágicas, levando um para cada mundo até o seu Castelo!',
    bgClass: 'from-violet-800 via-purple-700 to-indigo-900',
    scene: 'kidnap',
    durationMs: 8000,
  },
  {
    title: 'Capítulo 3 · A Saga do Resgate!',
    subtitle: '8 mundos para salvar todos os filhotinhos',
    text: 'Com sua tangerina da sorte na cabeça, Pipoca partiu em alta velocidade para pular, rolar, resgatar todos os seus 8 filhotinhos e vencer o Barão Raposão!',
    bgClass: 'from-amber-300 via-orange-200 to-sky-300',
    scene: 'quest',
    durationMs: 8000,
  },
];

export const StoryIntro: React.FC<StoryIntroProps> = ({onComplete, onBack}) => {
  const [pageIdx, setPageIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const page = PAGES[pageIdx];
  const isDark = page.scene === 'kidnap';

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setTimeout(() => {
      if (pageIdx < PAGES.length - 1) {
        setPageIdx((i) => i + 1);
      } else {
        setAutoPlay(false);
      }
    }, page.durationMs);
    return () => window.clearTimeout(timer);
  }, [autoPlay, pageIdx, page.durationMs]);

  const handleNext = () => {
    soundEngine.unlock();
    soundEngine.playCollect(pageIdx);
    if (pageIdx < PAGES.length - 1) {
      setPageIdx((i) => i + 1);
    } else {
      soundEngine.playCheckpoint();
      onComplete();
    }
  };

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between bg-gradient-to-b ${page.bgClass} p-4 sm:p-7 transition-colors duration-700 overflow-hidden`}
    >
      {/* Top Bar + Timeline Progress */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              setAutoPlay(false);
              if (pageIdx > 0) setPageIdx((i) => i - 1);
              else onBack();
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 font-display text-sm font-bold text-slate-800 shadow-md transition-transform active:scale-95 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{pageIdx > 0 ? 'Voltar' : 'Início'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoPlay((a) => !a)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/90 px-3.5 py-2 font-display text-xs sm:text-sm font-bold text-slate-800 shadow-md transition-transform active:scale-95 whitespace-nowrap shrink-0"
          >
            {autoPlay ? (
              <Pause className="h-4 w-4 text-orange-500" />
            ) : (
              <Play className="h-4 w-4 text-emerald-600 fill-current" />
            )}
            <span>{autoPlay ? 'Pausar Cena' : 'Reproduzir'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              onComplete();
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 font-display text-sm font-bold text-slate-800 shadow-md transition-transform active:scale-95 whitespace-nowrap shrink-0"
          >
            <span>Pular História</span>
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Animated Motion-Graphic Timeline Progress Strip */}
        <div className="grid grid-cols-3 gap-2">
          {PAGES.map((p, idx) => {
            const isPast = idx < pageIdx;
            const isCurrent = idx === pageIdx;
            return (
              <button
                key={p.title}
                type="button"
                onClick={() => {
                  setAutoPlay(false);
                  setPageIdx(idx);
                }}
                aria-label={`Ir para cena ${idx + 1}`}
                className={`relative h-2.5 overflow-hidden rounded-full ${
                  isDark ? 'bg-white/25' : 'bg-slate-900/15'
                }`}
              >
                {isPast && (
                  <div className="h-full w-full rounded-full bg-orange-500" />
                )}
                {isCurrent && (
                  <motion.div
                    key={`bar-${pageIdx}-${autoPlay}`}
                    initial={{scaleX: autoPlay ? 0 : 1}}
                    animate={{scaleX: 1}}
                    transition={{
                      duration: autoPlay ? page.durationMs / 1000 : 0.25,
                      ease: 'linear',
                    }}
                    style={{transformOrigin: 'left'}}
                    className="h-full w-full rounded-full bg-orange-500"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Central Choreographed Motion-Graphics Stage */}
      <div className="mx-auto my-auto flex w-full max-w-4xl flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={page.scene}
            initial={{opacity: 0, scale: 0.96, y: 12}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.98, y: -12}}
            transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
            className="w-full overflow-hidden rounded-3xl border-4 border-white/95 bg-white/20 shadow-2xl"
          >
            <svg
              viewBox="0 0 800 340"
              className="h-52 w-full sm:h-72 md:h-80"
              role="img"
              aria-label={page.title}
            >
              {page.scene === 'family' && (
                <g>
                  <rect width="800" height="340" fill="#BAE6FD" />
                  {/* Rotating warm sun */}
                  <motion.g
                    animate={{rotate: 360}}
                    transition={{repeat: Infinity, duration: 24, ease: 'linear'}}
                    style={{transformOrigin: '690px 70px'}}
                  >
                    <circle cx="690" cy="70" r="54" fill="#FEF08A" opacity="0.45" />
                    <circle cx="690" cy="70" r="40" fill="#FDE047" />
                  </motion.g>

                  {/* Drifting clouds */}
                  <motion.g
                    animate={{x: [0, 35, 0]}}
                    transition={{repeat: Infinity, duration: 9, ease: 'easeInOut'}}
                  >
                    <circle cx="140" cy="74" r="24" fill="#FFFFFF" />
                    <circle cx="168" cy="64" r="30" fill="#FFFFFF" />
                    <circle cx="198" cy="74" r="22" fill="#FFFFFF" />
                  </motion.g>

                  <path
                    d="M0 245 Q220 200 440 245 T800 235 L800 340 L0 340 Z"
                    fill="#4ADE80"
                  />
                  <motion.path
                    animate={{y: [0, 4, 0]}}
                    transition={{repeat: Infinity, duration: 3, ease: 'easeInOut'}}
                    d="M0 282 Q400 264 800 284 L800 340 L0 340 Z"
                    fill="#38BDF8"
                  />

                  {/* Mama Pipoca gently breathing & smiling */}
                  <motion.g
                    initial={{x: -120, opacity: 0}}
                    animate={{x: 0, opacity: 1}}
                    transition={{duration: 0.7, ease: 'easeOut'}}
                  >
                    <motion.g
                      animate={{y: [0, -6, 0]}}
                      transition={{repeat: Infinity, duration: 2.2, ease: 'easeInOut'}}
                      transform="translate(200, 212)"
                    >
                      <ellipse cx="0" cy="0" rx="64" ry="44" fill="#B47644" stroke="#452512" strokeWidth="5" />
                      <circle cx="48" cy="-28" r="34" fill="#B47644" stroke="#452512" strokeWidth="5" />
                      <ellipse cx="66" cy="-24" rx="16" ry="13" fill="#D49A6A" />
                      <circle cx="24" cy="-54" r="10" fill="#8C522B" stroke="#452512" strokeWidth="4" />
                      <path d="M36 -34 Q44 -42 52 -34" fill="none" stroke="#2A170B" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="46" cy="-68" r="16" fill="#FF7A1A" stroke="#7C2D12" strokeWidth="4" />
                      <ellipse cx="52" cy="-84" rx="10" ry="5" transform="rotate(-25 52 -84)" fill="#22C55E" />
                    </motion.g>
                  </motion.g>

                  {/* 8 Baby Capybaras hopping happily in staggered motion */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                    const bx = 355 + (i % 4) * 96;
                    const by = 225 + Math.floor(i / 4) * 44;
                    return (
                      <motion.g
                        key={i}
                        initial={{scale: 0}}
                        animate={{scale: 1, y: [0, -10, 0]}}
                        transition={{
                          scale: {delay: 0.15 + i * 0.08, duration: 0.35},
                          y: {
                            repeat: Infinity,
                            duration: 1.4,
                            delay: i * 0.18,
                            ease: 'easeInOut',
                          },
                        }}
                      >
                        <g transform={`translate(${bx}, ${by})`}>
                          <ellipse cx="0" cy="0" rx="20" ry="15" fill="#C08552" stroke="#452512" strokeWidth="3" />
                          <circle cx="-11" cy="-12" r="5" fill="#8C522B" stroke="#452512" strokeWidth="2.5" />
                          <circle cx="11" cy="-12" r="5" fill="#8C522B" stroke="#452512" strokeWidth="2.5" />
                          <circle cx="-5" cy="-2" r="2.5" fill="#1E1108" />
                          <circle cx="5" cy="-2" r="2.5" fill="#1E1108" />
                          <circle cx="0" cy="-17" r="6" fill="#FF7A1A" stroke="#7C2D12" strokeWidth="2" />
                        </g>
                      </motion.g>
                    );
                  })}
                </g>
              )}

              {page.scene === 'kidnap' && (
                <g>
                  <rect width="800" height="340" fill="#312E81" />
                  <motion.circle
                    cx="530"
                    cy="145"
                    r="110"
                    fill="#6D28D9"
                    animate={{scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35]}}
                    transition={{repeat: Infinity, duration: 2.5}}
                    style={{transformOrigin: '530px 145px'}}
                  />
                  <path d="M0 265 Q400 235 800 265 L800 340 L0 340 Z" fill="#1E1B4B" />

                  {/* Barão Raposão swooping in from upper right */}
                  <motion.g
                    initial={{x: 140, y: -60}}
                    animate={{x: 0, y: [0, -10, 0]}}
                    transition={{
                      x: {duration: 0.9, ease: 'easeOut'},
                      y: {repeat: Infinity, duration: 2.4, ease: 'easeInOut'},
                    }}
                  >
                    <g transform="translate(545, 145)">
                      <motion.path
                        animate={{skewX: [0, 6, 0]}}
                        transition={{repeat: Infinity, duration: 1.8}}
                        d="M-20 -30 L-128 74 L30 74 Z"
                        fill="#7C3AED"
                        stroke="#2E1065"
                        strokeWidth="5"
                      />
                      <ellipse cx="0" cy="18" rx="52" ry="56" fill="#EA580C" stroke="#1E293B" strokeWidth="5" />
                      <ellipse cx="10" cy="30" rx="28" ry="30" fill="#FED7AA" />
                      <polygon points="-36,-24 -48,-74 -10,-34" fill="#EA580C" stroke="#1E293B" strokeWidth="4" />
                      <polygon points="10,-34 44,-74 36,-24" fill="#EA580C" stroke="#1E293B" strokeWidth="4" />
                      <rect x="-32" y="-76" width="64" height="40" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
                      <rect x="-46" y="-42" width="92" height="12" rx="6" fill="#FACC15" stroke="#854D0E" strokeWidth="3" />
                      <circle cx="-12" cy="-6" r="7" fill="#FFFFFF" />
                      <circle cx="18" cy="-6" r="7" fill="#FFFFFF" />
                      <circle cx="-10" cy="-6" r="3.5" fill="#0F172A" />
                      <circle cx="20" cy="-6" r="3.5" fill="#0F172A" />
                      <path d="M-12 16 Q4 26 20 14" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                    </g>
                  </motion.g>

                  {/* 8 Kidnapped Baby Capybaras floating upward inside bubbles */}
                  {[
                    {x: 185, y: 125},
                    {x: 260, y: 82},
                    {x: 340, y: 132},
                    {x: 410, y: 80},
                    {x: 225, y: 195},
                    {x: 305, y: 190},
                    {x: 385, y: 198},
                    {x: 455, y: 155},
                  ].map((b, i) => (
                    <motion.g
                      key={i}
                      initial={{y: 90, opacity: 0}}
                      animate={{y: [0, -14, 0], opacity: 1}}
                      transition={{
                        opacity: {delay: 0.2 + i * 0.08, duration: 0.4},
                        y: {
                          repeat: Infinity,
                          duration: 2.2,
                          delay: i * 0.25,
                          ease: 'easeInOut',
                        },
                      }}
                    >
                      <g transform={`translate(${b.x}, ${b.y})`}>
                        <ellipse cx="0" cy="4" rx="14" ry="11" fill="#C08552" stroke="#452512" strokeWidth="2.5" />
                        <circle cx="0" cy="-9" r="4" fill="#FF7A1A" />
                        <circle cx="0" cy="0" r="24" fill="rgba(186,230,253,0.3)" stroke="#FFFFFF" strokeWidth="3" />
                      </g>
                    </motion.g>
                  ))}

                  {/* Surprised Pipoca jumping below */}
                  <motion.g
                    animate={{y: [0, -12, 0]}}
                    transition={{repeat: Infinity, duration: 0.9}}
                  >
                    <g transform="translate(105, 250)">
                      <ellipse cx="0" cy="0" rx="46" ry="32" fill="#B47644" stroke="#452512" strokeWidth="4" />
                      <circle cx="34" cy="-18" r="24" fill="#B47644" stroke="#452512" strokeWidth="4" />
                      <circle cx="34" cy="-47" r="11" fill="#FF7A1A" stroke="#7C2D12" strokeWidth="3" />
                      <circle cx="38" cy="-22" r="4" fill="#1E1108" />
                      <text x="58" y="-44" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="28" fill="#FACC15">
                        !?
                      </text>
                    </g>
                  </motion.g>
                </g>
              )}

              {page.scene === 'quest' && (
                <g>
                  <rect width="800" height="340" fill="#7DD3FC" />
                  <path d="M40 340 Q280 75 760 120" fill="none" stroke="#F472B6" strokeWidth="18" opacity="0.55" />
                  <path d="M40 340 Q280 93 760 138" fill="none" stroke="#FACC15" strokeWidth="18" opacity="0.55" />
                  <path d="M40 340 Q280 111 760 156" fill="none" stroke="#34D399" strokeWidth="18" opacity="0.55" />
                  <path d="M0 265 Q400 220 800 270 L800 340 L0 340 Z" fill="#22C55E" />

                  {/* Animated speed streaks */}
                  {[0, 1, 2].map((s) => (
                    <motion.line
                      key={s}
                      x1="60"
                      y1={130 + s * 32}
                      x2="260"
                      y2={130 + s * 32}
                      stroke="#FFFFFF"
                      strokeWidth="7"
                      strokeLinecap="round"
                      animate={{x: [-60, 120], opacity: [0, 1, 0]}}
                      transition={{
                        repeat: Infinity,
                        duration: 0.85,
                        delay: s * 0.22,
                      }}
                    />
                  ))}

                  {/* Heroic Leaping Pipoca */}
                  <motion.g
                    initial={{x: -180, y: 40}}
                    animate={{x: 0, y: [0, -16, 0]}}
                    transition={{
                      x: {duration: 0.7, ease: 'easeOut'},
                      y: {repeat: Infinity, duration: 1.5, ease: 'easeInOut'},
                    }}
                  >
                    <g transform="translate(360, 170) rotate(-10)">
                      <ellipse cx="0" cy="0" rx="64" ry="44" fill="#B47644" stroke="#452512" strokeWidth="5" />
                      <circle cx="48" cy="-26" r="34" fill="#B47644" stroke="#452512" strokeWidth="5" />
                      <ellipse cx="66" cy="-22" rx="16" ry="13" fill="#D49A6A" />
                      <circle cx="24" cy="-52" r="10" fill="#8C522B" stroke="#452512" strokeWidth="4" />
                      <rect x="20" y="-44" width="54" height="10" rx="5" fill="#FF7A1A" stroke="#7C2D12" strokeWidth="2.5" />
                      <circle cx="44" cy="-31" r="5" fill="#1E1108" />
                      <circle cx="46" cy="-68" r="16" fill="#FF7A1A" stroke="#7C2D12" strokeWidth="4" />
                      <ellipse cx="52" cy="-84" rx="10" ry="5" transform="rotate(-25 52 -84)" fill="#22C55E" />
                    </g>
                  </motion.g>

                  {/* Mini Timeline Preview: 8 Worlds -> Barão Raposão */}
                  <g transform="translate(130, 292)">
                    <line x1="0" y1="0" x2="540" y2="0" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <motion.circle
                        key={i}
                        cx={i * 77}
                        cy="0"
                        r={i === 7 ? 14 : 10}
                        fill={i === 7 ? '#7C3AED' : '#FACC15'}
                        stroke="#FFFFFF"
                        strokeWidth="3"
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        transition={{delay: 0.25 + i * 0.08}}
                      />
                    ))}
                  </g>
                </g>
              )}
            </svg>
          </motion.div>
        </AnimatePresence>

        {/* Story Text Card */}
        <motion.div
          key={`text-${pageIdx}`}
          initial={{opacity: 0, y: 8}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.3}}
          className="w-full rounded-3xl bg-white/95 p-4 sm:p-6 text-center shadow-2xl"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
            {page.subtitle}
          </div>
          <h2 className="mt-0.5 font-display text-xl sm:text-3xl font-bold text-slate-900 text-balance">
            {page.title}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-lg font-bold leading-relaxed text-slate-700">
            {page.text}
          </p>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-auto flex w-full max-w-md justify-center pb-safe">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-3xl border-b-4 border-orange-700 bg-orange-500 px-8 py-3 font-display text-xl font-bold text-white shadow-xl transition-transform active:scale-95 hover:bg-orange-400"
        >
          {pageIdx < PAGES.length - 1 ? (
            <>
              <span>Próxima Cena</span>
              <ArrowRight className="h-6 w-6 stroke-[3]" />
            </>
          ) : (
            <>
              <Sparkles className="h-6 w-6" />
              <span>Começar o Resgate!</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
