import type { Achievement, EventType } from '../types/database'
import { ACHIEVEMENTS } from '../constants/achievements'
import { useUserStore } from '../stores/userStore'
import * as userService from './userService'
import { supabase } from './supabase'

export async function fetchAchievements(
  userId: string,
): Promise<{ data: Achievement[]; error: unknown }> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })

  return { data: (data ?? []) as Achievement[], error }
}

export async function unlock(
  userId: string,
  achievementId: string,
): Promise<boolean> {
  const { error } = await supabase.from('achievements').insert({
    user_id: userId,
    achievement_id: achievementId,
    unlocked_at: new Date().toISOString(),
  })

  if (error) {
    if ((error as { code?: string }).code === '23505') return false
    return false
  }

  const definition = ACHIEVEMENTS.find((a) => a.id === achievementId)

  await supabase.from('events').insert({
    user_id: userId,
    type: 'achievement_unlocked',
    data: { achievementId, title: definition?.title ?? achievementId },
  })

  if (definition && definition.xpReward > 0) {
    await userService.addXP(userId, definition.xpReward)
    useUserStore.getState().applyXPGain(definition.xpReward)
  }

  useUserStore.setState({
    notification: {
      visible: true,
      type: 'achievement',
      achievementTitle: definition
        ? `${definition.emoji} ${definition.title}`
        : achievementId,
    },
  })

  useUserStore.setState((state) => ({
    achievements: [
      ...state.achievements,
      { id: achievementId, unlockedAt: new Date().toISOString() },
    ],
  }))

  return true
}

async function countEvents(userId: string, type: EventType): Promise<number> {
  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', type)
  return count ?? 0
}

async function hasSevenDayStreak(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('events')
    .select('created_at')
    .eq('user_id', userId)
    .eq('type', 'task_completed')
    .order('created_at', { ascending: false })
    .limit(60)

  if (!data || data.length === 0) return false

  const distinctDates = [
    ...new Set(data.map((e: { created_at: string }) => e.created_at.split('T')[0])),
  ]
    .sort()
    .reverse()

  if (distinctDates.length < 7) return false

  for (let i = 0; i < 6; i++) {
    const diff =
      (new Date(distinctDates[i]).getTime() - new Date(distinctDates[i + 1]).getTime()) /
      86_400_000
    if (diff !== 1) return false
  }

  return true
}

export async function check(
  userId: string,
  eventType: EventType,
  data: Record<string, unknown> = {},
): Promise<void> {
  switch (eventType) {
    case 'task_completed': {
      const total = await countEvents(userId, 'task_completed')
      if (total === 1) await unlock(userId, 'first_task')

      const streak = await hasSevenDayStreak(userId)
      if (streak) await unlock(userId, 'seven_day_streak')
      break
    }

    case 'guide_read': {
      const total = await countEvents(userId, 'guide_read')
      if (total === 1) await unlock(userId, 'first_guide')
      if (total >= 5) await unlock(userId, 'five_guides_read')
      break
    }

    case 'emergency_used': {
      const total = await countEvents(userId, 'emergency_used')
      if (total === 1) await unlock(userId, 'emergency_used')
      break
    }

    case 'level_up': {
      const newLevel = data.newLevel as string | undefined
      if (newLevel === 'learner')     await unlock(userId, 'reached_apprentice')
      if (newLevel === 'independent') await unlock(userId, 'reached_independent')
      if (newLevel === 'master')      await unlock(userId, 'reached_master')
      break
    }

    case 'diagnostic_done': {
      const total = await countEvents(userId, 'diagnostic_done')
      if (total === 1) await unlock(userId, 'diagnostic_done')
      break
    }

    default:
      break
  }
}
