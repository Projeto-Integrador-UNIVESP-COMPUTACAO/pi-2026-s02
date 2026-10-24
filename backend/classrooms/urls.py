from django.urls import path
from classrooms.views import classroom_students, teacher_classes

urlpatterns = [
    path(
        "<int:classroom_id>/students/",
        classroom_students,
        name="classroom-students",
    ),
    path(
        "mine/",
        teacher_classes,
        name="teacher-classes",
    ),
]
