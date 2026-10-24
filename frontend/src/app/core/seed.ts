import type {
  Activity,
  Badge,
  ClassGroup,
  ProgressRecord,
  Skill,
  SkillCode,
  Student,
  Teacher,
  UserAccount,
} from './models';
import { PASS_THRESHOLD } from './gamification';

export const SKILLS: Record<SkillCode, Skill> = {
  EF05MA06: {
    code: 'EF05MA06',
    title: 'Porcentagens e descontos',
    description: 'Calcular 10%, 25%, 50%, 75% e 100% em situações de compra.',
    grade: '5º ano',
  },
  EF06MA13: {
    code: 'EF06MA13',
    title: 'Comparação de ofertas',
    description: 'Usar proporcionalidade para descobrir qual oferta compensa mais.',
    grade: '6º ano',
  },
  EF07MA02: {
    code: 'EF07MA02',
    title: 'Acréscimos e decréscimos',
    description: 'Resolver aumentos, descontos e planejamento de gastos do dia a dia.',
    grade: '7º ano',
  },
};

export const CLASSES: ClassGroup[] = [
  {
    id: 'turma-5a',
    name: '5º ano A',
    grade: '5º ano',
    school: 'Colégio Extrativa',
    teacherId: 'prof-jose',
  },
  {
    id: 'turma-7b',
    name: '7º ano B',
    grade: '7º ano',
    school: 'Colégio Extrativa',
    teacherId: 'prof-jose',
  },
];

export const TEACHERS: Teacher[] = [
  {
    id: 'prof-jose',
    name: 'José Guilherme',
    title: 'Professor de Matemática',
    classIds: ['turma-5a', 'turma-7b'],
  },
];

export const USERS: UserAccount[] = [
  {
    id: '345G7B',
    password: '1234567890',
    role: 'student',
    displayName: 'Lucas S.',
    studentId: 'aluno-lucas',
  },
  {
    id: 'PROF-001',
    password: 'professor123',
    role: 'teacher',
    displayName: 'Prof. José Guilherme',
    teacherId: 'prof-jose',
  },
];

