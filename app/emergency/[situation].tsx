import { CheckCircle2, ChevronLeft, Circle } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/src/components/ui/Text";
import { useThemeStore } from "@/src/stores/themeStore";

interface EmergencyStep {
  id: string;
  text: string;
}

interface EmergencySituation {
  id: string;
  emoji: string;
  label: string;
  minutes: number;
  steps: EmergencyStep[];
  guideId?: string;
}

const SITUATIONS: EmergencySituation[] = [
  {
    id: "arroz-queimou",
    emoji: "😱",
    label: "Arroz queimou",
    minutes: 2,
    steps: [
      { id: "1", text: "Desligue o fogo imediatamente." },
      { id: "2", text: "NÃO mexa no fundo — isso espalha o gosto queimado." },
      { id: "3", text: "Coloque uma fatia de pão de forma em cima do arroz e tampe." },
      { id: "4", text: "Espere 5 minutos. O pão absorve o cheiro e sabor queimado." },
      { id: "5", text: "Retire o pão com cuidado e sirva apenas a parte de cima." },
    ],
    guideId: "limpar-fogao",
  },
  {
    id: "mancha-roupa",
    emoji: "🧼",
    label: "Mancha na roupa",
    minutes: 3,
    steps: [
      { id: "1", text: "Age rápido — mancha fresca sai mais fácil." },
      { id: "2", text: "Não esfregue. Bata levemente de fora para dentro." },
      { id: "3", text: "Aplique água fria (nunca quente — fixa a mancha)." },
      { id: "4", text: "Passe detergente líquido direto na mancha e deixe 5 min." },
      { id: "5", text: "Enxágue com água fria e verifique antes de secar." },
    ],
    guideId: "mancha-roupa",
  },
  {
    id: "ralo-entupido",
    emoji: "🚿",
    label: "Ralo entupido",
    minutes: 5,
    steps: [
      { id: "1", text: "Despeje meio copo de bicarbonato de sódio no ralo." },
      { id: "2", text: "Despeje meio copo de vinagre branco em seguida." },
      { id: "3", text: "Tampe o ralo e espere 15 minutos." },
      { id: "4", text: "Jogue água fervente (ou bem quente) para soltar o entupimento." },
      { id: "5", text: "Se persistir, use um desentupidor com movimentos de pressão." },
    ],
    guideId: "desentupir-ralo",
  },
  {
    id: "geladeira-cheirando",
    emoji: "🧊",
    label: "Geladeira cheirando mal",
    minutes: 5,
    steps: [
      { id: "1", text: "Retire todos os alimentos e descarte os vencidos ou estragados." },
      { id: "2", text: "Limpe as prateleiras com água morna + uma colher de bicarbonato." },
      { id: "3", text: "Limpe a borracha da porta — acumula mofo e cheiro." },
      { id: "4", text: "Coloque um potinho aberto com bicarbonato dentro para neutralizar." },
      { id: "5", text: "Deixe a porta aberta por 10 minutos antes de guardar os alimentos." },
    ],
    guideId: "cheiro-geladeira",
  },
  {
    id: "acabou-luz",
    emoji: "💡",
    label: "Acabou a luz",
    minutes: 2,
    steps: [
      { id: "1", text: "Use a lanterna do celular para se locomover com segurança." },
      { id: "2", text: "Vá ao quadro de disjuntores (geralmente corredor, área de serviço ou entrada)." },
      { id: "3", text: "Procure algum disjuntor na posição do meio ou desligado." },
      { id: "4", text: "Empurre para baixo e depois para cima com firmeza." },
      { id: "5", text: "Se nenhum disjuntor caiu, a queda é da distribuidora — ligue para o número no boleto." },
    ],
    guideId: "caiu-luz",
  },
  {
    id: "cheiro-gas",
    emoji: "🔥",
    label: "Cheiro de gás",
    minutes: 1,
    steps: [
      { id: "1", text: "Não acenda nada — nem luz, nem fogão, nem isqueiro." },
      { id: "2", text: "Feche o registro do gás (a válvula na mangueira ou botijão)." },
      { id: "3", text: "Abra todas as janelas e portas para ventilar o ambiente." },
      { id: "4", text: "Saia do apartamento/casa e fique do lado de fora." },
      { id: "5", text: "Só volte quando o cheiro tiver sumido completamente." },
    ],
    guideId: "trocar-gas",
  },
  {
    id: "apareceu-formiga",
    emoji: "🐜",
    label: "Apareceu formiga",
    minutes: 3,
    steps: [
      { id: "1", text: "Identifique a trilha — as formigas seguem o mesmo caminho." },
      { id: "2", text: "Limpe a trilha com água sanitária diluída ou vinagre." },
      { id: "3", text: "Guarde todo alimento em potes fechados ou na geladeira." },
      { id: "4", text: "Coloque isca de formiga (gel ou pó) próximo à entrada delas." },
      { id: "5", text: "Vede frestas na parede ou piso com silicone para evitar retorno." },
    ],
  },
  {
    id: "torneira-pingando",
    emoji: "🚰",
    label: "Torneira pingando",
    minutes: 2,
    steps: [
      { id: "1", text: "Feche o registro do banheiro ou cozinha (sob a pia ou no corredor)." },
      { id: "2", text: "Isso para o pingo imediatamente enquanto resolve o problema." },
      { id: "3", text: "Verifique se a torneira tem uma vedação solta — às vezes apertar resolve." },
      { id: "4", text: "Se o problema persistir, o reparo exige troca do vedante — solicite ajuda." },
      { id: "5", text: "Enquanto isso, deixe o registro fechado para não desperdiçar água." },
    ],
  },
];

