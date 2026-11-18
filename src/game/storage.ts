import type {DifficultyMode, SaveData, StageRecord} from './types';

const STORAGE_KEY = 'pipoca_capivara_save_v1';

const DEFAULT_SAVE: SaveData = {
  mode: 'pequenos',
  highestUnlockedStage: 1,
  unlockAll: false,
  muted: false,
  voiceEnabled: true,
  showTouchControlsOnDesktop: true,
  records: {},
};

export function loadSaveData(): SaveData {
  if (typeof window === 'undefined') return {...DEFAULT_SAVE};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {...DEFAULT_SAVE};
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      mode: parsed.mode === 'aventura' ? 'aventura' : 'pequenos',
      highestUnlockedStage: Math.max(1, Math.min(8, parsed.highestUnlockedStage ?? 1)),
      unlockAll: Boolean(parsed.unlockAll),
      muted: Boolean(parsed.muted),
      voiceEnabled: parsed.voiceEnabled ?? true,
      showTouchControlsOnDesktop: parsed.showTouchControlsOnDesktop ?? true,
      records: parsed.records ?? {},
    };
  } catch {
    return {...DEFAULT_SAVE};
  }
}

export function persistSaveData(data: SaveData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota issues gracefully
  }
}

export function recordStageVictory(
  current: SaveData,
  stageId: number,
  score: number,
  tangerines: number,
  goldenSecrets: [boolean, boolean, boolean],
  timeSec: number
): SaveData {
  const prev: StageRecord = current.records[stageId] ?? {
    completed: false,
    bestScore: 0,
    bestTangerines: 0,
    goldenSecrets: [false, false, false],
    bestTimeSec: null,
  };

  const mergedGolden: [boolean, boolean, boolean] = [
    prev.goldenSecrets[0] || goldenSecrets[0],
    prev.goldenSecrets[1] || goldenSecrets[1],
    prev.goldenSecrets[2] || goldenSecrets[2],
  ];

  const updated: SaveData = {
    ...current,
    highestUnlockedStage: Math.max(
      current.highestUnlockedStage,
      Math.min(8, stageId + 1)
    ),
    records: {
      ...current.records,
      [stageId]: {
        completed: true,
        bestScore: Math.max(prev.bestScore, score),
        bestTangerines: Math.max(prev.bestTangerines, tangerines),
        goldenSecrets: mergedGolden,
        bestTimeSec:
          prev.bestTimeSec === null ? timeSec : Math.min(prev.bestTimeSec, timeSec),
      },
    },
  };
  persistSaveData(updated);
  return updated;
}

export function setSaveMode(current: SaveData, mode: DifficultyMode): SaveData {
  const updated = {...current, mode};
  persistSaveData(updated);
  return updated;
}
