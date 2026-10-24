import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type FontScale = 100 | 112 | 125;
export type ContrastMode = 'normal' | 'high';

interface StoredPreferences {
  contrast: ContrastMode;
  fontScale: FontScale;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'educa.a11y.v1';

/**
 * Preferências de acessibilidade aplicadas no elemento <html>.
 * O alto contraste, o tamanho do texto e a redução de movimento também
 * estão disponíveis por media queries do sistema operacional.
 */
@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _contrast = signal<ContrastMode>('normal');
  private readonly _fontScale = signal<FontScale>(100);
  private readonly _reduceMotion = signal(false);

  readonly contrast = this._contrast.asReadonly();
  readonly fontScale = this._fontScale.asReadonly();
  readonly reduceMotion = this._reduceMotion.asReadonly();
  readonly highContrast = computed(() => this._contrast() === 'high');

  constructor() {
    if (this.isBrowser) {
      afterNextRender(() => this.load());
    }
  }

  toggleContrast(): void {
    this.setContrast(this._contrast() === 'high' ? 'normal' : 'high');
  }

  setContrast(mode: ContrastMode): void {
    this._contrast.set(mode);
    this.apply();
    this.save();
  }

  setFontScale(scale: FontScale): void {
    this._fontScale.set(scale);
    this.apply();
    this.save();
  }

  increaseFont(): void {
    const next = this._fontScale() === 100 ? 112 : 125;
    this.setFontScale(next);
  }

  decreaseFont(): void {
    const next = this._fontScale() === 125 ? 112 : 100;
    this.setFontScale(next);
  }

  toggleReduceMotion(): void {
    this._reduceMotion.update((value) => !value);
    this.apply();
    this.save();
  }

  reset(): void {
    this._contrast.set('normal');
    this._fontScale.set(100);
    this._reduceMotion.set(false);
    this.apply();
    this.save();
  }

  private apply(): void {
    if (!this.isBrowser) return;

    const root = this.document.documentElement;
    root.dataset['contrast'] = this._contrast();
    root.dataset['motion'] = this._reduceMotion() ? 'reduced' : 'normal';
    root.style.setProperty('--font-scale', String(this._fontScale() / 100));
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
        if (parsed.contrast === 'high' || parsed.contrast === 'normal') {
          this._contrast.set(parsed.contrast);
        }
        if (
          parsed.fontScale === 100 ||
          parsed.fontScale === 112 ||
          parsed.fontScale === 125
        ) {
          this._fontScale.set(parsed.fontScale);
        }
        this._reduceMotion.set(Boolean(parsed.reduceMotion));
      }
    } catch {
      // Preferências inválidas não impedem o uso da plataforma.
    }

    this.apply();
  }

  private save(): void {
    if (!this.isBrowser) return;

    try {
      const preferences: StoredPreferences = {
        contrast: this._contrast(),
        fontScale: this._fontScale(),
        reduceMotion: this._reduceMotion(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Modo privado: aplica apenas durante a sessão.
    }
  }
}
