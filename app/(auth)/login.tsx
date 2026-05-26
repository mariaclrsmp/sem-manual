import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/src/components/ui/Text";
import { signIn, signUp } from "@/src/services/authService";
import { Crown, Eye, EyeOff, Mail, Sprout, Wrench } from "lucide-react-native";

type Mode = "login" | "signup";

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Informe seu nome (minimo 2 caracteres).");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error: authError } = await signIn(email.trim(), password);
      if (authError) {
        const msg = authError.message ?? "";
        if (msg === "email_not_confirmed") {
          setInfo(
            "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
          );
        } else {
          setError("E-mail ou senha incorretos.");
        }
      }
    } else {
      const { error: authError } = await signUp(
        name.trim(),
        email.trim(),
        password,
      );
      if (authError) {
        const msg = authError.message ?? "";
        if (msg === "email_confirmation_required") {
          setInfo(
            "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
          );
        } else {
          setError(
            authError.message ??
              "Nao foi possivel criar a conta. Tente novamente.",
          );
        }
      }
    }

    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            locations={[0.3, 1]}
            colors={["rgba(255,140,66,0.85)", "rgba(93,187,138,0.85)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>Sem Manual</Text>
            <Text style={styles.welcomeSubtitle}>Seu assistente domestico</Text>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.modeToggle}>
              <Pressable
                onPress={() => switchMode("login")}
                style={[
                  styles.modeTab,
                  mode === "login" && styles.modeTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    mode === "login" && styles.modeTabTextActive,
                  ]}
                >
                  Entrar
                </Text>
              </Pressable>
              <Pressable
                onPress={() => switchMode("signup")}
                style={[
                  styles.modeTab,
                  mode === "signup" && styles.modeTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    mode === "signup" && styles.modeTabTextActive,
                  ]}
                >
                  Criar conta
                </Text>
              </Pressable>
            </View>

            {mode === "signup" && (
              <>
                <Text style={styles.inputLabel}>NOME</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderBottomColor: nameFocused ? "#5DBB8A" : "#E5E7EB" },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  placeholderTextColor="#C5C5C5"
                  autoCapitalize="words"
                  autoCorrect={false}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  returnKeyType="next"
                />
                <View style={styles.gap20} />
              </>
            )}

            <Text style={styles.inputLabel}>E-MAIL</Text>
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: emailFocused ? "#5DBB8A" : "#E5E7EB" },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor="#C5C5C5"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              returnKeyType="next"
            />

            <View style={styles.gap20} />

            <Text style={styles.inputLabel}>SENHA</Text>
            <View
              style={[
                styles.passwordRow,
                { borderBottomColor: passwordFocused ? "#5DBB8A" : "#E5E7EB" },
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#C5C5C5"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                {showPassword ? (
                  <EyeOff size={20} color="#5DBB8A" />
                ) : (
                  <Eye size={20} color="#5DBB8A" />
                )}
              </Pressable>
            </View>

            {mode === "login" && (
              <>
                <View style={styles.gap8} />
                <Pressable style={styles.forgotLink} hitSlop={8}>
                  <Text style={styles.forgotText}>Esqueci minha senha</Text>
                </Pressable>
              </>
            )}

            <View style={styles.gap24} />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {info ? (
              <View style={styles.infoBox}>
                <Mail size={16} color="#5DBB8A" />
                <Text style={styles.infoText}>{info}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.primaryBtn, loading && styles.disabled]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === "login" ? "ENTRAR" : "CRIAR CONTA"}
                </Text>
              )}
            </Pressable>

            <View style={styles.infoCard}>
              <View style={[styles.infoRow, { marginBottom: 8 }]}>
                <Sprout size={18} color="#FF8C42" />
                <Text style={styles.infoCardText}>
                  Ganhe XP por cada tarefa
                </Text>
              </View>
              <View style={[styles.infoRow, { marginBottom: 8 }]}>
                <Wrench size={16} color="#FF8C42" />
                <Text style={styles.infoCardText}>
                  Guias praticos para o dia a dia
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Crown size={18} color="#FF8C42" />
                <Text style={styles.infoCardText}>
                  Evolua de Iniciante a Mestre da Casa
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F7F9" },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { height: 260, alignItems: "center", justifyContent: "center" },
  logo: { width: 120, height: 120 },
  welcomeTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 36,
    color: "#fff",
    marginTop: 4,
  },
  welcomeSubtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
    marginTop: 24,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: "#9CA3AF",
  },
  modeTabTextActive: { color: "#2E2E2E", fontFamily: "Nunito_700Bold" },
  inputLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#8A8E9B",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    borderBottomWidth: 2,
    paddingVertical: 10,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#2E2E2E",
    backgroundColor: "transparent",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#2E2E2E",
    backgroundColor: "transparent",
  },
  forgotLink: { alignSelf: "center" },
  forgotText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    color: "#5DBB8A",
  },
  gap8: { height: 8 },
  gap20: { height: 20 },
  gap24: { height: 24 },
  errorBox: {
    backgroundColor: "#FFF1F1",
    borderColor: "#FFB4B4",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: "#DC2626",
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: "#15803D",
    flex: 1,
  },
  primaryBtn: {
    backgroundColor: "#5DBB8A",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 24,
  },
  disabled: { opacity: 0.6 },
  primaryBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#fff", letterSpacing: 1 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { fontFamily: "Nunito_400Regular", fontSize: 13, color: "#9CA3AF" },
  infoCard: { backgroundColor: "#FFF8F0", borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: "#FF8C42" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoCardText: { fontFamily: "Nunito_700Bold", fontSize: 13, color: "#2E2E2E", flex: 1 },
});
