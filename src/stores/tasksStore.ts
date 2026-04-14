import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TaskCategory = "cleaning" | "grocery" | "home" | "pet";

export interface TodayTask {
  id: string;
  title: string;
  category: TaskCategory;
  completed: boolean;
  xp: number;
}

const INITIAL_TASKS: TodayTask[] = [
  {
    id: "task-1",
    title: "Lavar a louça do dia",
    category: "cleaning",
    completed: false,
    xp: 15,
  },
  {
    id: "task-2",
    title: "Passar pano no banheiro",
    category: "cleaning",
    completed: false,
    xp: 20,
  },
  {
    id: "task-3",
    title: "Verificar o que está acabando na geladeira",
    category: "grocery",
    completed: false,
    xp: 10,
  },
  {
    id: "task-4",
    title: "Tirar o lixo",
    category: "home",
    completed: false,
    xp: 10,
  },
  {
    id: "task-5",
    title: "Organizar a cama pela manhã",
    category: "home",
    completed: false,
    xp: 5,
  },
];

interface TasksState {
  todayTasks: TodayTask[];
  todayXP: number;

  completeTask: (id: string) => void;
  addTask: (task: TodayTask) => void;
  resetDay: () => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      todayTasks: INITIAL_TASKS,
      todayXP: 0,

      completeTask: (id) => {
        const task = get().todayTasks.find((t) => t.id === id);
        if (!task || task.completed) return;

        set((state) => ({
          todayTasks: state.todayTasks.map((t) =>
            t.id === id ? { ...t, completed: true } : t,
          ),
          todayXP: state.todayXP + task.xp,
        }));
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
