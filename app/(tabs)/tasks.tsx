import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';

export default function TasksScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo px-6">
      <Text className="text-texto text-2xl font-bold">Tarefas</Text>
      <Text className="text-texto/60 mt-2">Suas tarefas do dia</Text>
    </View>
  );
}
