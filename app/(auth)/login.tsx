import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/src/components/ui/Text";
import { signInWithGoogle } from "@/src/services/authService";

// Deve ser chamado na tela de auth para fechar o browser ao retornar do OAuth
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError("Não foi possível entrar. Tente novamente.");
      console.error("[Auth] signInWithGoogle:", authError.message);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-fundo">
      <View className="flex-1 px-8 justify-between py-12">
        {/* Header / branding */}
        <View className="items-center mt-8">
          <Image
            source={require("../../assets/images/logo.png")}
            className="w-20 h-20"
          />
          <Text className="text-texto text-4xl font-extrabold tracking-tight">
            Sem Manual
          </Text>
          <Text className="text-texto/50 text-base mt-2 text-center leading-6">
            Um assistente doméstico para te ajudar numa fase sem manual
          </Text>
        </View>

        {/* Ilustração central */}
        <View className="items-center gap-y-4">
          <View className="bg-white rounded-3xl px-6 py-5 w-full shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-x-3 mb-3">
              <Text className="text-2xl">🌱</Text>
              <Text className="text-texto font-bold text-base">
                Ganhe XP por cada tarefa
              </Text>
            </View>
            <View className="flex-row items-center gap-x-3 mb-3">
              <Text className="text-2xl">🔧</Text>
              <Text className="text-texto font-bold text-base">
                Guias práticos para o dia a dia
              </Text>
            </View>
            <View className="flex-row items-center gap-x-3">
              <Text className="text-2xl">👑</Text>
              <Text className="text-texto font-bold text-base">
                Evolua de Iniciante a Mestre da Casa
              </Text>
            </View>
          </View>
        </View>

        {/* Botão de login + erro */}
        <View className="gap-y-4">
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <Text className="text-red-600 text-sm text-center">{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="flex-row items-center justify-center gap-x-3 bg-white border border-gray-200 rounded-2xl py-4 shadow-sm active:opacity-70"
          >
            {loading ? (
              <ActivityIndicator color="#5DBB8A" size="small" />
            ) : (
              <>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: "#EA4335",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 13,
                      fontFamily: "Nunito_800ExtraBold",
                      lineHeight: 18,
                    }}
                  >
                    G
                  </Text>
                </View>
                <Text className="text-texto font-bold text-base">
                  Entrar com Google
                </Text>
              </>
            )}
          </Pressable>

          <Text className="text-texto/40 text-xs text-center leading-5">
            Ao entrar, você concorda com nossos{"\n"}
            Termos de Uso e Política de Privacidade
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
