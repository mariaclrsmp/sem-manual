import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'

import * as authService from '../services/authService'
import { useTasksStore } from './tasksStore'
import { useUserStore } from './userStore'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean

  initialize: () => void
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,

  initialize: () => {
    authService.getCurrentSession().then(async (session) => {
      if (session) {
        await useUserStore.getState().loadData(session.user.id)
      }
      set({ session, user: session?.user ?? null, loading: false })
    })

    const subscription = authService.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user ?? null })

      if (event === 'SIGNED_IN' && session) {
        set({ loading: true })
        await useUserStore.getState().loadData(session.user.id)
        set({ loading: false })
      }

      if (event === 'SIGNED_OUT') {
        useUserStore.setState({ user: null, achievements: [], suggestions: [], notification: null })
        useTasksStore.setState({ todayTasks: [] })
      }
    })

    return () => subscription.unsubscribe()
  },

  signUp: async (name, email, password) => {
    set({ loading: true })
    const { error } = await authService.signUp(name, email, password)
    set({ loading: false })
    if (error) return { error: error.message }
    return { error: null }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    const { session, error } = await authService.signIn(email, password)
    if (error) {
      set({ loading: false })
      return { error: error.message }
    }
    if (session) {
      await useUserStore.getState().loadData(session.user.id)
      set({ session, user: session.user, loading: false })
    }
    return { error: null }
  },

  signOut: async () => {
    set({ loading: true })
    await authService.signOut()
    set({ session: null, user: null, loading: false })
    useUserStore.setState({ user: null, achievements: [], suggestions: [], notification: null })
    useTasksStore.setState({ todayTasks: [] })
  },
}))
