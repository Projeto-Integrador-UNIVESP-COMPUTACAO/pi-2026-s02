import { Component, computed, inject } from '@angular/core';
import { activityStats } from '../../core/analytics';
import { DataService } from '../../core/data.service';
import { TeacherContextService } from '../../core/teacher-context.service';
import { ToastService } from '../../core/toast.service';
import { downloadCsv, slugify } from '../../core/csv';
import { Icon } from '../../shared/icon';
import { ProgressBar } from '../../shared/progress-bar';

@Component({
  selector: 'app-teacher-missions',
  imports: [Icon, ProgressBar],
  templateUrl: './missions.page.html',
  styleUrl: './missions.page.css',
})
export class TeacherMissionsPage {
  private readonly data = inject(DataService);
  private readonly toasts = inject(ToastService);
  protected readonly context = inject(TeacherContextService);

  protected readonly students = computed(() =>
    this.data.studentsInClass(this.context.currentClassId()),
  );

  protected readonly missionStats = computed(() =>
    activityStats(
      this.students(),
      this.data.progress(),
      [...this.data.activities],
    ),
  );

  protected readonly totalQuestions = computed(() =>
    this.missionStats().reduce(
      (total, stat) => total + stat.activity.questions.length,
      0,
    ),
  );

  protected difficultyLabel(difficulty: 1 | 2 | 3): string {
    return difficulty === 1 ? 'Fácil' : difficulty === 2 ? 'Média' : 'Desafio';
  }

  protected exportCatalog(): void {
    const group = this.context.currentClass();
    const rows = [
      [
        'Missão',
        'Habilidades BNCC',
        'Ano',
        'Dificuldade',
        'Questões',
        'Recompensa (moedas)',
        'Média da turma (%)',
        'Concluíram',
      ],
      ...this.missionStats().map((stat) => [
        stat.activity.title,
        stat.activity.skills.join(', '),
        stat.activity.gradeLabel,
        this.difficultyLabel(stat.activity.difficulty),
        stat.activity.questions.length,
        stat.activity.rewardCoins,
        stat.averageScore,
        `${stat.completedStudents}/${this.students().length}`,
      ]),
    ];

    downloadCsv(`catalogo-missoes-${slugify(group?.name ?? 'educa')}.csv`, rows);
    this.toasts.show('Catálogo de missões exportado em CSV.', 'success');
  }
}
