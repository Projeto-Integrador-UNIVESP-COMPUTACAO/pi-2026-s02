import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { SessionService } from '../../core/session.service';
import { levelInfo } from '../../core/gamification';
import { formatDate } from '../../core/format';
import { BadgeCard } from '../../shared/badge-card';
import { Icon } from '../../shared/icon';
import { ProgressBar } from '../../shared/progress-bar';
import { StarRating } from '../../shared/star-rating';

@Component({
  selector: 'app-wallet-page',
  imports: [RouterLink, BadgeCard, Icon, ProgressBar, StarRating],
  templateUrl: './wallet.page.html',
  styleUrl: './wallet.page.css',
})
export class WalletPage {
  private readonly data = inject(DataService);
  private readonly sessions = inject(SessionService);

  protected readonly student = computed(() =>
    this.data.studentById(this.sessions.session()?.studentId),
  );
  protected readonly xp = computed(() => this.data.xpFor(this.student()?.id));
  protected readonly level = computed(() => levelInfo(this.xp()));
  protected readonly completed = computed(() =>
    this.data.completedCount(this.student()?.id),
  );

  protected readonly badgeItems = computed(() => {
    const earned = new Set(
      this.data.badgesFor(this.student()?.id).map((badge) => badge.id),
    );
    return this.data.badges.map((badge) => ({
      badge,
      earned: earned.has(badge.id),
    }));
  });

  protected readonly earnedBadges = computed(
    () => this.badgeItems().filter((item) => item.earned).length,
  );

  protected readonly statement = computed(() => {
    const studentId = this.student()?.id;
    if (!studentId) return [];

    return this.data
      .progressFor(studentId)
      .map((record) => {
        const activity = this.data.activityById(record.activityId);
        return {
          record,
          activity,
          coins: record.coinsAwarded ? (activity?.rewardCoins ?? 0) : 0,
          xp: record.passed ? record.bestScore : 0,
        };
      })
      .filter((entry) => Boolean(entry.activity))
      .sort((a, b) => b.record.lastAt.localeCompare(a.record.lastAt));
  });

  protected formatDate = formatDate;
}
