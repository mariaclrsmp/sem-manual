import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { QUESTIONS } from '@/src/constants/diagnostic';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { colors } from '@/src/constants/theme';

export default function DiagnosticScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const currentQuestion = QUESTIONS[questionIndex];
  const progress = (questionIndex + 1) / QUESTIONS.length;
  const isLastQuestion = questionIndex === QUESTIONS.length - 1;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,     { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(translateY,  { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [questionIndex]);

  function animateOut(callback: () => void) {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 0,  duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -24, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      translateY.setValue(24);
      callback();
    });
  }

  function handleNext() {
    if (selectedOption === null) return;

    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      animateOut(() => {
        router.push({ pathname: '/diagnostic/result', params: { answers: JSON.stringify(newAnswers) } });
      });
      return;
    }

    animateOut(() => {
      setSelectedOption(null);
      setQuestionIndex((i) => i + 1);
    });
  }

  const categoryLabel: Record<string, string> = {
    cooking:   'Cozinha',
    cleaning:  'Limpeza',
    finance:   'Finanças',
    emergency: 'Emergências',
  };

  const categoryColor: Record<string, string> = {
    cooking:   colors.laranja,
    cleaning:  colors.azul,
    finance:   colors.verde,
    emergency: '#E74C3C',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.verde }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.verde} />

      {/* Header */}
      <View className="px-6 pt-4 pb-6">
        <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 22, color: '#fff' }}>
          Diagnóstico de vida adulta
        </Text>
        <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.82)', marginTop: 2 }}>
          Descubra em que nível você está
        </Text>

        <View className="mt-4">
          <View className="flex-row justify-between mb-1.5">
            <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              Pergunta {questionIndex + 1} de {QUESTIONS.length}
            </Text>
            <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
            <Animated.View
              className="h-2 rounded-full bg-white"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 rounded-t-3xl bg-fundo px-6 pt-6 pb-6" style={{ gap: 16 }}>
        <Animated.View style={{ opacity, transform: [{ translateY }], gap: 16 }}>
          {/* Category badge */}
          <View className="flex-row">
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: categoryColor[currentQuestion.category] + '22' }}
            >
              <Text
                style={{
                  fontFamily: 'Nunito_700Bold',
                  fontSize: 12,
                  color: categoryColor[currentQuestion.category],
                }}
              >
                {categoryLabel[currentQuestion.category]}
              </Text>
            </View>
          </View>

          {/* Question card */}
          <Card className="mb-2">
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: colors.texto, lineHeight: 26 }}>
              {currentQuestion.text}
            </Text>
          </Card>

          {/* Options */}
          <View style={{ gap: 10 }}>
            {currentQuestion.options.map((option, index) => {
              const selected = selectedOption === index;
              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedOption(index)}
                  style={({ pressed }) => ({
                    backgroundColor: selected ? colors.verde : '#fff',
                    borderWidth: 2,
                    borderColor: selected ? colors.verde : '#E8EAF0',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    opacity: pressed && !selected ? 0.75 : 1,
                    shadowColor: '#2E2E2E',
                    shadowOpacity: selected ? 0.12 : 0.05,
                    shadowRadius: 6,
                    elevation: selected ? 3 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: selected ? 'rgba(255,255,255,0.25)' : '#F0F2F5',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 13, color: selected ? '#fff' : colors.texto }}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontFamily: selected ? 'Nunito_700Bold' : 'Nunito_400Regular',
                      fontSize: 15,
                      color: selected ? '#fff' : colors.texto,
                      flex: 1,
                      lineHeight: 21,
                    }}
                  >
                    {option}
                  </Text>

                  {selected && <Text style={{ fontSize: 16 }}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ marginTop: 'auto', paddingTop: 8 }}>
          <Button size="lg" disabled={selectedOption === null} onPress={handleNext}>
            {isLastQuestion ? 'Ver resultado' : 'Próxima pergunta'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
