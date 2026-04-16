import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/src/components/ui/Text";
import { colors } from "@/src/constants/theme";
import {
  CATEGORY_LABELS,
  GUIDES,
  type Guide,
  type GuideCategory,
} from "@/src/constants/guias";
import { useThemeStore } from "@/src/stores/themeStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = 16;
const COL_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - COL_GAP) / 2;

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

const CHIP_ORDER: GuideCategory[] = [
  "cozinha",
  "limpeza",
  "manutencao",
  "emergencia",
  "economia",
];

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
    chipBorder: dark ? "#334155" : "#D1D5DB",
    chipInactiveBg: dark ? "#1E293B" : "#ffffff",
  };
}

type Theme = ReturnType<typeof useTheme>;

function CategoryChip({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: Theme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.verde : theme.chipBorder,
        backgroundColor: active ? colors.verde : theme.chipInactiveBg,
        opacity: pressed ? 0.75 : 1,
        marginRight: 8,
      })}
    >
      <Text
        style={{
          fontFamily: "Nunito_600SemiBold",
          fontSize: 13,
          color: active ? "#ffffff" : theme.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CategoryBadge({ category, dark }: { category: GuideCategory; dark: boolean }) {
  const c = CATEGORY_COLORS[category];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: dark ? c.darkBg : c.bg,
      }}
    >
      <Text
        style={{
          fontFamily: "Nunito_600SemiBold",
          fontSize: 10,
          color: dark ? c.darkText : c.text,
        }}
      >
        {CATEGORY_LABELS[category]}
      </Text>
    </View>
  );
}

function GuideCard({ guide, theme }: { guide: Guide; theme: Theme }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/guides/[id]", params: { id: guide.id } })
      }
      style={({ pressed }) => ({
        width: CARD_WIDTH,
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 14,
        gap: 8,
        opacity: pressed ? 0.75 : 1,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: "#000",
        shadowOpacity: theme.dark ? 0.3 : 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      })}
    >
      <Text style={{ fontSize: 36, lineHeight: 44 }}>{guide.emoji}</Text>

      <Text
        style={{
          fontFamily: "Nunito_700Bold",
          fontSize: 13,
          color: theme.text,
          lineHeight: 18,
        }}
        numberOfLines={2}
      >
        {guide.title}
      </Text>

      <Text
        style={{
          fontFamily: "Nunito_400Regular",
          fontSize: 11,
          color: theme.textMuted,
        }}
      >
        ⏱ {guide.readingTime} min
      </Text>

      <CategoryBadge category={guide.category} dark={theme.dark} />
    </Pressable>
  );
}

function Header({
  selected,
  onSelect,
  theme,
  total,
}: {
  selected: GuideCategory | null;
  onSelect: (c: GuideCategory | null) => void;
  theme: Theme;
  total: number;
}) {
  return (
    <View style={{ paddingBottom: 16 }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: theme.bg }}>
        <StatusBar
          barStyle={theme.dark ? "light-content" : "dark-content"}
          backgroundColor={theme.bg}
        />
        <View
          style={{
            paddingHorizontal: H_PAD,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 26,
              color: theme.text,
            }}
          >
            Guias domésticos
          </Text>
          <Text
            style={{
              fontFamily: "Nunito_400Regular",
              fontSize: 13,
              color: theme.textMuted,
              marginTop: 2,
            }}
          >
            {total} {total === 1 ? "guia encontrado" : "guias encontrados"}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: H_PAD,
          paddingBottom: 4,
        }}
      >
        <CategoryChip
          label="Todos"
          active={selected === null}
          onPress={() => onSelect(null)}
          theme={theme}
        />
        {CHIP_ORDER.map((cat) => (
          <CategoryChip
            key={cat}
            label={CATEGORY_LABELS[cat]}
            active={selected === cat}
            onPress={() => onSelect(cat)}
            theme={theme}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default function GuidesScreen() {
  const theme = useTheme();
  const [selected, setSelected] = useState<GuideCategory | null>(null);

  const filtered = selected
    ? GUIDES.filter((g) => g.category === selected)
    : GUIDES;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: H_PAD,
          paddingBottom: 32,
        }}
        columnWrapperStyle={{ gap: COL_GAP, marginBottom: COL_GAP }}
        ListHeaderComponent={
          <Header
            selected={selected}
            onSelect={setSelected}
            theme={theme}
            total={filtered.length}
          />
        }
        renderItem={({ item }) => <GuideCard guide={item} theme={theme} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
