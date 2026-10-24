import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Icon } from '../../shared/icon';
import { AccessibilityTrigger } from '../../shared/accessibility-trigger';

type DemoRole = 'student' | 'teacher';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, Icon, AccessibilityTrigger],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly demos = [
    {
      role: 'student' as const,
      title: 'Aluno',
      subtitle: 'Lucas S. · 5º ano A',
      id: '345G7B',
      password: '1234567890',
    },
    {
      role: 'teacher' as const,
      title: 'Professor',
      subtitle: 'Prof. José Guilherme',
      id: 'PROF-001',
      password: 'professor123',
    },
  ];

  protected submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { identifier, password } = this.form.getRawValue();

    this.auth.login(identifier, password).subscribe({
      next: ({ session }) => {
        this.loading.set(false);
        this.router.navigateByUrl(this.targetUrl(session.role), {
          replaceUrl: true,
        });
      },
      error: (cause: unknown) => {
        this.loading.set(false);
        this.error.set(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível entrar. Tente novamente.',
        );
      },
    });
  }

  protected fillDemo(role: DemoRole): void {
    const demo = this.demos.find((item) => item.role === role);
    if (!demo) return;

    this.form.setValue({ identifier: demo.id, password: demo.password });
    this.submit();
  }

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  private targetUrl(role: 'student' | 'teacher'): string {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    const safeRedirect =
      redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : null;

    if (role === 'student' && safeRedirect?.startsWith('/aluno')) {
      return safeRedirect;
    }
    if (role === 'teacher' && safeRedirect?.startsWith('/professor')) {
      return safeRedirect;
    }

    return role === 'teacher' ? '/professor/turmas' : '/aluno/painel';
  }
}
