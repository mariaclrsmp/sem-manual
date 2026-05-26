import "../global.css";

import { type Session } from "@supabase/supabase-js";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import { supabase } from "@/src/services/supabase";
import {
  requestPermission,
  savePushToken,
  scheduleDailyReminder,
} from "@/src/services/notificationsService";
import { useThemeStore } from "@/src/stores/themeStore";
import { useUserStore } from "@/src/stores/userStore";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular: require("../assets/fonts/Nunito_400Regular.ttf"),
    Nunito_600SemiBold: require("../assets/fonts/Nunito_600SemiBold.ttf"),
    Nunito_700Bold: require("../assets/fonts/Nunito_700Bold.ttf"),
    Nunito_800ExtraBold: require("../assets/fonts/Nunito_800ExtraBold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { scheme } = useThemeStore();
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const notificacaoListener = useRef<Notifications.EventSubscription | null>(null);
  const respostaListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.signOut().then(() => {
      if (!mounted) return;
      setSession(null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN") {
        // Manter loading=true enquanto busca dados do usuário.
        // setLoading(true) + setSession() são batched pelo React 18,
        // então o efeito de routing só dispara depois do loadData.
        setLoading(true);
        setSession(session);
        if (session) {
          const meta = session.user.user_metadata ?? {};
          const fallbackName: string =
            (meta.full_name as string | undefined) ??
            (meta.name as string | undefined) ??
            session.user.email?.split("@")[0] ??
            "";
          await useUserStore.getState().loadData(session.user.id, fallbackName);
        }
        setLoading(false);
        return;
      }

      if (event === "SIGNED_OUT") {
        setSession(null);
        useUserStore.setState({ user: null, achievements: [], suggestions: [] });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      const user = useUserStore.getState().user;
      const needsOnboarding = !user?.home_type;
      router.replace(needsOnboarding ? "/onboarding" : "/(tabs)");
    } else if (session && !inAuthGroup && !inOnboarding) {
      const user = useUserStore.getState().user;
      if (!user?.home_type) {
        router.replace("/onboarding");
      }
    }
  }, [session, loading]);

  useEffect(() => {
    if (session && Constants.appOwnership !== "expo") {
      requestPermission().then((granted) => {
        if (granted) {
          scheduleDailyReminder();
          savePushToken(session.user.id);
        }
      });
    }
  }, [session]);

  useEffect(() => {
    notificacaoListener.current = Notifications.addNotificationReceivedListener(
      () => {},
    );

    respostaListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      notificacaoListener.current?.remove();
      respostaListener.current?.remove();
    };
  }, []);

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: "#F6F7F9" }} />;
  }

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </ThemeProvider>
  );
}
