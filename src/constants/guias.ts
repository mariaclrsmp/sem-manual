export type GuideCategory =
  | "cozinha"
  | "limpeza"
  | "emergencia"
  | "economia"
  | "manutencao";

export interface GuideStep {
  order: number;
  title: string;
  description: string;
}

export interface Guide {
  id: string;
  title: string;
  emoji: string;
  category: GuideCategory;
  readingTime: number;
  steps: GuideStep[];
  tip?: string;
}

export const CATEGORY_LABELS: Record<GuideCategory, string> = {
  cozinha: "Cozinha",
  limpeza: "Limpeza",
  emergencia: "Emergência",
  economia: "Economia",
  manutencao: "Manutenção",
};

export const GUIDES: Guide[] = [
  {
    id: "limpar-fogao",
    title: "Como limpar o fogão",
    emoji: "🍳",
    category: "cozinha",
    readingTime: 3,
    steps: [
      {
        order: 1,
        title: "Retire as grades e bocas",
        description:
          "Espere o fogão esfriar completamente. Retire as grades de ferro e as bocas do queimador.",
      },
      {
        order: 2,
        title: "Deixe de molho",
        description:
          "Coloque grades e bocas numa bacia com água quente e detergente por 15 minutos para soltar a gordura.",
      },
      {
        order: 3,
        title: "Limpe a superfície",
        description:
          "Passe um pano úmido com detergente. Para gordura grossa, use bicarbonato e deixe agir 5 minutos antes de esfregar.",
      },
      {
        order: 4,
        title: "Desentupa as bocas",
        description:
          "Use um palito de dente para desentupir os furinhos das bocas. Água quente com detergente ajuda a soltar resíduos.",
      },
      {
        order: 5,
        title: "Monte tudo seco",
        description:
          "Seque bem as peças antes de montar. Peças molhadas causam ferrugem.",
      },
    ],
    tip: "Limpar o fogão semanalmente evita acúmulo de gordura e torna a limpeza muito mais rápida.",
  },

  {
    id: "cheiro-geladeira",
    title: "Tirar cheiro da geladeira",
    emoji: "❄️",
    category: "cozinha",
    readingTime: 2,
    steps: [
      {
        order: 1,
        title: "Esvazie e ache a causa",
        description:
          "Retire todos os alimentos e descarte qualquer coisa estragada. O cheiro quase sempre vem de algo esquecido no fundo.",
      },
      {
        order: 2,
        title: "Limpe por dentro",
        description:
          "Passe um pano com água morna e bicarbonato (1 colher de sopa por litro) em todas as prateleiras e paredes.",
      },
      {
        order: 3,
        title: "Coloque um absorvente",
        description:
          "Deixe uma xícara com bicarbonato de sódio ou cascas de limão dentro. Ambos absorvem odores naturalmente.",
      },
      {
        order: 4,
        title: "Ventile por 30 minutos",
        description:
          "Deixe a porta entreaberta por meia hora antes de recolocar os alimentos.",
      },
    ],
    tip: "Trocar o bicarbonato dentro da geladeira a cada 30 dias mantém o cheiro neutro permanentemente.",
  },

  {
    id: "lavar-louça",
    title: "Lavar louça do jeito certo",
    emoji: "🫧",
    category: "cozinha",
    readingTime: 3,
    steps: [
      {
        order: 1,
        title: "Raspe os restos",
        description:
          "Jogue os restos no lixo antes de molhar. Isso evita entupir o ralo e economiza água.",
      },
      {
        order: 2,
        title: "Siga a ordem certa",
        description:
          "Comece pelos copos e talheres, depois pratos, por último panelas. Os mais limpos primeiro evitam que gordura contamine tudo.",
      },
      {
        order: 3,
        title: "Use esponja e detergente",
        description:
          "Lado macio para copos, lado verde para pratos e panelas. Pouco detergente já faz espuma suficiente.",
      },
      {
        order: 4,
        title: "Enxágue com água quente",
        description:
          "Água quente remove melhor o detergente e ajuda a secar mais rápido.",
      },
      {
        order: 5,
        title: "Escorra ou seque",
        description:
          "Use escorredor ou seque com pano limpo. Louça empilhada úmida cria mofo.",
      },
    ],
    tip: "Nunca deixe louça de molho por mais de 1 hora — a comida endurece e fica mais difícil de remover.",
  },

  {
    id: "limpar-banheiro",
    title: "Limpar o banheiro do jeito certo",
    emoji: "🚿",
    category: "limpeza",
    readingTime: 5,
    steps: [
      {
        order: 1,
        title: "Comece pelo vaso",
        description:
          "Jogue produto sanitário dentro do vaso e deixe agir enquanto limpa o resto. Economiza tempo.",
      },
      {
        order: 2,
        title: "Espelho e box",
        description:
          "Papel toalha com álcool 70% no espelho para evitar marcas. No box, esponja com detergente para remover resíduo de sabão.",
      },
      {
        order: 3,
        title: "Pia e torneira",
        description:
          "Esponja com detergente na pia. Para calcário na torneira, envolva com papel úmido de vinagre por 10 minutos.",
      },
      {
        order: 4,
        title: "Esfregue o vaso",
        description:
          "Com a escova, esfregue bem dentro do vaso — embaixo da borda é onde acumula mais sujeira. Dê a descarga.",
      },
      {
        order: 5,
        title: "Chão por último",
        description:
          "O chão é sempre o último passo, pois recebe respingo de tudo. Use desinfetante diluído.",
      },
    ],
    tip: "Uma limpeza leve semanal (15 min) é muito mais fácil do que uma limpeza pesada mensal.",
  },

  {
    id: "mancha-roupa",
    title: "Tirar mancha da roupa",
    emoji: "👕",
    category: "limpeza",
    readingTime: 4,
    steps: [
      {
        order: 1,
        title: "Aja rápido, não esfregue",
        description:
          "Quanto mais fresca a mancha, mais fácil de tirar. Tampe com papel toalha para absorver o excesso sem espalhar.",
      },
      {
        order: 2,
        title: "Identifique o tipo",
        description:
          "Gordura: bicarbonato ou talco. Sangue: água fria (nunca quente). Vinho e café: sal grosso imediatamente. Caneta: álcool.",
      },
      {
        order: 3,
        title: "Aplique o produto",
        description:
          "Para gordura: cubra com bicarbonato por 10 min, depois passe detergente de louça. Para os outros: detergente líquido direto na mancha.",
      },
      {
        order: 4,
        title: "Enxágue em água fria",
        description:
          "Enxágue a área da mancha em água fria corrente antes de lavar normalmente.",
      },
      {
        order: 5,
        title: "Verifique antes de secar",
        description:
          "Nunca seque sem confirmar que a mancha saiu. O calor fixa manchas permanentemente.",
      },
    ],
    tip: "Sabão de coco e detergente de louça funcionam melhor na maioria das manchas do que qualquer produto caro.",
  },

  {
    id: "lavar-roupas",
    title: "Lavar roupas pela primeira vez",
    emoji: "🫧",
    category: "limpeza",
    readingTime: 5,
    steps: [
      {
        order: 1,
        title: "Leia as etiquetas",
        description:
          "A etiqueta diz temperatura máxima, se pode máquina e se precisa lavar à mão. Ignore por sua conta e risco.",
      },
      {
        order: 2,
        title: "Separe por cor",
        description:
          "Brancas sozinhas. Escuras e coloridas separadas. Peças novas coloridas soltam tinta e mancham as outras.",
      },
      {
        order: 3,
        title: "Use a quantidade certa de sabão",
        description:
          "Use a medida indicada na embalagem. Excesso de sabão não limpa melhor, só cria espuma que não enxágua.",
      },
      {
        order: 4,
        title: "Escolha água fria para o dia a dia",
        description:
          "Água fria (30°C) lava bem roupas comuns. Lençóis e toalhas pedem água morna (40°C).",
      },
      {
        order: 5,
        title: "Não superlote a máquina",
        description:
          "Coloque no máximo 3/4 da capacidade. Roupa apertada não lava direito.",
      },
      {
        order: 6,
        title: "Estenda imediatamente",
        description:
          "Roupa parada na máquina cria odor de mofo em horas. Estenda assim que terminar.",
      },
    ],
    tip: "Meias e roupas íntimas podem ser lavadas à mão em 5 minutos quando a máquina não vale a pena ligar.",
  },

  {
    id: "desentupir-ralo",
    title: "Desentupir o ralo",
    emoji: "🔧",
    category: "manutencao",
    readingTime: 4,
    steps: [
      {
        order: 1,
        title: "Limpe a superfície",
        description:
          "Retire a grelha e limpe cabelos e resíduos visíveis com a mão (use luva) ou um palito.",
      },
      {
        order: 2,
        title: "Bicarbonato e vinagre",
        description:
          "Jogue meia xícara de bicarbonato no ralo, depois meia xícara de vinagre branco. A reação dissolve gordura e sabão. Espere 15 minutos.",
      },
      {
        order: 3,
        title: "Despeje água quente",
        description:
          "Após os 15 minutos, despeje uma chaleira de água quente (não fervendo, para não danificar o PVC).",
      },
      {
        order: 4,
        title: "Se não resolver: desentupidor",
        description:
          "Posicione o desentupidor de borracha sobre o ralo, pressione e puxe rapidamente várias vezes. Repita até a água escoar.",
      },
      {
        order: 5,
        title: "Última opção: produto químico",
        description:
          "Desentupidores químicos dissolvem entupimentos fortes. Siga a embalagem e ventile bem o ambiente.",
      },
    ],
    tip: "Jogue água com bicarbonato no ralo uma vez por mês para prevenir entupimentos.",
  },

  {
    id: "desentupir-vaso",
    title: "Desentupir o vaso sanitário",
    emoji: "🪠",
    category: "manutencao",
    readingTime: 3,
    steps: [
      {
        order: 1,
        title: "Não dê mais descarga",
        description:
          "Se o vaso não escorrer, pare. Mais descargas podem causar vazamento.",
      },
      {
        order: 2,
        title: "Use a ventosa",
        description:
          "Posicione o desentupidor sobre o buraco do fundo do vaso. Pressione devagar para expulsar o ar, depois puxe com força. Repita 10 vezes.",
      },
      {
        order: 3,
        title: "Água morna com detergente",
        description:
          "Despeje um fio de detergente de louça e 2 litros de água morna. Espere 10 minutos — o detergente lubrifica o entupimento.",
      },
      {
        order: 4,
        title: "Repita com a ventosa",
        description:
          "Após o tempo de espera, tente o desentupidor novamente. Na maioria dos casos resolve.",
      },
    ],
    tip: "Nunca jogue no vaso: papel toalha, absorvente, lenço umedecido ou cotonete.",
  },

  {
    id: "caiu-luz",
    title: "O que fazer quando cai a luz",
    emoji: "💡",
    category: "emergencia",
    readingTime: 2,
    steps: [
      {
        order: 1,
        title: "Verifique se é só sua casa",
        description:
          "Olhe pela janela: os vizinhos também estão sem luz? Se sim, é problema da distribuidora. Se só você, é problema interno.",
      },
      {
        order: 2,
        title: "Confira o disjuntor",
        description:
          "O quadro fica geralmente na área de serviço ou corredor. Veja se algum está desligado (para baixo ou no meio). Se sim, empurre para cima.",
      },
      {
        order: 3,
        title: "Se o disjuntor caiu de novo",
        description:
          "Desligue algum aparelho que estava ligado — sobrecarga é a causa mais comum. Tente religar com menos aparelhos na tomada.",
      },
      {
        order: 4,
        title: "Ligue para a distribuidora",
        description:
          "Enel SP: 0800 727 0196. Enel RJ: 0800 028 0196. Cemig: 116. CPFL: 0800 010 0116. Pesquise o número da sua distribuidora.",
      },
    ],
    tip: "Tenha sempre uma lanterna carregada. Cortes de luz costumam acontecer à noite.",
  },

  {
    id: "trocar-gas",
    title: "Trocar botijão de gás com segurança",
    emoji: "🔶",
    category: "emergencia",
    readingTime: 3,
    steps: [
      {
        order: 1,
        title: "Abra as janelas",
        description:
          "Nunca troque o botijão com janelas fechadas. O gás é mais pesado que o ar e se acumula no chão.",
      },
      {
        order: 2,
        title: "Apague tudo e não ligue nada",
        description:
          "Desligue o fogão, apague velas e não acione interruptores. Qualquer faísca pode causar explosão.",
      },
      {
        order: 3,
        title: "Feche o registro do botijão velho",
        description:
          "Gire o registro no sentido horário até fechar completamente antes de desconectar.",
      },
      {
        order: 4,
        title: "Desconecte a mangueira",
        description:
          "Segure o regulador e gire no sentido anti-horário para soltar. Se estiver preso, não force com chave.",
      },
      {
        order: 5,
        title: "Conecte e teste",
        description:
          "Encaixe o regulador no botijão novo e aperte no sentido horário. Abra o registro devagar. Para testar: passe água com sabão na conexão — bolhas indicam vazamento.",
      },
    ],
    tip: "Se sentir cheiro forte de gás sem achar a causa: feche o registro, abra tudo e saia. Ligue para o Corpo de Bombeiros (193).",
  },

  {
    id: "economizar-mercado",
    title: "Economizar no mercado",
    emoji: "🛒",
    category: "economia",
    readingTime: 5,
    steps: [
      {
        order: 1,
        title: "Nunca vá com fome",
        description:
          "Com fome, tudo parece necessário. Coma algo antes de ir e seu carrinho terá muito menos itens desnecessários.",
      },
      {
        order: 2,
        title: "Faça uma lista e siga ela",
        description:
          "Anote o que acabou durante a semana. No mercado, siga a lista. Cada 'só vou pegar esse' some 15 a 30 reais.",
      },
      {
        order: 3,
        title: "Compare preço por kg ou litro",
        description:
          "O pacote maior quase sempre é mais barato por unidade. Os mercados são obrigados a mostrar o preço por kg/litro na etiqueta.",
      },
      {
        order: 4,
        title: "Marcas próprias valem a pena",
        description:
          "Marcas do mercado (Taeq, Master, etc.) costumam ter a mesma qualidade por 20 a 40% menos. Arroz, feijão, farinha: sem diferença relevante.",
      },
      {
        order: 5,
        title: "Verifique o vencimento",
        description:
          "Produtos próximos do vencimento ficam com desconto. Se você vai usar em 2 dias, leve o mais barato.",
      },
    ],
    tip: "Reserve um dia fixo para compras semanais. Ir ao mercado todos os dias aumenta muito o gasto total.",
  },

  {
    id: "economizar-energia",
    title: "Economizar energia elétrica",
    emoji: "⚡",
    category: "economia",
    readingTime: 4,
    steps: [
      {
        order: 1,
        title: "Troque lâmpadas por LED",
        description:
          "LED consome até 80% menos que incandescente e dura 10x mais. Lâmpada amarela de vidro é a maior vilã da conta.",
      },
      {
        order: 2,
        title: "Desligue aparelhos em standby",
        description:
          "TV, micro-ondas e carregadores em standby chegam a 10% da conta. Desligue da tomada ou use filtro de linha com chave.",
      },
      {
        order: 3,
        title: "Chuveiro no modo verão",
        description:
          "No verão, use a posição 'verão' do chuveiro elétrico. Ele é o maior consumidor individual de energia em casas brasileiras.",
      },
      {
        order: 4,
        title: "Deixe espaço atrás da geladeira",
        description:
          "A geladeira precisa dissipar calor. Sem espaço, trabalha mais e gasta mais. Mantenha também a borracha da porta em bom estado.",
      },
      {
        order: 5,
        title: "Lave roupas com água fria",
        description:
          "Máquinas com aquecimento gastam muito mais. Água fria lava igual para roupas do dia a dia.",
      },
    ],
    tip: "O chuveiro elétrico representa em média 25% da conta de luz. Banhos de 5 minutos podem reduzir sua conta em até 15%.",
  },
];
