import type { PostgrestError } from '@supabase/supabase-js'

import * as eventsService from './eventsService'
import * as userService from './userService'
import { useUserStore } from '../stores/userStore'
import { supabase } from './supabase'

const GUIDE_XP = 20

export async function markAsRead(
  userId: string,
  guideId: string,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from('read_guides').upsert(
    { user_id: userId, guide_id: guideId, read_at: new Date().toISOString() },
    { onConflict: 'user_id,guide_id', ignoreDuplicates: true },
  )

  if (error) return { error }

  await eventsService.registerEvent(userId, 'guide_read', { guideId })

  await userService.addXP(userId, GUIDE_XP)
  useUserStore.getState().applyXPGain(GUIDE_XP)

  return { error: null }
}

export async function fetchRead(
  userId: string,
): Promise<{ data: string[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('read_guides')
    .select('guide_id')
    .eq('user_id', userId)

  const ids = (data ?? []).map((r: { guide_id: string }) => r.guide_id)
  return { data: ids, error }
}

export async function isRead(
  userId: string,
  guideId: string,
): Promise<{ data: boolean; error: PostgrestError | null }> {
  const { count, error } = await supabase
    .from('read_guides')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('guide_id', guideId)

  return { data: (count ?? 0) > 0, error }
}
