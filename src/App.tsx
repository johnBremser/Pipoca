import {useCallback, useEffect, useRef, useState} from 'react';
import {GameCanvas} from './components/GameCanvas';
import {HudOverlay} from './components/HudOverlay';
import {GameOverModal, PauseModal, VictoryModal} from './components/Modals';
import {PostBossCutscene} from './components/PostBossCutscene';
import {StageSelect} from './components/StageSelect';
import {StoryIntro} from './components/StoryIntro';
import {TitleScreen} from './components/TitleScreen';
import {TouchControls, type TouchInputRef} from './components/TouchControls';
import {soundEngine} from './game/audio';
import {stopPortugueseSpeech} from './game/cutscenes';
import {
  loadSaveData,
  persistSaveData,
  recordStageVictory,
  setSaveMode,
} from './game/storage';
import type {
  DifficultyMode,
  GameScreen,
  HudSnapshot,
  SaveData,
} from './game/types';
import {getWorldConfig} from './game/worlds';

type ActiveView = GameScreen | 'STORY_INTRO';

const INITIAL_HUD: HudSnapshot = {
  hearts: 6,
  maxHearts: 6,
  tangerines: 0,
  score: 0,
  goldenSecrets: [false, false, false],
  currentAct: 1,
  progressPct: 0,
  elapsedSec: 0,
  hasShield: false,
  comboCount: 0,
  bossActive: false,
  bossName: '',
  bossHp: 0,
  bossMaxHp: 0,
  bannerText: null,
};

