import { Text, View } from 'react-native';

export default function GuiasScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo">
      <Text className="text-texto text-2xl font-bold">Guias</Text>
      <Text className="text-texto/60 mt-2">Guias práticos de vida adulta</Text>
    </View>
  );
}
