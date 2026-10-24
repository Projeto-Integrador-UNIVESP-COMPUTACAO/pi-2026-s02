from django.core.management.base import BaseCommand
from django.db import transaction
from content.models import Skill, Activity, Question
from quizzes.models import QuestionOption


SKILLS = [
    {'code': 'EF05MA06', 'title': 'Porcentagens e descontos', 'description': 'Calcular 10%, 25%, 50%, 75% e 100% em situações de compra.', 'grade': '5º ano'},
    {'code': 'EF06MA13', 'title': 'Comparação de ofertas', 'description': 'Usar proporcionalidade para descobrir qual oferta compensa mais.', 'grade': '6º ano'},
    {'code': 'EF07MA02', 'title': 'Acréscimos e decréscimos', 'description': 'Resolver aumentos, descontos e planejamento de gastos do dia a dia.', 'grade': '7º ano'},
]


ACTIVITIES = [
    {
        'external_id': 'troco',
        'title': 'Simulador de Troco',
        'tagline': 'Pague, confira o troco e não perca um centavo.',
        'description': 'Resolva situações de compra na cantina da escola e calcule o troco usando dinheiro.',
        'kind': 'change',
        'icon': 'receipt',
        'skills': ['EF05MA06'],
        'grade_label': '5º ano',
        'difficulty': 1,
        'estimated_minutes': 5,
        'reward_coins': 60,
        'badge_id': 'badge-troco',
        'questions': [
            {
                'external_id': 'troco-1',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Você pagou com R$ 20,00. Quanto deve receber de troco?',
                'scenario': 'Cantina da escola — pedido de Lucas.',
                'answer_numeric': 9.5,
                'tolerance': 0.01,
                'hint': 'Some os dois produtos e subtraia o total do valor pago.',
                'explanation': 'Suco (R$ 6,50) + pão de queijo (R$ 4,00) = R$ 10,50. Troco: R$ 20,00 − R$ 10,50 = R$ 9,50.',
                'order': 1,
            },
            {
                'external_id': 'troco-2',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Pagando com R$ 20,00, qual é o troco da compra?',
                'scenario': 'Intervalo da tarde — dois salgados e um refrigerante.',
                'answer_numeric': 8.0,
                'tolerance': 0.01,
                'hint': 'Primeiro descubra quanto custaram os dois salgados.',
                'explanation': '2 × R$ 3,50 = R$ 7,00. Total: R$ 7,00 + R$ 5,00 = R$ 12,00. Troco: R$ 20,00 − R$ 12,00 = R$ 8,00.',
                'order': 2,
            },
            {
                'external_id': 'troco-3',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Você comprou 4 balas e pagou com uma nota de R$ 10,00. Quanto volta?',
                'scenario': 'Doceria do bairro — balas a R$ 0,75 cada.',
                'answer_numeric': 7.0,
                'tolerance': 0.01,
                'hint': 'Multiplique o preço de uma bala por 4 antes de calcular o troco.',
                'explanation': '4 × R$ 0,75 = R$ 3,00. Troco: R$ 10,00 − R$ 3,00 = R$ 7,00.',
                'order': 3,
            },
        ],
    },
    {
        'external_id': 'ofertas',
        'title': 'Qual oferta compensa?',
        'tagline': 'Olho vivo: nem sempre o mais barato é a melhor compra.',
        'description': 'Compare preços, quantidades e descontos para escolher a oferta que realmente vale a pena.',
        'kind': 'offer',
        'icon': 'tag',
        'skills': ['EF06MA13'],
        'grade_label': '6º ano',
        'difficulty': 2,
        'estimated_minutes': 6,
        'reward_coins': 70,
        'badge_id': 'badge-ofertas',
        'questions': [
            {
                'external_id': 'ofertas-1',
                'kind': 'choice',
                'unit': 'none',
                'prompt': 'Qual suco sai mais em conta por mililitro?',
                'scenario': 'Mercado do bairro — escolha entre duas embalagens do mesmo suco.',
                'answer_text': 'litro',
                'tolerance': 0.01,
                'hint': 'Divida o preço pela quantidade de mililitros de cada garrafa.',
                'explanation': 'R$ 7,00 ÷ 1.000 ml = R$ 0,007 por ml. R$ 4,00 ÷ 500 ml = R$ 0,008 por ml. A garrafa de 1 L é mais econômica.',
                'order': 1,
                'options': [
                    {'external_id': 'litro', 'label': 'Garrafa de 1 L por R$ 7,00', 'detail': 'R$ 0,007 por ml'},
                    {'external_id': 'meio-litro', 'label': 'Garrafa de 500 ml por R$ 4,00', 'detail': 'R$ 0,008 por ml'},
                ],
            },
            {
                'external_id': 'ofertas-2',
                'kind': 'choice',
                'unit': 'none',
                'prompt': 'Qual pacote tem o menor preço por unidade?',
                'scenario': 'Papelaria — o mesmo caderno em pacotes diferentes.',
                'answer_text': 'cinco',
                'tolerance': 0.01,
                'hint': 'Divida o valor do pacote pela quantidade de cadernos.',
                'explanation': 'R$ 9,00 ÷ 3 = R$ 3,00 por caderno. R$ 14,00 ÷ 5 = R$ 2,80 por caderno. O pacote com 5 cadernos compensa mais.',
                'order': 2,
                'options': [
                    {'external_id': 'tres', 'label': 'Pacote com 3 cadernos', 'detail': 'R$ 3,00 por caderno'},
                    {'external_id': 'cinco', 'label': 'Pacote com 5 cadernos', 'detail': 'R$ 2,80 por caderno'},
                ],
            },
            {
                'external_id': 'ofertas-3',
                'kind': 'choice',
                'unit': 'none',
                'prompt': 'Para a mesma camiseta, qual opção sai mais barata?',
                'scenario': 'Loja virtual — duas promoções para o mesmo produto.',
                'answer_text': 'promocao-b',
                'tolerance': 0.01,
                'hint': 'Calcule 20% de R$ 50,00 e compare com R$ 50,00 − R$ 5,00.',
                'explanation': '20% de R$ 50,00 = R$ 10,00, então a Promoção A fica em R$ 40,00. A Promoção B fica em R$ 50,00 − R$ 5,00 = R$ 37,00. O cupom compensa mais.',
                'order': 3,
                'options': [
                    {'external_id': 'promocao-a', 'label': 'Promoção A: 20% de desconto', 'detail': 'Total: R$ 40,00'},
                    {'external_id': 'promocao-b', 'label': 'Promoção B: R$ 5,00 de cupom', 'detail': 'Total: R$ 37,00'},
                ],
            },
        ],
    },
    {
        'external_id': 'parcelado',
        'title': 'Parcelado vs à Vista',
        'tagline': 'O preço final conta mais que o valor da parcela.',
        'description': 'Compare o total pago à vista e parcelado, calcule descontos e descubra quando a parcela esconde um custo maior.',
        'kind': 'installment',
        'icon': 'percent',
        'skills': ['EF05MA06', 'EF07MA02'],
        'grade_label': '5º ao 7º ano',
        'difficulty': 2,
        'estimated_minutes': 7,
        'reward_coins': 90,
        'badge_id': 'badge-parcelado',
        'questions': [
            {
                'external_id': 'parcelado-1',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Quanto você economiza pagando à vista em vez de parcelar?',
                'scenario': 'Loja de eletrônicos — televisão para a sala.',
                'answer_numeric': 240.0,
                'tolerance': 0.01,
                'hint': 'Calcule o total parcelado e compare com o preço à vista.',
                'explanation': 'À vista: R$ 1.200,00 − 10% (R$ 120,00) = R$ 1.080,00. Parcelado: 12 × R$ 110,00 = R$ 1.320,00. Economia: R$ 1.320,00 − R$ 1.080,00 = R$ 240,00.',
                'order': 1,
            },
            {
                'external_id': 'parcelado-2',
                'kind': 'choice',
                'unit': 'none',
                'prompt': 'Qual opção é mais vantajosa para o notebook?',
                'scenario': 'Papelaria e informática — mesmo notebook, duas formas de pagamento.',
                'answer_text': 'avista',
                'tolerance': 0.01,
                'hint': 'Multiplique o valor da parcela pela quantidade de parcelas.',
                'explanation': 'Parcelado: 10 × R$ 210,00 = R$ 2.100,00. À vista: R$ 1.900,00. A diferença é R$ 200,00, então pagar à vista vale mais a pena.',
                'order': 2,
                'options': [
                    {'external_id': 'avista', 'label': 'À vista por R$ 1.900,00', 'detail': 'Economia de R$ 200,00'},
                    {'external_id': 'parcelado', 'label': '10 × R$ 210,00', 'detail': 'Total de R$ 2.100,00'},
                ],
            },
            {
                'external_id': 'parcelado-3',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Qual é a economia ao pagar o fone à vista?',
                'scenario': 'Loja de acessórios — fone de ouvido em promoção.',
                'answer_numeric': 15.0,
                'tolerance': 0.01,
                'hint': 'O total parcelado é 3 vezes R$ 100,00.',
                'explanation': 'Parcelado: 3 × R$ 100,00 = R$ 300,00. À vista: R$ 285,00. Economia: R$ 300,00 − R$ 285,00 = R$ 15,00.',
                'order': 3,
            },
        ],
    },
    {
        'external_id': 'poupanca',
        'title': 'Desafio Poupança',
        'tagline': 'Pequenos depósitos, grande objetivo.',
        'description': 'Planeje quanto guardar por semana para alcançar uma meta sem apertar o orçamento.',
        'kind': 'savings',
        'icon': 'piggy',
        'skills': ['EF07MA02'],
        'grade_label': '7º ano',
        'difficulty': 2,
        'estimated_minutes': 6,
        'reward_coins': 100,
        'badge_id': 'badge-poupanca',
        'questions': [
            {
                'external_id': 'poupanca-1',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Quanto você precisa guardar por semana para chegar à meta em 4 semanas?',
                'scenario': 'Meta: comprar um jogo que custa R$ 120,00.',
                'answer_numeric': 30.0,
                'tolerance': 0.01,
                'hint': 'Divida o valor da meta pelo número de semanas.',
                'explanation': 'R$ 120,00 ÷ 4 semanas = R$ 30,00 por semana. Guardando R$ 30,00 por semana, você chega à meta.',
                'order': 1,
            },
            {
                'external_id': 'poupanca-2',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Quanto falta guardar por semana para completar a meta em 6 semanas?',
                'scenario': 'Meta: uma bicicleta usada de R$ 200,00. Você já tem R$ 50,00.',
                'answer_numeric': 25.0,
                'tolerance': 0.01,
                'hint': 'Subtraia o que você já tem da meta e divida pelas semanas restantes.',
                'explanation': 'Faltam R$ 200,00 − R$ 50,00 = R$ 150,00. Dividindo em 6 semanas: R$ 150,00 ÷ 6 = R$ 25,00 por semana.',
                'order': 2,
            },
            {
                'external_id': 'poupanca-3',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Guardando R$ 40,00 por semana durante 5 semanas, quanto ainda faltará para a meta?',
                'scenario': 'Meta: um curso de robótica de R$ 300,00.',
                'answer_numeric': 100.0,
                'tolerance': 0.01,
                'hint': 'Calcule quanto será guardado em 5 semanas e compare com a meta.',
                'explanation': 'Em 5 semanas: 5 × R$ 40,00 = R$ 200,00. Ainda faltam R$ 300,00 − R$ 200,00 = R$ 100,00.',
                'order': 3,
            },
        ],
    },
    {
        'external_id': 'orcamento',
        'title': 'Orçamento do Mês',
        'tagline': 'Cada real tem um lugar.',
        'description': 'Organize a mesada, separe despesas e descubra quanto sobra para realizar seus planos.',
        'kind': 'budget',
        'icon': 'target',
        'skills': ['EF07MA02'],
        'grade_label': '7º ano',
        'difficulty': 1,
        'estimated_minutes': 5,
        'reward_coins': 80,
        'badge_id': 'badge-orcamento',
        'questions': [
            {
                'external_id': 'orcamento-1',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Quanto sobra da mesada depois de pagar todos os gastos?',
                'scenario': 'Mesada de R$ 80,00 deste mês.',
                'answer_numeric': 10.0,
                'tolerance': 0.01,
                'hint': 'Some os gastos e subtraia da mesada.',
                'explanation': 'Gastos: R$ 35,00 + R$ 20,00 + R$ 15,00 = R$ 70,00. Sobra: R$ 80,00 − R$ 70,00 = R$ 10,00.',
                'order': 1,
            },
            {
                'external_id': 'orcamento-2',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'Quanto pode gastar com lazer e ainda guardar R$ 25,00?',
                'scenario': 'Mesada de R$ 100,00 e gastos fixos de R$ 60,00.',
                'answer_numeric': 15.0,
                'tolerance': 0.01,
                'hint': 'Subtraia os gastos fixos e a meta de poupança da mesada.',
                'explanation': 'R$ 100,00 − R$ 60,00 = R$ 40,00. Guardando R$ 25,00, restam R$ 40,00 − R$ 25,00 = R$ 15,00 para lazer.',
                'order': 2,
            },
            {
                'external_id': 'orcamento-3',
                'kind': 'numeric',
                'unit': 'brl',
                'prompt': 'O jogo custava R$ 70,00 e sofreu um aumento de 10%. Qual é o novo preço?',
                'scenario': 'Loja de jogos — reajuste de preço.',
                'answer_numeric': 77.0,
                'tolerance': 0.01,
                'hint': 'Calcule 10% de R$ 70,00 e some ao preço antigo.',
                'explanation': '10% de R$ 70,00 = R$ 7,00. Novo preço: R$ 70,00 + R$ 7,00 = R$ 77,00.',
                'order': 3,
            },
        ],
    },
]


