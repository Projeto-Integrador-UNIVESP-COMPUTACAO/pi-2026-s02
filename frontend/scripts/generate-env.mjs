#!/usr/bin/env node
/**
 * Gera `src/environments/environment.ts` a partir de `frontend/.env`.
 *
 * O Angular não lê arquivos `.env` diretamente, então este script faz a ponte
 * entre o `.env` e o código da aplicação. Ele roda automaticamente antes de
 * `npm start`, `npm run build` e `npm run watch` (scripts `prestart`,
 * `prebuild` e `prewatch`).
 *
 * Variáveis reconhecidas:
 *   NG_APP_API_URL       URL base da API Django (padrão: http://localhost:8000/api)
 *   NG_APP_PRODUCTION    "true" para marcar o build como produção (padrão: false)
 *
 * As variáveis do ambiente do processo têm prioridade sobre o arquivo `.env`.
 * Uso: node scripts/generate-env.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');
const outputPath = resolve(root, 'src/environments/environment.ts');

function parseEnvFile(path) {
  const values = {};

  if (!existsSync(path)) {
    return values;
  }

  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = line.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    const value = rawValue.trim();
    const unquoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
        ? value.slice(1, -1)
        : value;

    values[key] = unquoted;
  }

  return values;
}

const fileEnv = parseEnvFile(envPath);
const env = { ...fileEnv, ...process.env };

const apiUrl = (env.NG_APP_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');
const production =
  (env.NG_APP_PRODUCTION || '').toLowerCase() === 'true' ||
  env.NODE_ENV === 'production';

const escapedApiUrl = apiUrl.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const output = `// Arquivo gerado automaticamente por scripts/generate-env.mjs.
// Não edite à mão: altere frontend/.env e rode \`npm start\` ou \`npm run build\`.
// Este arquivo é versionado apenas com os valores padrão de desenvolvimento.

export interface Environment {
  production: boolean;
  apiUrl: string;
}

export const environment: Environment = {
  production: ${production},
  apiUrl: '${escapedApiUrl}',
};
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, output, 'utf8');

console.log(
  `[env] apiUrl=${apiUrl} modo=${production ? 'production' : 'development'} (${envPath})`,
);
