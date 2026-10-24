/**
 * Endereço da API Django.
 *
 * Em desenvolvimento o backend roda em http://localhost:8000.
 * Para outros ambientes, ajuste aqui ou defina `window.__EDUCA_API__`.
 */
function resolveApiBase(): string {
  const custom = (globalThis as { __EDUCA_API__?: string }).__EDUCA_API__;
  if (typeof custom === 'string' && custom.length > 0) {
    return custom.replace(/\/$/, '');
  }
  return 'http://localhost:8000/api';
}

export const API_BASE = resolveApiBase();
