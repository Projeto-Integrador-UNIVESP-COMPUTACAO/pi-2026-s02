import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccessibilityPanel } from './shared/accessibility-panel';
import { ToastHost } from './shared/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AccessibilityPanel, ToastHost],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
