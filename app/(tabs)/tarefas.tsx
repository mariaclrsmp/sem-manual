import { Text, View } from 'react-native';

export default function TarefasScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo">
      <Text className="text-texto text-2xl font-bold">Tarefas</Text>
      <Text className="text-texto/60 mt-2">Suas tarefas domésticas</Text>
    </View>
  );
}
