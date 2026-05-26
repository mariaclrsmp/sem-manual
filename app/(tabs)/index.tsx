import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  AlertTriangle,
  Brush,
  ChefHat,
  Clock,
  Flame,
  Home,
  Lightbulb,
  LogOut,
  Moon,
  PiggyBank,
  Sparkles,
  Sun,
  Wallet,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProactiveCard } from "@/src/components/features/ProactiveCard";
import { TaskItem } from "@/src/components/features/TaskItem";
import { Text } from "@/src/components/ui/Text";
import { colors } from "@/src/constants/theme";
import { addSuggestionAsTask } from "@/src/services/suggestionsService";
import { useAuthStore } from "@/src/stores/authStore";
import { useTasksStore } from "@/src/stores/tasksStore";
import { useThemeStore } from "@/src/stores/themeStore";
import type { Suggestion } from "@/src/stores/userStore";
import { useCurrentLevelInfo, useUserStore } from "@/src/stores/userStore";

type IconComponent = React.ComponentType<{ size: number; color: string }>;

function useTheme() {
  const scheme = useThemeStore((s) => s.scheme);
  const dark = scheme === "dark";
  return {
    dark,
    bg: dark ? "#0F172A" : colors.fundo,
    surface: dark ? "#1E293B" : "#ffffff",
    text: dark ? "#F1F5F9" : colors.texto,
    textMuted: dark ? "rgba(241,245,249,0.5)" : "#9CA3AF",
    border: dark ? "#334155" : "#E5E7EB",
    cardBorder: dark ? "#334155" : "#E5E7EB",
  };
}

const GUIDES_MOCK: { id: string; Icon: IconComponent; title: string; duration: string }[] = [
  { id: "g1", Icon: Brush, title: "Como limpar o banheiro do jeito certo", duration: "4 min" },
  { id: "g2", Icon: ChefHat, title: "Basico para nao passar fome", duration: "6 min" },
  { id: "g3", Icon: Lightbulb, title: "O que fazer quando cai a luz", duration: "3 min" },
  { id: "g4", Icon: Wallet, title: "Orcamento domestico em 5 passos", duration: "8 min" },
];

const ACHIEVEMENTS_MOCK: { id: string; Icon: IconComponent; label: string; unlocked: boolean }[] = [
  { id: "a1", Icon: Home, label: "Primeira semana", unlocked: true },
  { id: "a2", Icon: Sparkles, label: "Casa limpa!", unlocked: true },
  { id: "a3", Icon: ChefHat, label: "Cozinheiro", unlocked: false },
  { id: "a4", Icon: PiggyBank, label: "Poupador", unlocked: false },
  { id: "a5", Icon: Flame, label: "7 dias seguidos", unlocked: false },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function HeaderAction({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.18)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </Pressable>
  );
}

