export interface UserProfile {
  home_type: 'studio' | 'apartment' | 'house'
  has_pet: boolean
  lifestyle: 'survivor' | 'organized' | 'fitness' | 'saver'
  diagnostic_result?: {
    level: string
    score: number
    categories: Record<string, number>
  }
  push_token?: string
}

export interface User {
  id: string
  name: string
  xp_total: number
  level: 'beginner' | 'apprentice' | 'independent' | 'master'
  profile: UserProfile
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  category: 'cleaning' | 'shopping' | 'home' | 'pet' | 'maintenance'
  completed: boolean
  xp: number
  date: string
  created_at: string
}

export interface Routine {
  id: string
  user_id: string
  title: string
  category: string
  frequency_days: number
  last_done: string | null
  active: boolean
}

export type EventType =
  | 'task_completed'
  | 'guide_read'
  | 'emergency_used'
  | 'achievement_unlocked'
  | 'diagnostic_done'
  | 'level_up'

export interface Event {
  id: string
  user_id: string
  type: EventType
  data: Record<string, unknown>
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export interface GuideRead {
  user_id: string
  guide_id: string
  read_at: string
}

export interface Suggestion {
  id: string
  message: string
  action?: string
  type: 'alert' | 'tip' | 'achievement'
  routine_id?: string
}