export const BADGES: Badge[] = [
  {
    id: 'badge-troco',
    name: 'Troco na mão',
    description: 'Concluiu o Simulador de Troco.',
    icon: 'coin',
    tone: 'yellow',
    criterion: { type: 'activity', activityId: 'troco' },
  },
  {
    id: 'badge-ofertas',
    name: 'Olho na oferta',
    description: 'Concluiu o desafio de comparação de ofertas.',
    icon: 'tag',
    tone: 'green',
    criterion: { type: 'activity', activityId: 'ofertas' },
  },
  {
    id: 'badge-parcelado',
    name: 'Compra consciente',
    description: 'Concluiu Parcelado vs à Vista.',
    icon: 'percent',
    tone: 'blue',
    criterion: { type: 'activity', activityId: 'parcelado' },
  },
  {
    id: 'badge-poupanca',
    name: 'Poupador mirim',
    description: 'Concluiu o Desafio Poupança.',
    icon: 'piggy',
    tone: 'violet',
    criterion: { type: 'activity', activityId: 'poupanca' },
  },
  {
    id: 'badge-orcamento',
    name: 'Mestre do orçamento',
    description: 'Concluiu o Orçamento do Mês.',
    icon: 'target',
    tone: 'coral',
    criterion: { type: 'activity', activityId: 'orcamento' },
  },
  {
    id: 'badge-primeira',
    name: 'Primeira missão',
    description: 'Concluiu a primeira missão na plataforma.',
    icon: 'flag',
    tone: 'yellow',
    criterion: { type: 'any' },
  },
  {
    id: 'badge-nivel3',
    name: 'Nível 3',
    description: 'Chegou ao nível 3 e virou Poupador.',
    icon: 'star',
    tone: 'violet',
    criterion: { type: 'level', level: 3 },
  },
  {
    id: 'badge-todas',
    name: 'Colecionador',
    description: 'Concluiu todas as missões disponíveis.',
    icon: 'trophy',
    tone: 'green',
    criterion: { type: 'all' },
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: 'troco',
    title: 'Simulador de Troco',
    tagline: 'Pague, confira o troco e não perca um centavo.',
    description:
      'Resolva situações de compra na cantina da escola e calcule o troco usando dinheiro.',
    kind: 'change',
    icon: 'receipt',
    skills: ['EF05MA06'],
    gradeLabel: '5º ano',
    difficulty: 1,
    estimatedMinutes: 5,
    rewardCoins: 60,
    badgeId: 'badge-troco',
    questions: [
      {
        id: 'troco-1',
        kind: 'numeric',
        unit: 'brl',
        answer: 9.5,
        tolerance: 0.01,
        prompt: 'Você pagou com R$ 20,00. Quanto deve receber de troco?',
        scenario: 'Cantina da escola — pedido de Lucas.',
        table: [
          { label: 'Suco de laranja', value: 'R$ 6,50' },
          { label: 'Pão de queijo', value: 'R$ 4,00' },
          { label: 'Pagamento', value: 'R$ 20,00', emphasis: true },
        ],
        hint: 'Some os dois produtos e subtraia o total do valor pago.',
        explanation:
          'Suco (R$ 6,50) + pão de queijo (R$ 4,00) = R$ 10,50. Troco: R$ 20,00 − R$ 10,50 = R$ 9,50.',
      },
      {
        id: 'troco-2',
        kind: 'numeric',
        unit: 'brl',
        answer: 8,
        tolerance: 0.01,
        prompt: 'Pagando com R$ 20,00, qual é o troco da compra?',
        scenario: 'Intervalo da tarde — dois salgados e um refrigerante.',
        table: [
          { label: '2 salgados', value: 'R$ 3,50 cada' },
          { label: 'Refrigerante', value: 'R$ 5,00' },
          { label: 'Pagamento', value: 'R$ 20,00', emphasis: true },
        ],
        hint: 'Primeiro descubra quanto custaram os dois salgados.',
        explanation:
          '2 × R$ 3,50 = R$ 7,00. Total: R$ 7,00 + R$ 5,00 = R$ 12,00. Troco: R$ 20,00 − R$ 12,00 = R$ 8,00.',
      },
      {
        id: 'troco-3',
        kind: 'numeric',
        unit: 'brl',
        answer: 7,
        tolerance: 0.01,
        prompt: 'Você comprou 4 balas e pagou com uma nota de R$ 10,00. Quanto volta?',
        scenario: 'Doceria do bairro — balas a R$ 0,75 cada.',
        table: [
          { label: 'Bala de morango', value: 'R$ 0,75 cada' },
          { label: 'Quantidade', value: '4 balas' },
          { label: 'Pagamento', value: 'R$ 10,00', emphasis: true },
        ],
        hint: 'Multiplique o preço de uma bala por 4 antes de calcular o troco.',
        explanation:
          '4 × R$ 0,75 = R$ 3,00. Troco: R$ 10,00 − R$ 3,00 = R$ 7,00.',
      },
    ],
  },
  {
    id: 'ofertas',
    title: 'Qual oferta compensa?',
    tagline: 'Olho vivo: nem sempre o mais barato é a melhor compra.',
    description:
      'Compare preços, quantidades e descontos para escolher a oferta que realmente vale a pena.',
    kind: 'offer',
    icon: 'tag',
    skills: ['EF06MA13'],
    gradeLabel: '6º ano',
    difficulty: 2,
    estimatedMinutes: 6,
    rewardCoins: 70,
    badgeId: 'badge-ofertas',
    questions: [
      {
        id: 'ofertas-1',
        kind: 'choice',
        prompt: 'Qual suco sai mais em conta por mililitro?',
        scenario: 'Mercado do bairro — escolha entre duas embalagens do mesmo suco.',
        table: [
          { label: 'Garrafa de 1 L', value: 'R$ 7,00' },
          { label: 'Garrafa de 500 ml', value: 'R$ 4,00' },
        ],
        options: [
          { id: 'litro', label: 'Garrafa de 1 L por R$ 7,00', detail: 'R$ 0,007 por ml' },
          { id: 'meio-litro', label: 'Garrafa de 500 ml por R$ 4,00', detail: 'R$ 0,008 por ml' },
        ],
        answer: 'litro',
        hint: 'Divida o preço pela quantidade de mililitros de cada garrafa.',
        explanation:
          'R$ 7,00 ÷ 1.000 ml = R$ 0,007 por ml. R$ 4,00 ÷ 500 ml = R$ 0,008 por ml. A garrafa de 1 L é mais econômica.',
      },
      {
        id: 'ofertas-2',
        kind: 'choice',
        prompt: 'Qual pacote tem o menor preço por unidade?',
        scenario: 'Papelaria — o mesmo caderno em pacotes diferentes.',
        table: [
          { label: 'Pacote com 3 cadernos', value: 'R$ 9,00' },
          { label: 'Pacote com 5 cadernos', value: 'R$ 14,00' },
        ],
        options: [
          { id: 'tres', label: 'Pacote com 3 cadernos', detail: 'R$ 3,00 por caderno' },
          { id: 'cinco', label: 'Pacote com 5 cadernos', detail: 'R$ 2,80 por caderno' },
        ],
        answer: 'cinco',
        hint: 'Divida o valor do pacote pela quantidade de cadernos.',
        explanation:
          'R$ 9,00 ÷ 3 = R$ 3,00 por caderno. R$ 14,00 ÷ 5 = R$ 2,80 por caderno. O pacote com 5 cadernos compensa mais.',
      },
      {
        id: 'ofertas-3',
        kind: 'choice',
        prompt: 'Para a mesma camiseta, qual opção sai mais barata?',
        scenario: 'Loja virtual — duas promoções para o mesmo produto.',
        table: [
          { label: 'Camiseta', value: 'R$ 50,00' },
          { label: 'Promoção A', value: '20% de desconto' },
          { label: 'Promoção B', value: 'R$ 5,00 de cupom' },
        ],
        options: [
          { id: 'promocao-a', label: 'Promoção A: 20% de desconto', detail: 'Total: R$ 40,00' },
          { id: 'promocao-b', label: 'Promoção B: R$ 5,00 de cupom', detail: 'Total: R$ 37,00' },
        ],
        answer: 'promocao-b',
        hint: 'Calcule 20% de R$ 50,00 e compare com R$ 50,00 − R$ 5,00.',
        explanation:
          '20% de R$ 50,00 = R$ 10,00, então a Promoção A fica em R$ 40,00. A Promoção B fica em R$ 50,00 − R$ 5,00 = R$ 37,00. O cupom compensa mais.',
      },
    ],
  },
  {
    id: 'parcelado',
    title: 'Parcelado vs à Vista',
    tagline: 'O preço final conta mais que o valor da parcela.',
    description:
      'Compare o total pago à vista e parcelado, calcule descontos e descubra quando a parcela esconde um custo maior.',
    kind: 'installment',
    icon: 'percent',
    skills: ['EF05MA06', 'EF07MA02'],
    gradeLabel: '5º ao 7º ano',
    difficulty: 2,
    estimatedMinutes: 7,
    rewardCoins: 90,
    badgeId: 'badge-parcelado',
    questions: [
      {
        id: 'parcelado-1',
        kind: 'numeric',
        unit: 'brl',
        answer: 240,
        tolerance: 0.01,
        prompt: 'Quanto você economiza pagando à vista em vez de parcelar?',
        scenario: 'Loja de eletrônicos — televisão para a sala.',
        table: [
          { label: 'Preço à vista', value: 'R$ 1.200,00 com 10% de desconto' },
          { label: 'Parcelado', value: '12 × R$ 110,00' },
        ],
        hint: 'Calcule o total parcelado e compare com o preço à vista.',
        explanation:
          'À vista: R$ 1.200,00 − 10% (R$ 120,00) = R$ 1.080,00. Parcelado: 12 × R$ 110,00 = R$ 1.320,00. Economia: R$ 1.320,00 − R$ 1.080,00 = R$ 240,00.',
      },
      {
        id: 'parcelado-2',
        kind: 'choice',
        prompt: 'Qual opção é mais vantajosa para o notebook?',
        scenario: 'Papelaria e informática — mesmo notebook, duas formas de pagamento.',
        table: [
          { label: 'À vista', value: 'R$ 1.900,00' },
          { label: 'Parcelado', value: '10 × R$ 210,00' },
        ],
        options: [
          { id: 'avista', label: 'À vista por R$ 1.900,00', detail: 'Economia de R$ 200,00' },
          { id: 'parcelado', label: '10 × R$ 210,00', detail: 'Total de R$ 2.100,00' },
        ],
        answer: 'avista',
        hint: 'Multiplique o valor da parcela pela quantidade de parcelas.',
        explanation:
          'Parcelado: 10 × R$ 210,00 = R$ 2.100,00. À vista: R$ 1.900,00. A diferença é R$ 200,00, então pagar à vista vale mais a pena.',
      },
      {
        id: 'parcelado-3',
        kind: 'numeric',
        unit: 'brl',
        answer: 15,
        tolerance: 0.01,
        prompt: 'Qual é a economia ao pagar o fone à vista?',
        scenario: 'Loja de acessórios — fone de ouvido em promoção.',
        table: [
          { label: 'À vista', value: 'R$ 285,00' },
          { label: 'Parcelado', value: '3 × R$ 100,00' },
        ],
        hint: 'O total parcelado é 3 vezes R$ 100,00.',
        explanation:
          'Parcelado: 3 × R$ 100,00 = R$ 300,00. À vista: R$ 285,00. Economia: R$ 300,00 − R$ 285,00 = R$ 15,00.',
      },
    ],
  },
  {
    id: 'poupanca',
    title: 'Desafio Poupança',
    tagline: 'Pequenos depósitos, grande objetivo.',
    description:
      'Planeje quanto guardar por semana para alcançar uma meta sem apertar o orçamento.',
    kind: 'savings',
    icon: 'piggy',
    skills: ['EF07MA02'],
    gradeLabel: '7º ano',
    difficulty: 2,
    estimatedMinutes: 6,
    rewardCoins: 100,
    badgeId: 'badge-poupanca',
    questions: [
      {
        id: 'poupanca-1',
        kind: 'numeric',
        unit: 'brl',
        answer: 30,
        tolerance: 0.01,
        prompt: 'Quanto você precisa guardar por semana para chegar à meta em 4 semanas?',
        scenario: 'Meta: comprar um jogo que custa R$ 120,00.',
        table: [
          { label: 'Meta', value: 'R$ 120,00', emphasis: true },
          { label: 'Tempo', value: '4 semanas' },
          { label: 'Guardado até agora', value: 'R$ 0,00' },
        ],
        hint: 'Divida o valor da meta pelo número de semanas.',
        explanation:
          'R$ 120,00 ÷ 4 semanas = R$ 30,00 por semana. Guardando R$ 30,00 por semana, você chega à meta.',
      },
      {
        id: 'poupanca-2',
        kind: 'numeric',
        unit: 'brl',
        answer: 25,
        tolerance: 0.01,
        prompt: 'Quanto falta guardar por semana para completar a meta em 6 semanas?',
        scenario: 'Meta: uma bicicleta usada de R$ 200,00. Você já tem R$ 50,00.',
        table: [
          { label: 'Meta', value: 'R$ 200,00', emphasis: true },
          { label: 'Já guardado', value: 'R$ 50,00' },
          { label: 'Tempo restante', value: '6 semanas' },
        ],
        hint: 'Subtraia o que você já tem da meta e divida pelas semanas restantes.',
        explanation:
          'Faltam R$ 200,00 − R$ 50,00 = R$ 150,00. Dividindo em 6 semanas: R$ 150,00 ÷ 6 = R$ 25,00 por semana.',
      },
      {
        id: 'poupanca-3',
        kind: 'numeric',
        unit: 'brl',
        answer: 100,
        tolerance: 0.01,
        prompt: 'Guardando R$ 40,00 por semana durante 5 semanas, quanto ainda faltará para a meta?',
        scenario: 'Meta: um curso de robótica de R$ 300,00.',
        table: [
          { label: 'Meta', value: 'R$ 300,00', emphasis: true },
          { label: 'Depósito semanal', value: 'R$ 40,00' },
          { label: 'Tempo', value: '5 semanas' },
        ],
        hint: 'Calcule quanto será guardado em 5 semanas e compare com a meta.',
        explanation:
          'Em 5 semanas: 5 × R$ 40,00 = R$ 200,00. Ainda faltam R$ 300,00 − R$ 200,00 = R$ 100,00.',
      },
    ],
  },
  {
    id: 'orcamento',
    title: 'Orçamento do Mês',
    tagline: 'Cada real tem um lugar.',
    description:
      'Organize a mesada, separe despesas e descubra quanto sobra para realizar seus planos.',
    kind: 'budget',
    icon: 'target',
    skills: ['EF07MA02'],
    gradeLabel: '7º ano',
    difficulty: 1,
    estimatedMinutes: 5,
    rewardCoins: 80,
    badgeId: 'badge-orcamento',
    questions: [
      {
        id: 'orcamento-1',
        kind: 'numeric',
        unit: 'brl',
        answer: 10,
        tolerance: 0.01,
        prompt: 'Quanto sobra da mesada depois de pagar todos os gastos?',
        scenario: 'Mesada de R$ 80,00 deste mês.',
        table: [
          { label: 'Mesada', value: 'R$ 80,00', emphasis: true },
          { label: 'Transporte', value: 'R$ 35,00' },
          { label: 'Lanche', value: 'R$ 20,00' },
          { label: 'Material escolar', value: 'R$ 15,00' },
        ],
        hint: 'Some os gastos e subtraia da mesada.',
        explanation:
          'Gastos: R$ 35,00 + R$ 20,00 + R$ 15,00 = R$ 70,00. Sobra: R$ 80,00 − R$ 70,00 = R$ 10,00.',
      },
      {
        id: 'orcamento-2',
        kind: 'numeric',
        unit: 'brl',
        answer: 15,
        tolerance: 0.01,
        prompt: 'Quanto pode gastar com lazer e ainda guardar R$ 25,00?',
        scenario: 'Mesada de R$ 100,00 e gastos fixos de R$ 60,00.',
        table: [
          { label: 'Mesada', value: 'R$ 100,00', emphasis: true },
          { label: 'Gastos fixos', value: 'R$ 60,00' },
          { label: 'Meta de poupança', value: 'R$ 25,00' },
        ],
        hint: 'Subtraia os gastos fixos e a meta de poupança da mesada.',
        explanation:
          'R$ 100,00 − R$ 60,00 = R$ 40,00. Guardando R$ 25,00, restam R$ 40,00 − R$ 25,00 = R$ 15,00 para lazer.',
      },
      {
        id: 'orcamento-3',
        kind: 'numeric',
        unit: 'brl',
        answer: 77,
        tolerance: 0.01,
        prompt: 'O jogo custava R$ 70,00 e sofreu um aumento de 10%. Qual é o novo preço?',
        scenario: 'Loja de jogos — reajuste de preço.',
        table: [
          { label: 'Preço antigo', value: 'R$ 70,00' },
          { label: 'Aumento', value: '10%' },
          { label: 'Novo preço', value: '?', emphasis: true },
        ],
        hint: 'Calcule 10% de R$ 70,00 e some ao preço antigo.',
        explanation:
          '10% de R$ 70,00 = R$ 7,00. Novo preço: R$ 70,00 + R$ 7,00 = R$ 77,00.',
      },
    ],
  },
];

