import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import * as tasksService from "../services/tasksService";
import { useUserStore } from "./userStore";

export type TaskCategory = "cleaning" | "grocery" | "home" | "pet" | "maintenance";

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
  deleteTask: (id: string) => Promise<void>;
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
        const { data, error } = await tasksService.generateDailyTasks(userId);
        if (error) {
          set({ loading: false, error: error.message });
          return;
        }
        const completedXP = data
          .filter((t) => t.completed)
          .reduce((sum, t) => sum + t.xp, 0);
        set({ todayTasks: data as TodayTask[], todayXP: completedXP, loading: false });
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

        const userId = useUserStore.getState().userId;
        if (!userId) return;

        const { error } = await tasksService.completeTask(id, userId);

        if (error) {
          set((state) => ({
            todayTasks: state.todayTasks.map((t) =>
              t.id === id ? { ...t, completed: false } : t,
            ),
            todayXP: state.todayXP - task.xp,
            error: error.message,
          }));
          return;
        }

        useUserStore.getState().applyXPGain(task.xp);
      },

      addTask: (task) => {
        set((state) => ({ todayTasks: [...state.todayTasks, task] }));
      },

      deleteTask: async (id) => {
        const previous = get().todayTasks;
        set((state) => ({
          todayTasks: state.todayTasks.filter((t) => t.id !== id),
        }));
        const { error } = await tasksService.deleteTask(id);
        if (error) {
          set({ todayTasks: previous, error: error.message });
        }
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
