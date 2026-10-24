from django.db import models


class Skill(models.Model):
    code = models.CharField(max_length=10, unique=True)
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    grade = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.code


class Activity(models.Model):
    class Kind(models.TextChoices):
        CHANGE = 'change', 'Troco'
        OFFER = 'offer', 'Oferta'
        INSTALLMENT = 'installment', 'Parcelado'
        SAVINGS = 'savings', 'Poupança'
        BUDGET = 'budget', 'Orçamento'

    external_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=150)
    tagline = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    kind = models.CharField(max_length=20, choices=Kind.choices)
    icon = models.CharField(max_length=30, blank=True)
    skills = models.ManyToManyField(Skill, blank=True)
    grade_label = models.CharField(max_length=30, blank=True)
    difficulty = models.IntegerField(default=1)
    estimated_minutes = models.IntegerField(default=5)
    reward_coins = models.IntegerField(default=0)
    badge_id = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    class Kind(models.TextChoices):
        NUMERIC = 'numeric', 'Numérico'
        CHOICE = 'choice', 'Múltipla escolha'

    class Unit(models.TextChoices):
        BRL = 'brl', 'BRL'
        WEEKS = 'weeks', 'Semanas'
        PERCENT = 'percent', 'Porcentagem'
        NONE = 'none', 'Nenhum'

    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='questions')
    external_id = models.CharField(max_length=50, unique=True)
    kind = models.CharField(max_length=10, choices=Kind.choices)
    prompt = models.TextField()
    scenario = models.TextField(blank=True)
    answer_numeric = models.FloatField(null=True, blank=True)
    answer_text = models.CharField(max_length=100, blank=True)
    tolerance = models.FloatField(default=0.01)
    unit = models.CharField(max_length=10, choices=Unit.choices, default=Unit.NONE)
    explanation = models.TextField(blank=True)
    hint = models.TextField(blank=True)
    table = models.JSONField(default=list, blank=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.external_id
