import { Bell, Lightbulb, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/theme';

type CardType = 'alert' | 'tip' | 'achievement';
type IconComponent = React.ComponentType<{ size: number; color: string }>;

interface ProactiveCardProps {
  message: string;
  action?: string;
  onAction?: () => void;
  type: CardType;
}

const CONFIG: Record<CardType, { Icon: IconComponent; background: string; border: string; iconColor: string }> = {
  alert:       { Icon: Bell,      background: '#EAF0F9', border: '#C5D8F0', iconColor: colors.azul },
  tip:         { Icon: Lightbulb, background: '#EAF0F9', border: '#C5D8F0', iconColor: colors.azul },
  achievement: { Icon: Star,      background: '#E8F7F0', border: '#B6E8D2', iconColor: colors.verde },
};

export function ProactiveCard({ message, action, onAction, type }: ProactiveCardProps) {
  const { Icon, background, border, iconColor } = CONFIG[type];

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
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: 'rgba(255,255,255,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} color={iconColor} />
      </View>

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
