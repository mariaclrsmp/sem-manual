import type { PostgrestError } from '@supabase/supabase-js'

import type { User } from '../types/database'
import type { UserProfile } from '../stores/profileStore'
import type { UserLevel } from '../stores/userStore'
import { supabase } from './supabase'

export interface RemoteProfile {
  name?: string
  total_xp?: number
  level?: UserLevel
  home_type?: string | null
  has_pet?: boolean | null
  push_token?: string | null
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

type DbUser = {
  id: string
  name: string
  total_xp: number
  level: string
  profile: { home_type?: string | null; has_pet?: boolean | null; push_token?: string | null } | null
  created_at: string
}

function mapDbUser(raw: DbUser): User {
  return {
    id: raw.id,
    name: raw.name,
    total_xp: raw.total_xp,
    level: raw.level as User['level'],
    home_type: (raw.profile?.home_type as User['home_type']) ?? null,
    has_pet: raw.profile?.has_pet ?? null,
    push_token: raw.profile?.push_token ?? null,
    created_at: raw.created_at,
  }
}

export async function fetchProfile(
  userId: string,
): Promise<{ data: User | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, total_xp, level, profile, created_at')
    .eq('id', userId)
    .single()
  console.log('[userService] profile data:', JSON.stringify(data))
  console.log('[userService] profile error:', error)
  if (!data) return { data: null, error }
  return { data: mapDbUser(data as DbUser), error }
}

export async function ensureProfile(userId: string): Promise<User | null> {
  const { data: authData } = await supabase.auth.getUser()
  const meta = authData?.user?.user_metadata ?? {}
  const name: string =
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    (authData?.user?.email?.split('@')[0] ?? '')

  await supabase
    .from('users')
    .upsert({ id: userId, name, total_xp: 0, level: 'beginner' }, { onConflict: 'id' })

  const { data } = await supabase
    .from('users')
    .select('id, name, total_xp, level, profile, created_at')
    .eq('id', userId)
    .single()

  if (!data) return null
  return mapDbUser(data as DbUser)
}

export async function fetchAchievements(
  userId: string,
): Promise<{ data: { achievement_id: string; unlocked_at: string }[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', userId)
  return { data: (data ?? []) as { achievement_id: string; unlocked_at: string }[], error }
}

export async function updateProfile(
  userId: string,
  updates: Partial<RemoteProfile>,
): Promise<{ error: PostgrestError | null }> {
  const { home_type, has_pet, push_token, ...topLevelUpdates } = updates
  const profileFields: Record<string, unknown> = {}
  if (home_type !== undefined) profileFields.home_type = home_type
  if (has_pet !== undefined) profileFields.has_pet = has_pet
  if (push_token !== undefined) profileFields.push_token = push_token

  const dbUpdate: Record<string, unknown> = { ...topLevelUpdates }

  if (Object.keys(profileFields).length > 0) {
    const { data } = await supabase
      .from('users')
      .select('profile')
      .eq('id', userId)
      .single()
    dbUpdate.profile = { ...((data as { profile?: Record<string, unknown> } | null)?.profile ?? {}), ...profileFields }
  }

  const { error } = await supabase.from('users').update(dbUpdate).eq('id', userId)
  return { error }
}

export async function saveOnboardingProfile(
  userId: string,
  profile: UserProfile,
): Promise<{ error: PostgrestError | null }> {
  const { data: current } = await supabase
    .from('users')
    .select('profile')
    .eq('id', userId)
    .single()

  const { error } = await supabase
    .from('users')
    .update({
      name: profile.name,
      profile: {
        ...((current as { profile?: Record<string, unknown> } | null)?.profile ?? {}),
        home_type: profile.home_type,
        has_pet: profile.has_pet,
      },
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
    .select('total_xp, level')
    .eq('id', userId)
    .single()

  if (fetchError) {
    return { newXP: 0, leveledUp: false, newLevel: 'beginner', error: fetchError }
  }

  const currentXP = (current as { total_xp: number }).total_xp
  const currentLevel = (current as { level: UserLevel }).level
  const newXP = currentXP + amount
  const newLevel = resolveLevel(newXP)
  const leveledUp = newLevel !== currentLevel

  const { error: updateError } = await supabase
    .from('users')
    .update({ total_xp: newXP, level: newLevel })
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
