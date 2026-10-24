from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        TEACHER = "TEACHER", "Professor"
        STUDENT = "STUDENT", "Aluno"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
    )
    name = models.CharField(max_length=150, unique=False, null=False, blank=False)
    email = models.EmailField(unique=True, null=False, blank=False)
    classroom = models.ForeignKey(
        "classrooms.Classroom",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
    )