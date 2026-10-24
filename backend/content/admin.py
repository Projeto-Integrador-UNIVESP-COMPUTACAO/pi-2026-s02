from django.contrib import admin
from .models import Skill, Activity, Question


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'grade')


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('external_id', 'title', 'kind', 'grade_label', 'difficulty')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('external_id', 'activity', 'kind', 'order')
    list_filter = ('activity',)
