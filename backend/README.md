# Educa$ — backend

API Django REST para a plataforma gamificada de educação financeira descrita no relatório parcial do Projeto Integrador.

## Stack

- Django 5.2
- Django REST Framework com autenticação por token
- PostgreSQL (`psycopg`)
- `django-cors-headers` para o frontend Angular

## Configuração

As configurações ficam em `backend/.env`, carregado automaticamente por `python-dotenv` em `pi02/settings.py`. O arquivo não é versionado; use `backend/.env.example` como modelo:

```bash
cd backend
cp .env.example .env        # Windows: copy .env.example .env
```

| Variável | Valor padrão |
| -------- | ------------ |
| `DJANGO_SECRET_KEY` | chave insegura de desenvolvimento |
| `DJANGO_DEBUG` | `True` |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,testserver,.onrender.com` |
| `DJANGO_ADMIN_EMAIL` | `admin@example.com` |
| `DJANGO_ADMIN_PASSWORD` | `Senha123!` |
| `DJANGO_CORS_ALLOW_ALL_ORIGINS` | `True` |
| `DJANGO_CORS_ALLOWED_ORIGINS` | `http://localhost:4200,http://127.0.0.1:4200` |
| `DJANGO_CORS_ALLOW_CREDENTIALS` | `True` |
| `DB_NAME` | `pi02-db` |
| `DB_USER` | `pi02-user` |
| `DB_PASSWORD` | `pi02` |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |

Variáveis já definidas no ambiente do processo têm prioridade sobre o `.env`. Em produção, defina `DJANGO_DEBUG=False`, uma `DJANGO_SECRET_KEY` nova e restrinja hosts e origens de CORS.

O projeto espera um PostgreSQL local com os valores acima.

```bash
# na raiz do repositório
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env   # Windows: copy backend\.env.example backend\.env

cd backend
python manage.py migrate
python manage.py seed_data
python manage.py seed_activities
python manage.py runserver       # http://localhost:8000
```

## Dados de demonstração

`seed_data` cria o administrador (com as credenciais de `DJANGO_ADMIN_EMAIL` e `DJANGO_ADMIN_PASSWORD`), o professor, duas turmas e sete alunos com 100 moedas iniciais.

| Perfil    | E-mail                   | Senha      |
| --------- | ------------------------ | ---------- |
| Administrador | `admin@example.com`  | `Senha123!` |
| Professor | `professor@example.com`  | `Senha123!` |
| Aluno     | `ana@example.com`        | `Senha123!` |

As credenciais do administrador acima são apenas os valores padrão; altere `DJANGO_ADMIN_EMAIL` e `DJANGO_ADMIN_PASSWORD` no `backend/.env` antes de rodar `seed_data`.

`seed_activities` cria as cinco missões (`troco`, `ofertas`, `parcelado`, `poupanca`, `orcamento`), com 15 questões, alternativas e tabelas de apoio.

## Endpoints

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/` (ou `/health/`, `/api/health/`) | Liveness: 200 enquanto o Django estiver no ar; inclui o estado do banco |
| GET | `/health/ready/` (ou `/api/health/ready/`) | Readiness: 200 com banco acessível, 503 caso contrário |
| POST | `/api/users/` | Cria professor (somente ADMIN) ou aluno (somente TEACHER) |
| POST | `/api/users/login/` | Login por e-mail (ou username) e senha; retorna token e usuário |
| GET | `/api/users/me/` | Perfil do usuário autenticado |
| GET | `/api/classrooms/mine/` | Turmas do professor ou turma do aluno |
| GET | `/api/classrooms/:id/students/` | Alunos da turma |
| GET | `/api/content/activities/` | Lista de atividades com questões |
| GET | `/api/content/activities/:external_id/` | Detalhe de uma atividade |
| GET | `/api/progress/me/` | Progresso do aluno autenticado |
| GET | `/api/progress/classroom/:id/` | Turma + alunos + progresso (professor dono ou aluno da turma) |
| POST | `/api/progress/attempt/` | Registra tentativa e concede moedas na primeira conclusão |

As rotas, exceto o login, exigem o cabeçalho `Authorization: Token <token>`.

### Criar usuário

`POST /api/users/` cria professores e alunos conforme o papel de quem faz a requisição:

- **ADMIN** (criado somente por `seed_data`) cria apenas `TEACHER`.
- **TEACHER** cria apenas `STUDENT`.
- **STUDENT** não cria ninguém.
- `ADMIN` não pode ser criado pela API.
- Para alunos, `classroom_id` é opcional, mas quando informado precisa ser uma turma do próprio professor.
- `username` é opcional; se omitido, é gerado a partir do e-mail.
- A senha passa pelos validadores do Django (`AUTH_PASSWORD_VALIDATORS`).
- Alunos criados pela API começam com 100 moedas.

Exemplo — admin cria professor:

```http
POST /api/users/
Authorization: Token <token-do-admin>
Content-Type: application/json

{
  "name": "Maria Professora",
  "email": "maria.professora@example.com",
  "password": "Senha123!",
  "role": "TEACHER"
}
```

Exemplo — professor cria aluno na própria turma:

```http
POST /api/users/
Authorization: Token <token-do-professor>
Content-Type: application/json

{
  "name": "João Aluno",
  "email": "joao.aluno@example.com",
  "password": "Senha123!",
  "role": "STUDENT",
  "classroom_id": 1
}
```

Resposta `201 Created` com os dados públicos do usuário (sem senha).

### Registrar tentativa

```json
{
  "activityId": "troco",
  "score": 80,
  "errors": 1,
  "passed": true
}
```

A pontuação é limitada a 0–100. O melhor resultado é mantido, o histórico guarda as 20 tentativas mais recentes e as moedas são concedidas apenas na primeira vez que a atividade é concluída.

## Testes

```bash
cd backend
python manage.py test
```

A suíte cobre autenticação, turmas, conteúdo (tabelas, alternativas e ordenação), progresso, permissões e concessão de moedas.
