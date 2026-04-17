import type { PostgrestError } from '@supabase/supabase-js'

import type { User } from '../types/database'
import type { UserProfile } from '../stores/profileStore'
import type { UserLevel } from '../stores/userStore'
import { supabase } from './supabase'

export interface RemoteProfile {
  name: string
  xp_total: number
  level: UserLevel
  home_type?: string | null
  has_pet?: boolean | null
  push_token?: string | null
}

export interface RemoteAchievement {
  achievement_id: string
  unlocked_at: string
}

const LEVEL_BANDS: { level: UserLevel; minXP: number }[] = [
  { level: 'beginner',    minXP: 0    },
  { level: 'learner',     minXP: 201  },
  { level: 'independent', minXP: 501  },
  { level: 'master',      minXP: 1001 },
]

function resolveLevel(xp: number): UserLevel {
  return [...LEVEL_BANDS].reverse().find((b) => xp >= b.minXP)?.level ?? 'beginner'
}

export async function fetchProfile(
  userId: string,
): Promise<{ data: User | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, xp_total, level, home_type, has_pet, push_token, created_at')
    .eq('id', userId)
    .single()
  return { data: data as User | null, error }
}

export async function fetchAchievements(
  userId: string,
): Promise<{ data: RemoteAchievement[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', userId)
  return { data: (data ?? []) as RemoteAchievement[], error }
}

export async function updateProfile(
  userId: string,
  updates: Partial<RemoteProfile>,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
  return { error }
}

export async function saveOnboardingProfile(
  userId: string,
  profile: UserProfile,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('users')
    .update({
      name: profile.name,
      home_type: profile.home_type,
      has_pet: profile.has_pet,
    })
    .eq('id', userId)
  return { error }
}

export async function addXP(
  userId: string,
  amount: number,
): Promise<{ newXP: number; leveledUp: boolean; newLevel: UserLevel; error: PostgrestError | null }> {
  const { data: current, error: fetchError } = await supabase
    .from('users')
    .select('xp_total, level')
    .eq('id', userId)
    .single()

  if (fetchError) {
    return { newXP: 0, leveledUp: false, newLevel: 'beginner', error: fetchError }
  }

  const currentXP = (current as { xp_total: number }).xp_total
  const currentLevel = (current as { level: UserLevel }).level
  const newXP = currentXP + amount
  const newLevel = resolveLevel(newXP)
  const leveledUp = newLevel !== currentLevel

  const { error: updateError } = await supabase
    .from('users')
    .update({ xp_total: newXP, level: newLevel })
    .eq('id', userId)

  if (updateError) {
    return { newXP: currentXP, leveledUp: false, newLevel: currentLevel, error: updateError }
  }

  if (leveledUp) {
    await supabase.from('events').insert({
      user_id: userId,
      type: 'level_up',
      data: { previousLevel: currentLevel, newLevel, xp: newXP },
    })
  }

  return { newXP, leveledUp, newLevel, error: null }
}

export async function unlockAchievement(
  userId: string,
  achievementId: string,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('achievements')
    .upsert(
      {
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,achievement_id' },
    )
  return { error }
}
