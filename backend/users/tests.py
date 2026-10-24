from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from classrooms.models import Classroom

User = get_user_model()


class AuthLoginTest(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='prof1',
            email='prof1@example.com',
            password='Senha123!',
            role=User.Role.TEACHER,
            name='Professor Teste',
        )
        self.classroom = Classroom.objects.create(
            name='5º ano A',
            grade='5º ano',
            school='Escola Teste',
            teacher=self.teacher,
        )
        self.student = User.objects.create_user(
            username='aluno1',
            email='aluno1@example.com',
            password='Senha123!',
            role=User.Role.STUDENT,
            name='Aluno Teste',
            classroom=self.classroom,
            coins=100,
        )

    def test_login_success_with_email(self):
        response = self.client.post(
            '/api/users/login/',
            {'email': 'aluno1@example.com', 'password': 'Senha123!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'aluno1@example.com')
        self.assertEqual(response.data['user']['coins'], 100)
        self.assertEqual(response.data['user']['classroom']['name'], '5º ano A')
        self.assertEqual(
            response.data['user']['classroom']['teacher_id'], self.teacher.id
        )

    def test_login_accepts_username_as_identifier(self):
        response = self.client.post(
            '/api/users/login/',
            {'email': 'aluno1', 'password': 'Senha123!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_missing_credentials(self):
        response = self.client.post(
            '/api/users/login/', {'email': 'aluno1@example.com'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_invalid_password(self):
        response = self.client.post(
            '/api/users/login/',
            {'email': 'aluno1@example.com', 'password': 'wrong'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_authentication(self):
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_profile(self):
        token = Token.objects.create(user=self.student)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Aluno Teste')
        self.assertEqual(response.data['classroom_id'], self.classroom.id)
