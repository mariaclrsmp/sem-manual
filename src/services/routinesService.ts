import type { PostgrestError } from '@supabase/supabase-js'

import type { Routine } from '../types/database'
import type { UserProfile } from '../stores/profileStore'
import { supabase } from './supabase'

type RoutineInsert = Omit<Routine, 'id'>

interface DefaultRoutineTemplate {
  title: string
  category: Routine['category']
  frequency_days: number
}

const BASE_ROUTINES: DefaultRoutineTemplate[] = [
  { title: 'Wash clothes',      category: 'cleaning', frequency_days: 7  },
  { title: 'Clean bathroom',    category: 'cleaning', frequency_days: 7  },
  { title: 'Mop the floor',     category: 'cleaning', frequency_days: 3  },
  { title: 'Wash dishes',       category: 'cleaning', frequency_days: 1  },
  { title: 'Take out trash',    category: 'home',     frequency_days: 2  },
  { title: 'Change bed sheets', category: 'home',     frequency_days: 14 },
]

const PET_ROUTINES: DefaultRoutineTemplate[] = [
  { title: 'Feed pet',       category: 'pet', frequency_days: 1 },
  { title: 'Clean pet area', category: 'pet', frequency_days: 3 },
]

export async function fetchRoutines(
  userId: string,
): Promise<{ data: Routine[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('frequency_days', { ascending: true })

  return { data: (data ?? []) as Routine[], error }
}

export async function createRoutine(
  data: RoutineInsert,
): Promise<{ data: Routine | null; error: PostgrestError | null }> {
  const { data: inserted, error } = await supabase
    .from('routines')
    .insert(data)
    .select()
    .single()

  return { data: inserted as Routine | null, error }
}

export async function updateLastDone(
  routineId: string,
): Promise<{ error: PostgrestError | null }> {
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('routines')
    .update({ last_done: today })
    .eq('id', routineId)

  return { error }
}

export async function createDefaultRoutines(
  userId: string,
  profile: UserProfile,
): Promise<{ error: PostgrestError | null }> {
  const templates = profile.has_pet
    ? [...BASE_ROUTINES, ...PET_ROUTINES]
    : BASE_ROUTINES

  const rows: RoutineInsert[] = templates.map((t) => ({
    user_id: userId,
    title: t.title,
    category: t.category,
    frequency_days: t.frequency_days,
    last_done: null,
    active: true,
  }))

  const { error } = await supabase.from('routines').insert(rows)
  return { error }
}
