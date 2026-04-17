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
  routineId?: string;
  category?: string;
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
  applyXPGain: (amount: number) => void;
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

        const [{ data: profile, error: profileError }, { data: remoteAchievements, error: achievementsError }] =
          await Promise.all([
            userService.fetchProfile(userId),
            userService.fetchAchievements(userId),
          ]);

        if (profileError || !profile) {
          set({ loading: false, error: profileError?.message ?? 'Erro ao carregar perfil' });
          return;
        }

        if (achievementsError) {
          set({ loading: false, error: achievementsError.message });
          return;
        }

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
      },

      loadSuggestions: async () => {
        const userId = get().userId;
        if (!userId) return;
        const suggestions = await suggestionsService.generateDailySuggestions(userId);
        set({ suggestions });
      },

      updateXP: async (amount) => {
        if (amount <= 0) return;

        const userId = get().userId;
        const previousXP = get().xpTotal;
        const previousLevel = get().level;
        const optimisticXP = previousXP + amount;
        const optimisticBand = resolveLevel(optimisticXP);
        const optimisticLevelUp = optimisticBand.level !== previousLevel;

        set({
          xpTotal: optimisticXP,
          level: optimisticBand.level,
          xpToNextLevel: calculateXpToNextLevel(optimisticXP),
          notification: optimisticLevelUp
            ? { visible: true, type: 'achievement', achievementTitle: `Você chegou ao nível ${optimisticBand.label}!` }
            : { visible: true, type: 'xp', xpAmount: amount },
        });

        if (!userId) return;

        const { newXP, newLevel, error } = await userService.addXP(userId, amount);

        if (error) {
          const revertBand = resolveLevel(previousXP);
          set({
            xpTotal: previousXP,
            level: revertBand.level,
            xpToNextLevel: calculateXpToNextLevel(previousXP),
            error: error.message,
          });
          return;
        }

        set({
          xpTotal: newXP,
          level: newLevel,
          xpToNextLevel: calculateXpToNextLevel(newXP),
        });
      },

      applyXPGain: (amount) => {
        if (amount <= 0) return;
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
      },

      unlockAchievement: (id) => {
        const already = get().achievements.some((a) => a.id === id);
        if (already) return;
        const entry: Achievement = { id, unlockedAt: new Date().toISOString() };
        set((state) => ({ achievements: [...state.achievements, entry] }));

        const userId = get().userId;
        if (userId) {
          userService.unlockAchievement(userId, id);
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
