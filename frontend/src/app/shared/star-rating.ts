import { Component, computed, input } from '@angular/core';
import { Icon } from './icon';
import { starsForScore } from '../core/gamification';

@Component({
  selector: 'app-star-rating',
  imports: [Icon],
  template: `
    <span class="stars" role="img" [attr.aria-label]="label()">
      @for (i of [1, 2, 3]; track i) {
        <span class="stars__item" [class.is-on]="i <= stars()">
          <app-icon name="star" [size]="size()" [filled]="i <= stars()" />
        </span>
      }
    </span>
  `,
  styles: `
    .stars {
      display: inline-flex;
      align-items: center;
      gap: 0.12rem;
      color: var(--ink-soft);
      line-height: 1;
    }

    .stars__item.is-on {
      color: var(--yellow-deep);
    }
  `,
})
export class StarRating {
  readonly score = input(0);
  readonly size = input(18);
  readonly stars = computed(() => starsForScore(this.score()));
  readonly label = computed(() => `${this.stars()} de 3 estrelas`);
}
