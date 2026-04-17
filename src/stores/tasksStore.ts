import { create } from 'zustand'

import type { Task } from '../types/database'
import * as tasksService from '../services/tasksService'
import { useUserStore } from './userStore'

export type { Task as TodayTask }
export type TaskCategory = Task['category']

interface TasksState {
  todayTasks: Task[]
  loading: boolean
  error: string | null

  loadTodayTasks: (userId: string) => Promise<void>
  completeTask: (taskId: string) => Promise<void>
  addTask: (data: Omit<Task, 'id' | 'created_at'>) => Promise<void>
}

export const useTasksStore = create<TasksState>()((set, get) => ({
  todayTasks: [],
  loading: false,
  error: null,

  loadTodayTasks: async (userId) => {
    set({ loading: true, error: null })
    const { data, error } = await tasksService.generateDailyTasks(userId)
    if (error) {
      set({ loading: false, error: error.message })
      return
    }
    set({ todayTasks: data, loading: false })
  },

  completeTask: async (taskId) => {
    const task = get().todayTasks.find((t) => t.id === taskId)
    if (!task || task.completed) return

    set((state) => ({
      todayTasks: state.todayTasks.map((t) =>
        t.id === taskId ? { ...t, completed: true } : t,
      ),
    }))

    const userId = useUserStore.getState().userId
    if (!userId) return

    const { error } = await tasksService.completeTask(taskId, userId)

    if (error) {
      set((state) => ({
        todayTasks: state.todayTasks.map((t) =>
          t.id === taskId ? { ...t, completed: false } : t,
        ),
        error: error.message,
      }))
      return
    }

    useUserStore.getState().applyXPGain(task.xp)
  },

  addTask: async (data) => {
    const { data: created, error } = await tasksService.createTask(data)
    if (error) {
      set({ error: error.message })
      return
    }
    if (created) {
      set((state) => ({ todayTasks: [...state.todayTasks, created] }))
    }
  },
}))
