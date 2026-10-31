from django.urls import path

from .views import create_user, login, me

urlpatterns = [
    path("", create_user, name="user-create"),
    path("login/", login, name="login"),
    path("me/", me, name="me"),
]
