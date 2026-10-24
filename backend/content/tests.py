from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from content.models import Activity, Question, Skill
from quizzes.models import QuestionOption

User = get_user_model()


class ContentTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='aluno-content',
            email='aluno-content@example.com',
            password='Senha123!',
            role=User.Role.STUDENT,
            name='Aluno Conteúdo',
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        skill = Skill.objects.create(
            code='EF05MA06',
            title='Teste',
            description='',
            grade='5º ano',
        )
        self.activity = Activity.objects.create(
            external_id='teste-content',
            title='Teste Conteúdo',
            tagline='Uma missão de teste',
            description='Descrição da missão',
            kind=Activity.Kind.CHANGE,
            icon='receipt',
            grade_label='5º ano',
            difficulty=2,
            estimated_minutes=7,
            reward_coins=15,
            badge_id='badge-teste',
        )
        self.activity.skills.add(skill)
        self.question = Question.objects.create(
            activity=self.activity,
            external_id='q-content',
            kind=Question.Kind.NUMERIC,
            prompt='1+1?',
            scenario='Cenário de teste',
            answer_numeric=2.0,
            tolerance=0.5,
            unit=Question.Unit.NONE,
            explanation='ok',
            hint='some',
            table=[{'label': 'Item', 'value': 'R$ 2,00', 'emphasis': True}],
            order=1,
        )
        self.choice_question = Question.objects.create(
            activity=self.activity,
            external_id='q-content-choice',
            kind=Question.Kind.CHOICE,
            prompt='Escolha a melhor oferta',
            answer_text='a',
            unit=Question.Unit.NONE,
            explanation='porque sim',
            order=2,
        )
        QuestionOption.objects.create(
            question=self.choice_question,
            external_id='a',
            label='Oferta A',
            detail='R$ 10,00',
        )
        QuestionOption.objects.create(
            question=self.choice_question,
            external_id='b',
            label='Oferta B',
            detail='R$ 12,00',
        )

    def test_requires_authentication(self):
        self.client.credentials()

        self.assertEqual(
            self.client.get('/api/content/activities/').status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_activity_list_returns_seeded_shape(self):
        response = self.client.get('/api/content/activities/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        activity = response.data[0]
        self.assertEqual(activity['id'], 'teste-content')
        self.assertEqual(activity['title'], 'Teste Conteúdo')
        self.assertEqual(activity['kind'], Activity.Kind.CHANGE)
        self.assertEqual(activity['skills'], ['EF05MA06'])
        self.assertEqual(activity['gradeLabel'], '5º ano')
        self.assertEqual(activity['difficulty'], 2)
        self.assertEqual(activity['estimatedMinutes'], 7)
        self.assertEqual(activity['rewardCoins'], 15)
        self.assertEqual(activity['badgeId'], 'badge-teste')
        self.assertEqual(len(activity['questions']), 2)

    def test_activity_detail_returns_numeric_question(self):
        response = self.client.get('/api/content/activities/teste-content/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], 'teste-content')
        self.assertEqual(len(response.data['questions']), 2)

        question = response.data['questions'][0]
        self.assertEqual(question['id'], 'q-content')
        self.assertEqual(question['kind'], Question.Kind.NUMERIC)
        self.assertEqual(question['prompt'], '1+1?')
        self.assertEqual(question['scenario'], 'Cenário de teste')
        self.assertEqual(question['answer'], 2.0)
        self.assertEqual(question['tolerance'], 0.5)
        self.assertEqual(question['unit'], Question.Unit.NONE)
        self.assertEqual(question['explanation'], 'ok')
        self.assertEqual(question['hint'], 'some')
        self.assertEqual(
            question['table'],
            [{'label': 'Item', 'value': 'R$ 2,00', 'emphasis': True}],
        )
        self.assertNotIn('options', question)

    def test_activity_detail_returns_choice_options(self):
        response = self.client.get('/api/content/activities/teste-content/')

        question = response.data['questions'][1]
        self.assertEqual(question['id'], 'q-content-choice')
        self.assertEqual(question['kind'], Question.Kind.CHOICE)
        self.assertEqual(question['answer'], 'a')
        self.assertEqual(
            question['options'],
            [
                {'id': 'a', 'label': 'Oferta A', 'detail': 'R$ 10,00'},
                {'id': 'b', 'label': 'Oferta B', 'detail': 'R$ 12,00'},
            ],
        )

    def test_activity_detail_orders_questions(self):
        response = self.client.get('/api/content/activities/teste-content/')

        self.assertEqual(
            [question['id'] for question in response.data['questions']],
            ['q-content', 'q-content-choice'],
        )

    def test_unknown_activity_returns_not_found(self):
        response = self.client.get('/api/content/activities/nao-existe/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
