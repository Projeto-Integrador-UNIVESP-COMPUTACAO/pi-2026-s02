from django.conf import settings
from django.db import models
from content.models import Activity


class Attempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attempts')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    score = models.IntegerField()
    errors = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class ProgressRecord(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_records')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    best_score = models.IntegerField(default=0)
    attempts = models.IntegerField(default=0)
    errors = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    coins_awarded = models.BooleanField(default=False)
    last_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'activity')
