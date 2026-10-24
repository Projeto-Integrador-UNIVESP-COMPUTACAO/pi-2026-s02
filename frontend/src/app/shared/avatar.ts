import { Component, computed, input } from '@angular/core';
import { initials } from '../core/format';

@Component({
  selector: 'app-avatar',
  template: `
    <span
      class="avatar"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.font-size.px]="size() * 0.34"
      role="img"
      [attr.aria-label]="'Avatar de ' + name()"
    >
      {{ initials() }}
    </span>
  `,
  styles: `
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2.5px solid var(--ink);
      border-radius: 48% 52% 50% 50% / 51% 49% 52% 48%;
      background: var(--yellow-soft);
      color: var(--ink);
      font-family: var(--font-display);
      font-weight: 700;
      letter-spacing: 0.03em;
      line-height: 1;
      transform: rotate(-2deg);
      flex: 0 0 auto;
      overflow: hidden;
      user-select: none;
    }
  `,
})
export class Avatar {
  readonly name = input.required<string>();
  readonly size = input(48);
  readonly initials = computed(() => initials(this.name()));
}