TABLES = {
    'troco-1': [
        {'label': 'Suco de laranja', 'value': 'R$ 6,50'},
        {'label': 'Pão de queijo', 'value': 'R$ 4,00'},
        {'label': 'Pagamento', 'value': 'R$ 20,00', 'emphasis': True},
    ],
    'troco-2': [
        {'label': '2 salgados', 'value': 'R$ 3,50 cada'},
        {'label': 'Refrigerante', 'value': 'R$ 5,00'},
        {'label': 'Pagamento', 'value': 'R$ 20,00', 'emphasis': True},
    ],
    'troco-3': [
        {'label': 'Bala de morango', 'value': 'R$ 0,75 cada'},
        {'label': 'Quantidade', 'value': '4 balas'},
        {'label': 'Pagamento', 'value': 'R$ 10,00', 'emphasis': True},
    ],
    'ofertas-1': [
        {'label': 'Garrafa de 1 L', 'value': 'R$ 7,00'},
        {'label': 'Garrafa de 500 ml', 'value': 'R$ 4,00'},
    ],
    'ofertas-2': [
        {'label': 'Pacote com 3 cadernos', 'value': 'R$ 9,00'},
        {'label': 'Pacote com 5 cadernos', 'value': 'R$ 14,00'},
    ],
    'ofertas-3': [
        {'label': 'Camiseta', 'value': 'R$ 50,00'},
        {'label': 'Promoção A', 'value': '20% de desconto'},
        {'label': 'Promoção B', 'value': 'R$ 5,00 de cupom'},
    ],
    'parcelado-1': [
        {'label': 'Preço à vista', 'value': 'R$ 1.200,00 com 10% de desconto'},
        {'label': 'Parcelado', 'value': '12 × R$ 110,00'},
    ],
    'parcelado-2': [
        {'label': 'À vista', 'value': 'R$ 1.900,00'},
        {'label': 'Parcelado', 'value': '10 × R$ 210,00'},
    ],
    'parcelado-3': [
        {'label': 'À vista', 'value': 'R$ 285,00'},
        {'label': 'Parcelado', 'value': '3 × R$ 100,00'},
    ],
    'poupanca-1': [
        {'label': 'Meta', 'value': 'R$ 120,00', 'emphasis': True},
        {'label': 'Tempo', 'value': '4 semanas'},
        {'label': 'Guardado até agora', 'value': 'R$ 0,00'},
    ],
    'poupanca-2': [
        {'label': 'Meta', 'value': 'R$ 200,00', 'emphasis': True},
        {'label': 'Já guardado', 'value': 'R$ 50,00'},
        {'label': 'Tempo restante', 'value': '6 semanas'},
    ],
    'poupanca-3': [
        {'label': 'Meta', 'value': 'R$ 300,00', 'emphasis': True},
        {'label': 'Depósito semanal', 'value': 'R$ 40,00'},
        {'label': 'Tempo', 'value': '5 semanas'},
    ],
    'orcamento-1': [
        {'label': 'Mesada', 'value': 'R$ 80,00', 'emphasis': True},
        {'label': 'Transporte', 'value': 'R$ 35,00'},
        {'label': 'Lanche', 'value': 'R$ 20,00'},
        {'label': 'Material escolar', 'value': 'R$ 15,00'},
    ],
    'orcamento-2': [
        {'label': 'Mesada', 'value': 'R$ 100,00', 'emphasis': True},
        {'label': 'Gastos fixos', 'value': 'R$ 60,00'},
        {'label': 'Meta de poupança', 'value': 'R$ 25,00'},
    ],
    'orcamento-3': [
        {'label': 'Preço antigo', 'value': 'R$ 70,00'},
        {'label': 'Aumento', 'value': '10%'},
        {'label': 'Novo preço', 'value': '?', 'emphasis': True},
    ],
}


