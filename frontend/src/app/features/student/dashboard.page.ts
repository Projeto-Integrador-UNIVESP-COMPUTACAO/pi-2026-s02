import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { SessionService } from '../../core/session.service';
import { levelInfo } from '../../core/gamification';
import { firstName } from '../../core/format';
import { SKILLS } from '../../core/seed';
import { Avatar } from '../../shared/avatar';
import { BadgeCard } from '../../shared/badge-card';
import { Icon } from '../../shared/icon';
import { MissionCard } from '../../shared/mission-card';
import { ProgressBar } from '../../shared/progress-bar';
import { StarRating } from '../../shared/star-rating';

@Component({
  selector: 'app-student-dashboard',
  imports: [
    RouterLink,
    Avatar,
    BadgeCard,
    Icon,
    MissionCard,
    ProgressBar,
    StarRating,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class StudentDashboardPage {
  private readonly data = inject(DataService);
  private readonly sessions = inject(SessionService);

  protected readonly student = computed(() =>
    this.data.studentById(this.sessions.session()?.studentId),
  );

  protected readonly classInfo = computed(() =>
    this.data.classById(this.student()?.classId),
  );

  protected readonly missions = computed(() =>
    this.data.missionsFor(this.student()?.id ?? ''),
  );

  protected readonly xp = computed(() => this.data.xpFor(this.student()?.id));
  protected readonly level = computed(() => levelInfo(this.xp()));
  protected readonly average = computed(() =>
    this.data.averageScore(this.student()?.id),
  );
  protected readonly completed = computed(
    () => this.missions().filter((mission) => mission.status === 'done').length,
  );

  protected readonly ranking = computed(() =>
    this.data.rankingForClass(this.student()?.classId ?? ''),
  );

  protected readonly myPosition = computed(
    () =>
      this.ranking().find((entry) => entry.student.id === this.student()?.id)
        ?.position ?? 0,
  );

  protected readonly topRanking = computed(() => this.ranking().slice(0, 4));

  protected readonly featured = computed(() => {
    const missions = this.missions();
    return (
      missions.find((mission) => mission.status !== 'done') ?? missions[0]
    );
  });

  protected readonly badgeItems = computed(() => {
    const earned = new Set(
      this.data.badgesFor(this.student()?.id).map((badge) => badge.id),
    );
    return this.data.badges.slice(0, 4).map((badge) => ({
      badge,
      earned: earned.has(badge.id),
    }));
  });

  protected readonly earnedBadges = computed(
    () => this.badgeItems().filter((item) => item.earned).length,
  );

  protected readonly firstName = computed(() =>
    firstName(this.student()?.name ?? 'Aluno'),
  );

  protected skillTitle(code: keyof typeof SKILLS): string {
    return SKILLS[code]?.title ?? code;
  }

  protected readonly skillSummary = computed(() => {
    const missions = this.missions();
    return Object.values(SKILLS).map((skill) => {
      const related = missions.filter((mission) =>
        mission.activity.skills.includes(skill.code),
      );
      const done = related.filter((mission) => mission.status === 'done').length;
      return {
        skill,
        done,
        total: related.length,
        pct: related.length ? Math.round((done / related.length) * 100) : 0,
      };
    });
  });
}
