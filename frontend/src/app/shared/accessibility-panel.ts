import {
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Icon } from './icon';
import { AccessibilityService } from '../core/accessibility.service';
import { AccessibilityUiService } from '../core/accessibility-ui.service';

@Component({
  selector: 'app-accessibility-panel',
  imports: [Icon],
  template: `
    <div class="a11y">
      <button
        #toggle
        type="button"
        class="a11y__toggle"
        [attr.aria-expanded]="ui.open()"
        aria-controls="a11y-panel"
        [attr.aria-label]="ui.open() ? 'Fechar ajustes de acessibilidade' : 'Abrir ajustes de acessibilidade'"
        (click)="toggleFloating()"
      >
        <app-icon name="accessible" [size]="22" />
        <span class="a11y__toggle-text">Acessibilidade</span>
      </button>

      @if (ui.open()) {
        <section
          #panel
          id="a11y-panel"
          class="a11y__panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="a11y-title"
          tabindex="-1"
        >
          <header class="a11y__head">
            <div>
              <p class="a11y__eyebrow">Ajustes</p>
              <h2 id="a11y-title">Acessibilidade</h2>
            </div>
            <button type="button" class="a11y__close" aria-label="Fechar" (click)="close()">
              <app-icon name="close" [size]="20" />
            </button>
          </header>

          <div class="a11y__row">
            <div>
              <strong>Alto contraste</strong>
              <p>Preto e branco com destaques fortes.</p>
            </div>
            <button
              type="button"
              class="switch"
              role="switch"
              [attr.aria-checked]="a11y.highContrast()"
              aria-label="Alto contraste"
              (click)="a11y.toggleContrast()"
            >
              <span class="switch__knob"></span>
            </button>
          </div>

          <div class="a11y__row a11y__row--stack">
            <div>
              <strong>Tamanho do texto</strong>
              <p>Escolha o tamanho mais confortável para ler.</p>
            </div>
            <div class="a11y__sizes" role="group" aria-label="Tamanho do texto">
              <button
                type="button"
                class="a11y__size"
                [attr.aria-pressed]="a11y.fontScale() === 100"
                (click)="a11y.setFontScale(100)"
              >
                A
              </button>
              <button
                type="button"
                class="a11y__size a11y__size--md"
                [attr.aria-pressed]="a11y.fontScale() === 112"
                (click)="a11y.setFontScale(112)"
              >
                A+
              </button>
              <button
                type="button"
                class="a11y__size a11y__size--lg"
                [attr.aria-pressed]="a11y.fontScale() === 125"
                (click)="a11y.setFontScale(125)"
              >
                A++
              </button>
            </div>
          </div>

          <div class="a11y__row">
            <div>
              <strong>Reduzir animações</strong>
              <p>Remove movimentos e transições.</p>
            </div>
            <button
              type="button"
              class="switch"
              role="switch"
              [attr.aria-checked]="a11y.reduceMotion()"
              aria-label="Reduzir animações"
              (click)="a11y.toggleReduceMotion()"
            >
              <span class="switch__knob"></span>
            </button>
          </div>

          <button type="button" class="a11y__reset" (click)="a11y.reset()">
            <app-icon name="refresh" [size]="16" />
            Restaurar padrão
          </button>

          <p class="a11y__note">As preferências ficam salvas neste navegador.</p>
        </section>
      }
    </div>
  `,
  styles: `
    .a11y {
      position: fixed;
      right: max(1rem, env(safe-area-inset-right));
      bottom: max(1rem, env(safe-area-inset-bottom));
      z-index: 60;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.6rem;
    }

    .a11y__toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 0.8rem;
      border: 2.5px solid var(--ink);
      border-radius: 200px 18px 200px 18px / 18px 200px 18px 200px;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--font-display);
      font-size: 1rem;
      box-shadow: 3px 3px 0 var(--ink);
      cursor: pointer;
    }

    .a11y__toggle:hover {
      background: var(--yellow-soft);
    }

    .a11y__panel {
      width: min(21rem, calc(100vw - 2rem));
      max-height: min(80dvh, 34rem);
      overflow: auto;
      padding: 1rem;
      border: 2.5px solid var(--ink);
      border-radius: 18px 6px 20px 8px / 8px 20px 6px 18px;
      background: var(--paper);
      box-shadow: 5px 5px 0 var(--ink);
    }

    .a11y__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.8rem;
    }

    .a11y__eyebrow {
      margin: 0 0 0.1rem;
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink-soft);
      font-weight: 800;
    }

    h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 400;
      line-height: 1;
    }

    .a11y__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border: 2px solid var(--ink);
      border-radius: 50%;
      background: transparent;
      color: var(--ink);
      cursor: pointer;
    }

    .a11y__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.8rem;
      padding: 0.7rem 0;
      border-top: 2px dashed var(--line);
    }

    .a11y__row--stack {
      flex-direction: column;
      align-items: stretch;
    }

    .a11y__row strong {
      font-size: 0.92rem;
    }

    .a11y__row p {
      margin: 0.15rem 0 0;
      font-size: 0.76rem;
      line-height: 1.3;
      color: var(--ink-soft);
    }

    .switch {
      flex: 0 0 auto;
      width: 2.9rem;
      height: 1.6rem;
      padding: 0.14rem;
      border: 2px solid var(--ink);
      border-radius: 999px;
      background: var(--paper-2);
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .switch[aria-checked='true'] {
      background: var(--green-soft);
      justify-content: flex-end;
    }

    .switch__knob {
      display: block;
      width: 1.05rem;
      height: 1.05rem;
      border: 2px solid var(--ink);
      border-radius: 50%;
      background: var(--paper);
      transition: transform 0.15s ease;
    }

    .switch[aria-checked='true'] .switch__knob {
      transform: translateX(1.15rem);
      background: var(--green);
    }

    .a11y__sizes {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.35rem;
    }

    .a11y__size {
      padding: 0.35rem;
      border: 2px solid var(--ink);
      border-radius: 10px 4px 12px 5px / 5px 12px 4px 10px;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--font-display);
      font-size: 0.95rem;
      cursor: pointer;
    }

    .a11y__size--md {
      font-size: 1.1rem;
    }

    .a11y__size--lg {
      font-size: 1.25rem;
    }

    .a11y__size[aria-pressed='true'] {
      background: var(--yellow);
      box-shadow: 2px 2px 0 var(--ink);
    }

    .a11y__reset {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      width: 100%;
      justify-content: center;
      margin-top: 0.6rem;
      padding: 0.5rem;
      border: 2px solid var(--ink);
      border-radius: 999px;
      background: transparent;
      color: var(--ink);
      font-family: var(--font-display);
      font-size: 0.95rem;
      cursor: pointer;
    }

    .a11y__note {
      margin: 0.6rem 0 0;
      font-size: 0.72rem;
      text-align: center;
      color: var(--ink-soft);
    }

    @media (max-width: 640px) {
      .a11y__toggle {
        display: none;
      }

      .a11y__toggle-text {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .a11y__panel {
        width: min(20rem, calc(100vw - 1.5rem));
        max-height: min(78dvh, 34rem);
      }
    }
  `,
})
export class AccessibilityPanel {
  protected readonly a11y = inject(AccessibilityService);
  protected readonly ui = inject(AccessibilityUiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly toggleButton =
    viewChild<ElementRef<HTMLButtonElement>>('toggle');

  constructor() {
    effect(() => {
      if (this.ui.open()) {
        this.focusPanel();
      }
    });
  }

  toggleFloating(): void {
    const trigger = this.toggleButton()?.nativeElement;
    if (trigger) {
      this.ui.toggleFrom(trigger);
    }
  }

  close(): void {
    this.ui.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.ui.open()) this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.ui.open()) return;
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.close();
    }
  }

  private focusPanel(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      this.panel()?.nativeElement.focus();
    }, 0);
  }
}

