import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  activityStats,
  averageFor,
  classMetrics,
  completedFor,
  lastActivityAt,
  xpFor,
} from '../../core/analytics';
import { DataService } from '../../core/data.service';
import { levelForXp } from '../../core/gamification';
import { formatDate } from '../../core/format';
import { downloadCsv, slugify } from '../../core/csv';
import { TeacherContextService } from '../../core/teacher-context.service';
import { ToastService } from '../../core/toast.service';
import { Avatar } from '../../shared/avatar';
import { Icon } from '../../shared/icon';
import { ProgressBar } from '../../shared/progress-bar';
import type { Student } from '../../core/models';

type StatusTone = 'star' | 'ok' | 'support' | 'done';

interface StudentRow {
  student: Student;
  level: number;
  xp: number;
  completed: number;
  average: number;
  lastAt: string | null;
  status: StatusTone;
  statusLabel: string;
}

@Component({
  selector: 'app-teacher-classes',
  imports: [RouterLink, Avatar, Icon, ProgressBar],
  templateUrl: './classes.page.html',
  styleUrl: './classes.page.css',
})
export class TeacherClassesPage {
  private readonly data = inject(DataService);
  private readonly toasts = inject(ToastService);
  protected readonly context = inject(TeacherContextService);

  protected readonly query = signal('');

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

  protected readonly rows = computed<StudentRow[]>(() => {
    const progress = this.data.progress();
    const totalMissions = this.data.activities.length;

    return this.students().map((student) => {
      const completed = completedFor(student.id, progress);
      const average = averageFor(student.id, progress);
      const xp = xpFor(student.id, progress);
      const level = levelForXp(xp);

      let status: StatusTone = 'ok';
      let statusLabel = 'Em dia';

      if (completed === totalMissions) {
        status = 'done';
        statusLabel = 'Concluiu tudo';
      } else if (completed === 0 || average < 60) {
        status = 'support';
        statusLabel = 'Precisa de apoio';
      } else if (average >= 85) {
        status = 'star';
        statusLabel = 'Destaque';
      }

      return {
        student,
        level,
        xp,
        completed,
        average,
        lastAt: lastActivityAt(student.id, progress),
        status,
        statusLabel,
      };
    });
  });

  protected readonly filteredRows = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) return this.rows();
    return this.rows().filter((row) =>
      row.student.name.toLowerCase().includes(query),
    );
  });

  protected readonly totalMissions = computed(
    () => this.data.activities.length,
  );

  protected readonly supportCount = computed(
    () => this.rows().filter((row) => row.status === 'support').length,
  );

  protected readonly classStats = computed(() =>
    activityStats(this.students(), this.data.progress(), [...this.data.activities]),
  );

  protected readonly topMission = computed(() => {
    const stats = this.classStats().filter((stat) => stat.completedStudents > 0);
    return [...stats].sort((a, b) => b.averageScore - a.averageScore)[0];
  });

  protected formatDate = formatDate;

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.query.set('');
  }

  protected exportCsv(): void {
    const group = this.context.currentClass();
    const rows = [
      [
        'Aluno',
        'Nível',
        'XP',
        'Moedas',
        'Missões concluídas',
        'Média (%)',
        'Último acesso',
        'Situação',
      ],
      ...this.rows().map((row) => [
        row.student.name,
        row.level,
        row.xp,
        row.student.coins,
        `${row.completed}/${this.totalMissions()}`,
        row.average,
        row.lastAt ? this.formatDate(row.lastAt) : '—',
        row.statusLabel,
      ]),
    ];

    downloadCsv(`turma-${slugify(group?.name ?? 'educa')}.csv`, rows);
    this.toasts.show('Relatório da turma exportado em CSV.', 'success');
  }
}
