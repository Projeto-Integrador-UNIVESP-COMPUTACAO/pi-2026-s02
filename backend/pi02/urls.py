from django.contrib import admin
from django.urls import include, path

from pi02.views import health, readiness

urlpatterns = [
    path('admin/', admin.site.urls),

    # Health checks. As versões com e sem barra evitam redirecionamentos 301,
    # que alguns monitores e plataformas de deploy não seguem.
    path('', health, name='health-root'),
    path('health', health, name='health'),
    path('health/', health, name='health-slash'),
    path('healthz', health, name='healthz'),
    path('health/ready', readiness, name='health-ready'),
    path('health/ready/', readiness, name='health-ready-slash'),
    path('api/health', health, name='api-health'),
    path('api/health/', health, name='api-health-slash'),
    path('api/health/ready', readiness, name='api-health-ready'),
    path('api/health/ready/', readiness, name='api-health-ready-slash'),

    path("api/users/", include("users.urls")),
    path("api/classrooms/", include("classrooms.urls")),
    path("api/content/", include("content.urls")),
    path("api/quizzes/", include("quizzes.urls")),
    path("api/progress/", include("progress.urls")),
]
