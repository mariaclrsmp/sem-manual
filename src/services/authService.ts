import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "./supabase";

function getRedirectUri(): string {
  return makeRedirectUri({ scheme: "semmanual" });
}

async function handleOAuthCallback(url: string): Promise<void> {
  const urlObj = new URL(url);

  const code = urlObj.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const hash = url.includes("#") ? url.split("#")[1] : "";
  const hashParams = new URLSearchParams(hash);
  const access_token = hashParams.get("access_token");
  const refresh_token = hashParams.get("refresh_token");
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
  }
}

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = getRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) throw error;
  if (!data.url) throw new Error("URL de autenticação não retornada");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === "success") {
    await handleOAuthCallback(result.url);
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
