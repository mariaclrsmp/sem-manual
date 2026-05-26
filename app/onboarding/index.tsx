import { router } from "expo-router";
import {
  ArrowRight,
  BedDouble,
  BookOpen,
  Building2,
  CheckCircle,
  CheckSquare,
  Hand,
  Home,
  PawPrint,
  Smile,
  Trophy,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/src/components/ui/Text";
import * as routinesService from "@/src/services/routinesService";
import * as userService from "@/src/services/userService";
import { useProfileStore, type HomeType } from "@/src/stores/profileStore";
import { useThemeStore } from "@/src/stores/themeStore";
import { useUserStore } from "@/src/stores/userStore";

const GREEN = "#5DBB8A";
const GREEN_DARK = "#4AA876";

function useTheme() {
  const scheme = useThemeStore((s) => s.scheme);
  const dark = scheme === "dark";
  return {
    dark,
    bg: dark ? "#0F172A" : "#F6F7F9",
    surface: dark ? "#1E293B" : "#ffffff",
    text: dark ? "#F1F5F9" : "#2E2E2E",
    textMuted: dark ? "rgba(241,245,249,0.55)" : "#6B7280",
    border: dark ? "#334155" : "#E5E7EB",
    inputBg: dark ? "#0F172A" : "#F9FAFB",
  };
}

type Step = "welcome" | "name" | "home_type" | "pet";
const STEPS: Step[] = ["welcome", "name", "home_type", "pet"];

type HomeOption = {
  value: HomeType;
  label: string;
  description: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
};

const HOME_OPTIONS: HomeOption[] = [
  { value: "studio", label: "Studio / Kitnet", description: "Espaco compacto e multifuncional", Icon: BedDouble },
  { value: "apartment", label: "Apartamento", description: "Sala, quarto(s) e cozinha separados", Icon: Building2 },
  { value: "house", label: "Casa", description: "Mais espaco, mais responsabilidades", Icon: Home },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [homeType, setHomeType] = useState<HomeType | null>(null);
  const [hasPet, setHasPet] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  function animateToNext(nextIndex: number) {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -40, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setStepIndex(nextIndex);
      slideAnim.setValue(40);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }

  function goNext() {
    const next = stepIndex + 1;
    if (next < STEPS.length) animateToNext(next);
  }

  async function finish() {
    if (!user?.id || !homeType || hasPet === null) return;
    setSaving(true);
    const profile = { name: name.trim() || user.name, home_type: homeType, has_pet: hasPet };
    await userService.saveOnboardingProfile(user.id, profile);
    await routinesService.createDefaultRoutines(user.id, profile);
    useProfileStore.getState().setProfile(profile);
    useUserStore.getState().saveProfile(profile);
    setSaving(false);
    router.replace("/onboarding/starter-pack");
  }

  const currentStep = STEPS[stepIndex];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.bg} />

      <View style={styles.progressContainer}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, { backgroundColor: i <= stepIndex ? GREEN : theme.border, width: i === stepIndex ? 24 : 8 }]}
          />
        ))}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {currentStep === "welcome" && <WelcomeStep theme={theme} onNext={goNext} />}
          {currentStep === "name" && (
            <NameStep theme={theme} name={name} onChangeName={setName} onNext={goNext} canProceed={name.trim().length >= 2} />
          )}
          {currentStep === "home_type" && (
            <HomeTypeStep theme={theme} selected={homeType} onSelect={setHomeType} onNext={goNext} canProceed={homeType !== null} />
          )}
          {currentStep === "pet" && (
            <PetStep theme={theme} selected={hasPet} onSelect={setHasPet} onFinish={finish} canProceed={hasPet !== null} saving={saving} />
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function WelcomeStep({ theme, onNext }: { theme: ReturnType<typeof useTheme>; onNext: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const features = [
    { Icon: CheckSquare, text: "Tarefas e rotinas do lar" },
    { Icon: Trophy, text: "Conquistas e XP pelo progresso" },
    { Icon: BookOpen, text: "Guias praticos para o dia a dia" },
  ] as const;

  return (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logoImage} resizeMode="contain" />
      </View>

      <Text style={[styles.welcomeTitle, { color: theme.text }]}>
        {"Bem-vindo(a) ao\n"}
        <Text style={[styles.welcomeTitle, { color: GREEN }]}>Sem Manual</Text>
      </Text>
      <Text style={[styles.welcomeSubtitle, { color: theme.textMuted }]}>
        Seu companheiro para aprender a morar sozinho, sem estresse e com confianca.
      </Text>

      <View style={styles.featureList}>
        {features.map(({ Icon, text }) => (
          <View key={text} style={[styles.featureItem, { backgroundColor: theme.surface }]}>
            <Icon size={20} color={GREEN} />
            <Text style={[styles.featureText, { color: theme.text }]}>{text}</Text>
          </View>
        ))}
      </View>

      <ContinueButton onPress={onNext} />
    </Animated.View>
  );
}

function NameStep({
  theme, name, onChangeName, onNext, canProceed,
}: {
  theme: ReturnType<typeof useTheme>; name: string; onChangeName: (v: string) => void; onNext: () => void; canProceed: boolean;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={[styles.stepIconContainer, { backgroundColor: `${GREEN}18` }]}>
        <Hand size={32} color={GREEN} />
      </View>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Como posso te chamar?</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textMuted }]}>
        Vou usar seu nome para personalizar a experiencia.
      </Text>
      <TextInput
        style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: name.length > 0 ? GREEN : theme.border, color: theme.text }]}
        placeholder="Seu nome"
        placeholderTextColor={theme.textMuted}
        value={name}
        onChangeText={onChangeName}
        autoFocus
        returnKeyType="next"
        onSubmitEditing={canProceed ? onNext : undefined}
        maxLength={40}
      />
      <ContinueButton onPress={onNext} disabled={!canProceed} />
    </View>
  );
}

