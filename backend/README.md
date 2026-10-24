# Educa$ — backend

API Django REST para a plataforma gamificada de educação financeira descrita no relatório parcial do Projeto Integrador.

## Stack

- Django 5.2
- Django REST Framework com autenticação por token
- PostgreSQL (`psycopg`)
- `django-cors-headers` para o frontend Angular

## Configuração

O projeto espera um PostgreSQL local:

| Variável | Valor padrão |
| -------- | ------------ |
| Banco    | `pi02-db`    |
| Usuário  | `pi02-user`  |
| Senha    | `pi02`       |
| Host     | `localhost`  |
| Porta    | `5432`       |

Ajuste em `pi02/settings.py` se necessário.

```bash
# na raiz do repositório
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r backend/requirements.txt

cd backend
python manage.py migrate
python manage.py seed_data
python manage.py seed_activities
python manage.py runserver       # http://localhost:8000
```

## Dados de demonstração

`seed_data` cria o professor, duas turmas e sete alunos com 100 moedas iniciais.

| Perfil    | E-mail                   | Senha      |
| --------- | ------------------------ | ---------- |
| Professor | `professor@example.com`  | `Senha123!` |
| Aluno     | `ana@example.com`        | `Senha123!` |

`seed_activities` cria as cinco missões (`troco`, `ofertas`, `parcelado`, `poupanca`, `orcamento`), com 15 questões, alternativas e tabelas de apoio.

## Endpoints

| Método | Rota | Descrição |
| ------ | ---- | --------- |
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
