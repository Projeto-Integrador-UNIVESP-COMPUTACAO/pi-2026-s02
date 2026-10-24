# Educa$ — frontend

Frontend do protótipo **Educação Financeira e Tecnologia: uma proposta gamificada para o Ensino Fundamental**, desenvolvido para o Projeto Integrador da UNIVESP (2026).

O app transforma os wireframes do relatório parcial em uma aplicação Angular navegável: login, painel do aluno, missões com feedback, ranking, carteira e painel do professor com métricas e exportação.

## Stack

- Angular 22 (standalone components, signals, control flow `@if`/`@for`)
- TypeScript 6
- CSS autoral (papel, tinta e traços à mão), sem biblioteca de UI
- SSR com `@angular/ssr` + Express
- Vitest para testes unitários

## Contas de demonstração

| Perfil    | ID         | Senha          | O que abre                                  |
| --------- | ---------- | -------------- | ------------------------------------------- |
| Aluno     | `345G7B`   | `1234567890`   | Painel, missões, ranking e carteira         |
| Professor | `PROF-001` | `professor123` | Turmas, relatórios, missões e ficha do aluno |

A tela de login também tem botões que preenchem e entram com essas contas. Os dados são fictícios; o progresso fica no `localStorage` do navegador.

## Rotas

| Rota                        | Tela                                            |
| --------------------------- | ----------------------------------------------- |
| `/login`                    | Login com contas de demonstração                |
| `/aluno/painel`             | Painel do aluno, próxima missão e conquistas    |
| `/aluno/missoes`            | Catálogo de missões com filtros                 |
| `/aluno/missoes/:id`        | Player da missão (troco, oferta, parcelamento…) |
| `/aluno/ranking`            | Ranking da turma                                |
| `/aluno/carteira`           | Moedas, extrato e insígnias                     |
| `/professor/turmas`         | Visão da turma, busca e exportação CSV          |
| `/professor/alunos/:id`     | Ficha individual e histórico de tentativas      |
| `/professor/relatorios`     | Desempenho por missão e cobertura BNCC          |
| `/professor/missoes`        | Catálogo do MVP com questões e escopo           |

## O que está implementado

- **Login** com validação, mensagens de erro, mostrar/ocultar senha e sessão por cookie + `localStorage`.
- **Painel do aluno** com nível, XP, moedas, missão recomendada, ranking e progresso por habilidade da BNCC.
- **Cinco missões** baseadas no relatório:
  1. Simulador de Troco (EF05MA06)
  2. Qual oferta compensa? (EF06MA13)
  3. Parcelado vs à Vista (EF05MA06, EF07MA02)
  4. Desafio Poupança (EF07MA02)
  5. Orçamento do Mês (EF07MA02)
- **Player de atividade** com situação-problema, tabela de dados, resposta numérica ou múltipla escolha, dica, feedback explicativo, nova tentativa, pontuação, XP, moedas, insígnias e revisão.
- **Gamificação mínima e informativa** conforme o recorte do relatório: pontos, barra de progresso e insígnia por missão. Não há loja virtual, avatar customizável ou narrativa extensa.
- **Ranking da turma** com posição do aluno e privacidade (primeiro nome + inicial).
- **Carteira** com saldo, extrato de moedas/XP e coleção de insígnias.
- **Painel do professor** com turma selecionável, indicadores (nível médio, conclusão, média, ativos em 7 dias), tabela de alunos, situação pedagógica e busca.
- **Relatórios** com desempenho por missão, cobertura das três habilidades da BNCC, alunos que podem precisar de apoio e exportação CSV.
- **Ficha do aluno** com progresso por missão, insígnias e histórico de tentativas (data, erros, pontuação e situação).
- **Acessibilidade**: painel com alto contraste, três tamanhos de texto, redução de animações e restauração de padrão; HTML semântico, foco visível, skip link, `aria-live` no feedback e tabelas com caption.
- **Responsivo** para celular, tablet e desktop.

## Arquitetura

```
src/app/
├── core/                 # modelos, seed, dados, sessão, guards, analytics, CSV
│   ├── data.service.ts   # camada de dados simulada (contrato do backend)
│   ├── session.service.ts
│   └── seed.ts           # 22 alunos, 2 turmas, 5 missões, insígnias
├── shared/               # ícones, avatar, progresso, estrelas, badges, cartões
├── layout/               # shells do aluno e do professor
└── features/
    ├── auth/
    ├── student/
    └── teacher/
```

