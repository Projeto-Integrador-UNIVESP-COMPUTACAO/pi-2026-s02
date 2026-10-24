from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from classrooms.models import Classroom
from content.models import Activity
from progress.models import Attempt, ProgressRecord

User = get_user_model()
HISTORY_LIMIT = 20


def record_payload(record):
    attempts = record.student.attempts.filter(activity=record.activity).order_by("-created_at")[:HISTORY_LIMIT]
    history = [
        {
            "at": attempt.created_at.isoformat(),
            "score": attempt.score,
            "errors": attempt.errors,
            "passed": attempt.passed,
        }
        for attempt in reversed(attempts)
    ]
    return {
        "studentId": str(record.student_id),
        "activityId": record.activity.external_id,
        "bestScore": record.best_score,
        "attempts": record.attempts,
        "errors": record.errors,
        "passed": record.passed,
        "coinsAwarded": record.coins_awarded,
        "lastAt": record.last_at.isoformat(),
        "history": history,
    }


def student_payload(student):
    return {
        "id": str(student.id),
        "name": student.name,
        "classId": str(student.classroom_id) if student.classroom_id else "",
        "coins": student.coins,
        "joinedAt": student.date_joined.date().isoformat(),
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_progress(request):
    records = ProgressRecord.objects.filter(student=request.user).select_related(
        "activity", "student"
    )
    return Response([record_payload(record) for record in records])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def classroom_progress(request, classroom_id):
    classroom = get_object_or_404(Classroom, id=classroom_id)

    if request.user.role == User.Role.TEACHER:
        if classroom.teacher_id != request.user.id:
            return Response(
                {"detail": "Você não tem acesso a esta turma."},
                status=status.HTTP_403_FORBIDDEN,
            )
    elif request.user.classroom_id != classroom.id:
        return Response(
            {"detail": "Você não tem acesso a esta turma."},
            status=status.HTTP_403_FORBIDDEN,
        )

    students = User.objects.filter(
        classroom=classroom, role=User.Role.STUDENT
    ).order_by("name")
    records = (
        ProgressRecord.objects.filter(student__in=students)
        .select_related("activity", "student")
        .order_by("student__name", "activity__external_id")
    )

    return Response({
        "classroom": {
            "id": classroom.id,
            "name": classroom.name,
            "grade": classroom.grade,
            "school": classroom.school,
            "teacher_id": classroom.teacher_id,
        },
        "students": [student_payload(student) for student in students],
        "progress": [record_payload(record) for record in records],
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def record_attempt(request):
    activity_id = request.data.get("activityId")
    try:
        score = max(0, min(100, int(request.data.get("score", 0))))
        errors = max(0, int(request.data.get("errors", 0)))
    except (TypeError, ValueError):
        return Response(
            {"detail": "Pontuação inválida."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    passed = bool(request.data.get("passed", False)) and score >= 60

    try:
        activity = Activity.objects.get(external_id=activity_id)
    except Activity.DoesNotExist:
        return Response(
            {"detail": "Atividade não encontrada."},
            status=status.HTTP_404_NOT_FOUND,
        )

    Attempt.objects.create(
        student=request.user,
        activity=activity,
        score=score,
        errors=errors,
        passed=passed,
    )

    record, _ = ProgressRecord.objects.get_or_create(
        student=request.user, activity=activity
    )
    record.best_score = max(record.best_score, score)
    record.attempts += 1
    record.errors += errors
    record.passed = record.passed or passed

    coins_gain = 0
    if passed and not record.coins_awarded:
        record.coins_awarded = True
        coins_gain = activity.reward_coins
        request.user.coins += coins_gain
        request.user.save(update_fields=["coins"])

    record.last_at = timezone.now()
    record.save()

    return Response({
        **record_payload(record),
        "score": score,
        "coinsGain": coins_gain,
        "coins": request.user.coins,
    })
