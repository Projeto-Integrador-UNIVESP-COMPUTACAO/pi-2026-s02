import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';
import { StarRating } from './star-rating';
import { SKILLS } from '../core/seed';
import type { Activity, ProgressRecord, Tone } from '../core/models';

@Component({
  selector: 'app-mission-card',
  imports: [RouterLink, Icon, StarRating],
  template: `
    <a
      class="mission-card"
      [routerLink]="['/aluno/missoes', activity().id]"
      [attr.aria-label]="ariaLabel()"
    >
      <div class="mission-card__top">
        <span class="mission-card__icon" [attr.data-tone]="tone()">
          <app-icon [name]="activity().icon" [size]="30" />
        </span>
        <span
          class="mission-card__status"
          [class.is-done]="status() === 'done'"
          [class.is-progress]="status() === 'progress'"
        >
          {{ statusLabel() }}
        </span>
      </div>

      <h3>{{ activity().title }}</h3>
      <p class="mission-card__tagline">{{ activity().tagline }}</p>

      <div class="mission-card__tags">
        @for (skill of activity().skills; track skill) {
          <span class="tag skill-tag" [attr.data-skill]="skill">
            {{ skill }} · {{ skillName(skill) }}
          </span>
        }
      </div>

      <div class="mission-card__meta">
        <span><app-icon name="clock" [size]="16" /> {{ activity().estimatedMinutes }} min</span>
        <span><app-icon name="coin" [size]="16" /> +{{ activity().rewardCoins }} moedas</span>
        @if (record()?.passed) {
          <app-star-rating [score]="record()?.bestScore ?? 0" />
        } @else {
          <span class="mission-card__diff" [attr.aria-label]="difficultyLabel()">
            {{ difficultyLabel() }}
          </span>
        }
      </div>

      <span class="mission-card__cta">
        {{ cta() }}
        <app-icon name="arrow-right" [size]="18" />
      </span>
    </a>
  `,
  styles: `
    .mission-card {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      padding: 1.15rem;
      border: 2.5px solid var(--ink);
      border-radius: 18px 6px 20px 8px / 8px 20px 6px 18px;
      background: var(--paper);
      color: var(--ink);
      text-decoration: none;
      box-shadow: 4px 4px 0 var(--shadow);
      transition:
        transform 0.14s ease,
        box-shadow 0.14s ease,
        background 0.14s ease;
      height: 100%;
    }

    .mission-card:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 var(--shadow);
      background: var(--paper-2);
    }

    .mission-card:active {
      transform: translate(1px, 1px);
      box-shadow: 2px 2px 0 var(--shadow);
    }

    .mission-card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
    }

    .mission-card__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.25rem;
      height: 3.25rem;
      border: 2.5px solid var(--ink);
      border-radius: 48% 52% 50% 50% / 51% 49% 52% 48%;
      background: var(--yellow-soft);
      transform: rotate(-2deg);
    }

    .mission-card__icon[data-tone='green'] {
      background: var(--green-soft);
    }

    .mission-card__icon[data-tone='blue'] {
      background: var(--blue-soft);
    }

    .mission-card__icon[data-tone='violet'] {
      background: var(--violet-soft);
    }

    .mission-card__icon[data-tone='coral'] {
      background: var(--coral-soft);
    }

    .mission-card__status {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.2rem 0.55rem;
      border: 1.5px solid var(--ink);
      border-radius: 999px;
      background: var(--paper-2);
      white-space: nowrap;
    }

    .mission-card__status.is-done {
      background: var(--green-soft);
    }

    .mission-card__status.is-progress {
      background: var(--yellow-soft);
    }

    h3 {
      margin: 0.1rem 0 0;
      font-family: var(--font-display);
      font-size: 1.45rem;
      font-weight: 400;
      line-height: 1.05;
    }

    .mission-card__tagline {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
      color: var(--ink-soft);
    }

    .mission-card__tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .mission-card__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.7rem;
      margin-top: auto;
      padding-top: 0.4rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--ink-soft);
    }

    .mission-card__meta > span {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .mission-card__diff {
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 0.7rem;
    }

    .mission-card__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-family: var(--font-display);
      font-size: 1.05rem;
      border-top: 2px dashed var(--line);
      padding-top: 0.55rem;
      margin-top: 0.15rem;
    }
  `,
})
export class MissionCard {
  readonly activity = input.required<Activity>();
  readonly record = input<ProgressRecord | undefined>(undefined);

  readonly status = computed<'new' | 'progress' | 'done'>(() => {
    const record = this.record();
    if (record?.passed) return 'done';
    if (record?.attempts) return 'progress';
    return 'new';
  });

  readonly statusLabel = computed(() => {
    switch (this.status()) {
      case 'done':
        return 'Concluída';
      case 'progress':
        return 'Em andamento';
      default:
        return 'Nova';
    }
  });

  readonly cta = computed(() => {
    switch (this.status()) {
      case 'done':
        return 'Revisar missão';
      case 'progress':
        return 'Continuar';
      default:
        return 'Começar agora';
    }
  });

  readonly tone = computed<Tone>(() => {
    const map: Record<Activity['kind'], Tone> = {
      change: 'yellow',
      offer: 'green',
      installment: 'blue',
      savings: 'violet',
      budget: 'coral',
    };
    return map[this.activity().kind];
  });

  readonly difficultyLabel = computed(() => {
    switch (this.activity().difficulty) {
      case 1:
        return 'Fácil';
      case 2:
        return 'Média';
      default:
        return 'Desafio';
    }
  });

  readonly ariaLabel = computed(() => {
    const record = this.record();
    const progress = record?.passed
      ? `, concluída com ${record.bestScore}% de acerto`
      : '';
    return `${this.activity().title}, ${this.statusLabel()}${progress}. ${this.cta()}`;
  });

  skillName(code: keyof typeof SKILLS): string {
    return SKILLS[code]?.title ?? code;
  }
}
