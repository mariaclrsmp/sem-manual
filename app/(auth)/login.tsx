import { Text, View } from 'react-native';

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-fundo px-6">
      <Text className="text-texto text-3xl font-extrabold mb-2">Sem Manual</Text>
      <Text className="text-texto/60 text-base mb-10">Bem-vindo de volta</Text>
    </View>
  );
}
