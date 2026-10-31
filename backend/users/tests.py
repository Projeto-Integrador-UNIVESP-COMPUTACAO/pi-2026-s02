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


class UserCreationTest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_test',
            email='admin_test@example.com',
            password='Senha123!',
            role=User.Role.ADMIN,
            name='Admin Teste',
            is_staff=True,
            is_superuser=True,
        )
        self.teacher = User.objects.create_user(
            username='teacher_test',
            email='teacher_test@example.com',
            password='Senha123!',
            role=User.Role.TEACHER,
            name='Professor Teste',
        )
        self.other_teacher = User.objects.create_user(
            username='other_teacher',
            email='other_teacher@example.com',
            password='Senha123!',
            role=User.Role.TEACHER,
            name='Outro Professor',
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
            username='student_test',
            email='student_test@example.com',
            password='Senha123!',
            role=User.Role.STUDENT,
            name='Aluno Teste',
            classroom=self.classroom,
            coins=100,
        )

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_unauthenticated_cannot_create_user(self):
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Novo Professor',
                'email': 'novo.professor@example.com',
                'password': 'Senha123!',
                'role': 'TEACHER',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_create_teacher(self):
        self.authenticate(self.admin)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Novo Professor',
                'email': 'novo.professor@example.com',
                'password': 'Senha123!',
                'role': 'TEACHER',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'TEACHER')
        self.assertEqual(response.data['username'], 'novo.professor')
        self.assertEqual(response.data['coins'], 0)
        self.assertTrue(
            User.objects.filter(email='novo.professor@example.com').exists()
        )

    def test_endpoint_accepts_path_without_trailing_slash(self):
        self.authenticate(self.admin)
        response = self.client.post(
            '/api/users',
            {
                'name': 'Professor Sem Barra',
                'email': 'professor.sem.barra@example.com',
                'password': 'Senha123!',
                'role': 'TEACHER',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_cannot_create_student(self):
        self.authenticate(self.admin)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Novo Aluno',
                'email': 'novo.aluno@example.com',
                'password': 'Senha123!',
                'role': 'STUDENT',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_create_admin(self):
        self.authenticate(self.admin)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Outro Admin',
                'email': 'outro.admin@example.com',
                'password': 'Senha123!',
                'role': 'ADMIN',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_create_student_in_own_classroom(self):
        self.authenticate(self.teacher)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Novo Aluno',
                'email': 'novo.aluno@example.com',
                'password': 'Senha123!',
                'role': 'STUDENT',
                'classroom_id': self.classroom.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'STUDENT')
        self.assertEqual(response.data['classroom_id'], self.classroom.id)
        self.assertEqual(response.data['coins'], 100)

    def test_teacher_cannot_create_student_in_another_teachers_classroom(self):
        self.authenticate(self.teacher)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Novo Aluno',
                'email': 'novo.aluno@example.com',
                'password': 'Senha123!',
                'role': 'STUDENT',
                'classroom_id': self.other_classroom.id,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_create_teacher(self):
        self.authenticate(self.teacher)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Novo Professor',
                'email': 'novo.professor@example.com',
                'password': 'Senha123!',
                'role': 'TEACHER',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_create_users(self):
        self.authenticate(self.student)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Novo Aluno',
                'email': 'novo.aluno@example.com',
                'password': 'Senha123!',
                'role': 'STUDENT',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_email_is_rejected(self):
        self.authenticate(self.admin)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Professor Duplicado',
                'email': 'teacher_test@example.com',
                'password': 'Senha123!',
                'role': 'TEACHER',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_role_is_rejected(self):
        self.authenticate(self.admin)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Usuário Inválido',
                'email': 'invalido@example.com',
                'password': 'Senha123!',
                'role': 'MANAGER',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_weak_password_is_rejected(self):
        self.authenticate(self.admin)
        response = self.client.post(
            '/api/users/',
            {
                'name': 'Professor Fraco',
                'email': 'fraco@example.com',
                'password': '123',
                'role': 'TEACHER',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_created_student_can_login(self):
        self.authenticate(self.teacher)
        create_response = self.client.post(
            '/api/users/',
            {
                'name': 'Aluno Login',
                'email': 'aluno.login@example.com',
                'password': 'Senha123!',
                'role': 'STUDENT',
                'classroom_id': self.classroom.id,
            },
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        self.client.credentials()
        login_response = self.client.post(
            '/api/users/login/',
            {'email': 'aluno.login@example.com', 'password': 'Senha123!'},
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data['user']['role'], 'STUDENT')

