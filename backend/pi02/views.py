"""Endpoints de infraestrutura (health checks)."""

import logging

from django.db import connection
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def database_is_available() -> bool:
    """Executa um `SELECT 1` para verificar se o PostgreSQL responde."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return True
    except Exception as exc:  # noqa: BLE001 - qualquer falha de conexão conta como indisponível
        logger.warning("Health check: banco de dados indisponível (%s).", exc)
        return False


@api_view(["GET", "HEAD"])
@authentication_classes([])
@permission_classes([AllowAny])
def health(request):
    """
    Liveness probe.

    Responde 200 enquanto o processo Django estiver de pé. O estado do banco é
    informativo, para que um monitor não derrube a aplicação por causa de uma
    indisponibilidade momentânea do PostgreSQL.
    """
    database_ok = database_is_available()
    return Response(
        {
            "status": "ok",
            "service": "pi02-api",
            "database": "ok" if database_ok else "error",
            "timestamp": timezone.now().isoformat(),
        }
    )


@api_view(["GET", "HEAD"])
@authentication_classes([])
@permission_classes([AllowAny])
def readiness(request):
    """
    Readiness probe.

    Responde 200 somente quando o banco está acessível; caso contrário, 503.
    """
    if not database_is_available():
        return Response(
            {
                "status": "unavailable",
                "service": "pi02-api",
                "database": "error",
                "timestamp": timezone.now().isoformat(),
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {
            "status": "ok",
            "service": "pi02-api",
            "database": "ok",
            "timestamp": timezone.now().isoformat(),
        }
    )
