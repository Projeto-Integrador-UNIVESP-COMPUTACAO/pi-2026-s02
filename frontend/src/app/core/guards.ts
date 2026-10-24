import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';
import type { Role } from './models';

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService).session();
  const router = inject(Router);

  if (!session) return true;
  return router.parseUrl(
    session.role === 'teacher' ? '/professor/turmas' : '/aluno/painel',
  );
};

export const roleGuard = (role: Role): CanActivateFn => (_route, state) => {
  const session = inject(SessionService).session();
  const router = inject(Router);

  if (!session) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirect: state.url },
    });
  }

  if (session.role === role) return true;

  return router.parseUrl(
    session.role === 'teacher' ? '/professor/turmas' : '/aluno/painel',
  );
};
