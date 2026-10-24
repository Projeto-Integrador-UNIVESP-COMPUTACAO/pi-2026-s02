from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

User = get_user_model()


def user_payload(user):
    classroom = user.classroom
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "classroom_id": user.classroom_id,
        "coins": user.coins,
        "joined_at": user.date_joined.date().isoformat(),
        "classroom": (
            {
                "id": classroom.id,
                "name": classroom.name,
                "grade": classroom.grade,
                "school": classroom.school,
                "teacher_id": classroom.teacher_id,
            }
            if classroom
            else None
        ),
    }


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email") or request.data.get("identifier")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"detail": "E-mail e senha são obrigatórios."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(
        Q(email__iexact=email) | Q(username__iexact=email)
    ).first()

    if user is None or not user.check_password(password):
        return Response(
            {"detail": "E-mail ou senha inválidos."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"detail": "Usuário desativado."},
            status=status.HTTP_403_FORBIDDEN,
        )

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "user": user_payload(user),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(user_payload(request.user))
