import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DataService } from '../../core/data.service';
import { SessionService } from '../../core/session.service';
import { levelInfo } from '../../core/gamification';
import { averageFor, completedFor, xpFor } from '../../core/analytics';
import { formatDate } from '../../core/format';
import { downloadCsv, slugify } from '../../core/csv';
import { ToastService } from '../../core/toast.service';
import { BadgeCard } from '../../shared/badge-card';
import { Avatar } from '../../shared/avatar';
import { Icon } from '../../shared/icon';
import { StarRating } from '../../shared/star-rating';
import type { Activity, ProgressRecord } from '../../core/models';

interface MissionRow {
  activity: Activity;
  record?: ProgressRecord;
  status: 'done' | 'progress' | 'new';
  statusLabel: string;
}

interface HistoryRow {
  at: string;
  activityTitle: string;
  score: number;
  errors: number;
  passed: boolean;
}

@Component({
  selector: 'app-teacher-student-detail',
  imports: [RouterLink, Avatar, BadgeCard, Icon, StarRating],
  templateUrl: './student-detail.page.html',
  styleUrl: './student-detail.page.css',
})
export class TeacherStudentDetailPage implements OnInit {
  private readonly data = inject(DataService);
  private readonly sessions = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toasts = inject(ToastService);

  private readonly studentId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly student = computed(() =>
    this.data.studentById(this.studentId),
  );
  protected readonly classInfo = computed(() =>
    this.data.classById(this.student()?.classId),
  );
  protected readonly progress = computed(() =>
    this.data.progressFor(this.studentId),
  );
  protected readonly xp = computed(() => xpFor(this.studentId, this.progress()));
  protected readonly level = computed(() => levelInfo(this.xp()));
  protected readonly completed = computed(() =>
    completedFor(this.studentId, this.progress()),
  );
  protected readonly average = computed(() =>
    averageFor(this.studentId, this.progress()),
  );
  protected readonly rank = computed(() => {
    const classId = this.student()?.classId;
    if (!classId) return null;
    return (
      this.data
        .rankingForClass(classId)
        .find((entry) => entry.student.id === this.studentId) ?? null
    );
  });

  protected readonly missionRows = computed<MissionRow[]>(() =>
    this.data.activities.map((activity) => {
      const record = this.data.recordFor(this.studentId, activity.id);
      const status = record?.passed
        ? 'done'
        : record?.attempts
          ? 'progress'
          : 'new';
      return {
        activity,
        record,
        status,
        statusLabel:
          status === 'done'
            ? 'Concluída'
            : status === 'progress'
              ? 'Em andamento'
              : 'Não iniciada',
      };
    }),
  );

  protected readonly history = computed<HistoryRow[]>(() => {
    const rows: HistoryRow[] = [];
    for (const record of this.progress()) {
      const activity = this.data.activityById(record.activityId);
      for (const entry of record.history) {
        rows.push({
          at: entry.at,
          activityTitle: activity?.title ?? record.activityId,
          score: entry.score,
          errors: entry.errors,
          passed: entry.passed,
        });
      }
    }
    return rows.sort((a, b) => b.at.localeCompare(a.at));
  });

  protected readonly badgeItems = computed(() => {
    const earned = new Set(
      this.data.badgesFor(this.studentId).map((badge) => badge.id),
    );
    return this.data.badges.map((badge) => ({
      badge,
      earned: earned.has(badge.id),
    }));
  });

  protected readonly earnedBadges = computed(
    () => this.badgeItems().filter((item) => item.earned).length,
  );

  protected readonly totalMissions = computed(
    () => this.data.activities.length,
  );

  protected formatDate = formatDate;

  ngOnInit(): void {
    const teacherId = this.sessions.session()?.teacherId;
    const allowed = this.data
      .classesForTeacher(teacherId)
      .some((group) => group.id === this.student()?.classId);

    if (!this.student() || !allowed) {
      this.router.navigateByUrl('/professor/turmas');
    }
  }

  protected exportCsv(): void {
    const student = this.student();
    if (!student) return;

    const rows = [
      ['Aluno', student.name],
      ['Turma', this.classInfo()?.name ?? ''],
      ['Nível', this.level().level],
      ['XP', this.xp()],
      ['Moedas', student.coins],
      [],
      ['Missão', 'Situação', 'Melhor resultado (%)', 'Tentativas', 'Erros acumulados', 'Último acesso'],
      ...this.missionRows().map((row) => [
        row.activity.title,
        row.statusLabel,
        row.record?.bestScore ?? '',
        row.record?.attempts ?? 0,
        row.record?.errors ?? 0,
        row.record?.lastAt ? this.formatDate(row.record.lastAt) : '—',
      ]),
      [],
      ['Histórico', 'Missão', 'Resultado (%)', 'Erros', 'Situação'],
      ...this.history().map((entry) => [
        this.formatDate(entry.at),
        entry.activityTitle,
        entry.score,
        entry.errors,
        entry.passed ? 'Concluída' : 'Tentativa',
      ]),
    ];

    downloadCsv(`ficha-${slugify(student.name)}.csv`, rows);
    this.toasts.show(`Ficha de ${student.name} exportada em CSV.`, 'success');
  }
}

