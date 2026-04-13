import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo">
      <Text className="text-texto text-2xl font-bold">Sem Manual</Text>
      <Text className="text-texto/60 mt-2">Seu companheiro de vida adulta</Text>
    </View>
  );
}
