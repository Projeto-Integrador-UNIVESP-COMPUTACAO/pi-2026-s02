import { Component, computed, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../core/auth.service';
import { DataService } from '../core/data.service';
import { SessionService } from '../core/session.service';
import { TeacherContextService } from '../core/teacher-context.service';
import { Avatar } from '../shared/avatar';
import { Icon } from '../shared/icon';
import { AccessibilityTrigger } from '../shared/accessibility-trigger';
import type { IconName } from '../core/models';

interface TeacherLink {
  path: string;
  label: string;
  icon: IconName;
}

@Component({
  selector: 'app-teacher-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    Avatar,
    Icon,
    AccessibilityTrigger,
  ],
  templateUrl: './teacher-shell.html',
  styleUrl: './teacher-shell.css',
})
export class TeacherShell {
  private readonly data = inject(DataService);
  private readonly sessions = inject(SessionService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly context = inject(TeacherContextService);

  protected readonly teacher = computed(() =>
    this.data.teacherById(this.sessions.session()?.teacherId),
  );

  protected readonly links: TeacherLink[] = [
    { path: '/professor/turmas', label: 'Turmas', icon: 'users' },
    { path: '/professor/relatorios', label: 'Relatórios', icon: 'chart' },
    { path: '/professor/missoes', label: 'Missões', icon: 'flag' },
  ];

  protected selectClass(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.context.select(value);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

