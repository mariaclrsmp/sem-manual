import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View
      className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}
      style={{ shadowColor: '#2E2E2E', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }}
    >
      {children}
    </View>
  );
}
