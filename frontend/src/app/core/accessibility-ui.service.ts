import { Injectable, signal } from '@angular/core';

/**
 * Controla a abertura do painel global de acessibilidade.
 * Permite que o botão flutuante (desktop) e os gatilhos dos cabeçalhos
 * (mobile) compartilhem o mesmo painel.
 */
@Injectable({ providedIn: 'root' })
export class AccessibilityUiService {
  private readonly _open = signal(false);
  readonly open = this._open.asReadonly();

  private lastTrigger: HTMLElement | null = null;

  openFrom(trigger: HTMLElement): void {
    this.lastTrigger = trigger;
    this._open.set(true);
  }

  close(): void {
    this._open.set(false);
    const trigger = this.lastTrigger;
    this.lastTrigger = null;
    if (trigger?.isConnected) {
      trigger.focus();
    }
  }

  toggleFrom(trigger: HTMLElement): void {
    if (this._open()) {
      this.close();
    } else {
      this.openFrom(trigger);
    }
  }
}
