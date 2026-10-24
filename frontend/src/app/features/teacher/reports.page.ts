import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  activityStats,
  classMetrics,
  lastActivityAt,
  skillStats,
  supportStudents as computeSupportStudents,
} from '../../core/analytics';
import { DataService } from '../../core/data.service';
import { TeacherContextService } from '../../core/teacher-context.service';
import { ToastService } from '../../core/toast.service';
import { downloadCsv, slugify } from '../../core/csv';
import { formatDate } from '../../core/format';
import { Avatar } from '../../shared/avatar';
import { Icon } from '../../shared/icon';
import { ProgressBar } from '../../shared/progress-bar';

@Component({
  selector: 'app-teacher-reports',
  imports: [RouterLink, Avatar, Icon, ProgressBar],
  templateUrl: './reports.page.html',
  styleUrl: './reports.page.css',
})
export class TeacherReportsPage {
  private readonly data = inject(DataService);
  private readonly toasts = inject(ToastService);
  protected readonly context = inject(TeacherContextService);

  protected readonly totalMissions = computed(() => this.data.activities.length);

  protected readonly students = computed(() =>
    this.data.studentsInClass(this.context.currentClassId()),
  );

  protected readonly metrics = computed(() =>
    classMetrics(
      this.students(),
      this.data.progress(),
      [...this.data.activities],
    ),
  );

  protected readonly missionStats = computed(() =>
    activityStats(
      this.students(),
      this.data.progress(),
      [...this.data.activities],
    ),
  );

  protected readonly skills = computed(() =>
    skillStats(
      this.students(),
      this.data.progress(),
      [...this.data.activities],
    ),
  );

  protected readonly supportStudents = computed(() =>
    computeSupportStudents(this.students(), this.data.progress()),
  );

  protected readonly hardest = computed(() => {
    const withAttempts = this.missionStats().filter(
      (stat) => stat.completedStudents > 0,
    );
    return [...withAttempts].sort((a, b) => a.averageScore - b.averageScore)[0];
  });

  protected readonly best = computed(() => {
    const withAttempts = this.missionStats().filter(
      (stat) => stat.completedStudents > 0,
    );
    return [...withAttempts].sort((a, b) => b.averageScore - a.averageScore)[0];
  });

  protected formatDate = formatDate;

  protected lastAccess(studentId: string): string {
    const lastAt = lastActivityAt(studentId, this.data.progress());
    return lastAt ? formatDate(lastAt) : '—';
  }

  protected print(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  protected exportCsv(): void {
    const group = this.context.currentClass();
    const rows = [
      [
        'Missão',
        'Habilidades BNCC',
        'Média (%)',
        'Alunos que concluíram',
        'Tentativas',
        'Média de erros por tentativa',
      ],
      ...this.missionStats().map((stat) => [
        stat.activity.title,
        stat.activity.skills.join(', '),
        stat.averageScore,
        `${stat.completedStudents}/${this.students().length}`,
        stat.attempts,
        stat.averageErrors,
      ]),
    ];

    downloadCsv(`relatorio-${slugify(group?.name ?? 'turma')}.csv`, rows);
    this.toasts.show('Relatório por missão exportado em CSV.', 'success');
  }
}
