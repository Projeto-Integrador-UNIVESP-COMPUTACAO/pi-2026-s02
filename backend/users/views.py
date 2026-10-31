import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
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

from classrooms.models import Classroom

User = get_user_model()


def user_payload(user):
    classroom = user.classroom
    return {
        "id": user.id,
        "username": user.username,
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


def _generate_username(email: str) -> str:
    """Gera um username único a partir da parte local do e-mail."""
    local_part = email.split("@", 1)[0]
    base = re.sub(r"[^\w.@+-]", "", local_part)[:140] or "user"
    candidate = base
    suffix = 1

    while User.objects.filter(username__iexact=candidate).exists():
        suffix += 1
        candidate = f"{base}{suffix}"[:150]

    return candidate


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_user(request):
    """
    Cria professores e alunos conforme o papel do usuário autenticado.

    - ADMIN cria apenas TEACHER.
    - TEACHER cria apenas STUDENT, opcionalmente vinculado a uma de suas turmas.
    - ADMIN não é criável pela API: apenas pelo comando `seed_data`.
    """
    data = request.data
    requested_role = str(data.get("role", "")).strip().upper()

    if requested_role not in {User.Role.ADMIN, User.Role.TEACHER, User.Role.STUDENT}:
        return Response(
            {"detail": "Papel inválido. Use TEACHER ou STUDENT."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if requested_role == User.Role.ADMIN:
        return Response(
            {"detail": "Administradores só podem ser criados pelo seed."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if requested_role == User.Role.TEACHER and request.user.role != User.Role.ADMIN:
        return Response(
            {"detail": "Apenas administradores podem criar professores."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if requested_role == User.Role.STUDENT and request.user.role != User.Role.TEACHER:
        return Response(
            {"detail": "Apenas professores podem criar alunos."},
            status=status.HTTP_403_FORBIDDEN,
        )

    name = data.get("name")
    email = data.get("email")
    username = data.get("username")

    name = name.strip() if isinstance(name, str) else ""
    email = email.strip().lower() if isinstance(email, str) else ""
    username = username.strip() if isinstance(username, str) else ""
    password = data.get("password")

    missing = [
        field
        for field, value in (("name", name), ("email", email), ("password", password))
        if not value
    ]
    if missing:
        return Response(
            {"detail": f"Campos obrigatórios: {', '.join(missing)}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not isinstance(password, str):
        return Response(
            {"detail": "A senha deve ser um texto."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email__iexact=email).exists():
        return Response(
            {"detail": "Já existe um usuário com este e-mail."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if username:
        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {"detail": "Nome de usuário já está em uso."},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        username = _generate_username(email)

    classroom = None
    classroom_id = data.get("classroom_id")

    if requested_role == User.Role.STUDENT and classroom_id not in (None, ""):
        try:
            classroom_id = int(classroom_id)
        except (TypeError, ValueError):
            return Response(
                {"detail": "classroom_id inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        classroom = Classroom.objects.filter(id=classroom_id).first()
        if classroom is None:
            return Response(
                {"detail": "Turma não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if classroom.teacher_id != request.user.id:
            return Response(
                {"detail": "Você só pode vincular alunos às suas próprias turmas."},
                status=status.HTTP_403_FORBIDDEN,
            )
    elif requested_role == User.Role.TEACHER and classroom_id not in (None, ""):
        return Response(
            {"detail": "Professores não são vinculados a uma turma."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User(
        username=username,
        email=email,
        name=name,
        role=requested_role,
        classroom=classroom,
        coins=100 if requested_role == User.Role.STUDENT else 0,
    )

    try:
        validate_password(password, user)
        user.full_clean(exclude=["password"])
    except ValidationError as exc:
        field_errors = getattr(exc, "message_dict", None)
        if field_errors:
            detail = "; ".join(
                f"{field}: {', '.join(values)}"
                for field, values in field_errors.items()
            )
        else:
            detail = "; ".join(exc.messages)
        return Response(
            {"detail": detail},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(password)
    user.save()

    return Response(user_payload(user), status=status.HTTP_201_CREATED)

