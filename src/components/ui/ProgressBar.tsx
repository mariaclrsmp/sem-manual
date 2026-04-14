import { View } from "react-native";

interface ProgressBarProps {
  progress: number; // 0 a 1
  className?: string;
}

export function ProgressBar({ progress, className = "" }: ProgressBarProps) {
  const clampedWidth = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <View
      className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}
    >
      <View
        className="h-full bg-verde rounded-full"
        style={{ width: `${clampedWidth}%` }}
      />
    </View>
  );
}
