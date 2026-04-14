import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';

export default function OnboardingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo px-6">
      <Text className="text-texto text-2xl font-bold">Onboarding</Text>
      <Text className="text-texto/60 mt-2">Vamos configurar seu perfil</Text>
    </View>
  );
}
