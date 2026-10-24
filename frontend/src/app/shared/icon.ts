import { Component, input } from '@angular/core';
import type { IconName } from '../core/models';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      [attr.fill]="filled() ? 'currentColor' : 'none'"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('coin') {
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v9" />
          <path d="M14.6 9.4c-.6-.7-1.6-1.1-2.8-1.1-1.6 0-2.7.8-2.7 1.9 0 1.3 1.2 1.8 3 2.1 1.9.3 2.8.8 2.8 2.1 0 1.2-1.1 2-2.9 2-1.3 0-2.4-.4-3-1.2" />
        }
        @case ('flag') {
          <path d="M6 21V4" />
          <path d="M6 5h10l-2.2 3.5L16 12H6" />
        }
        @case ('star') {
          <path d="M12 3.6l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" />
        }
        @case ('wallet') {
          <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18a2 2 0 0 1 2 2v10H6.5A2.5 2.5 0 0 1 4 15.5z" />
          <path d="M4 9h16" />
          <circle cx="16.5" cy="12.5" r="1" />
        }
        @case ('cart') {
          <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H6" />
          <circle cx="9.5" cy="19" r="1.2" />
          <circle cx="17" cy="19" r="1.2" />
        }
        @case ('check') {
          <path d="M4.5 12.5l4.5 4.5 10-10" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5M11 18l-6-6 6-6" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('arrow-up-right') {
          <path d="M7 17L17 7M9 7h8v8" />
        }
        @case ('trophy') {
          <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
          <path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3" />
          <path d="M12 13v4M9 20h6M10 17h4" />
        }
        @case ('book') {
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22z" />
          <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22z" />
        }
        @case ('chart') {
          <path d="M4 20V4M4 20h16" />
          <path d="M8 16v-4M12 16V8M16 16v-6" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
          <circle cx="17" cy="9" r="2.3" />
          <path d="M16 15c2.8.2 5 1.8 5 5" />
        }
        @case ('logout') {
          <path d="M15 4h4v16h-4" />
          <path d="M10 8l-4 4 4 4M6 12h9" />
        }
        @case ('download') {
          <path d="M12 4v11M8 11l4 4 4-4M5 20h14" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        }
        @case ('eye') {
          <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="2.7" />
        }
        @case ('eye-off') {
          <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="2.7" />
          <path d="M4 4l16 16" />
        }
        @case ('lock') {
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        }
        @case ('user') {
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" />
        }
        @case ('sparkles') {
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3.5 2" />
        }
        @case ('target') {
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" />
        }
        @case ('piggy') {
          <path d="M4.5 12a7 7 0 0 1 7-7H13a6.5 6.5 0 0 1 6.3 4.8l1.2.7v3l-2 .5a6.5 6.5 0 0 1-2.4 2.5V19h-3v-1.5h-3V19H8v-2.2A7 7 0 0 1 4.5 12z" />
          <circle cx="16" cy="11" r="0.8" fill="currentColor" stroke="none" />
          <path d="M9 5.5L10 3M12.5 5V2.5" />
        }
        @case ('receipt') {
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        }
        @case ('tag') {
          <path d="M3.5 12.2V4.5H11l9.5 9.5-7 7z" />
          <circle cx="8" cy="8" r="1.3" />
        }
        @case ('percent') {
          <path d="M5 19L19 5" />
          <circle cx="7" cy="7" r="2.2" />
          <circle cx="17" cy="17" r="2.2" />
        }
        @case ('accessible') {
          <circle cx="13" cy="4.5" r="1.8" />
          <path d="M13 8v6h4l2 6" />
          <path d="M8 10h5M8 10a5.5 5.5 0 1 0 5 8" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6L6 18" />
        }
        @case ('chevron-down') {
          <path d="M6 9l6 6 6-6" />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('home') {
          <path d="M3.5 11L12 3.5 20.5 11" />
          <path d="M5.5 9.5V20h13V9.5" />
          <path d="M10 20v-5h4v5" />
        }
        @case ('list-checks') {
          <path d="M4 6.5l2 2 3-3M4 15.5l2 2 3-3" />
          <path d="M12 7h8M12 16h8" />
        }
        @case ('award') {
          <circle cx="12" cy="10" r="5" />
          <path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" />
        }
        @case ('info') {
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 11v5M12 8h.01" />
        }
        @case ('alert') {
          <path d="M12 3.5L21 20H3z" />
          <path d="M12 9v5M12 17h.01" />
        }
        @case ('lightbulb') {
          <path d="M9 18h6M10 21h4" />
          <path d="M8 13a5 5 0 1 1 8 0c-.8 1-1 1.5-1 3H9c0-1.5-.2-2-1-3z" />
        }
        @case ('play') {
          <path d="M8 5.5v13l11-6.5z" />
        }
        @case ('refresh') {
          <path d="M20 8a8 8 0 1 0 1 6" />
          <path d="M20 3v5h-5" />
        }
        @case ('print') {
          <path d="M7 8V3h10v5" />
          <rect x="4" y="8" width="16" height="8" rx="2" />
          <path d="M7 14h10v7H7z" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('minus') {
          <path d="M5 12h14" />
        }
        @case ('filter') {
          <path d="M3 5h18l-7 8v6l-4 2v-8z" />
        }
        @case ('medal') {
          <circle cx="12" cy="9" r="4" />
          <path d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: 0 0 auto;
      line-height: 0;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);
  readonly filled = input(false);
  readonly strokeWidth = input(2);
}
