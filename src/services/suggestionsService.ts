import type { PostgrestError } from '@supabase/supabase-js'

import type { Task } from '../types/database'
import type { Suggestion } from '../stores/userStore'
import * as routinesService from './routinesService'
import * as tasksService from './tasksService'
import { supabase } from './supabase'

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
    message: `It's been ${daysAgo} day${daysAgo !== 1 ? 's' : ''} since you ${routine.title.toLowerCase()}`,
    type: 'task',
    actionLabel: "Add to today's list?",
    routineId: routine.id,
    category: routine.category,
  }
}

export async function generateDailySuggestions(
  userId: string,
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = []

  const { data: overdue } = await supabase
    .from('rotinas_atrasadas')
    .select('id, title, category, frequency_days, last_done')
    .eq('user_id', userId)
    .limit(2)

  for (const routine of (overdue ?? []) as OverdueRoutine[]) {
    suggestions.push(buildOverdueSuggestion(routine))
  }

  const dayOfWeek = new Date().getDay()

  if (suggestions.length < 3 && dayOfWeek === 6) {
    const hasCleaningCovered = suggestions.some((s) => s.category === 'cleaning')
    if (!hasCleaningCovered) {
      suggestions.push({
        id: 'special:saturday_cleaning',
        message: "Saturday is a great day for a deep clean",
        type: 'tip',
        actionLabel: "Add to today's list?",
        category: 'cleaning',
      })
    }
  }

  if (suggestions.length < 3 && dayOfWeek === 0) {
    suggestions.push({
      id: 'special:sunday_planning',
      message: "Organize your week: check what needs to be done at home",
      type: 'tip',
      actionLabel: "Plan the week",
      category: 'home',
    })
  }

  return suggestions.slice(0, 3)
}

export async function addSuggestionAsTask(
  userId: string,
  suggestion: Suggestion,
): Promise<{ data: Task | null; error: PostgrestError | null }> {
  const today = new Date().toISOString().split('T')[0]
  const category = (suggestion.category ?? 'home') as Task['category']

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

  return { data, error: null }
}
