import { Plus } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TaskItem } from "@/src/components/features/TaskItem";
import { Text } from "@/src/components/ui/Text";
import { colors, fonts } from "@/src/constants/theme";
import type { TaskCategory } from "@/src/stores/tasksStore";
import { useTasksStore } from "@/src/stores/tasksStore";
import { useThemeStore } from "@/src/stores/themeStore";
import { useUserStore } from "@/src/stores/userStore";

// ─── theme ────────────────────────────────────────────────────────────────────

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
  };
}

type Theme = ReturnType<typeof useTheme>;

// ─── constants ────────────────────────────────────────────────────────────────

type FilterKey = "all" | TaskCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "cleaning", label: "Limpeza" },
  { key: "grocery", label: "Mercado" },
  { key: "home", label: "Casa" },
  { key: "pet", label: "Pet" },
];

const QUICK_SUGGESTIONS: { title: string; category: TaskCategory; xp: number }[] = [
  { title: "Lavar a louça", category: "cleaning", xp: 15 },
  { title: "Fazer a cama", category: "home", xp: 5 },
  { title: "Tirar o lixo", category: "home", xp: 10 },
  { title: "Passar pano no chão", category: "cleaning", xp: 20 },
  { title: "Verificar geladeira", category: "grocery", xp: 10 },
];

const CATEGORY_OPTIONS: { key: TaskCategory; label: string }[] = [
  { key: "cleaning", label: "Limpeza" },
  { key: "grocery", label: "Mercado" },
  { key: "home", label: "Casa" },
  { key: "pet", label: "Pet" },
  { key: "maintenance", label: "Manutenção" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(): string {
  const now = new Date();
  const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${weekdays[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── add task modal ────────────────────────────────────────────────────────────

function AddTaskModal({
  visible,
  onClose,
  onAdd,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, category: TaskCategory) => void;
  theme: Theme;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("home");

  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title.trim(), category);
    setTitle("");
    setCategory("home");
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable
          style={[s.modalSheet, { backgroundColor: theme.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[s.modalHandle, { backgroundColor: theme.border }]} />

          <Text style={[s.modalTitle, { color: theme.text }]}>Nova Tarefa</Text>

          <TextInput
            style={[
              s.modalInput,
              { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg },
            ]}
            placeholder="Nome da tarefa..."
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />

          <Text style={[s.modalLabel, { color: theme.textMuted }]}>Categoria</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.modalCategoryRow}
          >
            {CATEGORY_OPTIONS.map((opt) => {
              const active = category === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setCategory(opt.key)}
                  style={[
                    s.filterChip,
                    {
                      backgroundColor: active ? colors.verde : theme.surface,
                      borderColor: active ? colors.verde : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.filterChipText,
                      { color: active ? "#fff" : theme.textMuted },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            style={[s.addButton, !title.trim() && s.addButtonDisabled]}
            onPress={handleAdd}
          >
            <Text style={s.addButtonText}>Adicionar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── screen ───────────────────────────────────────────────────────────────────

export default function TasksScreen() {
  const theme = useTheme();
  const { todayTasks, loadTodayTasks, completeTask, addTask } = useTasksStore();
  const user = useUserStore((s) => s.user);
  const userId = user?.id ?? null;

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userId) loadTodayTasks(userId);
  }, [userId]);

  const pending = useMemo(
    () =>
      todayTasks.filter(
        (t) => !t.completed && (activeFilter === "all" || t.category === activeFilter),
      ),
    [todayTasks, activeFilter],
  );

  const completed = useMemo(
    () =>
      todayTasks.filter(
        (t) => t.completed && (activeFilter === "all" || t.category === activeFilter),
      ),
    [todayTasks, activeFilter],
  );

  const totalCompleted = todayTasks.filter((t) => t.completed).length;
  const xpToday = todayTasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.xp, 0);

  const quickSuggestions = QUICK_SUGGESTIONS.filter(
    (sg) => !todayTasks.some((t) => t.title === sg.title),
  ).slice(0, 4);

  async function handleAddSuggestion(sg: (typeof QUICK_SUGGESTIONS)[0]) {
    if (!userId) return;
    await addTask({
      user_id: userId,
      title: sg.title,
      category: sg.category,
      xp: sg.xp,
      completed: false,
      date: todayStr(),
    });
  }

  async function handleAddTask(title: string, category: TaskCategory) {
    if (!userId) return;
    await addTask({
      user_id: userId,
      title,
      category,
      xp: 10,
      completed: false,
      date: todayStr(),
    });
  }

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.verde} />

      {/* ── HEADER ── */}
      <SafeAreaView edges={["top"]} style={s.header}>
        <View style={s.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Minhas Tarefas</Text>
            <Text style={s.headerDate}>{formatDate()}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [s.addBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => setShowModal(true)}
          >
            <Plus size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={s.statsRow}>
          <View style={s.statChip}>
            <Text style={s.statChipText}>
              {totalCompleted}/{todayTasks.length} Concluídas
            </Text>
          </View>
          <View style={s.statChip}>
            <Text style={s.statChipText}>+{xpToday} XP hoje</Text>
          </View>
          <View style={s.statChip}>
            <Text style={s.statChipText}>🔥 0 dias</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── FILTROS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filtersRow}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={[
                  s.filterChip,
                  {
                    backgroundColor: active ? colors.verde : theme.surface,
                    borderColor: active ? colors.verde : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    s.filterChipText,
                    { color: active ? "#fff" : theme.textMuted },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── SUGESTÕES RÁPIDAS ── */}
        {quickSuggestions.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: theme.text }]}>
              Sugestões rápidas
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {quickSuggestions.map((sg) => (
                <Pressable
                  key={sg.title}
                  onPress={() => handleAddSuggestion(sg)}
                  style={({ pressed }) => [s.suggestionChip, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={s.suggestionText}>+ {sg.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── PENDENTES ── */}
        {pending.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: theme.text }]}>
              Pendentes ({pending.length})
            </Text>
            <View style={{ gap: 10 }}>
              {pending.map((t) => (
                <TaskItem key={t.id} task={t} onComplete={completeTask} />
              ))}
            </View>
          </View>
        )}

        {/* ── CONCLUÍDAS ── */}
        {completed.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: theme.text }]}>
              Concluídas ({completed.length})
            </Text>
            <View style={{ gap: 10 }}>
              {completed.map((t) => (
                <TaskItem key={t.id} task={t} onComplete={completeTask} />
              ))}
            </View>
          </View>
        )}

        {/* ── EMPTY STATE ── */}
        {pending.length === 0 && completed.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>🎉</Text>
            <Text style={[s.emptyTitle, { color: theme.text }]}>
              Nenhuma tarefa por aqui
            </Text>
            <Text style={[s.emptySubtitle, { color: theme.textMuted }]}>
              Toque em + para adicionar uma nova tarefa
            </Text>
          </View>
        )}
      </ScrollView>

      <AddTaskModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddTask}
        theme={theme}
      />
    </View>
  );
}

// ─── styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header — fundo verde fixo, padrão igual à Home
  header: {
    backgroundColor: colors.verde,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: "#fff",
  },
  headerDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  statChipText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: "#fff",
  },

  // Scroll
  scrollContent: {
    paddingBottom: 40,
  },

  // Filters
  filtersRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },

  // Quick suggestions
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.verde,
    borderStyle: "dashed",
    backgroundColor: colors.primaryLight,
  },
  suggestionText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.verde,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    marginBottom: 20,
  },
  modalLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginBottom: 10,
  },
  modalCategoryRow: {
    gap: 8,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: colors.verde,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: "#fff",
  },
});
