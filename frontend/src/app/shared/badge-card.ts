import { Component, input } from '@angular/core';
import { Icon } from './icon';
import type { Badge } from '../core/models';

@Component({
  selector: 'app-badge-card',
  imports: [Icon],
  template: `
    <article
      class="badge-card"
      [class.is-locked]="!earned()"
      [attr.data-tone]="badge().tone"
    >
      <span class="badge-card__icon">
        <app-icon [name]="badge().icon" [size]="28" [filled]="earned()" />
      </span>
      <div class="badge-card__body">
        <strong>{{ badge().name }}</strong>
        <p>{{ badge().description }}</p>
      </div>
      <span class="badge-card__state" [attr.aria-label]="earned() ? 'Conquistada' : 'Bloqueada'">
        <app-icon [name]="earned() ? 'check' : 'lock'" [size]="16" />
      </span>
    </article>
  `,
  styles: `
    .badge-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.8rem;
      padding: 0.85rem 0.95rem;
      border: 2px solid var(--ink);
      border-radius: 16px 6px 18px 8px / 8px 18px 6px 16px;
      background: var(--paper);
    }

    .badge-card.is-locked {
      opacity: 0.58;
      border-style: dashed;
    }

    .badge-card__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border: 2px solid var(--ink);
      border-radius: 50%;
      color: var(--ink);
      background: var(--yellow-soft);
    }

    .badge-card[data-tone='green'] .badge-card__icon {
      background: var(--green-soft);
    }

    .badge-card[data-tone='blue'] .badge-card__icon {
      background: var(--blue-soft);
    }

    .badge-card[data-tone='violet'] .badge-card__icon {
      background: var(--violet-soft);
    }

    .badge-card[data-tone='coral'] .badge-card__icon {
      background: var(--coral-soft);
    }

    .badge-card__body strong {
      display: block;
      font-family: var(--font-display);
      font-size: 1.1rem;
      line-height: 1.1;
    }

    .badge-card__body p {
      margin: 0.2rem 0 0;
      font-size: 0.82rem;
      line-height: 1.35;
      color: var(--ink-soft);
    }

    .badge-card__state {
      color: var(--ink-soft);
    }
  `,
})
export class BadgeCard {
  readonly badge = input.required<Badge>();
  readonly earned = input(true);
}
