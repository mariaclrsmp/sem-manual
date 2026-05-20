import type { PostgrestError } from '@supabase/supabase-js'

import type { Task } from '../types/database'
import type { Suggestion } from '../stores/userStore'
import * as routinesService from './routinesService'
import * as tasksService from './tasksService'
import { supabase } from './supabase'

const VALID_TASK_CATEGORIES = new Set(['cleaning', 'grocery', 'home', 'pet', 'maintenance'])

function toTaskCategory(raw: string): Task['category'] {
  return VALID_TASK_CATEGORIES.has(raw) ? (raw as Task['category']) : 'home'
}

interface OverdueRoutine {
  id: string
  title: string
  category: string
  frequency_days: number
  last_done: string | null
}

const DEFAULT_XP: Record<string, number> = {
  cleaning: 15,
  grocery: 10,
  home: 10,
  pet: 20,
  maintenance: 25,
}

function buildOverdueSuggestion(routine: OverdueRoutine): Suggestion {
  const today = new Date()
  const lastDone = routine.last_done ? new Date(routine.last_done) : null
  const daysAgo = lastDone
    ? Math.floor((today.getTime() - lastDone.getTime()) / 86_400_000)
    : routine.frequency_days

  return {
    id: `routine:${routine.id}`,
    message: `Faz ${daysAgo} dia${daysAgo !== 1 ? 's' : ''} desde que voce ${routine.title.toLowerCase()}`,
    type: 'task',
    actionLabel: 'Adicionar a lista de hoje?',
    routineId: routine.id,
    category: routine.category,
  }
}

async function fetchOverdueRoutines(userId: string): Promise<OverdueRoutine[]> {
  const { data } = await supabase
    .from('routines')
    .select('id, title, category, frequency_days, last_done')
    .eq('user_id', userId)
    .eq('active', true)

  if (!data) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (data as OverdueRoutine[]).filter((r) => {
    if (!r.last_done) return true
    const due = new Date(r.last_done)
    due.setDate(due.getDate() + r.frequency_days)
    return due <= today
  })
}

async function loadTodaySuggestions(userId: string): Promise<Suggestion[] | null> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_suggestions')
    .select('id, message, action, type, routine_id')
    .eq('user_id', userId)
    .eq('date', today)
    .eq('read', false)
    .order('id', { ascending: true })

  if (error || !data || data.length === 0) return null

  return data.map((row: {
    id: string
    message: string
    action: string | null
    type: string
    routine_id: string | null
  }) => ({
    id: row.id,
    message: row.message,
    type: row.type as Suggestion['type'],
    actionLabel: row.action ?? undefined,
    routineId: row.routine_id ?? undefined,
  }))
}

async function persistSuggestions(userId: string, suggestions: Suggestion[]): Promise<void> {
  if (suggestions.length === 0) return

  const today = new Date().toISOString().split('T')[0]

  const rows = suggestions.map((s) => ({
    user_id: userId,
    message: s.message,
    action: s.actionLabel ?? null,
    type: s.type,
    date: today,
    read: false,
    routine_id: s.routineId ?? null,
  }))

  await supabase
    .from('daily_suggestions')
    .upsert(rows, { onConflict: 'user_id,message,date', ignoreDuplicates: true })
}

export async function generateDailySuggestions(userId: string): Promise<Suggestion[]> {
  const cached = await loadTodaySuggestions(userId)
  if (cached) return cached

  const suggestions: Suggestion[] = []

  const overdue = await fetchOverdueRoutines(userId)
  for (const routine of overdue.slice(0, 2)) {
    suggestions.push(buildOverdueSuggestion(routine))
  }

  const dayOfWeek = new Date().getDay()

  if (suggestions.length < 3 && dayOfWeek === 6) {
    const hasCleaningCovered = suggestions.some((s) => s.category === 'cleaning')
    if (!hasCleaningCovered) {
      suggestions.push({
        id: 'special:saturday_cleaning',
        message: 'Sabado e um otimo dia para uma faxina geral',
        type: 'tip',
        actionLabel: 'Adicionar a lista de hoje?',
        category: 'cleaning',
      })
    }
  }

  if (suggestions.length < 3 && dayOfWeek === 0) {
    suggestions.push({
      id: 'special:sunday_planning',
      message: 'Organize sua semana: veja o que precisa ser feito em casa',
      type: 'tip',
      actionLabel: 'Planejar a semana',
      category: 'home',
    })
  }

  const result = suggestions.slice(0, 3)
  await persistSuggestions(userId, result)
  return result
}

export async function markSuggestionRead(suggestionId: string): Promise<void> {
  if (suggestionId.startsWith('routine:') || suggestionId.startsWith('special:')) return
  await supabase
    .from('daily_suggestions')
    .update({ read: true })
    .eq('id', suggestionId)
}

export async function addSuggestionAsTask(
  userId: string,
  suggestion: Suggestion,
): Promise<{ data: Task | null; error: PostgrestError | null }> {
  const today = new Date().toISOString().split('T')[0]
  const category = toTaskCategory(suggestion.category ?? 'home')

  const { data, error } = await tasksService.createTask({
    user_id: userId,
    title: suggestion.message,
    category,
    xp: DEFAULT_XP[category] ?? 10,
    completed: false,
    date: today,
  })

  if (error) return { data: null, error }

  if (suggestion.routineId) {
    await routinesService.updateLastDone(suggestion.routineId)
  }

  if (suggestion.id && !suggestion.id.startsWith('routine:') && !suggestion.id.startsWith('special:')) {
    await markSuggestionRead(suggestion.id)
  }

  return { data, error: null }
}
