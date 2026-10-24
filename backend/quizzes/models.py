from django.db import models


class QuestionOption(models.Model):
    question = models.ForeignKey('content.Question', on_delete=models.CASCADE, related_name='options')
    external_id = models.CharField(max_length=50)
    label = models.CharField(max_length=200)
    detail = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.external_id
