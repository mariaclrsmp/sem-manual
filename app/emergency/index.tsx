import { router } from "expo-router";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  Droplets,
  Flame,
  Thermometer,
  Wind,
  ZapOff,
} from "lucide-react-native";
import { Dimensions, FlatList, Pressable, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/src/components/ui/Text";
import { useThemeStore } from "@/src/stores/themeStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = 16;
const COL_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - COL_GAP) / 2;

type IconComponent = React.ComponentType<{ size: number; color: string }>;

const SITUATIONS: { id: string; Icon: IconComponent; label: string; color: string }[] = [
  { id: "arroz-queimou",       Icon: Flame,        label: "Arroz queimou",          color: "#C2430A" },
  { id: "mancha-roupa",        Icon: Droplets,     label: "Mancha na roupa",         color: "#2D4F87" },
  { id: "ralo-entupido",       Icon: AlertCircle,  label: "Ralo entupido",           color: "#6B7280" },
  { id: "geladeira-cheirando", Icon: Thermometer,  label: "Geladeira cheirando mal", color: "#2D7A5A" },
  { id: "acabou-luz",          Icon: ZapOff,       label: "Acabou a luz",            color: "#A16207" },
  { id: "cheiro-gas",          Icon: Wind,         label: "Cheiro de gas",           color: "#DC2626" },
  { id: "apareceu-formiga",    Icon: Bug,          label: "Apareceu formiga",        color: "#6B7280" },
  { id: "torneira-pingando",   Icon: Droplets,     label: "Torneira pingando",       color: "#2D4F87" },
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
  };
}

export default function EmergencyScreen() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#DC2626" }}>
        <View style={{ paddingHorizontal: H_PAD, paddingTop: 16, paddingBottom: 20, backgroundColor: "#DC2626" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={24} color="#ffffff" />
            <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 26, color: "#ffffff", lineHeight: 34 }}>
              Socorro Domestico
            </Text>
          </View>
          <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
            O que esta acontecendo?
          </Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={SITUATIONS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: H_PAD, paddingTop: 20, paddingBottom: 40 }}
        columnWrapperStyle={{ gap: COL_GAP, marginBottom: COL_GAP }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/emergency/[situation]", params: { situation: item.id } })}
            style={{
              width: CARD_WIDTH,
              backgroundColor: theme.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              minHeight: 120,
              shadowColor: "#DC2626",
              shadowOpacity: theme.dark ? 0.15 : 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#FFF1F1",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <item.Icon size={28} color={item.color} />
            </View>
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
