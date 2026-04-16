import "../global.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "react-native-reanimated";

import {
  requestPermission,
  savePushToken,
  scheduleDailyReminder,
} from "@/src/services/notificationsService";
import { useAuthStore } from "@/src/stores/authStore";
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
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { scheme } = useThemeStore();
  const router = useRouter();
  const segments = useSegments();

  const { session, isInitialized, initialize } = useAuthStore();
  const name = useUserStore((s) => s.name);

  const notificacaoListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const respostaListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    return initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!session) {
      if (!inAuthGroup) router.replace("/(auth)/login");
    } else if (!name) {
      if (!inOnboarding) router.replace("/onboarding");
    } else {
      if (inAuthGroup || inOnboarding) router.replace("/(tabs)");
    }
  }, [session, isInitialized, name]);

  useEffect(() => {
    if (session) {
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
      (notificacao) => {
        console.log("[Notificação recebida]", notificacao.request.content.title);
      },
    );

    respostaListener.current =
      Notifications.addNotificationResponseReceivedListener((resposta) => {
        const data = resposta.notification.request.content.data;
        console.log("[Notificação tocada]", data);
      });

    return () => {
      notificacaoListener.current?.remove();
      respostaListener.current?.remove();
    };
  }, []);

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="guides/[id]" />
        <Stack.Screen name="diagnostic/index" />
        <Stack.Screen name="emergency/index" />
        <Stack.Screen name="emergency/[situation]" />
        <Stack.Screen
          name="modal"
          options={{ headerShown: true, presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
