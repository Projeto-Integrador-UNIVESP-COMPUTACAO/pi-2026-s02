import { Component, inject } from '@angular/core';
import { Icon } from './icon';
import { AccessibilityUiService } from '../core/accessibility-ui.service';

/** Gatilho compacto usado nos cabeçalhos em telas pequenas. */
@Component({
  selector: 'app-a11y-trigger',
  imports: [Icon],
  template: `
    <button
      type="button"
      class="icon-btn a11y-trigger__button"
      aria-label="Abrir ajustes de acessibilidade"
      aria-haspopup="dialog"
      aria-controls="a11y-panel"
      [attr.aria-expanded]="ui.open()"
      (click)="open($event)"
    >
      <app-icon name="accessible" [size]="20" />
    </button>
  `,
  styles: `
    :host {
      display: none;
    }

    .a11y-trigger__button {
      width: 2.15rem;
      height: 2.15rem;
    }

    @media (max-width: 640px) {
      :host {
        display: inline-flex;
      }
    }
  `,
})
export class AccessibilityTrigger {
  protected readonly ui = inject(AccessibilityUiService);

  protected open(event: MouseEvent): void {
    event.stopPropagation();
    this.ui.toggleFrom(event.currentTarget as HTMLElement);
  }
}
