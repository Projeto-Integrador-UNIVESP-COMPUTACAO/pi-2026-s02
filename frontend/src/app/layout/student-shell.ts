import { Component, OnInit, computed, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../core/auth.service';
import { DataService } from '../core/data.service';
import { SessionService } from '../core/session.service';
import { levelInfo } from '../core/gamification';
import { Avatar } from '../shared/avatar';
import { Icon } from '../shared/icon';
import { AccessibilityTrigger } from '../shared/accessibility-trigger';
import type { IconName } from '../core/models';

interface NavLink {
  path: string;
  label: string;
  icon: IconName;
  exact: boolean;
}

@Component({
  selector: 'app-student-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    Avatar,
    Icon,
    AccessibilityTrigger,
  ],
  templateUrl: './student-shell.html',
  styleUrl: './student-shell.css',
})
export class StudentShell implements OnInit {
  private readonly data = inject(DataService);
  private readonly sessions = inject(SessionService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const session = this.sessions.session();
    if (session) {
      this.data.loadForSession(session).subscribe();
    }
  }

  protected readonly student = computed(() =>
    this.data.studentById(this.sessions.session()?.studentId),
  );

  protected readonly level = computed(() =>
    levelInfo(this.data.xpFor(this.student()?.id)),
  );

  protected readonly links: NavLink[] = [
    { path: '/aluno/painel', label: 'Painel', icon: 'home', exact: true },
    { path: '/aluno/missoes', label: 'Missões', icon: 'flag', exact: false },
    { path: '/aluno/ranking', label: 'Ranking', icon: 'trophy', exact: true },
    { path: '/aluno/carteira', label: 'Carteira', icon: 'wallet', exact: true },
  ];

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

