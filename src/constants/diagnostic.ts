import type { DiagnosticResult, LifeLevel, Question } from '@/src/types/diagnostic';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Por quanto tempo o arroz cozido dura na geladeira?',
    options: ['1 dia', '3 a 5 dias', '2 semanas', 'Até um mês'],
    correct: 1,
    category: 'cooking',
  },
  {
    id: 2,
    text: 'Com que frequência os lençóis devem ser trocados?',
    options: ['Uma vez por mês', 'A cada 15 dias', 'Uma vez por semana', 'Só quando estiverem sujos'],
    correct: 2,
    category: 'cleaning',
  },
  {
    id: 3,
    text: 'O que fazer primeiro se a energia elétrica cair na sua casa?',
    options: [
      'Ligar para a operadora de TV a cabo',
      'Verificar se o disjuntor geral caiu',
      'Trocar todas as lâmpadas',
      'Chamar um eletricista imediatamente',
    ],
    correct: 1,
    category: 'emergency',
  },
  {
    id: 4,
    text: 'Qual hábito ajuda mais a economizar gás no fogão?',
    options: [
      'Usar sempre a chama no máximo',
      'Cozinhar com a panela sem tampa',
      'Tampar a panela e usar chama adequada ao tamanho',
      'Deixar o forno preaquecendo por 30 minutos',
    ],
    correct: 2,
    category: 'cooking',
  },
  {
    id: 5,
    text: 'Qual a regra do orçamento pessoal conhecida como 50-30-20?',
    options: [
      '50% lazer, 30% poupança, 20% necessidades',
      '50% necessidades, 30% desejos, 20% poupança/investimento',
      '50% aluguel, 30% alimentação, 20% transporte',
      '50% poupança, 30% necessidades, 20% desejos',
    ],
    correct: 1,
    category: 'finance',
  },
  {
    id: 6,
    text: 'Com que frequência o banheiro deve ser limpo adequadamente?',
    options: ['Uma vez por mês', 'A cada 15 dias', 'Uma vez por semana', 'Só quando estiver visivelmente sujo'],
    correct: 2,
    category: 'cleaning',
  },
  {
    id: 7,
    text: 'O que fazer se sentir cheiro forte de gás em casa?',
    options: [
      'Acender a luz e investigar a origem',
      'Fechar o registro do gás, abrir janelas e sair sem acionar interruptores',
      'Ligar o exaustor para ventilar',
      'Jogar água na área suspeita',
    ],
    correct: 1,
    category: 'emergency',
  },
  {
    id: 8,
    text: 'Qual é a melhor forma de descongelar carne com segurança?',
    options: [
      'Deixar na pia em temperatura ambiente',
      'Descongelar no microondas na potência máxima',
      'Transferir do freezer para a geladeira na véspera',
      'Colocar em água quente',
    ],
    correct: 2,
    category: 'cooking',
  },
  {
    id: 9,
    text: 'O que é uma reserva de emergência financeira?',
    options: [
      'Dinheiro guardado para viagens',
      'Valor equivalente a 3 a 6 meses de gastos mensais em aplicação de liquidez diária',
      'Um cartão de crédito com limite alto',
      'Poupança usada para compras parceladas',
    ],
    correct: 1,
    category: 'finance',
  },
  {
    id: 10,
    text: 'Com que frequência o filtro do ar-condicionado deve ser limpo?',
    options: ['Uma vez por ano', 'A cada 6 meses', 'A cada 15 a 30 dias de uso', 'Só quando aparecer mofo'],
    correct: 2,
    category: 'cleaning',
  },
];

export const LIFE_LEVELS: LifeLevel[] = [
  {
    min: 0,
    emoji: '☠️',
    label: 'Caos Total',
    description: 'Tudo bem, todo mundo começa do zero! O app vai te ajudar a construir uma base sólida.',
    color: '#E74C3C',
  },
  {
    min: 30,
    emoji: '🪴',
    label: 'Sobrevivendo',
    description: 'Você já sabe o básico, mas ainda tem muito espaço para crescer. Bora evoluir!',
    color: '#FF8C42',
  },
  {
    min: 60,
    emoji: '🏠',
    label: 'Independente',
    description: 'Você se vira bem sozinho! Com alguns ajustes, vai dominar a vida adulta.',
    color: '#4A6FA5',
  },
  {
    min: 85,
    emoji: '👑',
    label: 'Mestre da Casa',
    description: 'Impressionante! Você tem um domínio invejável da vida doméstica.',
    color: '#5DBB8A',
  },
];

export function calculateResult(answers: Record<number, number>): DiagnosticResult {
  const categories: Record<string, { correct: number; total: number }> = {
    cooking:   { correct: 0, total: 0 },
    cleaning:  { correct: 0, total: 0 },
    finance:   { correct: 0, total: 0 },
    emergency: { correct: 0, total: 0 },
  };

  let totalCorrect = 0;

  for (const question of QUESTIONS) {
    categories[question.category].total += 1;
    if (answers[question.id] === question.correct) {
      totalCorrect += 1;
      categories[question.category].correct += 1;
    }
  }

  const score = Math.round((totalCorrect / QUESTIONS.length) * 100);

  const categoryPercentages: Record<string, number> = {};
  for (const [cat, data] of Object.entries(categories)) {
    categoryPercentages[cat] = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
  }

  const level = [...LIFE_LEVELS].reverse().find((l) => score >= l.min) ?? LIFE_LEVELS[0];

  return {
    level: level.label,
    emoji: level.emoji,
    description: level.description,
    score,
    categories: categoryPercentages,
  };
}
