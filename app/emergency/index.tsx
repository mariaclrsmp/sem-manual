import { router } from "expo-router";
import { Dimensions, FlatList, Pressable, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/src/components/ui/Text";
import { useThemeStore } from "@/src/stores/themeStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = 16;
const COL_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - COL_GAP) / 2;

const SITUATIONS = [
  { id: "arroz-queimou",        emoji: "😱", label: "Arroz queimou" },
  { id: "mancha-roupa",         emoji: "🧼", label: "Mancha na roupa" },
  { id: "ralo-entupido",        emoji: "🚿", label: "Ralo entupido" },
  { id: "geladeira-cheirando",  emoji: "🧊", label: "Geladeira cheirando mal" },
  { id: "acabou-luz",           emoji: "💡", label: "Acabou a luz" },
  { id: "cheiro-gas",           emoji: "🔥", label: "Cheiro de gás" },
  { id: "apareceu-formiga",     emoji: "🐜", label: "Apareceu formiga" },
  { id: "torneira-pingando",    emoji: "🚰", label: "Torneira pingando" },
] as const;

export type SituationId = (typeof SITUATIONS)[number]["id"];

function useTheme() {
  const scheme = useThemeStore((s) => s.scheme);
  const dark = scheme === "dark";
  return {
    dark,
    bg: dark ? "#0F172A" : "#FFF5F5",
    surface: dark ? "#1E293B" : "#ffffff",
    text: dark ? "#F1F5F9" : "#2E2E2E",
    textMuted: dark ? "rgba(241,245,249,0.5)" : "#6B7280",
    border: dark ? "#334155" : "#FED7D7",
    cardPressedBg: dark ? "#2D1B1B" : "#FFF0F0",
  };
}

export default function EmergencyScreen() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#DC2626" }}>
        <View
          style={{
            paddingHorizontal: H_PAD,
            paddingTop: 16,
            paddingBottom: 20,
            backgroundColor: "#DC2626",
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 26,
              color: "#ffffff",
              lineHeight: 34,
            }}
          >
            🚨 Socorro Doméstico
          </Text>
          <Text
            style={{
              fontFamily: "Nunito_400Regular",
              fontSize: 14,
              color: "rgba(255,255,255,0.85)",
              marginTop: 4,
            }}
          >
            O que está acontecendo?
          </Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={SITUATIONS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: H_PAD,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        columnWrapperStyle={{ gap: COL_GAP, marginBottom: COL_GAP }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/emergency/[situation]",
                params: { situation: item.id },
              })
            }
            style={({ pressed }) => ({
              width: CARD_WIDTH,
              backgroundColor: pressed ? theme.cardPressedBg : theme.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: pressed ? "#FCA5A5" : theme.border,
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: 120,
              shadowColor: "#DC2626",
              shadowOpacity: theme.dark ? 0.15 : 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            })}
          >
            <Text style={{ fontSize: 42, lineHeight: 50 }}>{item.emoji}</Text>
            <Text
              style={{
                fontFamily: "Nunito_700Bold",
                fontSize: 13,
                color: theme.text,
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
