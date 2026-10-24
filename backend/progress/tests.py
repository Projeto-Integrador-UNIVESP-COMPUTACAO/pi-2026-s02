from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from classrooms.models import Classroom
from content.models import Activity, Question, Skill
from progress.models import Attempt, ProgressRecord

User = get_user_model()


class ProgressTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='prof-progress',
            email='prof-progress@example.com',
            password='Senha123!',
            role=User.Role.TEACHER,
            name='Professor Progresso',
        )
        self.other_teacher = User.objects.create_user(
            username='prof-outro',
            email='prof-outro@example.com',
            password='Senha123!',
            role=User.Role.TEACHER,
            name='Professor Outro',
        )
        self.classroom = Classroom.objects.create(
            name='5º ano A',
            grade='5º ano',
            school='Escola Teste',
            teacher=self.teacher,
        )
        self.other_classroom = Classroom.objects.create(
            name='7º ano B',
            grade='7º ano',
            school='Escola Teste',
            teacher=self.other_teacher,
        )
        self.student = User.objects.create_user(
            username='aluno-progress',
            email='aluno-progress@example.com',
            password='Senha123!',
            role=User.Role.STUDENT,
            name='Aluno Progresso',
            classroom=self.classroom,
            coins=100,
        )
        self.other_student = User.objects.create_user(
            username='aluno-outro',
            email='aluno-outro@example.com',
            password='Senha123!',
            role=User.Role.STUDENT,
            name='Aluno Outro',
            classroom=self.other_classroom,
            coins=0,
        )
        self.student_token = Token.objects.create(user=self.student)
        self.teacher_token = Token.objects.create(user=self.teacher)

        skill = Skill.objects.create(
            code='EF06MA13',
            title='Teste',
            description='',
            grade='6º ano',
        )
        self.activity = Activity.objects.create(
            external_id='teste-progresso',
            title='Teste Progresso',
            tagline='t',
            description='d',
            kind=Activity.Kind.OFFER,
            icon='tag',
            grade_label='6º ano',
            difficulty=1,
            estimated_minutes=5,
            reward_coins=10,
            badge_id='b',
        )
        self.activity.skills.add(skill)
        Question.objects.create(
            activity=self.activity,
            external_id='q-progresso',
            kind=Question.Kind.NUMERIC,
            prompt='2+2?',
            answer_numeric=4.0,
            unit=Question.Unit.NONE,
        )

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def attempt(self, score=80, errors=1, passed=True, activity_id='teste-progresso'):
        return self.client.post(
            '/api/progress/attempt/',
            {
                'activityId': activity_id,
                'score': score,
                'errors': errors,
                'passed': passed,
            },
            format='json',
        )

    def test_requires_authentication(self):
        self.assertEqual(
            self.client.post('/api/progress/attempt/', {}, format='json').status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
        self.assertEqual(
            self.client.get('/api/progress/me/').status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_first_pass_awards_coins_and_creates_record(self):
        self.authenticate(self.student)

        response = self.attempt(score=80, errors=1, passed=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bestScore'], 80)
        self.assertEqual(response.data['attempts'], 1)
        self.assertEqual(response.data['errors'], 1)
        self.assertTrue(response.data['passed'])
        self.assertTrue(response.data['coinsAwarded'])
        self.assertEqual(response.data['coinsGain'], self.activity.reward_coins)
        self.assertEqual(response.data['coins'], 110)
        self.assertEqual(len(response.data['history']), 1)
        self.assertTrue(response.data['history'][0]['passed'])

        self.student.refresh_from_db()
        self.assertEqual(self.student.coins, 110)

        record = ProgressRecord.objects.get(student=self.student, activity=self.activity)
        self.assertEqual(record.best_score, 80)
        self.assertEqual(record.attempts, 1)
        self.assertTrue(record.coins_awarded)
        self.assertEqual(Attempt.objects.filter(student=self.student).count(), 1)

    def test_repeat_attempt_improves_best_score_without_extra_coins(self):
        self.authenticate(self.student)
        self.attempt(score=70, errors=2, passed=True)

        response = self.attempt(score=95, errors=0, passed=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bestScore'], 95)
        self.assertEqual(response.data['attempts'], 2)
        self.assertEqual(response.data['errors'], 2)
        self.assertEqual(response.data['coinsGain'], 0)
        self.assertEqual(response.data['coins'], 110)
        self.assertEqual(len(response.data['history']), 2)
        self.assertEqual(
            [entry['score'] for entry in response.data['history']], [70, 95]
        )

        self.student.refresh_from_db()
        self.assertEqual(self.student.coins, 110)

    def test_worse_attempt_keeps_best_score(self):
        self.authenticate(self.student)
        self.attempt(score=90, errors=0, passed=True)

        response = self.attempt(score=60, errors=3, passed=True)

        self.assertEqual(response.data['bestScore'], 90)
        self.assertEqual(response.data['attempts'], 2)
        self.assertEqual(response.data['errors'], 3)

    def test_failed_attempt_does_not_award_coins(self):
        self.authenticate(self.student)

        response = self.attempt(score=40, errors=3, passed=False)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bestScore'], 40)
        self.assertFalse(response.data['passed'])
        self.assertFalse(response.data['coinsAwarded'])
        self.assertEqual(response.data['coinsGain'], 0)
        self.assertEqual(response.data['coins'], 100)

        self.student.refresh_from_db()
        self.assertEqual(self.student.coins, 100)

    def test_score_is_clamped_between_zero_and_hundred(self):
        self.authenticate(self.student)

        self.assertEqual(self.attempt(score=250, passed=False).data['bestScore'], 100)
        self.assertEqual(self.attempt(score=-10, passed=False).data['bestScore'], 100)

    def test_invalid_score_returns_bad_request(self):
        self.authenticate(self.student)

        response = self.attempt(score='abc')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unknown_activity_returns_not_found(self):
        self.authenticate(self.student)

        response = self.attempt(activity_id='nao-existe')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_my_progress_returns_records_and_history(self):
        self.authenticate(self.student)
        self.attempt(score=85, errors=1, passed=True)

        response = self.client.get('/api/progress/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['studentId'], str(self.student.id))
        self.assertEqual(response.data[0]['activityId'], self.activity.external_id)
        self.assertEqual(response.data[0]['bestScore'], 85)
        self.assertEqual(len(response.data[0]['history']), 1)

    def test_my_progress_only_returns_own_records(self):
        self.authenticate(self.student)
        self.attempt(score=85, passed=True)

        self.authenticate(self.other_student)
        response = self.client.get('/api/progress/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_student_can_read_own_classroom_progress(self):
        self.authenticate(self.student)

        response = self.client.get(
            f'/api/progress/classroom/{self.classroom.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['classroom']['name'], '5º ano A')
        self.assertEqual(response.data['classroom']['grade'], '5º ano')
        self.assertEqual(response.data['classroom']['school'], 'Escola Teste')
        self.assertEqual(len(response.data['students']), 1)
        student = response.data['students'][0]
        self.assertEqual(student['id'], str(self.student.id))
        self.assertEqual(student['classId'], str(self.classroom.id))
        self.assertEqual(student['coins'], 100)
        self.assertIn('joinedAt', student)
        self.assertEqual(response.data['progress'], [])

    def test_student_cannot_read_other_classroom(self):
        self.authenticate(self.student)

        response = self.client.get(
            f'/api/progress/classroom/{self.other_classroom.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_read_own_classroom_progress(self):
        self.authenticate(self.student)
        self.attempt(score=90, passed=True)

        self.authenticate(self.teacher)
        response = self.client.get(
            f'/api/progress/classroom/{self.classroom.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['students']), 1)
        self.assertEqual(len(response.data['progress']), 1)
        self.assertEqual(response.data['progress'][0]['studentId'], str(self.student.id))

    def test_teacher_cannot_read_other_classroom(self):
        self.authenticate(self.teacher)

        response = self.client.get(
            f'/api/progress/classroom/{self.other_classroom.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unknown_classroom_returns_not_found(self):
        self.authenticate(self.teacher)

        response = self.client.get('/api/progress/classroom/999999/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
