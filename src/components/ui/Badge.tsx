import { View } from 'react-native';

import { Text } from './Text';

type Variant = 'success' | 'info' | 'reward' | 'neutral';

const variantStyles: Record<Variant, { container: string; text: string }> = {
  success: { container: 'bg-verde/20', text: 'text-verde' },
  info: { container: 'bg-azul/20', text: 'text-azul' },
  reward: { container: 'bg-laranja/20', text: 'text-laranja' },
  neutral: { container: 'bg-gray-200', text: 'text-gray-600' },
};

interface BadgeProps {
  variant?: Variant;
  label: string;
}

export function Badge({ variant = 'neutral', label }: BadgeProps) {
  return (
    <View className={`self-start rounded-full px-3 py-1 ${variantStyles[variant].container}`}>
      <Text className={`text-xs font-semibold ${variantStyles[variant].text}`}>{label}</Text>
    </View>
  );
}