function HomeTypeStep({
  theme, selected, onSelect, onNext, canProceed,
}: {
  theme: ReturnType<typeof useTheme>; selected: HomeType | null; onSelect: (v: HomeType) => void; onNext: () => void; canProceed: boolean;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={[styles.stepIconContainer, { backgroundColor: `${GREEN}18` }]}>
        <Home size={32} color={GREEN} />
      </View>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Como e o seu lar?</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textMuted }]}>
        Vou sugerir rotinas e tarefas adequadas para o seu espaco.
      </Text>
      <View style={styles.optionsContainer}>
        {HOME_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[styles.optionCard, { backgroundColor: isSelected ? `${GREEN}18` : theme.surface, borderColor: isSelected ? GREEN : theme.border }]}
            >
              <opt.Icon size={26} color={isSelected ? GREEN : theme.textMuted} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>{opt.label}</Text>
                <Text style={[styles.optionDescription, { color: theme.textMuted }]}>{opt.description}</Text>
              </View>
              {isSelected && <CheckCircle size={20} color={GREEN} />}
            </Pressable>
          );
        })}
      </View>
      <ContinueButton onPress={onNext} disabled={!canProceed} />
    </View>
  );
}

function PetStep({
  theme, selected, onSelect, onFinish, canProceed, saving,
}: {
  theme: ReturnType<typeof useTheme>; selected: boolean | null; onSelect: (v: boolean) => void; onFinish: () => void; canProceed: boolean; saving: boolean;
}) {
  const petOptions = [
    { value: true, Icon: PawPrint, label: "Sim, tenho!" },
    { value: false, Icon: Smile, label: "Nao tenho" },
  ] as const;

  return (
    <View style={styles.stepContent}>
      <View style={[styles.stepIconContainer, { backgroundColor: `${GREEN}18` }]}>
        <PawPrint size={32} color={GREEN} />
      </View>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Voce tem pet?</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textMuted }]}>
        Vou adicionar rotinas de cuidado com seu bichinho.
      </Text>
      <View style={styles.petOptions}>
        {petOptions.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onSelect(opt.value)}
              style={[styles.petCard, { backgroundColor: isSelected ? `${GREEN}18` : theme.surface, borderColor: isSelected ? GREEN : theme.border }]}
            >
              <opt.Icon size={36} color={isSelected ? GREEN : theme.textMuted} />
              <Text style={[styles.petLabel, { color: theme.text }]}>{opt.label}</Text>
              {isSelected && <CheckCircle size={18} color={GREEN} />}
            </Pressable>
          );
        })}
      </View>
      <ContinueButton onPress={onFinish} disabled={!canProceed || saving} />
    </View>
  );
}

function ContinueButton({ onPress, disabled = false }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.continueButton, { backgroundColor: disabled ? "#A8D5BE" : GREEN }]}
    >
      <ArrowRight size={24} color="#ffffff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  progressContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: 16, paddingBottom: 8 },
  progressDot: { height: 8, borderRadius: 4 },
  stepContainer: { flex: 1 },
  stepContent: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  logoContainer: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  logoImage: { width: 100, height: 100 },
  welcomeTitle: { fontSize: 32, fontFamily: "Nunito_800ExtraBold", textAlign: "center", lineHeight: 40, marginBottom: 12 },
  welcomeSubtitle: { fontSize: 16, fontFamily: "Nunito_400Regular", textAlign: "center", lineHeight: 24, marginBottom: 32 },
  featureList: { gap: 10, marginBottom: 40 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12 },
  featureText: { fontSize: 15, fontFamily: "Nunito_600SemiBold" },
  stepIconContainer: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 20, marginTop: 8 },
  stepTitle: { fontSize: 26, fontFamily: "Nunito_800ExtraBold", textAlign: "center", marginBottom: 8 },
  stepSubtitle: { fontSize: 15, fontFamily: "Nunito_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  textInput: { height: 52, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 16, fontFamily: "Nunito_600SemiBold", marginBottom: 24 },
  optionsContainer: { gap: 10, marginBottom: 32 },
  optionCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, borderWidth: 1.5 },
  optionTextContainer: { flex: 1 },
  optionLabel: { fontSize: 16, fontFamily: "Nunito_700Bold", marginBottom: 2 },
  optionDescription: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  petOptions: { flexDirection: "row", gap: 12, marginBottom: 40 },
  petCard: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, borderRadius: 16, borderWidth: 1.5, gap: 10 },
  petLabel: { fontSize: 15, fontFamily: "Nunito_600SemiBold", textAlign: "center" },
  continueButton: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", alignSelf: "flex-end", marginTop: "auto" },
});
