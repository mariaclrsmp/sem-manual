import { Text, View } from 'react-native';

export default function CadastroScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo px-6">
      <Text className="text-texto text-3xl font-extrabold mb-2">Criar conta</Text>
      <Text className="text-texto/60 text-base mb-10">Comece sua jornada</Text>
    </View>
  );
}
