import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type HomeType = 'studio' | 'apartment' | 'house'

export interface UserProfile {
  name: string
  home_type: HomeType
  has_pet: boolean
}

interface ProfileState {
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'sem-manual:profile',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
