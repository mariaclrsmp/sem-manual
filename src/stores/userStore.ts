import { create } from 'zustand'

import type { Achievement, User } from '../types/database'
import type { UserProfile } from './profileStore'
import * as userService from '../services/userService'
import * as suggestionsService from '../services/suggestionsService'

export type UserLevel = 'beginner' | 'learner' | 'independent' | 'master'

export interface Suggestion {
  id: string
  message: string
  type: 'tip' | 'task' | 'guide'
  actionLabel?: string
  routineId?: string
  category?: string
}

export interface NotificationState {
  visible: boolean
  type: 'xp' | 'achievement'
  xpAmount?: number
  achievementTitle?: string
}

interface LevelBand {
  level: UserLevel
  label: string
  emoji: string
  minXP: number
  maxXP: number | null
}

const LEVEL_BANDS: LevelBand[] = [
  { level: 'beginner',    label: 'Iniciante',      emoji: '🌱', minXP: 0,    maxXP: 200  },
  { level: 'learner',     label: 'Aprendiz',       emoji: '🔧', minXP: 201,  maxXP: 500  },
  { level: 'independent', label: 'Independente',   emoji: '🏠', minXP: 501,  maxXP: 1000 },
  { level: 'master',      label: 'Mestre da Casa', emoji: '👑', minXP: 1001, maxXP: null },
]

function resolveLevel(xp: number): LevelBand {
  return [...LEVEL_BANDS].reverse().find((b) => xp >= b.minXP) ?? LEVEL_BANDS[0]
}

interface UserState {
  user: User | null
  achievements: Achievement[]
  suggestions: Suggestion[]
  loading: boolean
  error: string | null
  notification: NotificationState | null

  loadData: (userId: string) => Promise<void>
  updateXP: (amount: number) => Promise<void>
  saveProfile: (profile: UserProfile) => Promise<void>
  loadSuggestions: () => Promise<void>
  applyXPGain: (amount: number) => void
  unlockAchievement: (achievementId: string) => void
  clearNotification: () => void
}

export const useUserStore = create<UserState>()((set, get) => ({
  user: null,
  achievements: [],
  suggestions: [],
  loading: false,
  error: null,
  notification: null,

  loadData: async (userId) => {
    set({ loading: true, error: null })

    const [
      { data: profile, error: profileError },
      { data: remoteAchievements, error: achievementsError },
      suggestions,
    ] = await Promise.all([
      userService.fetchProfile(userId),
      userService.fetchAchievements(userId),
      suggestionsService.generateDailySuggestions(userId),
    ])

    if (profileError || !profile) {
      set({ loading: false, error: profileError?.message ?? 'Erro ao carregar perfil' })
      return
    }

    if (achievementsError) {
      set({ loading: false, error: achievementsError.message })
      return
    }

    set({
      user: profile,
      achievements: remoteAchievements as Achievement[],
      suggestions,
      loading: false,
    })
  },

  updateXP: async (amount) => {
    if (amount <= 0) return

    const currentUser = get().user
    if (!currentUser) return

    const previousXP = currentUser.xp_total
    const previousLevel = currentUser.level
    const optimisticXP = previousXP + amount
    const optimisticBand = resolveLevel(optimisticXP)
    const leveledUp = optimisticBand.level !== previousLevel

    set({
      user: { ...currentUser, xp_total: optimisticXP, level: optimisticBand.level },
      notification: leveledUp
        ? { visible: true, type: 'achievement', achievementTitle: `Você chegou ao nível ${optimisticBand.label}!` }
        : { visible: true, type: 'xp', xpAmount: amount },
    })

    const { newXP, newLevel, error } = await userService.addXP(currentUser.id, amount)

    if (error) {
      set({
        user: { ...currentUser, xp_total: previousXP, level: previousLevel },
        error: error.message,
      })
      return
    }

    set((state) => ({
      user: state.user ? { ...state.user, xp_total: newXP, level: newLevel } : null,
    }))
  },

  saveProfile: async (profile) => {
    const userId = get().user?.id
    if (!userId) return

    const { error } = await userService.saveOnboardingProfile(userId, profile)
    if (error) {
      set({ error: error.message })
      return
    }

    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            name: profile.name,
            home_type: profile.home_type,
            has_pet: profile.has_pet,
          }
        : null,
    }))
  },

  loadSuggestions: async () => {
    const userId = get().user?.id
    if (!userId) return
    const suggestions = await suggestionsService.generateDailySuggestions(userId)
    set({ suggestions })
  },

  applyXPGain: (amount) => {
    if (amount <= 0) return
    const currentUser = get().user
    if (!currentUser) return

    const newXP = currentUser.xp_total + amount
    const newBand = resolveLevel(newXP)
    const leveledUp = newBand.level !== currentUser.level

    set({
      user: { ...currentUser, xp_total: newXP, level: newBand.level },
      notification: leveledUp
        ? { visible: true, type: 'achievement', achievementTitle: `Você chegou ao nível ${newBand.label}!` }
        : { visible: true, type: 'xp', xpAmount: amount },
    })
  },

  unlockAchievement: (achievementId) => {
    const already = get().achievements.some((a) => a.achievement_id === achievementId)
    if (already) return
    const userId = get().user?.id ?? ''
    const entry: Achievement = {
      id: '',
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
    }
    set((state) => ({ achievements: [...state.achievements, entry] }))
  },

  clearNotification: () => set({ notification: null }),
}))

export function useCurrentLevelInfo() {
  const user = useUserStore((s) => s.user)
  const xp = user?.xp_total ?? 0
  const band = resolveLevel(xp)
  const nextBand = LEVEL_BANDS[LEVEL_BANDS.indexOf(band) + 1] ?? null

  const currentLevelXP = xp - band.minXP
  const levelTotalXP = band.maxXP !== null ? band.maxXP - band.minXP : 0
  const levelProgress = levelTotalXP > 0 ? currentLevelXP / levelTotalXP : 1
  const xpToNextLevel = band.maxXP !== null ? band.maxXP - xp : 0

  return {
    level: band.level,
    label: band.label,
    emoji: band.emoji,
    nextLabel: nextBand?.label ?? null,
    levelProgress: Math.min(levelProgress, 1),
    currentLevelXP,
    levelTotalXP,
    xpToNextLevel,
  }
}
