import { Text, View } from 'react-native';

export default function ProgressoScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo">
      <Text className="text-texto text-2xl font-bold">Progresso</Text>
      <Text className="text-texto/60 mt-2">Sua evolução na vida adulta</Text>
    </View>
  );
}
