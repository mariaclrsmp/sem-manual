import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import * as tasksService from "../services/tasksService";

export type TaskCategory = "cleaning" | "grocery" | "home" | "pet";

export interface TodayTask {
  id: string;
  title: string;
  category: TaskCategory;
  completed: boolean;
  xp: number;
}

interface TasksState {
  todayTasks: TodayTask[];
  todayXP: number;
  loading: boolean;
  error: string | null;

  loadTodayTasks: (userId: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  addTask: (task: TodayTask) => void;
  resetDay: () => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      todayTasks: [],
      todayXP: 0,
      loading: false,
      error: null,

      loadTodayTasks: async (userId) => {
        set({ loading: true, error: null });
        try {
          const tasks = await tasksService.generateDailyTasks(userId);
          const completedXP = tasks
            .filter((t) => t.completed)
            .reduce((sum, t) => sum + t.xp, 0);
          set({ todayTasks: tasks, todayXP: completedXP, loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
        }
      },

      completeTask: async (id) => {
        const task = get().todayTasks.find((t) => t.id === id);
        if (!task || task.completed) return;

        set((state) => ({
          todayTasks: state.todayTasks.map((t) =>
            t.id === id ? { ...t, completed: true } : t,
          ),
          todayXP: state.todayXP + task.xp,
        }));

        try {
          await tasksService.completeTask(id);
        } catch (e) {
          set((state) => ({
            todayTasks: state.todayTasks.map((t) =>
              t.id === id ? { ...t, completed: false } : t,
            ),
            todayXP: state.todayXP - task.xp,
            error: (e as Error).message,
          }));
        }
      },

      addTask: (task) => {
        set((state) => ({ todayTasks: [...state.todayTasks, task] }));
      },

      resetDay: () => {
        set((state) => ({
          todayTasks: state.todayTasks.map((t) => ({ ...t, completed: false })),
          todayXP: 0,
        }));
      },
    }),
    {
      name: "sem-manual:tasks",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        todayTasks: state.todayTasks,
        todayXP: state.todayXP,
      }),
    },
  ),
);
