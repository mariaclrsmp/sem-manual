import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';

export default function SignupScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo px-6">
      <Text className="text-texto text-3xl font-extrabold mb-2">Sem Manual</Text>
      <Text className="text-texto/60 text-base mb-10">Crie sua conta</Text>
    </View>
  );
}
