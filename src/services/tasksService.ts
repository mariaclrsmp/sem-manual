import type { PostgrestError } from '@supabase/supabase-js'

import type { Task } from '../types/database'
import * as userService from './userService'
import { supabase } from './supabase'

type TaskInsert = Omit<Task, 'id' | 'created_at'>

const DEFAULT_XP: Record<string, number> = {
  cleaning: 15,
  grocery: 10,
  home: 10,
  pet: 20,
  maintenance: 25,
}

const FALLBACK_TASKS: Omit<TaskInsert, 'user_id' | 'date' | 'completed'>[] = [
  { title: 'Lavar a louça do dia',                       category: 'cleaning', xp: 15 },
  { title: 'Passar pano no banheiro',                    category: 'cleaning', xp: 20 },
  { title: 'Verificar o que está acabando na geladeira', category: 'grocery',  xp: 10 },
  { title: 'Tirar o lixo',                               category: 'home',     xp: 10 },
  { title: 'Organizar a cama pela manhã',                category: 'home',     xp:  5 },
]

export async function fetchTodayTasks(
  userId: string,
): Promise<{ data: Task[]; error: PostgrestError | null }> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('completed', { ascending: true })
    .order('created_at', { ascending: true })

  return { data: (data ?? []) as Task[], error }
}

export async function createTask(
  data: TaskInsert,
): Promise<{ data: Task | null; error: PostgrestError | null }> {
  const { data: inserted, error } = await supabase
    .from('tasks')
    .insert(data)
    .select()
    .single()

  return { data: inserted as Task | null, error }
}

export async function completeTask(
  taskId: string,
  userId: string,
): Promise<{ error: PostgrestError | null }> {
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('id, title, category, xp')
    .eq('id', taskId)
    .single()

  if (fetchError) return { error: fetchError }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({ completed: true })
    .eq('id', taskId)

  if (updateError) return { error: updateError }

  const { xp, title, category } = task as { xp: number; title: string; category: string }

  const { error: xpError } = await userService.addXP(userId, xp)
  if (xpError) return { error: xpError }

  await supabase.from('events').insert({
    user_id: userId,
    type: 'task_completed',
    data: { taskId, title, category, xp },
  })

  return { error: null }
}

export async function generateDailyTasks(
  userId: string,
): Promise<{ data: Task[]; error: PostgrestError | null }> {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing, error: existingError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)

  if (existingError) return { data: [], error: existingError }
  if (existing && existing.length > 0) return { data: existing as Task[], error: null }

  const { data: routines, error: routinesError } = await supabase
    .from('routines')
    .select('id, title, category')
    .eq('user_id', userId)
    .eq('active', true)
    .limit(5)

  if (routinesError) return { data: [], error: routinesError }

  const rows: TaskInsert[] =
    routines && routines.length > 0
      ? (routines as { title: string; category: string }[]).map((r) => ({
          user_id: userId,
          title: r.title,
          category: r.category as Task['category'],
          xp: DEFAULT_XP[r.category] ?? 10,
          completed: false,
          date: today,
        }))
      : FALLBACK_TASKS.map((t) => ({
          ...t,
          user_id: userId,
          completed: false,
          date: today,
        }))

  const { data: inserted, error: insertError } = await supabase
    .from('tasks')
    .insert(rows)
    .select()

  if (insertError) return { data: [], error: insertError }

  return { data: (inserted ?? []) as Task[], error: null }
}

export async function deleteTask(
  taskId: string,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  return { error }
}
