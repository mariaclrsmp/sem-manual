import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../services/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitialized: false,

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isInitialized: true });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, isInitialized: true });
    });

    return () => subscription.unsubscribe();
  },
}));
