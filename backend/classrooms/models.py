from django.conf import settings
from django.db import models


class Classroom(models.Model):
    name = models.CharField(max_length=150)
    grade = models.CharField(max_length=30, blank=True)
    school = models.CharField(max_length=150, blank=True)

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="teaching_classrooms",
        limit_choices_to={"role": "TEACHER"},
    )

    def __str__(self):
        return self.name