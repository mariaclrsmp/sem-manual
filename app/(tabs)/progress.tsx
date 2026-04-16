import { Lock } from 'lucide-react-native'
import { Alert, Pressable, ScrollView, StatusBar, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Text } from '@/src/components/ui/Text'
import { ACHIEVEMENTS } from '@/src/constants/achievements'
import { colors, fonts } from '@/src/constants/theme'
import { useTasksStore } from '@/src/stores/tasksStore'
import { useThemeStore } from '@/src/stores/themeStore'
import { useCurrentLevelInfo, useUserStore } from '@/src/stores/userStore'

interface MetricCardProps {
  label: string
  value: number
  emoji: string
}

function useTheme() {
  const scheme = useThemeStore((s) => s.scheme)
  const dark = scheme === 'dark'
  return {
    dark,
    bg: dark ? '#0F172A' : colors.fundo,
    surface: dark ? '#1E293B' : '#ffffff',
    text: dark ? '#F1F5F9' : colors.texto,
    textMuted: dark ? 'rgba(241,245,249,0.5)' : '#9CA3AF',
    border: dark ? '#334155' : '#E5E7EB',
  }
}

function MetricCard({ label, value, emoji }: MetricCardProps) {
  const theme = useTheme()
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 4,
        shadowColor: theme.dark ? '#000' : '#2E2E2E',
        shadowOpacity: theme.dark ? 0.4 : 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: theme.dark ? 1 : 0,
        borderColor: theme.border,
      }}
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text
        style={{ fontFamily: fonts.extrabold, fontSize: 22, color: theme.text }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: fonts.regular,
          fontSize: 12,
          color: theme.textMuted,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  )
}

function AchievementBadge({
  achievement,
  unlocked,
}: {
  achievement: (typeof ACHIEVEMENTS)[number]
  unlocked: boolean
}) {
  const theme = useTheme()

  function handlePress() {
    if (unlocked) {
      Alert.alert(achievement.title, `${achievement.emoji} Desbloqueado!\n\n${achievement.description}`)
    } else {
      Alert.alert('🔒 Bloqueado', `Como desbloquear:\n${achievement.description}`, [
        { text: 'Ok' },
      ])
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        width: '31%',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
        opacity: pressed ? 0.7 : 1,
      })}
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
        <Text style={{ fontSize: 26, opacity: unlocked ? 1 : 0.3 }}>
          {achievement.emoji}
        </Text>
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
  )
}

export default function ProgressScreen() {
  const theme = useTheme()
  const { emoji, label, levelProgress, currentLevelXP, levelTotalXP, nextLabel } =
    useCurrentLevelInfo()
  const xpToNextLevel = useUserStore((s) => s.xpToNextLevel)
  const unlockedIds = useUserStore((s) => s.achievements)
  const todayTasks = useTasksStore((s) => s.todayTasks)

  const tasksCompleted = todayTasks.filter((t) => t.completed).length
  const progressPercent = Math.round(levelProgress * 100)

  const metrics: MetricCardProps[] = [
    { label: 'Tarefas hoje', value: tasksCompleted, emoji: '✅' },
    { label: 'Sequência atual', value: 0, emoji: '🔥' },
    { label: 'Guias lidos', value: 0, emoji: '📖' },
    { label: 'Emergências', value: 0, emoji: '🚨' },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.verde} />

      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.verde }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 }}>
          <Text
            style={{
              fontFamily: fonts.extrabold,
              fontSize: 22,
              color: '#fff',
              marginBottom: 20,
            }}
          >
            Meu Progresso
          </Text>

          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 64, lineHeight: 72 }}>{emoji}</Text>
            <Text
              style={{ fontFamily: fonts.extrabold, fontSize: 20, color: '#fff' }}
            >
              {label}
            </Text>

            <View style={{ width: '100%', gap: 6, marginTop: 4 }}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text
                  style={{
                    fontFamily: fonts.regular,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  {currentLevelXP} / {levelTotalXP} XP
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.bold,
                    fontSize: 12,
                    color: '#fff',
                  }}
                >
                  {progressPercent}%
                </Text>
              </View>

              <View
                style={{
                  height: 10,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: '#fff',
                    borderRadius: 999,
                  }}
                />
              </View>

              {nextLabel ? (
                <Text
                  style={{
                    fontFamily: fonts.regular,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.75)',
                    textAlign: 'center',
                    marginTop: 2,
                  }}
                >
                  {xpToNextLevel} XP para {nextLabel}
                </Text>
              ) : (
                <Text
                  style={{
                    fontFamily: fonts.semibold,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.9)',
                    textAlign: 'center',
                    marginTop: 2,
                  }}
                >
                  Nível máximo atingido 👑
                </Text>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção 2 — Stats */}
        <View style={{ gap: 12 }}>
          <Text
            style={{ fontFamily: fonts.extrabold, fontSize: 18, color: theme.text }}
          >
            Estatísticas
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <MetricCard {...metrics[0]} />
            <MetricCard {...metrics[1]} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <MetricCard {...metrics[2]} />
            <MetricCard {...metrics[3]} />
          </View>
        </View>

        {/* Seção 3 — Achievements */}
        <View style={{ gap: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: fonts.extrabold,
                fontSize: 18,
                color: theme.text,
              }}
            >
              Achievements
            </Text>
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: 13,
                color: theme.textMuted,
              }}
            >
              {unlockedIds.length}/{ACHIEVEMENTS.length}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {ACHIEVEMENTS.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={unlockedIds.includes(achievement.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
