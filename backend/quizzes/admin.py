from django.contrib import admin
from .models import QuestionOption


@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ('external_id', 'question')
    list_filter = ('question',)
