from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from classrooms.models import Classroom

User = get_user_model()


class ClassroomTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='prof2',
            email='prof2@example.com',
            password='Senha123!',
            role=User.Role.TEACHER,
            name='Professor Dois',
        )
        self.classroom = Classroom.objects.create(name='Turma Teste', teacher=self.teacher)
        self.student = User.objects.create_user(
            username='aluno2',
            email='aluno2@example.com',
            password='Senha123!',
            role=User.Role.STUDENT,
            name='Aluno Dois',
            classroom=self.classroom,
        )
        self.token = Token.objects.create(user=self.teacher)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_list_classroom_students(self):
        response = self.client.get(f'/api/classrooms/{self.classroom.id}/students/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Aluno Dois')

    def test_teacher_classes(self):
        response = self.client.get('/api/classrooms/mine/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Turma Teste')
