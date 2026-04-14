import { router } from "expo-router";
import { Pressable, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProactiveCard } from "@/src/components/features/ProactiveCard";
import { TaskItem } from "@/src/components/features/TaskItem";
import { Text } from "@/src/components/ui/Text";
import { colors } from "@/src/constants/theme";
import { useTasksStore } from "@/src/stores/tasksStore";
import { useCurrentLevelInfo, useUserStore } from "@/src/stores/userStore";

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
          color: colors.texto,
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
  return (
    <Pressable
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        gap: 8,
        opacity: pressed ? 0.75 : 1,
        shadowColor: "#2E2E2E",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      })}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <Text
        style={{
          fontFamily: "Nunito_700Bold",
          fontSize: 13,
          color: colors.texto,
          lineHeight: 18,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: "Nunito_400Regular",
          fontSize: 12,
          color: "#9CA3AF",
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
          backgroundColor: unlocked ? "#E8F7F0" : "#F3F4F6",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: unlocked ? 2 : 1,
          borderColor: unlocked ? colors.verde : "#E5E7EB",
        }}
      >
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <Text
        style={{
          fontFamily: "Nunito_600SemiBold",
          fontSize: 11,
          color: colors.texto,
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

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const name = useUserStore((s) => s.name);
  const addXP = useUserStore((s) => s.addXP);
  const { todayTasks, completeTask, todayXP } = useTasksStore();

  const handleCompleteTask = (id: string) => {
    const task = todayTasks.find((t) => t.id === id);
    if (task && !task.completed) {
      completeTask(id);
      addXP(task.xp);
    }
  };

  const pendingTasks = todayTasks.filter((t) => !t.completed);
  const completedTasks = todayTasks.filter((t) => t.completed);

  return (
    <View style={{ flex: 1, backgroundColor: colors.fundo }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.verde} />

      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.verde }}>
        <View
          style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}
        >
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
        <XPCard />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Proactive card */}
        <ProactiveCard
          type="tip"
          message="Faz mais de 1 semana que o banheiro não é limpo. Que tal hoje?"
          action="Adicionar na lista de hoje?"
          onAction={() => {}}
        />

        {/* 2. Today's tasks */}
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
                  color: "#6B7280",
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
                color: "#9CA3AF",
                textAlign: "center",
                paddingVertical: 16,
              }}
            >
              Nenhuma tarefa para hoje 🎉
            </Text>
          )}
        </View>

        {/* 3. Emergency button */}
        <Pressable
          onPress={() => router.navigate("/emergency" as any)}
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

        {/* 4. Guides grid */}
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

        {/* 5. Achievements */}
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
