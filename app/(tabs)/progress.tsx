import { AlertTriangle, BookOpen, CheckCircle, Crown, Flame, Lock } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/src/components/ui/Text';
import { ACHIEVEMENTS } from '@/src/constants/achievements';
import { colors, fonts } from '@/src/constants/theme';
import { useTasksStore } from '@/src/stores/tasksStore';
import { useThemeStore } from '@/src/stores/themeStore';
import { useCurrentLevelInfo, useUserStore } from '@/src/stores/userStore';

type IconComponent = React.ComponentType<{ size: number; color: string }>;

interface MetricCardProps {
  label: string;
  value: number;
  Icon: IconComponent;
  iconColor: string;
  iconBg: string;
}

function useTheme() {
  const scheme = useThemeStore((s) => s.scheme);
  const dark = scheme === 'dark';
  return {
    dark,
    bg: dark ? '#0F172A' : colors.fundo,
    surface: dark ? '#1E293B' : '#ffffff',
    text: dark ? '#F1F5F9' : colors.texto,
    textMuted: dark ? 'rgba(241,245,249,0.5)' : '#9CA3AF',
    border: dark ? '#334155' : '#E5E7EB',
  };
}

function MetricCard({ label, value, Icon, iconColor, iconBg }: MetricCardProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        shadowColor: theme.dark ? '#000' : '#2E2E2E',
        shadowOpacity: theme.dark ? 0.4 : 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: theme.dark ? 1 : 0,
        borderColor: theme.border,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={22} color={iconColor} />
      </View>
      <Text style={{ fontFamily: fonts.extrabold, fontSize: 22, color: theme.text }}>{value}</Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
}: {
  achievement: (typeof ACHIEVEMENTS)[number];
  unlocked: boolean;
  unlockedAt?: string;
}) {
  const theme = useTheme();

  function handlePress() {
    if (unlocked) {
      const dateLabel = unlockedAt
        ? new Date(unlockedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
        : null;
      Alert.alert(
        achievement.title,
        `${achievement.description}${dateLabel ? `\n\nDesbloqueado em ${dateLabel}` : ''}`,
      );
    } else {
      Alert.alert('Bloqueado', `Como desbloquear:\n${achievement.description}`, [{ text: 'Ok' }]);
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: '31%',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: unlocked
            ? theme.dark ? '#14532D' : '#E8F7F0'
            : theme.dark ? '#1E293B' : '#F3F4F6',
          borderWidth: unlocked ? 2 : 1,
          borderColor: unlocked ? colors.verde : theme.border,
          shadowColor: unlocked ? colors.verde : 'transparent',
          shadowOpacity: unlocked ? 0.45 : 0,
          shadowRadius: unlocked ? 10 : 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: unlocked ? 5 : 0,
        }}
      >
        <Text style={{ fontSize: 26, opacity: unlocked ? 1 : 0.3 }}>{achievement.emoji}</Text>
        {!unlocked && (
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: theme.dark ? '#334155' : '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={11} color={theme.textMuted} />
          </View>
        )}
      </View>
      <Text
        style={{
          fontFamily: fonts.semibold,
          fontSize: 11,
          color: unlocked ? theme.text : theme.textMuted,
          textAlign: 'center',
          lineHeight: 15,
        }}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
    </Pressable>
  );
}

export default function ProgressScreen() {
  const theme = useTheme();
  const { emoji, label, levelProgress, currentLevelXP, levelTotalXP, nextLabel, xpToNextLevel } =
    useCurrentLevelInfo();
  const achievements = useUserStore((s) => s.achievements);
  const unlockedMap = new Map(achievements.map((a) => [a.achievement_id, a.unlocked_at]));
  const todayTasks = useTasksStore((s) => s.todayTasks);

  const tasksCompleted = todayTasks.filter((t) => t.completed).length;
  const progressPercent = Math.round(levelProgress * 100);

  const metrics: MetricCardProps[] = [
    { label: 'Tarefas hoje',    value: tasksCompleted, Icon: CheckCircle,  iconColor: colors.verde,  iconBg: '#E8F7F0' },
    { label: 'Sequencia atual', value: 0,              Icon: Flame,         iconColor: '#FF8C42',     iconBg: '#FFF3EB' },
    { label: 'Guias lidos',     value: 0,              Icon: BookOpen,      iconColor: colors.azul,   iconBg: '#EAF0F9' },
    { label: 'Emergencias',     value: 0,              Icon: AlertTriangle, iconColor: '#DC2626',     iconBg: '#FFF1F1' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.verde} />

      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.verde }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 }}>
          <Text style={{ fontFamily: fonts.extrabold, fontSize: 22, color: '#fff', marginBottom: 20 }}>
            Meu Progresso
          </Text>

          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 64, lineHeight: 72 }}>{emoji}</Text>
            <Text style={{ fontFamily: fonts.extrabold, fontSize: 20, color: '#fff' }}>{label}</Text>

            <View style={{ width: '100%', gap: 6, marginTop: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                  {currentLevelXP} / {levelTotalXP} XP
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: '#fff' }}>{progressPercent}%</Text>
              </View>

              <View style={{ height: 10, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#fff', borderRadius: 999 }} />
              </View>

              {nextLabel ? (
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 2 }}>
                  {xpToNextLevel} XP para {nextLabel}
                </Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 }}>
                  <Crown size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                    Nivel maximo atingido
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 28 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: fonts.extrabold, fontSize: 18, color: theme.text }}>Estatisticas</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <MetricCard {...metrics[0]} />
            <MetricCard {...metrics[1]} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <MetricCard {...metrics[2]} />
            <MetricCard {...metrics[3]} />
          </View>
        </View>

        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.extrabold, fontSize: 18, color: theme.text }}>Conquistas</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: theme.textMuted }}>
              {unlockedMap.size}/{ACHIEVEMENTS.length}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {ACHIEVEMENTS.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={unlockedMap.has(achievement.id)}
                unlockedAt={unlockedMap.get(achievement.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
