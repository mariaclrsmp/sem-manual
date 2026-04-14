import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserLevel = 'beginner' | 'learner' | 'independent' | 'master';

interface LevelBand {
  level: UserLevel;
  label: string;
  emoji: string;
  minXP: number;
  maxXP: number | null;
}

const LEVEL_BANDS: LevelBand[] = [
  { level: 'beginner',    label: 'Iniciante',      emoji: '🌱', minXP: 0,    maxXP: 200  },
  { level: 'learner',     label: 'Aprendiz',       emoji: '🔧', minXP: 201,  maxXP: 500  },
  { level: 'independent', label: 'Independente',   emoji: '🏠', minXP: 501,  maxXP: 1000 },
  { level: 'master',      label: 'Mestre da Casa', emoji: '👑', minXP: 1001, maxXP: null },
];

function resolveLevel(xp: number): LevelBand {
  return [...LEVEL_BANDS].reverse().find((b) => xp >= b.minXP) ?? LEVEL_BANDS[0];
}

function calculateXpToNextLevel(xp: number): number {
  const band = resolveLevel(xp);
  if (band.maxXP === null) return 0;
  return band.maxXP - xp;
}

interface UserState {
  name: string;
  level: UserLevel;
  xpTotal: number;
  xpToNextLevel: number;
  achievements: string[];

  addXP: (amount: number) => boolean | void;
  unlockAchievement: (id: string) => void;
  setName: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      level: 'beginner',
      xpTotal: 0,
      xpToNextLevel: calculateXpToNextLevel(0),
      achievements: [],

      addXP: (amount) => {
        if (amount <= 0) return;

        const newXP = get().xpTotal + amount;
        const previousLevel = get().level;
        const newBand = resolveLevel(newXP);

        set({
          xpTotal: newXP,
          level: newBand.level,
          xpToNextLevel: calculateXpToNextLevel(newXP),
        });

        return newBand.level !== previousLevel;
      },

      unlockAchievement: (id) => {
        if (get().achievements.includes(id)) return;
        set((state) => ({ achievements: [...state.achievements, id] }));
      },

      setName: (name) => {
        set({ name: name.trim() });
      },
    }),
    {
      name: 'sem-manual:user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        name: state.name,
        level: state.level,
        xpTotal: state.xpTotal,
        xpToNextLevel: state.xpToNextLevel,
        achievements: state.achievements,
      }),
    },
  ),
);

export function useCurrentLevelInfo() {
  const xpTotal = useUserStore((s) => s.xpTotal);
  const band = resolveLevel(xpTotal);
  const nextBand = LEVEL_BANDS[LEVEL_BANDS.indexOf(band) + 1] ?? null;

  const currentLevelXP = xpTotal - band.minXP;
  const levelTotalXP = band.maxXP !== null ? band.maxXP - band.minXP : 0;
  const levelProgress = levelTotalXP > 0 ? currentLevelXP / levelTotalXP : 1;

  return {
    level: band.level,
    label: band.label,
    emoji: band.emoji,
    nextLabel: nextBand?.label ?? null,
    levelProgress: Math.min(levelProgress, 1),
    currentLevelXP,
    levelTotalXP,
  };
}
