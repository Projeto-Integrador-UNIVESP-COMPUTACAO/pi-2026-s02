import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress',
  template: `
    <div
      class="progress"
      role="progressbar"
      [attr.aria-label]="label()"
      [attr.aria-valuenow]="clamped()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuetext]="clamped() + '%'"
    >
      <span class="progress__fill" [style.width.%]="clamped()"></span>
    </div>
  `,
  styles: `
    .progress {
      position: relative;
      height: 0.9rem;
      border: 2px solid var(--ink);
      border-radius: 999px;
      background: var(--paper);
      overflow: hidden;
    }

    .progress__fill {
      display: block;
      height: 100%;
      background: var(--ink);
      background-image: repeating-linear-gradient(
        45deg,
        var(--ink) 0 2px,
        transparent 2px 6px
      );
      transition: width 0.35s ease;
    }
  `,
})
export class ProgressBar {
  readonly value = input(0);
  readonly label = input('Progresso');
  readonly clamped = computed(() =>
    Math.min(100, Math.max(0, Math.round(this.value()))),
  );
}
