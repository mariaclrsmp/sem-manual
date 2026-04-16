import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ColorScheme = "light" | "dark";

interface ThemeState {
  scheme: ColorScheme;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      scheme: "light",

      toggle: () => {
        const next = get().scheme === "light" ? "dark" : "light";
        set({ scheme: next });
      },
    }),
    {
      name: "sem-manual:theme",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
