import "../global.css";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import {
  scheduleDailyReminder,
  getPushToken,
  saveTokenToSupabase,
} from "@/src/services/notificationsService";

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
    ...FontAwesome.font,
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
  const colorScheme = useColorScheme();
  const notificacaoListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const respostaListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    async function initNotifications() {
      const token = await getPushToken();
      if (token) await saveTokenToSupabase(token);
      await scheduleDailyReminder();
    }

    initNotifications();

    notificacaoListener.current = Notifications.addNotificationReceivedListener(
      (notificacao) => {
        console.log(
          "[Notificação recebida]",
          notificacao.request.content.title,
        );
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="diagnostic" options={{ headerShown: false }} />
        <Stack.Screen name="emergency" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
