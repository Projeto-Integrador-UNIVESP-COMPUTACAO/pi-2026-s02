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
                "name": "José Guilherme",
                "role": User.Role.TEACHER,
                "is_active": True,
                "is_staff": True,
            },
        )

        teacher.set_password("Senha123!")
        teacher.save()

        # Turmas
        classroom_a, _ = Classroom.objects.get_or_create(
            name="5º ano A",
            teacher=teacher,
            defaults={
                "grade": "5º ano",
                "school": "Colégio Extrativa",
            },
        )
        classroom_a.grade = "5º ano"
        classroom_a.school = "Colégio Extrativa"
        classroom_a.save(update_fields=["grade", "school"])

        classroom_b, _ = Classroom.objects.get_or_create(
            name="7º ano B",
            teacher=teacher,
            defaults={
                "grade": "7º ano",
                "school": "Colégio Extrativa",
            },
        )
        classroom_b.grade = "7º ano"
        classroom_b.school = "Colégio Extrativa"
        classroom_b.save(update_fields=["grade", "school"])

        # Alunos
        students = [
            ("ana@example.com", "345G7B", "Ana B.", classroom_a),
            ("pedro@example.com", "pedro_mock", "Pedro H.", classroom_b),
            ("maria@example.com", "maria_mock", "Maria Oliveira", classroom_a),
            ("lucas@example.com", "lucas_mock", "Lucas S.", classroom_a),
            ("valentina@example.com", "valentina_mock", "Valentina R.", classroom_a),
            ("theo@example.com", "theo_mock", "Theo V.", classroom_b),
            ("manuela@example.com", "manuela_mock", "Manuela C.", classroom_b),
        ]

        for email, username, name, classroom in students:
            student, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": username,
                    "name": name,
                    "role": User.Role.STUDENT,
                    "is_active": True,
                    "coins": 100,
                },
            )

            student.classroom = classroom
            student.set_password("Senha123!")
            if student.coins == 0:
                student.coins = 100
            student.save()

        self.stdout.write(
            self.style.SUCCESS(
                "Dados mockados criados com sucesso!"
            )
        )
