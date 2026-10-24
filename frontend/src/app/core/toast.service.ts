import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Toast } from './models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private counter = 0;

  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, tone: Toast['tone'] = 'info'): void {
    const id = ++this.counter;
    this._toasts.update((toasts) => [...toasts.slice(-2), { id, message, tone }]);

    if (this.isBrowser) {
      setTimeout(() => this.dismiss(id), 4200);
    }
  }

  dismiss(id: number): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
