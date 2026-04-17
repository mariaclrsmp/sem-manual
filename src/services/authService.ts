import type { AuthError, Session, Subscription, User } from '@supabase/supabase-js'
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

import { useProfileStore } from '../stores/profileStore'
import { useTasksStore } from '../stores/tasksStore'
import { useUserStore } from '../stores/userStore'
import { supabase } from './supabase'

function clearStores(): void {
  useUserStore.setState({
    userId: null,
    name: '',
    level: 'beginner',
    xpTotal: 0,
    xpToNextLevel: 200,
    achievements: [],
    suggestions: [],
    loading: false,
    error: null,
    notification: null,
  })
  useTasksStore.setState({
    todayTasks: [],
    todayXP: 0,
    loading: false,
    error: null,
  })
  useProfileStore.getState().clearProfile()
}

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })
  return { user: data.user, error }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { session: data.session, error }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut()
  if (!error) clearStores()
  return { error }
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void,
): Subscription {
  const { data } = supabase.auth.onAuthStateChange(callback)
  return data.subscription
}

export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  const redirectTo = makeRedirectUri({ scheme: 'semmanual' })

  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  })

  if (oauthError) return { error: oauthError }
  if (!data.url) return { error: { message: 'URL de autenticação não retornada' } as AuthError }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

  if (result.type === 'success') {
    const { error: callbackError } = await handleOAuthCallback(result.url)
    return { error: callbackError }
  }

  return { error: null }
}

async function handleOAuthCallback(
  url: string,
): Promise<{ error: AuthError | null }> {
  const urlObj = new URL(url)
  const code = urlObj.searchParams.get('code')

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    return { error }
  }

  const hash = url.includes('#') ? url.split('#')[1] : ''
  const params = new URLSearchParams(hash)
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')

  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    return { error }
  }

  return { error: null }
}
