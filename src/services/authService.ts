import type {
  AuthError,
  Session,
  Subscription,
  User,
} from "@supabase/supabase-js";

import { useTasksStore } from "../stores/tasksStore";
import { useUserStore } from "../stores/userStore";
import { supabase } from "./supabase";

function clearStores(): void {
  useUserStore.setState({
    user: null,
    achievements: [],
    suggestions: [],
    loading: false,
    error: null,
    notification: null,
  });
  useTasksStore.setState({
    todayTasks: [],
    loading: false,
    error: null,
  });
}

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  return { user: data.user, error };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data.session, error };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  clearStores();
  const authAny = supabase.auth as any;
  const storage = authAny.storage;
  const storageKey: string = authAny.storageKey ?? "supabase.auth.token";
  try {
    await storage?.removeItem(storageKey);
    await storage?.removeItem(`${storageKey}-code-verifier`);
    await storage?.removeItem(`${storageKey}-user`);
  } catch {}
  return { error: null };
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void,
): Subscription {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}
