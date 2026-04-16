import { supabase } from './supabase'
import type { UserLevel } from '../stores/userStore'

export interface RemoteProfile {
  name: string
  xp_total: number
  level: UserLevel
}

export interface RemoteAchievement {
  achievement_id: string
  unlocked_at: string
}

export async function fetchProfile(userId: string): Promise<RemoteProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, xp_total, level')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as RemoteProfile
}

export async function fetchAchievements(userId: string): Promise<RemoteAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', userId)

  if (error) throw error
  return (data ?? []) as RemoteAchievement[]
}

export async function addXP(
  userId: string,
  amount: number,
  newTotal: number,
  newLevel: UserLevel,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ xp_total: newTotal, level: newLevel })
    .eq('id', userId)

  if (error) throw error
}

export async function updateProfile(
  userId: string,
  updates: Partial<RemoteProfile & { push_token: string }>,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) throw error
}

export async function unlockAchievement(
  userId: string,
  achievementId: string,
): Promise<void> {
  const { error } = await supabase
    .from('user_achievements')
    .upsert(
      { user_id: userId, achievement_id: achievementId, unlocked_at: new Date().toISOString() },
      { onConflict: 'user_id,achievement_id' },
    )

  if (error) throw error
}
