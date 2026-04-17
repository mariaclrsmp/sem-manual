import type { PostgrestError } from '@supabase/supabase-js'

import type { Event, EventType } from '../types/database'
import * as achievementsService from './achievementsService'
import { supabase } from './supabase'

export async function registerEvent(
  userId: string,
  type: EventType,
  data: Record<string, unknown> = {},
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from('events').insert({ user_id: userId, type, data })
  if (error) return { error }

  await achievementsService.check(userId, type, data)
  return { error: null }
}

export async function fetchEvents(
  userId: string,
  type?: EventType,
  limit = 50,
): Promise<{ data: Event[]; error: PostgrestError | null }> {
  let query = supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  return { data: (data ?? []) as Event[], error }
}

export async function countEventsByType(
  userId: string,
  type: EventType,
): Promise<{ count: number; error: PostgrestError | null }> {
  const { count, error } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', type)

  return { count: count ?? 0, error }
}