class Command(BaseCommand):
    help = 'Popula atividades e questões conforme o frontend'

    @transaction.atomic
    def handle(self, *args, **options):
        for s in SKILLS:
            Skill.objects.get_or_create(code=s['code'], defaults=s)
        for a in ACTIVITIES:
            activity, _ = Activity.objects.get_or_create(
                external_id=a['external_id'],
                defaults={
                    'title': a['title'],
                    'tagline': a['tagline'],
                    'description': a['description'],
                    'kind': a['kind'],
                    'icon': a['icon'],
                    'grade_label': a['grade_label'],
                    'difficulty': a['difficulty'],
                    'estimated_minutes': a['estimated_minutes'],
                    'reward_coins': a['reward_coins'],
                    'badge_id': a['badge_id'],
                },
            )
            activity.skills.clear()
            for sc in a['skills']:
                skill = Skill.objects.get(code=sc)
                activity.skills.add(skill)
            for q in a['questions']:
                question, _ = Question.objects.get_or_create(
                    external_id=q['external_id'],
                    defaults={
                        'activity': activity,
                        'kind': q['kind'],
                        'prompt': q['prompt'],
                        'scenario': q.get('scenario', ''),
                        'answer_numeric': q.get('answer_numeric'),
                        'answer_text': q.get('answer_text', ''),
                        'tolerance': q.get('tolerance', 0.01),
                        'unit': q.get('unit', 'none'),
                        'explanation': q.get('explanation', ''),
                        'hint': q.get('hint', ''),
                        'table': TABLES.get(q['external_id'], []),
                        'order': q.get('order', 0),
                    },
                )
                question.table = TABLES.get(q['external_id'], [])
                question.save(update_fields=['table'])
                question.options.all().delete()
                for opt in q.get('options', []):
                    QuestionOption.objects.create(question=question, external_id=opt['external_id'], label=opt['label'], detail=opt.get('detail', ''))
        self.stdout.write(self.style.SUCCESS('Atividades populadas com sucesso!'))
