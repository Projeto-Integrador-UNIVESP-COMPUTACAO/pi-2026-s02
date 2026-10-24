import { Component, computed, inject } from '@angular/core';
import { DataService } from '../../core/data.service';
import { SessionService } from '../../core/session.service';
import { Avatar } from '../../shared/avatar';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-ranking-page',
  imports: [Avatar, Icon],
  templateUrl: './ranking.page.html',
  styleUrl: './ranking.page.css',
})
export class RankingPage {
  private readonly data = inject(DataService);
  private readonly sessions = inject(SessionService);

  protected readonly student = computed(() =>
    this.data.studentById(this.sessions.session()?.studentId),
  );

  protected readonly classInfo = computed(() =>
    this.data.classById(this.student()?.classId),
  );

  protected readonly ranking = computed(() =>
    this.data.rankingForClass(this.student()?.classId ?? ''),
  );

  protected readonly myEntry = computed(() =>
    this.ranking().find((entry) => entry.student.id === this.student()?.id),
  );

  protected readonly podium = computed(() => {
    const top = this.ranking().slice(0, 3);
    if (top.length < 3) return top;
    return [top[1], top[0], top[2]];
  });

  protected readonly rest = computed(() => this.ranking().slice(3));

  protected completedFor(studentId: string): number {
    return this.data.completedCount(studentId);
  }
}