function XPCard() {
  const { label, emoji, levelProgress, currentLevelXP, levelTotalXP } = useCurrentLevelInfo();
  const xpTotal = useUserStore((s) => s.user?.total_xp) ?? 0;

  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 20,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "rgba(255,255,255,0.25)",
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 14 }}>{emoji}</Text>
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 13, color: "#fff" }}>{label}</Text>
        </View>
        <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#fff" }}>{xpTotal} XP</Text>
      </View>
      <View>
        <View
          style={{
            height: 8,
            backgroundColor: "rgba(255,255,255,0.25)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${Math.round(levelProgress * 100)}%`,
              backgroundColor: "#fff",
              borderRadius: 999,
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: "Nunito_400Regular",
            fontSize: 11,
            color: "rgba(255,255,255,0.75)",
            marginTop: 5,
          }}
        >
          {currentLevelXP} / {levelTotalXP} XP para o proximo nivel
        </Text>
      </View>
    </View>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: theme.text }}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          {({ pressed }) => (
            <Text style={{ fontFamily: "Nunito_600SemiBold", fontSize: 13, color: colors.azul, opacity: pressed ? 0.6 : 1 }}>
              {action}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

function GuideCard({ Icon, title, duration }: { Icon: IconComponent; title: string; duration: string }) {
  const theme = useTheme();
  return (
    <Pressable
      style={[
        {
          flex: 1,
          backgroundColor: theme.surface,
          borderRadius: 16,
          padding: 14,
          gap: 8,
          shadowColor: theme.dark ? "#000" : "#2E2E2E",
          shadowOpacity: theme.dark ? 0.4 : 0.06,
          shadowRadius: 6,
          elevation: 2,
          borderWidth: theme.dark ? 1 : 0,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: `${colors.verde}18`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={22} color={colors.verde} />
      </View>
      <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 13, color: theme.text, lineHeight: 18 }}>
        {title}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Clock size={12} color={theme.textMuted} />
        <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 12, color: theme.textMuted }}>{duration}</Text>
      </View>
    </Pressable>
  );
}

function AchievementBadge({ Icon, label, unlocked }: { Icon: IconComponent; label: string; unlocked: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", gap: 6, width: 72, opacity: unlocked ? 1 : 0.35 }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: unlocked
            ? theme.dark ? "#14532D" : "#E8F7F0"
            : theme.dark ? "#1E293B" : "#F3F4F6",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: unlocked ? 2 : 1,
          borderColor: unlocked ? colors.verde : theme.border,
        }}
      >
        <Icon size={24} color={unlocked ? colors.verde : theme.textMuted} />
      </View>
      <Text
        style={{ fontFamily: "Nunito_600SemiBold", fontSize: 11, color: theme.text, textAlign: "center", lineHeight: 14 }}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

function suggestionCardType(type: Suggestion["type"]): "tip" | "alert" | "achievement" {
  if (type === "guide") return "achievement";
  return "tip";
}

export default function HomeScreen() {
  const theme = useTheme();
  const user = useUserStore((s) => s.user);
  const firstName = (
    user?.name ||
    (user as never as { nome?: string })?.nome ||
    ""
  ).split(" ")[0];
  const userId = user?.id ?? null;
  const suggestions = useUserStore((s) => s.suggestions);
  const { todayTasks, completeTask, loadTodayTasks, loading: tasksLoading } = useTasksStore();
  const todayXP = todayTasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.xp, 0);
  const { scheme, toggle } = useThemeStore();

  const firstSuggestion = suggestions[0] ?? null;

  const handleCompleteTask = (id: string) => {
    completeTask(id);
  };

  async function handleSuggestionAction() {
    if (!firstSuggestion || !userId) return;
    const { error } = await addSuggestionAsTask(userId, firstSuggestion);
    if (!error) await loadTodayTasks(userId);
  }

  async function handleLogout() {
    await useAuthStore.getState().signOut();
    router.replace("/(auth)/login");
  }

  const pendingTasks = todayTasks.filter((t) => !t.completed);
  const completedTasks = todayTasks.filter((t) => t.completed);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.verde} />

      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.verde }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                {greeting()}
              </Text>
              <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 24, color: "#fff", marginBottom: 16 }}>
                {`Bem-vindo(a), ${firstName}!`}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8, paddingTop: 4 }}>
              <HeaderAction onPress={toggle}>
                {scheme === "dark" ? <Sun size={18} color="#ffffff" /> : <Moon size={18} color="#ffffff" />}
              </HeaderAction>
              <HeaderAction onPress={handleLogout}>
                <LogOut size={18} color="#ffffff" />
              </HeaderAction>
            </View>
          </View>
        </View>
        <XPCard />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {firstSuggestion ? (
          <ProactiveCard
            type={suggestionCardType(firstSuggestion.type)}
            message={firstSuggestion.message}
            action={firstSuggestion.actionLabel ?? "Adicionar na lista de hoje"}
            onAction={handleSuggestionAction}
          />
        ) : (
          <ProactiveCard
            type="tip"
            message={`Bem-vindo, ${firstName || "ao Sem Manual"}! Explore os guias e comece sua primeira tarefa.`}
            onAction={undefined}
          />
        )}

        <View>
          <SectionTitle
            title="Hoje na sua casa"
            action="Ver todas"
            onAction={() => router.push("/(tabs)/tasks")}
          />
          {completedTasks.length > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 13, color: theme.textMuted }}>
                {completedTasks.length} de {todayTasks.length} concluidas
              </Text>
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 13, color: colors.verde }}>
                +{todayXP} XP hoje
              </Text>
            </View>
          )}
          {tasksLoading ? (
            <ActivityIndicator size="small" color={colors.verde} style={{ paddingVertical: 20 }} />
          ) : (
            <>
              <View style={{ gap: 10 }}>
                {pendingTasks.map((t) => (
                  <TaskItem key={t.id} task={t} onComplete={handleCompleteTask} />
                ))}
                {completedTasks.map((t) => (
                  <TaskItem key={t.id} task={t} onComplete={handleCompleteTask} />
                ))}
              </View>
              {todayTasks.length === 0 && (
                <Text
                  style={{
                    fontFamily: "Nunito_400Regular",
                    fontSize: 14,
                    color: theme.textMuted,
                    textAlign: "center",
                    paddingVertical: 16,
                  }}
                >
                  Nenhuma tarefa para hoje
                </Text>
              )}
            </>
          )}
        </View>

        <View
          style={{
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "#E8631A",
            shadowColor: "#FF8C42",
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <Pressable onPress={() => router.push("/emergency")}>
            <LinearGradient
              colors={["#FF8C42", "#E8631A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 18, alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={20} color="#fff" />
                <Text style={{ fontFamily: "Nunito_800ExtraBold", fontSize: 17, color: "#fff" }}>
                  Socorro Domestico
                </Text>
              </View>
              <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                Respostas rapidas para emergencias
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View>
          <SectionTitle
            title="Guias rapidos"
            action="Ver todos"
            onAction={() => router.push("/(tabs)/guides")}
          />
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <GuideCard {...GUIDES_MOCK[0]} />
            <GuideCard {...GUIDES_MOCK[1]} />
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <GuideCard {...GUIDES_MOCK[2]} />
            <GuideCard {...GUIDES_MOCK[3]} />
          </View>
        </View>

        <View>
          <SectionTitle
            title="Conquistas"
            action="Ver todas"
            onAction={() => router.push("/(tabs)/progress")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingRight: 4 }}
          >
            {ACHIEVEMENTS_MOCK.map((a) => (
              <AchievementBadge key={a.id} {...a} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
