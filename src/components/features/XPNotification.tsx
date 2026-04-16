import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

import { Text } from '@/src/components/ui/Text'

interface XPNotificationProps {
  visible: boolean
  type: 'xp' | 'achievement'
  xpAmount?: number
  achievementTitle?: string
}

const SLIDE_DISTANCE = 80
const VISIBLE_DURATION = 2000
const ANIM_DURATION = 350

export function XPNotification({
  visible,
  type,
  xpAmount,
  achievementTitle,
}: XPNotificationProps) {
  const translateY = useRef(new Animated.Value(SLIDE_DISTANCE)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) return

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    ]).start()

    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -SLIDE_DISTANCE,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        translateY.setValue(SLIDE_DISTANCE)
      })
    }, VISIBLE_DURATION)

    return () => clearTimeout(exitTimer)
  }, [visible])

  const isAchievement = type === 'achievement'

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { transform: [{ translateY }], opacity },
        isAchievement ? styles.achievementBg : styles.xpBg,
      ]}
    >
      {isAchievement ? (
        <View style={styles.row}>
          <Text style={styles.achievementText}>
            🏆 Conquista Desbloqueada!
          </Text>
          {achievementTitle && (
            <Text style={styles.achievementTitle} numberOfLines={1}>
              {achievementTitle}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.xpText}>+{xpAmount} XP ⭐</Text>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 999,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    maxWidth: 320,
  },
  xpBg: {
    backgroundColor: '#5DBB8A',
    shadowColor: '#5DBB8A',
  },
  achievementBg: {
    backgroundColor: '#B8860B',
    shadowColor: '#FFD700',
  },
  row: {
    alignItems: 'center',
    gap: 2,
  },
  xpText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#fff',
  },
  achievementText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#FFD700',
  },
  achievementTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: '#fff',
  },
})
