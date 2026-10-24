import { Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../core/data.service';
import { SessionService } from '../../core/session.service';
import { Icon } from '../../shared/icon';
import { MissionCard } from '../../shared/mission-card';
import { ProgressBar } from '../../shared/progress-bar';
import { SKILLS } from '../../core/seed';
import type { MissionView } from '../../core/models';

type Filter = 'all' | 'available' | 'done';

@Component({
  selector: 'app-missions-page',
  imports: [Icon, MissionCard, ProgressBar],
  templateUrl: './missions.page.html',
  styleUrl: './missions.page.css',
})
export class MissionsPage {
  private readonly data = inject(DataService);
  private readonly sessions = inject(SessionService);

  protected readonly filter = signal<Filter>('all');

  protected readonly student = computed(() =>
    this.data.studentById(this.sessions.session()?.studentId),
  );

  protected readonly missions = computed(() =>
    this.data.missionsFor(this.student()?.id ?? ''),
  );

  protected readonly completed = computed(
    () => this.missions().filter((mission) => mission.status === 'done').length,
  );

  protected readonly progressPct = computed(() => {
    const total = this.missions().length;
    return total === 0 ? 0 : Math.round((this.completed() / total) * 100);
  });

  protected readonly counts = computed(() => ({
    all: this.missions().length,
    available: this.missions().filter((mission) => mission.status !== 'done').length,
    done: this.completed(),
  }));

  protected readonly filtered = computed<MissionView[]>(() => {
    const list = this.missions();
    const visible =
      this.filter() === 'done'
        ? list.filter((mission) => mission.status === 'done')
        : this.filter() === 'available'
          ? list.filter((mission) => mission.status !== 'done')
          : list;

    const order: Record<MissionView['status'], number> = {
      progress: 0,
      new: 1,
      done: 2,
    };

    return [...visible].sort(
      (a, b) => order[a.status] - order[b.status],
    );
  });

  protected readonly skills = computed(() => Object.values(SKILLS));

  protected setFilter(filter: Filter): void {
    this.filter.set(filter);
  }
}
