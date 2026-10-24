from django.contrib import admin
from .models import Attempt, ProgressRecord


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'activity', 'score', 'passed', 'created_at')


@admin.register(ProgressRecord)
class ProgressRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'activity', 'best_score', 'passed', 'coins_awarded', 'last_at')
