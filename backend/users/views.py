from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

User = get_user_model()


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"detail": "E-mail e senha são obrigatórios."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email__iexact=email).first()

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
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "classroom_id": user.classroom_id,
        },
    })
