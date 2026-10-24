import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, Icon],
  template: `
    <main id="conteudo" class="not-found" tabindex="-1">
      <div class="not-found__card card">
        <span class="not-found__mark" aria-hidden="true">404</span>
        <p class="eyebrow">Página não encontrada</p>
        <h1>Essa trilha não existe.</h1>
        <p>
          O endereço pode estar incompleto ou a página foi movida. Volte para o
          início e continue de onde parou.
        </p>
        <div class="not-found__actions">
          <a class="btn btn--primary" routerLink="/">
            <app-icon name="home" [size]="18" />
            Ir para o início
          </a>
          <a class="btn btn--ghost" routerLink="/aluno/missoes">
            <app-icon name="flag" [size]="18" />
            Ver missões
          </a>
        </div>
      </div>
    </main>
  `,
  styles: `
    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      padding: 1.5rem;
    }

    .not-found__card {
      max-width: 34rem;
      padding: clamp(1.4rem, 4vw, 2.4rem);
      text-align: center;
    }

    .not-found__mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 7rem;
      height: 7rem;
      margin-bottom: 1rem;
      border: 3px solid var(--ink);
      border-radius: 48% 52% 50% 50% / 51% 49% 52% 48%;
      background: var(--yellow-soft);
      font-family: var(--font-display);
      font-size: 2.6rem;
      transform: rotate(-4deg);
    }

    h1 {
      margin: 0.2rem 0 0.5rem;
      font-size: clamp(2rem, 5vw, 2.8rem);
    }

    p {
      margin: 0 auto 1.2rem;
      max-width: 38ch;
      color: var(--ink-soft);
    }

    .not-found__actions {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.6rem;
    }
  `,
})
export class NotFoundPage {}
