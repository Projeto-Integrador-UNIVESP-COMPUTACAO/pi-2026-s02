import { environment } from '../../environments/environment';

/**
 * Endereço da API Django.
 *
 * O valor padrão vem de `NG_APP_API_URL` no arquivo `frontend/.env`, que é
 * convertido em `src/environments/environment.ts` por `scripts/generate-env.mjs`
 * durante `npm start` / `npm run build`.
 *
 * `globalThis.__EDUCA_API__` continua disponível como override em tempo de
 * execução (útil em SSR ou em deploys sem rebuild).
 */
function resolveApiBase(): string {
  const custom = (globalThis as { __EDUCA_API__?: string }).__EDUCA_API__;
  if (typeof custom === 'string' && custom.length > 0) {
    return custom.replace(/\/$/, '');
  }
  return environment.apiUrl.replace(/\/$/, '');
}

export const API_BASE = resolveApiBase();
