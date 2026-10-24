import { Component, inject } from '@angular/core';
import { Icon } from './icon';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [Icon],
  template: `
    <div class="toast-host" role="status" aria-live="polite" aria-atomic="false">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="toast" [attr.data-tone]="toast.tone">
          <app-icon
            [name]="toast.tone === 'error' ? 'alert' : toast.tone === 'success' ? 'check' : 'info'"
            [size]="18"
          />
          <span>{{ toast.message }}</span>
          <button type="button" class="toast__close" aria-label="Fechar aviso" (click)="toasts.dismiss(toast.id)">
            <app-icon name="close" [size]="15" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-host {
      position: fixed;
      left: max(1rem, env(safe-area-inset-left));
      bottom: max(1rem, env(safe-area-inset-bottom));
      z-index: 70;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: min(24rem, calc(100vw - 2rem));
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 0.8rem;
      border: 2.5px solid var(--ink);
      border-radius: 14px 5px 16px 6px / 6px 16px 5px 14px;
      background: var(--paper);
      box-shadow: 3px 3px 0 var(--ink);
      font-size: 0.85rem;
      font-weight: 700;
      pointer-events: auto;
      animation: toast-in 0.18s ease-out;
    }

    .toast[data-tone='success'] {
      background: var(--green-soft);
    }

    .toast[data-tone='error'] {
      background: var(--coral-soft);
    }

    .toast__close {
      margin-left: auto;
      display: inline-flex;
      border: 0;
      background: transparent;
      color: var(--ink);
      cursor: pointer;
      padding: 0.1rem;
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(0.5rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
}
