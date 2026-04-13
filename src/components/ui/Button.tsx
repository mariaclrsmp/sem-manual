import { Pressable, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-verde active:opacity-80',
    text: 'text-white font-bold',
  },
  secondary: {
    container: 'bg-azul active:opacity-80',
    text: 'text-white font-bold',
  },
  ghost: {
    container: 'border border-verde bg-transparent active:opacity-60',
    text: 'text-verde font-bold',
  },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-3 py-1.5 rounded-lg', text: 'text-sm' },
  md: { container: 'px-5 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-6 py-4 rounded-2xl', text: 'text-lg' },
};

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  onPress?: () => void;
  children: string;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  onPress,
  children,
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`items-center justify-center ${variantStyles[variant].container} ${sizeStyles[size].container} ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className={`${variantStyles[variant].text} ${sizeStyles[size].text}`}>
        {children}
      </Text>
    </Pressable>
  );
}
