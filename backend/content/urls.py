from django.urls import path
from .views import activity_list, activity_detail

urlpatterns = [
    path('activities/', activity_list, name='activity-list'),
    path('activities/<str:activity_id>/', activity_detail, name='activity-detail'),
]
