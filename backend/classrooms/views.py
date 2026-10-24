from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from classrooms.models import Classroom
from users.models import User

from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def classroom_students(request, classroom_id):
    try:
        classroom = Classroom.objects.get(id=classroom_id)
    except Classroom.DoesNotExist:
        return Response(
            {"detail": "Turma não encontrada."},
            status=status.HTTP_404_NOT_FOUND,
        )

    students = User.objects.filter(
        classroom=classroom,
        role=User.Role.STUDENT,
    ).values(
        "id",
        "name",
        "email",
    )

    return Response(list(students))
