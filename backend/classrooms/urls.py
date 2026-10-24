from django.urls import path
from classrooms.views import classroom_students

urlpatterns = [
    path(
        "<int:classroom_id>/students/",
        classroom_students,
        name="classroom-students",
    ),
]
