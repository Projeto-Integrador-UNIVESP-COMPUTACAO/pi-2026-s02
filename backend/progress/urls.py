from django.urls import path
from .views import classroom_progress, my_progress, record_attempt

urlpatterns = [
    path('me/', my_progress, name='my-progress'),
    path('attempt/', record_attempt, name='record-attempt'),
    path('classroom/<int:classroom_id>/', classroom_progress, name='classroom-progress'),
]
