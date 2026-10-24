from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from classrooms.models import Classroom
from users.models import User


def classroom_payload(classroom):
    return {
        "id": classroom.id,
        "name": classroom.name,
        "grade": classroom.grade,
        "school": classroom.school,
        "teacher_id": classroom.teacher_id,
    }


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
        "coins",
    )

    return Response(list(students))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_classes(request):
    if request.user.role == User.Role.TEACHER:
        classes = Classroom.objects.filter(teacher=request.user)
    else:
        classes = Classroom.objects.filter(id=request.user.classroom_id)

    return Response([classroom_payload(c) for c in classes])
