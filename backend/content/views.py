from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Activity


def question_payload(question):
    options = [
        {
            "id": option.external_id,
            "label": option.label,
            "detail": option.detail,
        }
        for option in question.options.all()
    ]
    data = {
        "id": question.external_id,
        "kind": question.kind,
        "prompt": question.prompt,
        "scenario": question.scenario,
        "table": question.table,
        "answer": (
            question.answer_numeric
            if question.answer_numeric is not None
            else question.answer_text
        ),
        "tolerance": question.tolerance,
        "unit": question.unit,
        "explanation": question.explanation,
        "hint": question.hint,
    }
    if options:
        data["options"] = options
    return data


def activity_payload(activity):
    return {
        "id": activity.external_id,
        "title": activity.title,
        "tagline": activity.tagline,
        "description": activity.description,
        "kind": activity.kind,
        "icon": activity.icon,
        "skills": list(activity.skills.values_list("code", flat=True)),
        "gradeLabel": activity.grade_label,
        "difficulty": activity.difficulty,
        "estimatedMinutes": activity.estimated_minutes,
        "rewardCoins": activity.reward_coins,
        "badgeId": activity.badge_id,
        "questions": [
            question_payload(question)
            for question in activity.questions.all().order_by("order")
        ],
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def activity_list(request):
    activities = Activity.objects.all().prefetch_related(
        "skills", "questions__options"
    ).order_by("id")
    return Response([activity_payload(activity) for activity in activities])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def activity_detail(request, activity_id):
    activity = (
        Activity.objects.prefetch_related("skills", "questions__options")
        .filter(external_id=activity_id)
        .first()
    )
    if activity is None:
        return Response(
            {"detail": "Atividade não encontrada."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(activity_payload(activity))
