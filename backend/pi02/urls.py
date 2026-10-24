from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/classrooms/", include("classrooms.urls")),
    path("api/content/", include("content.urls")),
    path("api/quizzes/", include("quizzes.urls")),
    path("api/progress/", include("progress.urls")),
]
