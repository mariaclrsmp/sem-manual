import { ChevronLeft } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/src/components/ui/Text";
import { colors } from "@/src/constants/theme";
import { CATEGORY_LABELS, GUIDES, type GuideCategory } from "@/src/constants/guias";
import { useThemeStore } from "@/src/stores/themeStore";
import { useUserStore } from "@/src/stores/userStore";

const GUIDE_XP = 25;

const CATEGORY_COLORS: Record<
  GuideCategory,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  cozinha:    { bg: "#E8F7F0", text: "#2D7A5A", darkBg: "#14532D", darkText: "#86EFAC" },
  limpeza:    { bg: "#EAF0F9", text: "#2D4F87", darkBg: "#1E3A5F", darkText: "#93C5FD" },
  emergencia: { bg: "#FFF0E6", text: "#C2430A", darkBg: "#7C2D12", darkText: "#FCA17D" },
  economia:   { bg: "#FFFBE6", text: "#A16207", darkBg: "#713F12", darkText: "#FDE68A" },
  manutencao: { bg: "#F3F4F6", text: "#4B5563", darkBg: "#1F2937", darkText: "#9CA3AF" },
};

function useTheme() {
  const scheme = useThemeStore((s) => s.scheme);
  const dark = scheme === "dark";
  return {
    dark,
    bg: dark ? "#0F172A" : colors.fundo,
    surface: dark ? "#1E293B" : "#ffffff",
    text: dark ? "#F1F5F9" : colors.texto,
    textMuted: dark ? "rgba(241,245,249,0.5)" : "#6B7280",
    border: dark ? "#334155" : "#E5E7EB",
    stepNumInactiveBg: dark ? "#1E293B" : "#F3F4F6",
    stepNumInactiveText: dark ? "#94A3B8" : "#9CA3AF",
  };
}

type Theme = ReturnType<typeof useTheme>;

function CategoryBadge({ category, dark }: { category: GuideCategory; dark: boolean }) {
  const c = CATEGORY_COLORS[category];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: dark ? c.darkBg : c.bg,
      }}
    >
      <Text
        style={{
          fontFamily: "Nunito_600SemiBold",
          fontSize: 12,
          color: dark ? c.darkText : c.text,
        }}
      >
        {CATEGORY_LABELS[category]}
      </Text>
    </View>
  );
}

function StepChip({
  number,
  active,
  onPress,
  theme,
}: {
  number: number;
  active: boolean;
  onPress: () => void;
  theme: Theme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: active ? colors.verde : theme.stepNumInactiveBg,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: "Nunito_700Bold",
          fontSize: 13,
          color: active ? "#ffffff" : theme.stepNumInactiveText,
        }}
      >
        {number}
      </Text>
    </Pressable>
  );
}

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { addXP, unlockAchievement, achievements } = useUserStore();

  const scrollRef = useRef<ScrollView>(null);
  const stepYPositions = useRef<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [justLearned, setJustLearned] = useState(false);

  const guide = GUIDES.find((g) => g.id === id);
  const achievementId = `guide:${id}`;
  const isLearned = achievements.includes(achievementId);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const scrollY = e.nativeEvent.contentOffset.y;
    let active = 0;
    for (let i = 0; i < stepYPositions.current.length; i++) {
      if (scrollY >= stepYPositions.current[i] - 100) {
        active = i;
      }
    }
    setActiveStep(active);
  }

  function scrollToStep(index: number) {
    const y = stepYPositions.current[index];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: y - 24, animated: true });
    }
  }

  function handleMarkAsLearned() {
    if (!isLearned && !justLearned) {
      addXP(GUIDE_XP);
      unlockAchievement(achievementId);
      setJustLearned(true);
    }
  }

  if (!guide) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: "Nunito_400Regular", color: theme.textMuted }}>
          Guia não encontrado.
        </Text>
      </View>
    );
  }

  const learned = isLearned || justLearned;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.bg}
      />

      <SafeAreaView edges={["top"]} style={{ backgroundColor: theme.bg }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <ChevronLeft size={26} color={theme.text} />
          </Pressable>
          <Text
            style={{
              fontFamily: "Nunito_700Bold",
              fontSize: 16,
              color: theme.text,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {guide.title}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 16, paddingBottom: 24 }}>
          <Text style={{ fontSize: 64, lineHeight: 76 }}>{guide.emoji}</Text>

          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 26,
              color: theme.text,
              lineHeight: 34,
            }}
          >
            {guide.title}
          </Text>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "Nunito_600SemiBold",
                  fontSize: 12,
                  color: theme.textMuted,
                }}
              >
                ⏱ {guide.readingTime} min · {guide.steps.length} passos
              </Text>
            </View>
            <CategoryBadge category={guide.category} dark={theme.dark} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 0 }}
          >
            {guide.steps.map((_, index) => (
              <StepChip
                key={index}
                number={index + 1}
                active={activeStep === index}
                onPress={() => scrollToStep(index)}
                theme={theme}
              />
            ))}
          </ScrollView>
        </View>

        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: theme.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {guide.steps.map((step, index) => (
            <View
              key={step.order}
              onLayout={(e) => {
                stepYPositions.current[index] = e.nativeEvent.layout.y;
              }}
              style={{
                flexDirection: "row",
                gap: 14,
                padding: 16,
                borderBottomWidth: index < guide.steps.length - 1 ? 1 : 0,
                borderBottomColor: theme.border,
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor:
                    activeStep === index
                      ? colors.verde
                      : theme.stepNumInactiveBg,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Nunito_800ExtraBold",
                    fontSize: 13,
                    color:
                      activeStep === index ? "#ffffff" : theme.stepNumInactiveText,
                  }}
                >
                  {step.order}
                </Text>
              </View>

              <View style={{ flex: 1, gap: 6 }}>
                <Text
                  style={{
                    fontFamily: "Nunito_700Bold",
                    fontSize: 15,
                    color: theme.text,
                    lineHeight: 22,
                  }}
                >
                  {step.title}
                </Text>
                <Text
                  style={{
                    fontFamily: "Nunito_400Regular",
                    fontSize: 14,
                    color: theme.textMuted,
                    lineHeight: 22,
                  }}
                >
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {guide.tip && (
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: theme.dark ? "#431407" : "#FFF0E6",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.dark ? "#7C2D12" : "#FED7AA",
              padding: 16,
              flexDirection: "row",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 22, lineHeight: 28 }}>💡</Text>
            <Text
              style={{
                fontFamily: "Nunito_400Regular",
                fontSize: 14,
                color: theme.dark ? "#FCA17D" : "#9A3412",
                lineHeight: 22,
                flex: 1,
              }}
            >
              {guide.tip}
            </Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 20 }}>
          <Pressable
            onPress={handleMarkAsLearned}
            disabled={learned}
            style={({ pressed }) => ({
              backgroundColor: learned ? (theme.dark ? "#14532D" : "#E8F7F0") : colors.verde,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed && !learned ? 0.8 : 1,
              gap: 4,
            })}
          >
            <Text
              style={{
                fontFamily: "Nunito_800ExtraBold",
                fontSize: 16,
                color: learned ? (theme.dark ? "#86EFAC" : "#2D7A5A") : "#ffffff",
              }}
            >
              {learned ? "✓ Aprendido!" : "Marcar como aprendido"}
            </Text>
            {!learned && (
              <Text
                style={{
                  fontFamily: "Nunito_600SemiBold",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                +{GUIDE_XP} XP
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