interface StudentSeed {
  id: string;
  name: string;
  classId: string;
  joinedAt: string;
  scores: (number | null)[];
}

const STUDENT_SEEDS: StudentSeed[] = [
  {
    id: 'aluno-lucas',
    name: 'Lucas S.',
    classId: 'turma-5a',
    joinedAt: '2026-08-04',
    scores: [100, 80, 70, null, null],
  },
  {
    id: 'aluno-enzo',
    name: 'Enzo M.',
    classId: 'turma-5a',
    joinedAt: '2026-08-04',
    scores: [80, 60, null, null, null],
  },
  {
    id: 'aluno-valentina',
    name: 'Valentina R.',
    classId: 'turma-5a',
    joinedAt: '2026-08-05',
    scores: [100, 100, 90, 80, null],
  },
  {
    id: 'aluno-ana',
    name: 'Ana B.',
    classId: 'turma-5a',
    joinedAt: '2026-08-05',
    scores: [60, 50, null, null, null],
  },
  {
    id: 'aluno-miguel',
    name: 'Miguel S.',
    classId: 'turma-5a',
    joinedAt: '2026-08-06',
    scores: [90, 70, 60, null, null],
  },
  {
    id: 'aluno-helena',
    name: 'Helena C.',
    classId: 'turma-5a',
    joinedAt: '2026-08-06',
    scores: [null, null, null, null, null],
  },
  {
    id: 'aluno-arthur',
    name: 'Arthur L.',
    classId: 'turma-5a',
    joinedAt: '2026-08-07',
    scores: [70, 60, 50, null, null],
  },
  {
    id: 'aluno-laura',
    name: 'Laura P.',
    classId: 'turma-5a',
    joinedAt: '2026-08-07',
    scores: [100, 90, 80, 70, 60],
  },
  {
    id: 'aluno-davi',
    name: 'Davi N.',
    classId: 'turma-5a',
    joinedAt: '2026-08-08',
    scores: [50, null, null, null, null],
  },
  {
    id: 'aluno-sofia',
    name: 'Sofia T.',
    classId: 'turma-5a',
    joinedAt: '2026-08-08',
    scores: [80, 70, null, null, null],
  },
  {
    id: 'aluno-bernardo',
    name: 'Bernardo F.',
    classId: 'turma-5a',
    joinedAt: '2026-08-09',
    scores: [null, 60, null, null, null],
  },
  {
    id: 'aluno-alice',
    name: 'Alice G.',
    classId: 'turma-5a',
    joinedAt: '2026-08-09',
    scores: [90, 80, 70, 60, null],
  },
  {
    id: 'aluno-theo',
    name: 'Theo V.',
    classId: 'turma-7b',
    joinedAt: '2026-08-04',
    scores: [100, 90, 80, null, null],
  },
  {
    id: 'aluno-cecilia',
    name: 'Cecília A.',
    classId: 'turma-7b',
    joinedAt: '2026-08-05',
    scores: [80, 70, null, null, null],
  },
  {
    id: 'aluno-joaquim',
    name: 'Joaquim R.',
    classId: 'turma-7b',
    joinedAt: '2026-08-05',
    scores: [60, null, null, null, null],
  },
  {
    id: 'aluno-manuela',
    name: 'Manuela C.',
    classId: 'turma-7b',
    joinedAt: '2026-08-06',
    scores: [100, 100, 90, 80, 70],
  },
  {
    id: 'aluno-pedro',
    name: 'Pedro H.',
    classId: 'turma-7b',
    joinedAt: '2026-08-06',
    scores: [70, 60, 50, null, null],
  },
  {
    id: 'aluno-isabela',
    name: 'Isabela F.',
    classId: 'turma-7b',
    joinedAt: '2026-08-07',
    scores: [90, 80, 70, 60, null],
  },
  {
    id: 'aluno-rafael',
    name: 'Rafael N.',
    classId: 'turma-7b',
    joinedAt: '2026-08-07',
    scores: [null, 50, null, null, null],
  },
  {
    id: 'aluno-luiza',
    name: 'Luiza M.',
    classId: 'turma-7b',
    joinedAt: '2026-08-08',
    scores: [80, 70, 60, null, null],
  },
  {
    id: 'aluno-gabriel',
    name: 'Gabriel T.',
    classId: 'turma-7b',
    joinedAt: '2026-08-08',
    scores: [null, null, null, null, null],
  },
  {
    id: 'aluno-nina',
    name: 'Nina P.',
    classId: 'turma-7b',
    joinedAt: '2026-08-09',
    scores: [70, 60, null, null, null],
  },
];

