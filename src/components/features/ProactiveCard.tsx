import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/theme';

type CardType = 'alert' | 'tip' | 'achievement';

interface ProactiveCardProps {
  message: string;
  action?: string;
  onAction?: () => void;
  type: CardType;
}

const CONFIG: Record<CardType, { icon: string; background: string; border: string }> = {
  alert:       { icon: '⏰', background: '#EAF0F9', border: '#C5D8F0' },
  tip:         { icon: '💡', background: '#EAF0F9', border: '#C5D8F0' },
  achievement: { icon: '⭐', background: '#E8F7F0', border: '#B6E8D2' },
};

export function ProactiveCard({ message, action, onAction, type }: ProactiveCardProps) {
  const { icon, background, border } = CONFIG[type];

  return (
    <View
      style={{
        backgroundColor: background,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 22, lineHeight: 28 }}>{icon}</Text>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: 14,
            color: colors.texto,
            lineHeight: 20,
          }}
        >
          {message}
        </Text>

        {action && (
          <Pressable onPress={onAction} hitSlop={8}>
            {({ pressed }) => (
              <Text
                style={{
                  fontFamily: 'Nunito_600SemiBold',
                  fontSize: 13,
                  color: colors.azul,
                  opacity: pressed ? 0.6 : 1,
                }}
              >
                {action} →
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
