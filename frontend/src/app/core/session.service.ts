import {
  Injectable,
  PLATFORM_ID,
  REQUEST,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { USERS } from './seed';
import type { Session } from './models';

const COOKIE_NAME = 'educa_session';
const STORAGE_KEY = 'educa.session.v1';
const MAX_AGE_SECONDS = 60 * 60 * 8;

/**
 * Sessão de demonstração.
 *
 * O cookie permite que o SSR renderize a área correta já na primeira
 * requisição. Em produção, substitua por um cookie HttpOnly emitido pelo
 * Django ou por um token gerenciado pelo backend.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _session = signal<Session | null>(this.readInitialSession());
  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);

  readonly homeUrl = computed(() => {
    const session = this._session();
    if (!session) return '/login';
    return session.role === 'teacher' ? '/professor/turmas' : '/aluno/painel';
  });

  establish(session: Session): void {
    const canonical = this.canonicalize(session);
    if (!canonical) return;

    this._session.set(canonical);

    if (!this.isBrowser) return;

    const value = encodeURIComponent(JSON.stringify(canonical));
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
    } catch {
      // Sem armazenamento local, o cookie ainda mantém a sessão.
    }
  }

  clear(): void {
    this._session.set(null);
    if (!this.isBrowser) return;

    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora ambientes sem localStorage.
    }
  }

  private readInitialSession(): Session | null {
    if (!this.isBrowser) {
      return this.parseCookie(this.request?.headers.get('cookie') ?? '');
    }

    return this.parseCookie(document.cookie) ?? this.readStorage();
  }

  private readStorage(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return this.canonicalize(JSON.parse(raw) as Session);
    } catch {
      return null;
    }
  }

  private parseCookie(cookieHeader: string): Session | null {
    if (!cookieHeader) return null;

    const entry = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${COOKIE_NAME}=`));

    if (!entry) return null;

    try {
      const value = decodeURIComponent(entry.slice(COOKIE_NAME.length + 1));
      return this.canonicalize(JSON.parse(value) as Session);
    } catch {
      return null;
    }
  }

  private canonicalize(session: Session | null): Session | null {
    if (!session?.userId || !session.role) return null;
    if (session.role !== 'student' && session.role !== 'teacher') return null;

    const account = USERS.find(
      (user) => user.id === session.userId && user.role === session.role,
    );
    if (!account) return null;

    return {
      userId: account.id,
      role: account.role,
      displayName: account.displayName,
      studentId: account.studentId,
      teacherId: account.teacherId,
    };
  }
}
