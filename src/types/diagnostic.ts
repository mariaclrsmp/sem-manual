export interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  category: 'cooking' | 'cleaning' | 'finance' | 'emergency';
}

export interface DiagnosticResult {
  level: string;
  emoji: string;
  description: string;
  score: number;
  categories: Record<string, number>;
}

export interface LifeLevel {
  min: number;
  emoji: string;
  label: string;
  description: string;
  color: string;
}
