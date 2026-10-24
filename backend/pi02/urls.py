from django.urls import include, path

urlpatterns = [
    path(
        path("api/users/", include("users.urls")),
        path("api/classrooms/", include("classrooms.urls")),
    ),
]
