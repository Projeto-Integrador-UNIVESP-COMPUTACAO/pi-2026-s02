import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import { API_BASE } from './api';
import { DataService } from './data.service';
import { SessionService } from './session.service';
import type { Session } from './models';

export interface LoginResult {
  session: Session;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'STUDENT' | 'TEACHER';
    classroom_id: number | null;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessions = inject(SessionService);
  private readonly data = inject(DataService);

  /** Autentica na API Django e carrega os dados do usuário. */
  login(identifier: string, password: string): Observable<LoginResult> {
    const email = identifier.trim();

    return this.http
      .post<LoginResponse>(`${API_BASE}/users/login/`, {
        email,
        password,
      })
      .pipe(
        map((response) => {
          const user = response.user;
          const userId = String(user.id);
          const session: Session = {
            userId,
            role: user.role === 'TEACHER' ? 'teacher' : 'student',
            displayName: user.name,
            studentId: user.role === 'STUDENT' ? userId : undefined,
            teacherId: user.role === 'TEACHER' ? userId : undefined,
          };

          this.sessions.establish(session, response.token);
          return session;
        }),
        switchMap((session) =>
          this.data
            .loadForSession(session)
            .pipe(map(() => ({ session }))),
        ),
        catchError((cause: unknown) => {
          if (cause instanceof HttpErrorResponse) {
            const detail =
              typeof cause.error?.detail === 'string'
                ? cause.error.detail
                : 'Não foi possível entrar. Verifique e-mail e senha.';
            return throwError(() => new Error(detail));
          }
          return throwError(() =>
            cause instanceof Error
              ? cause
              : new Error('Não foi possível entrar. Tente novamente.'),
          );
        }),
      );
  }

  logout(): void {
    this.data.restoreDemoData();
    this.sessions.clear();
  }
}
