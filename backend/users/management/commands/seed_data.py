import os

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from users.models import User
from classrooms.models import Classroom


class Command(BaseCommand):
    help = "Cria dados fictícios para desenvolvimento"

    @transaction.atomic
    def handle(self, *args, **options):
        # Administrador (criado apenas por seed, nunca pela API)
        admin_email = (os.getenv("DJANGO_ADMIN_EMAIL") or "admin@example.com").strip().lower()
        admin_password = os.getenv("DJANGO_ADMIN_PASSWORD") or "Senha123!"

        admin, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": admin_email,
                "name": "Administrador",
                "role": User.Role.ADMIN,
                "is_active": True,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        conflict = User.objects.filter(email__iexact=admin_email).exclude(pk=admin.pk).first()
        if conflict:
            raise CommandError(
                f"O e-mail {admin_email} já pertence a outro usuário ({conflict.username})."
            )
        admin.email = admin_email
        admin.name = admin.name or "Administrador"
        admin.role = User.Role.ADMIN
        admin.is_active = True
        admin.is_staff = True
        admin.is_superuser = True
        admin.set_password(admin_password)
        admin.save()

        # Professor
        teacher, _ = User.objects.get_or_create(
            email="professor@example.com",
            defaults={
                "username": "professor_mock",
                "name": "José Guilherme",
                "role": User.Role.TEACHER,
                "is_active": True,
                "is_staff": False,
            },
        )

        teacher.is_staff = False
        teacher.is_superuser = False
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
