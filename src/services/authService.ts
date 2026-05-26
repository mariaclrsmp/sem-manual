import type {
  AuthError,
  Session,
  Subscription,
  User,
} from "@supabase/supabase-js";
import * as Linking from "expo-linking";

import { useTasksStore } from "../stores/tasksStore";
import { useUserStore } from "../stores/userStore";
import { supabase } from "./supabase";

function getRedirectUri(): string {
  return Linking.createURL("auth/callback");
}

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
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: getRedirectUri(),
    },
  });

  if (error) return { user: null, session: null, error };

  if (data.session) {
    return { user: data.user, session: data.session, error: null };
  }

  return {
    user: null,
    session: null,
    error: { message: "email_confirmation_required" } as AuthError,
  };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
      return {
        session: null,
        error: { ...error, message: "email_not_confirmed" } as AuthError,
      };
    }
    return { session: null, error };
  }

  return { session: data.session, error: null };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  clearStores();
  const { error } = await supabase.auth.signOut();
  return { error };
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
