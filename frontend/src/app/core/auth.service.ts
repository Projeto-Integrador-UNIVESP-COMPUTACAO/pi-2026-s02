import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { USERS } from './seed';
import { SessionService } from './session.service';
import type { Session } from './models';

export interface LoginResult {
  session: Session;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessions = inject(SessionService);

  /**
   * Simula POST /api/auth/login. A pequena latência mantém a sensação de
   * chamada de rede e permite testar o estado de carregamento.
   */
  login(identifier: string, password: string): Observable<LoginResult> {
    const normalized = identifier.trim();

    return of(null).pipe(
      delay(450),
      map(() => {
        const account = USERS.find(
          (user) =>
            user.id.toLowerCase() === normalized.toLowerCase() ||
            user.displayName.toLowerCase() === normalized.toLowerCase(),
        );

        if (!account || account.password !== password) {
          throw new Error('ID ou senha incorretos. Confira os dados e tente novamente.');
        }

        const session: Session = {
          userId: account.id,
          role: account.role,
          displayName: account.displayName,
          studentId: account.studentId,
          teacherId: account.teacherId,
        };

        this.sessions.establish(session);
        return { session };
      }),
    );
  }

  logout(): void {
    this.sessions.clear();
  }
}
