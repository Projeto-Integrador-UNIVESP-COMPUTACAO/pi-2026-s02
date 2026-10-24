import {
  Injectable,
  PLATFORM_ID,
  REQUEST,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TOKEN_KEY } from './auth.interceptor';
import type { Session } from './models';

const COOKIE_NAME = 'educa_session';
const STORAGE_KEY = 'educa.session.v1';
const MAX_AGE_SECONDS = 60 * 60 * 8;

/**
 * Sessão emitida pelo backend Django.
 *
 * O token da API fica no localStorage e é anexado às requisições pelo
 * `authInterceptor`. O cookie permite que o SSR renderize a área correta
 * já na primeira requisição.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _session = signal<Session | null>(this.readInitialSession());
  private readonly _token = signal<string | null>(this.readToken());

  readonly session = this._session.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);

  readonly homeUrl = computed(() => {
    const session = this._session();
    if (!session) return '/login';
    return session.role === 'teacher' ? '/professor/turmas' : '/aluno/painel';
  });

  establish(session: Session, token?: string): void {
    const canonical = this.canonicalize(session);
    if (!canonical) return;

    this._session.set(canonical);

    if (token) {
      this._token.set(token);
      this.writeToken(token);
    }

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
    this._token.set(null);

    if (!this.isBrowser) return;

    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignora ambientes sem localStorage.
    }
  }

  private readToken(): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private writeToken(token: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Em modo privado, a sessão continua apenas em memória.
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

    return {
      userId: session.userId,
      role: session.role,
      displayName: session.displayName || 'Usuário',
      studentId: session.role === 'student' ? session.studentId ?? session.userId : undefined,
      teacherId: session.role === 'teacher' ? session.teacherId ?? session.userId : undefined,
    };
  }
}