function daysAgo(days: number, hour = 14): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function buildProgress(): ProgressRecord[] {
  const records: ProgressRecord[] = [];

  STUDENT_SEEDS.forEach((seed, studentIndex) => {
    seed.scores.forEach((score, activityIndex) => {
      if (score === null) return;

      const activity = ACTIVITIES[activityIndex];
      const passed = score >= PASS_THRESHOLD;
      const errors = passed ? Math.max(0, Math.round((100 - score) / 25)) : 2;
      const attempts = passed && score >= 90 ? 1 : 2;
      const days = 1 + activityIndex * 2 + (studentIndex % 3);
      const lastAt = daysAgo(days, 13 + (studentIndex % 5));

      records.push({
        studentId: seed.id,
        activityId: activity.id,
        bestScore: score,
        attempts,
        errors,
        passed,
        coinsAwarded: passed,
        lastAt,
        history: [{ at: lastAt, score, errors, passed }],
      });
    });
  });

  return records;
}

const PROGRESS = buildProgress();

export const STUDENTS: Student[] = STUDENT_SEEDS.map((seed) => {
  const awarded = PROGRESS.filter(
    (record) => record.studentId === seed.id && record.coinsAwarded,
  ).reduce((total, record) => {
    const activity = ACTIVITIES.find((item) => item.id === record.activityId);
    return total + (activity?.rewardCoins ?? 0);
  }, 0);

  return {
    id: seed.id,
    name: seed.name,
    classId: seed.classId,
    coins: 100 + awarded,
    joinedAt: seed.joinedAt,
  };
});

export const SEED_PROGRESS: ProgressRecord[] = PROGRESS;

export const DEMO_STUDENT_ID = 'aluno-lucas';
export const DEMO_TEACHER_ID = 'prof-jose';
