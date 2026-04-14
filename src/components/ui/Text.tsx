import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

/**
 * Substituto direto de Text do react-native.
 * Aplica Nunito_400Regular como fonte padrão em todos os textos do app.
 * Qualquer style passado como prop é mesclado por cima, mantendo Nunito
 * mesmo quando NativeWind injeta estilos via className.
 */
export function Text({ style, ...props }: TextProps) {
  return <RNText style={[styles.padrao, style]} {...props} />;
}

const styles = StyleSheet.create({
  padrao: { fontFamily: 'Nunito_400Regular' },
});