### Backend simulado

`DataService` é o único ponto de acesso aos dados. Ele mantém sinais em memória, persiste em `localStorage` (`educa.data.v1`) e expõe operações equivalentes às do backend previsto:

| Operação atual                 | Equivalente Django/PostgreSQL                   |
| ------------------------------ | ----------------------------------------------- |
| `studentsInClass`, `studentById` | `GET /api/turmas/:id/alunos`                   |
| `activities`, `activityById`   | `GET /api/atividades`                           |
| `recordFor`, `progressFor`     | `GET /api/alunos/:id/progresso`                 |
| `recordAttempt(...)`           | `POST /api/alunos/:id/tentativas`               |
| `badgesFor`                    | `GET /api/alunos/:id/conquistas`                |
| `rankingForClass`              | `GET /api/turmas/:id/ranking`                   |
| exportações CSV                | `GET /api/turmas/:id/export.csv`                |

A autenticação também é simulada: `SessionService` lê o cookie `educa_session` no servidor (para o SSR renderizar a área correta) e usa `localStorage` como apoio no navegador. Em produção, substitua por um cookie `HttpOnly` emitido pelo Django ou um token gerenciado pelo backend.

Para integrar a API real, mantenha os modelos de `core/models.ts`, troque os métodos síncronos de `DataService` por chamadas `HttpClient` e ajuste os componentes para consumir `Observable`/`resource`. Os componentes não conhecem a origem dos dados.

### Persistência local

- `educa.session.v1` — sessão de demonstração.
- `educa.data.v1` — alunos, moedas e progresso.
- `educa.a11y.v1` — preferências de acessibilidade.

O botão **Restaurar padrão** do painel de acessibilidade limpa apenas as preferências visuais. Para zerar o progresso, remova as chaves acima no DevTools.

## Acessibilidade

- Tokens de contraste e foco definidos em `src/styles.css`.
- `html[data-contrast="high"]` aplica preto, branco e amarelo com bordas reforçadas.
- `html[data-motion="reduced"]` remove animações e transições.
- Tamanho do texto em 100%, 112% e 125% via `--font-scale`.
- `prefers-reduced-motion` também é respeitado.
- Feedbacks usam `role="status"`/`aria-live`; erros usam `role="alert"`.
- O player move o foco para a pergunta, o feedback e o resultado.
- Tabelas têm `caption` (visualmente oculto) e cabeçalhos `scope="col"`.
- O botão de acessibilidade é global e fecha com `Esc` ou clique fora.

## Comandos

```bash
npm install
npm start            # ng serve (http://localhost:4200)
npm run build        # build de produção com SSR
npm run serve:ssr:frontend  # serve o build em http://localhost:4000
npm test             # testes via Angular/Vitest
```

Neste ambiente, os testes puros podem ser executados sem o builder Angular:

```bash
npx vitest run --pool=threads src/app/core
```

## SSR e hospedagem

- `src/app/app.routes.server.ts` usa `RenderMode.Server` para todas as rotas (sem pré-renderização estática).
- `angular.json` define `security.allowedHosts` como `localhost` e `127.0.0.1`. Ao publicar (por exemplo, no Render), adicione o domínio de produção nessa lista. Sem isso, o servidor Angular responde `400 Host not allowed`.
- `npm run serve:ssr:frontend` usa `PORT` do ambiente (padrão 4000).

## Decisões e escopo

O relatório parcial define um MVP com três módulos curtos, uma ou duas séries e três habilidades da BNCC. Este frontend mantém esse recorte:

- **Dentro do escopo**: troco, comparação de ofertas, parcelamento, poupança, orçamento, feedback corretivo, pontos/moedas, barra de progresso, insígnia por módulo, painel do professor e exportação.
- **Fora do escopo**: loja virtual, avatar personalizável, narrativa extensa, simulações econômicas complexas, multijogador e IA.
- **LGPD**: dados fictícios, nomes exibidos de forma reduzida e apenas o necessário para registrar progresso.
- **Camada de dados**: mock local. A modelagem de `Aluno`, `Atividade` e `Histórico Progresso` segue a seção 2.5 do relatório.

Os wireframes estáticos que ficavam em `src/login`, `src/dashboard-aluno`, `src/dashboard-professor` e `src/atividades` foram substituídos por componentes Angular. O histórico do Git preserva os arquivos originais.
