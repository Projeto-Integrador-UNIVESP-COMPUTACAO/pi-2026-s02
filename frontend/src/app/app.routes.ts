import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.page').then((module) => module.LoginPage),
    title: 'Entrar · Educa$',
  },
  {
    path: 'aluno',
    canActivate: [roleGuard('student')],
    loadComponent: () =>
      import('./layout/student-shell').then((module) => module.StudentShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'painel',
      },
      {
        path: 'painel',
        loadComponent: () =>
          import('./features/student/dashboard.page').then(
            (module) => module.StudentDashboardPage,
          ),
        title: 'Painel do aluno · Educa$',
      },
      {
        path: 'missoes',
        loadComponent: () =>
          import('./features/student/missions.page').then(
            (module) => module.MissionsPage,
          ),
        title: 'Missões · Educa$',
      },
      {
        path: 'missoes/:id',
        loadComponent: () =>
          import('./features/student/activity.page').then(
            (module) => module.ActivityPage,
          ),
        title: 'Missão · Educa$',
      },
      {
        path: 'ranking',
        loadComponent: () =>
          import('./features/student/ranking.page').then(
            (module) => module.RankingPage,
          ),
        title: 'Ranking da turma · Educa$',
      },
      {
        path: 'carteira',
        loadComponent: () =>
          import('./features/student/wallet.page').then(
            (module) => module.WalletPage,
          ),
        title: 'Carteira e conquistas · Educa$',
      },
    ],
  },
  {
    path: 'professor',
    canActivate: [roleGuard('teacher')],
    loadComponent: () =>
      import('./layout/teacher-shell').then((module) => module.TeacherShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'turmas',
      },
      {
        path: 'turmas',
        loadComponent: () =>
          import('./features/teacher/classes.page').then(
            (module) => module.TeacherClassesPage,
          ),
        title: 'Turmas · Educa$',
      },
      {
        path: 'alunos/:id',
        loadComponent: () =>
          import('./features/teacher/student-detail.page').then(
            (module) => module.TeacherStudentDetailPage,
          ),
        title: 'Detalhes do aluno · Educa$',
      },
      {
        path: 'relatorios',
        loadComponent: () =>
          import('./features/teacher/reports.page').then(
            (module) => module.TeacherReportsPage,
          ),
        title: 'Relatórios · Educa$',
      },
      {
        path: 'missoes',
        loadComponent: () =>
          import('./features/teacher/missions.page').then(
            (module) => module.TeacherMissionsPage,
          ),
        title: 'Missões e BNCC · Educa$',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found.page').then((module) => module.NotFoundPage),
    title: 'Página não encontrada · Educa$',
  },
];