export default function App() {
  const [saveData, setSaveData] = useState<SaveData>(() => {
    const loaded = loadSaveData();
    soundEngine.setMuted(loaded.muted);
    return loaded;
  });

  const [screen, setScreen] = useState<ActiveView>('TITLE_MENU');
  const [hasSeenStory, setHasSeenStory] = useState(false);
  const [activeStageId, setActiveStageId] = useState(1);
  const [runKey, setRunKey] = useState(1);
  const [respawnSignal, setRespawnSignal] = useState(0);
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [victorySummary, setVictorySummary] = useState<{
    score: number;
    tangerines: number;
    goldenSecrets: [boolean, boolean, boolean];
    elapsedSec: number;
  } | null>(null);
  const [gameOverSummary, setGameOverSummary] = useState<{
    score: number;
    tangerines: number;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const touchInputRef = useRef<TouchInputRef>({
    left: false,
    right: false,
    jumpHeld: false,
    jumpJustPressed: false,
    rollHeld: false,
    rollJustPressed: false,
  });

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const toggleMute = useCallback(() => {
    soundEngine.unlock();
    setSaveData((prev) => {
      const muted = !prev.muted;
      soundEngine.setMuted(muted);
      const updated = {...prev, muted};
      persistSaveData(updated);
      if (!muted && screen === 'PLAYING') {
        soundEngine.startMusic(activeStageId);
      }
      return updated;
    });
  }, [activeStageId, screen]);

  const handleChangeMode = useCallback((mode: DifficultyMode) => {
    setSaveData((prev) => setSaveMode(prev, mode));
  }, []);

  const handleStartFromTitle = useCallback(() => {
    if (!hasSeenStory && saveData.highestUnlockedStage === 1) {
      setHasSeenStory(true);
      setScreen('STORY_INTRO');
    } else {
      setScreen('STAGE_SELECT');
    }
  }, [hasSeenStory, saveData.highestUnlockedStage]);

  const startStage = useCallback((stageId: number) => {
    setActiveStageId(stageId);
    setRunKey((k) => k + 1);
    setVictorySummary(null);
    setGameOverSummary(null);
    setScreen('PLAYING');
  }, []);

  const handleToggleUnlockAll = useCallback(() => {
    setSaveData((prev) => {
      const updated = {...prev, unlockAll: !prev.unlockAll};
      persistSaveData(updated);
      return updated;
    });
  }, []);

  const handleToggleTouchControls = useCallback(() => {
    setSaveData((prev) => {
      const updated = {
        ...prev,
        showTouchControlsOnDesktop: !prev.showTouchControlsOnDesktop,
      };
      persistSaveData(updated);
      return updated;
    });
  }, []);

  const handleToggleVoice = useCallback(() => {
    setSaveData((prev) => {
      const voiceEnabled = !prev.voiceEnabled;
      if (!voiceEnabled) {
        stopPortugueseSpeech();
      }
      const updated = {...prev, voiceEnabled};
      persistSaveData(updated);
      return updated;
    });
  }, []);

  const handleVictory = useCallback(
    (summary: {
      score: number;
      tangerines: number;
      goldenSecrets: [boolean, boolean, boolean];
      elapsedSec: number;
    }) => {
      soundEngine.stopMusic();
      setSaveData((prev) =>
        recordStageVictory(
          prev,
          activeStageId,
          summary.score,
          summary.tangerines,
          summary.goldenSecrets,
          summary.elapsedSec
        )
      );
      setVictorySummary(summary);
      setScreen('CUTSCENE');
    },
    [activeStageId]
  );

  const handleGameOver = useCallback(
    (summary: {score: number; tangerines: number}) => {
      soundEngine.stopMusic();
      setGameOverSummary(summary);
      setScreen('GAME_OVER');
    },
    []
  );

  const handleTogglePause = useCallback(() => {
    setScreen((curr) =>
      curr === 'PLAYING' ? 'PAUSED' : curr === 'PAUSED' ? 'PLAYING' : curr
    );
  }, []);

  const activeWorld = getWorldConfig(activeStageId);
  const isPlayingOrModal =
    screen === 'PLAYING' ||
    screen === 'PAUSED' ||
    screen === 'CUTSCENE' ||
    screen === 'VICTORY' ||
    screen === 'GAME_OVER';

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-sky-400">
      {screen === 'TITLE_MENU' && (
        <TitleScreen
          mode={saveData.mode}
          muted={saveData.muted}
          isFullscreen={isFullscreen}
          onChangeMode={handleChangeMode}
          onStart={handleStartFromTitle}
          onOpenStory={() => setScreen('STORY_INTRO')}
          onToggleMute={toggleMute}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {screen === 'STORY_INTRO' && (
        <StoryIntro
          onComplete={() => {
            setHasSeenStory(true);
            setScreen('STAGE_SELECT');
          }}
          onBack={() => setScreen('TITLE_MENU')}
        />
      )}

      {screen === 'STAGE_SELECT' && (
        <StageSelect
          saveData={saveData}
          onSelectStage={startStage}
          onToggleUnlockAll={handleToggleUnlockAll}
          onOpenStory={() => setScreen('STORY_INTRO')}
          onBack={() => setScreen('TITLE_MENU')}
        />
      )}

      {isPlayingOrModal && (
        <>
          <GameCanvas
            stageId={activeStageId}
            mode={saveData.mode}
            runKey={runKey}
            paused={screen !== 'PLAYING'}
            touchInputRef={touchInputRef}
            respawnSignal={respawnSignal}
            onHudUpdate={setHud}
            onVictory={handleVictory}
            onGameOver={handleGameOver}
            onTogglePause={handleTogglePause}
          />

          {screen !== 'CUTSCENE' && (
            <HudOverlay
              stageName={`Fase ${activeWorld.id}: ${activeWorld.name}`}
              hud={hud}
              muted={saveData.muted}
              isFullscreen={isFullscreen}
              onToggleMute={toggleMute}
              onToggleFullscreen={toggleFullscreen}
              onPause={() => setScreen('PAUSED')}
            />
          )}

          {screen === 'CUTSCENE' && (
            <PostBossCutscene
              world={activeWorld}
              voiceEnabled={saveData.voiceEnabled}
              onToggleVoice={handleToggleVoice}
              onFinish={() => setScreen('VICTORY')}
            />
          )}

          {screen === 'PLAYING' && (
            <TouchControls
              visible={saveData.showTouchControlsOnDesktop}
              inputRef={touchInputRef}
            />
          )}

          {screen === 'PAUSED' && (
            <PauseModal
              world={activeWorld}
              showTouchControls={saveData.showTouchControlsOnDesktop}
              onResume={() => setScreen('PLAYING')}
              onRestart={() => startStage(activeStageId)}
              onStageMap={() => setScreen('STAGE_SELECT')}
              onHome={() => setScreen('TITLE_MENU')}
              onToggleTouchControls={handleToggleTouchControls}
            />
          )}

          {screen === 'VICTORY' && victorySummary && (
            <VictoryModal
              world={activeWorld}
              score={victorySummary.score}
              tangerines={victorySummary.tangerines}
              goldenSecrets={victorySummary.goldenSecrets}
              elapsedSec={victorySummary.elapsedSec}
              hasNextStage={activeStageId < 8}
              onNextStage={() => startStage(Math.min(8, activeStageId + 1))}
              onReplay={() => startStage(activeStageId)}
              onStageMap={() => setScreen('STAGE_SELECT')}
            />
          )}

          {screen === 'GAME_OVER' && gameOverSummary && (
            <GameOverModal
              score={gameOverSummary.score}
              tangerines={gameOverSummary.tangerines}
              onContinueCheckpoint={() => {
                setGameOverSummary(null);
                setRespawnSignal((s) => s + 1);
                soundEngine.startMusic(activeStageId);
                setScreen('PLAYING');
              }}
              onRestart={() => startStage(activeStageId)}
              onStageMap={() => setScreen('STAGE_SELECT')}
            />
          )}
        </>
      )}
    </main>
  );
}
