import { LogOut, Moon, Sun } from "lucide-react-native";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProactiveCard } from "@/src/components/features/ProactiveCard";
import { TaskItem } from "@/src/components/features/TaskItem";
import { Text } from "@/src/components/ui/Text";
import { colors } from "@/src/constants/theme";
import { signOut } from "@/src/services/authService";
import { addSuggestionAsTask } from "@/src/services/suggestionsService";
import { useTasksStore } from "@/src/stores/tasksStore";
import { useThemeStore } from "@/src/stores/themeStore";
import { useCurrentLevelInfo, useUserStore } from "@/src/stores/userStore";
import type { Suggestion } from "@/src/stores/userStore";

// Lê direto do store — não depende de Appearance.setColorScheme() propagar
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

const GUIDES_MOCK = [
  {
    id: "g1",
    icon: "🧹",
    title: "Como limpar o banheiro do jeito certo",
    duration: "4 min",
  },
  {
    id: "g2",
    icon: "🍳",
    title: "Básico para não passar fome",
    duration: "6 min",
  },
  {
    id: "g3",
    icon: "💡",
    title: "O que fazer quando cai a luz",
    duration: "3 min",
  },
  {
    id: "g4",
    icon: "💰",
    title: "Orçamento doméstico em 5 passos",
    duration: "8 min",
  },
];

const ACHIEVEMENTS_MOCK = [
  { id: "a1", icon: "🏠", label: "Primeira semana", unlocked: true },
  { id: "a2", icon: "✨", label: "Casa limpa!", unlocked: true },
  { id: "a3", icon: "🍳", label: "Cozinheiro", unlocked: false },
  { id: "a4", icon: "💰", label: "Poupador", unlocked: false },
  { id: "a5", icon: "🔥", label: "7 dias seguidos", unlocked: false },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function HeaderAction({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.18)",
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

function XPCard() {
  const { label, emoji, levelProgress, currentLevelXP, levelTotalXP } =
    useCurrentLevelInfo();
  const xpTotal = useUserStore((s) => s.xpTotal);

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
          <Text
            style={{
              fontFamily: "Nunito_700Bold",
              fontSize: 13,
              color: "#fff",
            }}
          >
            {label}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "Nunito_800ExtraBold",
            fontSize: 15,
            color: "#fff",
          }}
        >
          {xpTotal} XP
        </Text>
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
          {currentLevelXP} / {levelTotalXP} XP para o próximo nível
        </Text>
      </View>
    </View>
  );
}

function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontFamily: "Nunito_800ExtraBold",
          fontSize: 18,
          color: theme.text,
        }}
      >
        {title}
      </Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          {({ pressed }) => (
            <Text
              style={{
                fontFamily: "Nunito_600SemiBold",
                fontSize: 13,
                color: colors.azul,
                opacity: pressed ? 0.6 : 1,
              }}
            >
              {action}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

function GuideCard({
  icon,
  title,
  duration,
}: {
  icon: string;
  title: string;
  duration: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 14,
        gap: 8,
        opacity: pressed ? 0.75 : 1,
        shadowColor: theme.dark ? "#000" : "#2E2E2E",
        shadowOpacity: theme.dark ? 0.4 : 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: theme.dark ? 1 : 0,
        borderColor: theme.cardBorder,
      })}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <Text
        style={{
          fontFamily: "Nunito_700Bold",
          fontSize: 13,
          color: theme.text,
          lineHeight: 18,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: "Nunito_400Regular",
          fontSize: 12,
          color: theme.textMuted,
        }}
      >
        ⏱ {duration}
      </Text>
    </Pressable>
  );
}

function AchievementBadge({
  icon,
  label,
  unlocked,
}: {
  icon: string;
  label: string;
  unlocked: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        gap: 6,
        width: 72,
        opacity: unlocked ? 1 : 0.35,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: unlocked
            ? theme.dark
              ? "#14532D"
              : "#E8F7F0"
            : theme.dark
              ? "#1E293B"
              : "#F3F4F6",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: unlocked ? 2 : 1,
          borderColor: unlocked ? colors.verde : theme.border,
        }}
      >
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <Text
        style={{
          fontFamily: "Nunito_600SemiBold",
          fontSize: 11,
          color: theme.text,
          textAlign: "center",
          lineHeight: 14,
        }}
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
  const name = user?.name ?? '';
  const userId = user?.id ?? null;
  const suggestions = useUserStore((s) => s.suggestions);
  const { todayTasks, completeTask, loadTodayTasks } = useTasksStore();
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

  function handleLogout() {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          signOut().then(({ error }) => {
            if (error) console.error("[logout]", error.message);
          });
        },
      },
    ]);
  }

  const pendingTasks = todayTasks.filter((t) => !t.completed);
  const completedTasks = todayTasks.filter((t) => t.completed);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.verde} />

      {/* Cabeçalho verde */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.verde }}>
        <View
          style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* Saudação */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Nunito_400Regular",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {greeting()} 👋
              </Text>
              <Text
                style={{
                  fontFamily: "Nunito_800ExtraBold",
                  fontSize: 24,
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                {name || "Bem-vindo!"}
              </Text>
            </View>

            {/* Botões de ação */}
            <View style={{ flexDirection: "row", gap: 8, paddingTop: 4 }}>
              <HeaderAction onPress={toggle}>
                {scheme === "dark"
                  ? <Sun size={18} color="#ffffff" />
                  : <Moon size={18} color="#ffffff" />}
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
        {/* 1. Proactive card */}
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
            message={`Bem-vindo, ${name || "ao Sem Manual"}! Explore os guias e comece sua primeira tarefa. 🏠`}
            onAction={undefined}
          />
        )}

        {/* 2. Tarefas de hoje */}
        <View>
          <SectionTitle
            title="Hoje na sua casa"
            action="Ver todas"
            onAction={() => router.push("/(tabs)/tasks")}
          />

          {completedTasks.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: "Nunito_400Regular",
                  fontSize: 13,
                  color: theme.textMuted,
                }}
              >
                {completedTasks.length} de {todayTasks.length} concluídas
              </Text>
              <Text
                style={{
                  fontFamily: "Nunito_700Bold",
                  fontSize: 13,
                  color: colors.verde,
                }}
              >
                +{todayXP} XP hoje
              </Text>
            </View>
          )}

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
              Nenhuma tarefa para hoje 🎉
            </Text>
          )}
        </View>

        {/* 3. Botão de socorro */}
        <Pressable
          onPress={() => router.push("/emergency")}
          style={({ pressed }) => ({
            backgroundColor: colors.laranja,
            borderRadius: 20,
            paddingVertical: 18,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
            shadowColor: colors.laranja,
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          })}
        >
          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 17,
              color: "#fff",
            }}
          >
            🚨 Socorro Doméstico
          </Text>
          <Text
            style={{
              fontFamily: "Nunito_400Regular",
              fontSize: 12,
              color: "rgba(255,255,255,0.8)",
              marginTop: 2,
            }}
          >
            Respostas rápidas para emergências
          </Text>
        </Pressable>

        {/* 4. Guias rápidos */}
        <View>
          <SectionTitle
            title="Guias rápidos"
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

        {/* 5. Conquistas */}
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
