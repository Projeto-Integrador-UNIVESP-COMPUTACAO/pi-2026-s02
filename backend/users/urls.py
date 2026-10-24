from django.urls import path
from .views import login, me

urlpatterns = [
    path("login/", login, name="login"),
    path("me/", me, name="me"),
]
