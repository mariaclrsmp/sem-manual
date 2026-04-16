import { supabase } from './supabase'
import type { TaskCategory, TodayTask } from '../stores/tasksStore'

interface RawTask {
  id: string
  title: string
  category: TaskCategory
  xp: number
  completed: boolean
}

export async function generateDailyTasks(userId: string): Promise<TodayTask[]> {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing, error: fetchError } = await supabase
    .from('daily_tasks')
    .select('id, title, category, xp, completed')
    .eq('user_id', userId)
    .eq('date', today)

  if (fetchError) throw fetchError

  if (existing && existing.length > 0) {
    return (existing as RawTask[]).map((t) => ({ ...t }))
  }

  const { data: templates, error: templateError } = await supabase
    .from('task_templates')
    .select('id, title, category, xp')
    .limit(5)

  if (templateError) throw templateError
  if (!templates || templates.length === 0) return []

  const rows = templates.map((t: { id: string; title: string; category: TaskCategory; xp: number }) => ({
    user_id: userId,
    template_id: t.id,
    title: t.title,
    category: t.category,
    xp: t.xp,
    completed: false,
    date: today,
  }))

  const { data: inserted, error: insertError } = await supabase
    .from('daily_tasks')
    .insert(rows)
    .select('id, title, category, xp, completed')

  if (insertError) throw insertError

  return (inserted as RawTask[]).map((t) => ({ ...t }))
}

export async function completeTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('daily_tasks')
    .update({ completed: true })
    .eq('id', taskId)

  if (error) throw error
}
