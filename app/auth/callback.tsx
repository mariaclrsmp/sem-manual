import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { supabase } from "@/src/services/supabase";

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    const handle = async (url: string) => {
      if (url.includes("code=")) {
        await supabase.auth.exchangeCodeForSession(url);
      }
      router.replace("/(tabs)");
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handle(url);
      } else {
        router.replace("/(tabs)");
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F7F9", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#5DBB8A" size="large" />
    </View>
  );
}