function useTheme() {
  const scheme = useThemeStore((s) => s.scheme);
  const dark = scheme === "dark";
  return {
    dark,
    bg: dark ? "#0F172A" : "#FFF5F5",
    surface: dark ? "#1E293B" : "#ffffff",
    text: dark ? "#F1F5F9" : "#2E2E2E",
    textMuted: dark ? "rgba(241,245,249,0.5)" : "#6B7280",
    border: dark ? "#334155" : "#FEE2E2",
    stepBorder: dark ? "#334155" : "#F3F4F6",
    successBg: dark ? "#14532D" : "#F0FDF4",
    successText: dark ? "#86EFAC" : "#166534",
    successBorder: dark ? "#166534" : "#BBF7D0",
    linkColor: dark ? "#93C5FD" : "#2563EB",
  };
}

export default function EmergencySituationScreen() {
  const { situation } = useLocalSearchParams<{ situation: string }>();
  const theme = useTheme();

  const data = SITUATIONS.find((s) => s.id === situation);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: "Nunito_400Regular", color: theme.textMuted }}>
          Situação não encontrada.
        </Text>
      </View>
    );
  }

  const allDone = data.steps.every((s) => checked.has(s.id));

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#DC2626" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 16,
            gap: 10,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <ChevronLeft size={26} color="#ffffff" />
          </Pressable>
          <Text
            style={{
              fontFamily: "Nunito_800ExtraBold",
              fontSize: 18,
              color: "#ffffff",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {data.emoji} {data.label}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: theme.dark ? "#7C2D12" : "#FEE2E2",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 5,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito_700Bold",
              fontSize: 13,
              color: theme.dark ? "#FCA5A5" : "#B91C1C",
            }}
          >
            ⚡ Solução em {data.minutes} {data.minutes === 1 ? "minuto" : "minutos"}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {data.steps.map((step, index) => {
            const done = checked.has(step.id);
            return (
              <Pressable
                key={step.id}
                onPress={() => toggle(step.id)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: 16,
                  backgroundColor: done
                    ? theme.dark ? "#0F2B1A" : "#F0FDF4"
                    : pressed ? (theme.dark ? "#263344" : "#FFF8F8") : theme.surface,
                  borderBottomWidth: index < data.steps.length - 1 ? 1 : 0,
                  borderBottomColor: theme.stepBorder,
                })}
              >
                <View style={{ marginTop: 1 }}>
                  {done ? (
                    <CheckCircle2 size={26} color="#22C55E" />
                  ) : (
                    <Circle size={26} color={theme.dark ? "#475569" : "#D1D5DB"} />
                  )}
                </View>
                <Text
                  style={{
                    fontFamily: done ? "Nunito_600SemiBold" : "Nunito_400Regular",
                    fontSize: 15,
                    color: done ? (theme.dark ? "#86EFAC" : "#166534") : theme.text,
                    lineHeight: 22,
                    flex: 1,
                    textDecorationLine: done ? "line-through" : "none",
                    opacity: done ? 0.7 : 1,
                  }}
                >
                  {step.text}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {allDone && (
          <View
            style={{
              backgroundColor: theme.successBg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.successBorder,
              padding: 20,
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "Nunito_800ExtraBold",
                fontSize: 22,
              }}
            >
              💪
            </Text>
            <Text
              style={{
                fontFamily: "Nunito_800ExtraBold",
                fontSize: 17,
                color: theme.successText,
                textAlign: "center",
              }}
            >
              Problema resolvido!
            </Text>
            <Text
              style={{
                fontFamily: "Nunito_400Regular",
                fontSize: 13,
                color: theme.successText,
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              Você deu conta. Agora respira.
            </Text>
          </View>
        )}

        {data.guideId && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/guides/[id]",
                params: { id: data.guideId },
              })
            }
            style={({ pressed }) => ({
              alignItems: "center",
              paddingVertical: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.dark ? "#334155" : "#DBEAFE",
              backgroundColor: theme.dark ? "#1E293B" : "#EFF6FF",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: "Nunito_600SemiBold",
                fontSize: 14,
                color: theme.linkColor,
              }}
            >
              📖 Ver guia completo
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
