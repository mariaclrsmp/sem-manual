import { Text, View } from 'react-native';

export default function SocorroScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo px-6">
      <Text className="text-texto text-2xl font-bold">Socorro!</Text>
      <Text className="text-texto/60 mt-2">Ajuda rápida para emergências domésticas</Text>
    </View>
  );
}
