
from django.core.management.base import BaseCommand
from django.db import transaction

from users.models import User
from classrooms.models import Classroom


class Command(BaseCommand):
    help = "Cria dados fictícios para desenvolvimento"

    @transaction.atomic
    def handle(self, *args, **options):
        # Professor
        teacher, _ = User.objects.get_or_create(
            email="professor@example.com",
            defaults={
                "username": "professor_mock",
                "name": "Carlos Silva",
                "role": User.Role.TEACHER,
                "is_active": True,
            },
        )

        teacher.set_password("Senha123!")
        teacher.save()

        # Turmas
        classroom_a, _ = Classroom.objects.get_or_create(
            name="Turma A",
            teacher=teacher,
        )

        classroom_b, _ = Classroom.objects.get_or_create(
            name="Turma B",
            teacher=teacher,
        )

        # Alunos
        students = [
            ("ana@example.com", "ana_mock", "Ana Souza", classroom_a),
            ("pedro@example.com", "pedro_mock", "Pedro Santos", classroom_b),
            ("maria@example.com", "maria_mock", "Maria Oliveira", classroom_a),
        ]

        for email, username, name, classroom in students:
            student, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": username,
                    "name": name,
                    "role": User.Role.STUDENT,
                    "is_active": True,
                },
            )

            student.classroom = classroom
            student.set_password("Senha123!")
            student.save()

        self.stdout.write(
            self.style.SUCCESS(
                "Dados mockados criados com sucesso!"
            )
        )
