import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';

export default function GuidesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo px-6">
      <Text className="text-texto text-2xl font-bold">Guias</Text>
      <Text className="text-texto/60 mt-2">Guias práticos de vida doméstica</Text>
    </View>
  );
}
