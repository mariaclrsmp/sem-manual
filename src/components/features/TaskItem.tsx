import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/theme';
import type { TaskCategory, TodayTask } from '@/src/stores/tasksStore';

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; background: string }> = {
  cleaning: { label: 'Limpeza', color: colors.azul,   background: '#EAF0F9' },
  grocery:  { label: 'Mercado', color: '#6B7280',      background: '#F3F4F6' },
  home:     { label: 'Casa',    color: colors.verde,   background: '#E8F7F0' },
  pet:      { label: 'Pet',     color: colors.laranja, background: '#FFF3EB' },
};

interface TaskItemProps {
  task: TodayTask;
  onComplete: (id: string) => void;
}

export function TaskItem({ task, onComplete }: TaskItemProps) {
  const { id, title, category, completed, xp } = task;
  const cat = CATEGORY_CONFIG[category];

  const checkScale   = useRef(new Animated.Value(completed ? 1 : 0)).current;
  const xpOpacity    = useRef(new Animated.Value(0)).current;
  const xpTranslate  = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(completed ? 0.45 : 1)).current;
  const hasAnimated  = useRef(completed);

  useEffect(() => {
    if (!completed || hasAnimated.current) return;
    hasAnimated.current = true;

    Animated.spring(checkScale, {
      toValue: 1,
      damping: 12,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(titleOpacity, {
      toValue: 0.45,
      duration: 250,
      useNativeDriver: true,
    }).start();

    xpTranslate.setValue(0);
    xpOpacity.setValue(1);
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(xpTranslate, { toValue: -28, duration: 600, useNativeDriver: true }),
        Animated.timing(xpOpacity,   { toValue: 0,   duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, [completed]);

  return (
    <Pressable
      onPress={() => !completed && onComplete(id)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
        opacity: pressed && !completed ? 0.75 : 1,
        shadowColor: '#2E2E2E',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      })}
    >
      {/* Circular checkbox */}
      <View style={{ width: 28, height: 28 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: completed ? colors.verde : '#D1D5DB',
            backgroundColor: completed ? colors.verde : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.Text
            style={{ fontSize: 14, color: '#fff', transform: [{ scale: checkScale }], lineHeight: 18 }}
          >
            ✓
          </Animated.Text>
        </View>

        {/* Floating XP badge */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -4,
            left: -2,
            opacity: xpOpacity,
            transform: [{ translateY: xpTranslate }],
          }}
        >
          <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 12, color: colors.verde }}>
            +{xp} XP
          </Text>
        </Animated.View>
      </View>

      {/* Title */}
      <Animated.View style={{ flex: 1, opacity: titleOpacity }}>
        <Text
          style={{
            fontFamily: completed ? 'Nunito_400Regular' : 'Nunito_600SemiBold',
            fontSize: 15,
            color: colors.texto,
            textDecorationLine: completed ? 'line-through' : 'none',
            lineHeight: 21,
          }}
        >
          {title}
        </Text>
      </Animated.View>

      {/* Category tag */}
      <View
        style={{
          backgroundColor: cat.background,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 11, color: cat.color }}>
          {cat.label}
        </Text>
      </View>
    </Pressable>
  );
}
