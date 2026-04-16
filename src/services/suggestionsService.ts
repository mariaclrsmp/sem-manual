import { supabase } from './supabase'
import type { Suggestion } from '../stores/userStore'

interface RawSuggestion {
  id: string
  message: string
  type: 'tip' | 'task' | 'guide'
  action_label: string | null
}

export async function generateDailySuggestions(userId: string): Promise<Suggestion[]> {
  const { data, error } = await supabase
    .from('suggestions')
    .select('id, message, type, action_label')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error

  return ((data ?? []) as RawSuggestion[]).map((s) => ({
    id: s.id,
    message: s.message,
    type: s.type,
    actionLabel: s.action_label ?? undefined,
  }))
}

export async function addSuggestionAsTask(
  userId: string,
  suggestion: Suggestion,
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('daily_tasks').insert({
    user_id: userId,
    title: suggestion.message,
    category: 'home',
    xp: 15,
    completed: false,
    date: today,
    source_suggestion_id: suggestion.id,
  })

  if (error) throw error
}
