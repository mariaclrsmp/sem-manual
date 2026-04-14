import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

import { Button } from '@/src/components/ui/Button';
import { calculateResult } from '@/src/constants/diagnostic';
import { colors } from '@/src/constants/theme';

const CATEGORY_COLOR: Record<string, string> = {
  cooking:   colors.laranja,
  cleaning:  colors.azul,
  finance:   colors.verde,
  emergency: '#E74C3C',
};

const CATEGORY_LABEL: Record<string, string> = {
  cooking:   '🍳  Cozinha',
  cleaning:  '🧹  Limpeza',
  finance:   '💰  Finanças',
  emergency: '🚨  Emergências',
};

const CATEGORY_ORDER = ['cooking', 'cleaning', 'finance', 'emergency'];

function CategoryBar({ label, color, percentage, delay }: {
  label: string;
  color: string;
  percentage: number;
  delay: number;
}) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: percentage / 100,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.texto }}>{label}</Text>
        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color }}>{percentage}%</Text>
      </View>
      <View style={{ height: 10, backgroundColor: '#ECEEF2', borderRadius: 999, overflow: 'hidden' }}>
        <Animated.View
          style={{
            height: '100%',
            borderRadius: 999,
            backgroundColor: color,
            width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        />
      </View>
    </View>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const angle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(angle, { toValue: score / 100, duration: 900, delay: 300, useNativeDriver: false }).start();
  }, []);

  const size = 110;
  const thickness = 10;
  const showSecondArc = score > 50;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: thickness, borderColor: 'rgba(255,255,255,0.18)' }} />

      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
        <Animated.View style={{ position: 'absolute', width: size / 2, height: size, left: 0, overflow: 'hidden' }}>
          <Animated.View
            style={{
              position: 'absolute', width: size, height: size, borderRadius: size / 2,
              borderWidth: thickness, borderColor: '#fff',
              transform: [{ rotate: angle.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-90deg', '90deg', '90deg'] }) }],
            }}
          />
        </Animated.View>

        {showSecondArc && (
          <View style={{ position: 'absolute', width: size / 2, height: size, right: 0, overflow: 'hidden' }}>
            <Animated.View
              style={{
                position: 'absolute', right: 0, width: size, height: size, borderRadius: size / 2,
                borderWidth: thickness, borderColor: '#fff',
                transform: [{ rotate: angle.interpolate({ inputRange: [0.5, 1], outputRange: ['-90deg', '90deg'], extrapolate: 'clamp' }) }],
              }}
            />
          </View>
        )}
      </View>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 26, color: '#fff' }}>{score}%</Text>
    </View>
  );
}

export default function ResultScreen() {
  const { answers: answersParam } = useLocalSearchParams<{ answers: string }>();
  const answers: Record<number, number> = answersParam ? JSON.parse(answersParam) : {};
  const result = calculateResult(answers);

  const viewShotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  const cardOpacity    = useRef(new Animated.Value(0)).current;
  const cardTranslate  = useRef(new Animated.Value(30)).current;
  const breakdownOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardOpacity,   { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(breakdownOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const levelColor =
    result.score >= 85 ? colors.verde :
    result.score >= 60 ? colors.azul  :
    result.score >= 30 ? colors.laranja : '#E74C3C';

  async function handleShare() {
    if (!viewShotRef.current || sharing) return;
    try {
      setSharing(true);
      const capture = viewShotRef.current.capture;
      if (!capture) return;
      const uri = await capture();
      const text = `Meu nível de sobrevivência doméstica: ${result.level} ${result.emoji} — descubra o seu no app Sem Manual!`;
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Ops', 'Compartilhamento não está disponível neste dispositivo.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: text, UTI: 'public.png' });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar o resultado. Tente novamente.');
    } finally {
      setSharing(false);
    }
  }

  function handleStart() {
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1A2E' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
        {/* Main result card */}
        <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardTranslate }], marginBottom: 20 }}>
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1 }}
            style={{ borderRadius: 28, overflow: 'hidden', backgroundColor: '#1E3A5F', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}
          >
            <View style={{ height: 6, backgroundColor: levelColor }} />

            <View style={{ padding: 28, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 }}>
                Meu nível de sobrevivência
              </Text>

              <Text style={{ fontSize: 64, marginBottom: 12 }}>{result.emoji}</Text>

              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 30, color: '#fff', marginBottom: 10 }}>
                {result.level}
              </Text>

              <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 8 }}>
                {result.description}
              </Text>

              <ScoreCircle score={result.score} />

              <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
                de acerto no diagnóstico
              </Text>

              <View style={{ marginTop: 28, paddingTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', width: '100%', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: colors.verde, letterSpacing: 0.5 }}>
                  Sem Manual
                </Text>
                <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  Seu companheiro de vida adulta
                </Text>
              </View>
            </View>
          </ViewShot>
        </Animated.View>

        {/* Category breakdown */}
        <Animated.View style={{ opacity: breakdownOpacity }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 22, marginBottom: 16, shadowColor: '#2E2E2E', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 }}>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.texto, marginBottom: 18 }}>
              Desempenho por área
            </Text>

            {CATEGORY_ORDER.map((cat, i) => (
              <CategoryBar
                key={cat}
                label={CATEGORY_LABEL[cat]}
                color={CATEGORY_COLOR[cat]}
                percentage={result.categories[cat] ?? 0}
                delay={200 + i * 120}
              />
            ))}
          </View>

          <Pressable
            onPress={handleShare}
            disabled={sharing}
            style={({ pressed }) => ({
              borderWidth: 2,
              borderColor: colors.verde,
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 12,
              backgroundColor: pressed ? colors.verde + '15' : 'transparent',
              opacity: sharing ? 0.6 : 1,
            })}
          >
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.verde }}>
              {sharing ? 'Preparando imagem...' : '📤  Compartilhar resultado'}
            </Text>
          </Pressable>

          <Button size="lg" onPress={handleStart}>
            Começar a usar o app
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
