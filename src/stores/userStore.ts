import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as userService from '../services/userService';
import * as suggestionsService from '../services/suggestionsService';

export type UserLevel = 'beginner' | 'learner' | 'independent' | 'master';

export interface Achievement {
  id: string;
  unlockedAt: string;
}

export interface Suggestion {
  id: string;
  message: string;
  type: 'tip' | 'task' | 'guide';
  actionLabel?: string;
}

export interface NotificationState {
  visible: boolean;
  type: 'xp' | 'achievement';
  xpAmount?: number;
  achievementTitle?: string;
}

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
  userId: string | null;
  name: string;
  level: UserLevel;
  xpTotal: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
  notification: NotificationState | null;

  loadData: (userId: string) => Promise<void>;
  loadSuggestions: () => Promise<void>;
  updateXP: (amount: number) => Promise<void>;
  unlockAchievement: (id: string) => void;
  setName: (name: string) => void;
  clearNotification: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      name: '',
      level: 'beginner',
      xpTotal: 0,
      xpToNextLevel: calculateXpToNextLevel(0),
      achievements: [],
      suggestions: [],
      loading: false,
      error: null,
      notification: null,

      loadData: async (userId) => {
        set({ loading: true, error: null, userId });
        try {
          const [profile, remoteAchievements] = await Promise.all([
            userService.fetchProfile(userId),
            userService.fetchAchievements(userId),
          ]);

          const band = resolveLevel(profile.xp_total);
          const achievements: Achievement[] = remoteAchievements.map((a) => ({
            id: a.achievement_id,
            unlockedAt: a.unlocked_at,
          }));

          set({
            name: profile.name,
            level: band.level,
            xpTotal: profile.xp_total,
            xpToNextLevel: calculateXpToNextLevel(profile.xp_total),
            achievements,
            loading: false,
          });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
        }
      },

      loadSuggestions: async () => {
        const userId = get().userId;
        if (!userId) return;
        try {
          const suggestions = await suggestionsService.generateDailySuggestions(userId);
          set({ suggestions });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },

      updateXP: async (amount) => {
        if (amount <= 0) return;

        const userId = get().userId;
        const previousLevel = get().level;
        const newXP = get().xpTotal + amount;
        const newBand = resolveLevel(newXP);
        const leveledUp = newBand.level !== previousLevel;

        set({
          xpTotal: newXP,
          level: newBand.level,
          xpToNextLevel: calculateXpToNextLevel(newXP),
          notification: leveledUp
            ? { visible: true, type: 'achievement', achievementTitle: `Você chegou ao nível ${newBand.label}!` }
            : { visible: true, type: 'xp', xpAmount: amount },
        });

        if (!userId) return;
        try {
          await userService.addXP(userId, amount, newXP, newBand.level);
        } catch (e) {
          const previousXP = get().xpTotal - amount;
          const previousBand = resolveLevel(previousXP);
          set({
            xpTotal: previousXP,
            level: previousBand.level,
            xpToNextLevel: calculateXpToNextLevel(previousXP),
            error: (e as Error).message,
          });
        }
      },

      unlockAchievement: (id) => {
        const already = get().achievements.some((a) => a.id === id);
        if (already) return;
        const entry: Achievement = { id, unlockedAt: new Date().toISOString() };
        set((state) => ({ achievements: [...state.achievements, entry] }));

        const userId = get().userId;
        if (userId) {
          userService.unlockAchievement(userId, id).catch(() => {});
        }
      },

      setName: (name) => {
        set({ name: name.trim() });
      },

      clearNotification: () => {
        set({ notification: null });
      },
    }),
    {
      name: 'sem-manual:user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
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
