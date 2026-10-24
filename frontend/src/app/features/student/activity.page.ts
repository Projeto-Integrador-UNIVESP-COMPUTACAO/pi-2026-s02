import {
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { SessionService } from '../../core/session.service';
import { PASS_THRESHOLD } from '../../core/gamification';
import { parseNumericAnswer } from '../../core/format';
import { BadgeCard } from '../../shared/badge-card';
import { Icon } from '../../shared/icon';
import { ProgressBar } from '../../shared/progress-bar';
import { StarRating } from '../../shared/star-rating';
import type { CompletionOutcome, Question } from '../../core/models';

@Component({
  selector: 'app-activity-page',
  imports: [RouterLink, BadgeCard, Icon, ProgressBar, StarRating],
  templateUrl: './activity.page.html',
  styleUrl: './activity.page.css',
})
export class ActivityPage implements OnInit {
  private readonly data = inject(DataService);
  private readonly sessions = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly missionId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly activity = computed(() =>
    this.data.activityById(this.missionId),
  );
  protected readonly student = computed(() =>
    this.data.studentById(this.sessions.session()?.studentId),
  );
  protected readonly record = computed(() =>
    this.data.recordFor(this.student()?.id, this.missionId),
  );

  protected readonly index = signal(0);
  protected readonly answerText = signal('');
  protected readonly selectedOption = signal<string | null>(null);
  protected readonly checked = signal(false);
  protected readonly feedback = signal<'correct' | 'wrong' | null>(null);
  protected readonly results = signal<boolean[]>([]);
  protected readonly errors = signal(0);
  protected readonly hintOpen = signal(false);
  protected readonly inputError = signal<string | null>(null);
  protected readonly finished = signal(false);
  protected readonly outcome = signal<CompletionOutcome | null>(null);

  protected readonly total = computed(
    () => this.activity()?.questions.length ?? 0,
  );
  protected readonly question = computed<Question | undefined>(
    () => this.activity()?.questions[this.index()],
  );
  protected readonly isLast = computed(
    () => this.index() === this.total() - 1,
  );
  protected readonly progressPct = computed(() => {
    const total = this.total();
    if (total === 0) return 0;
    return Math.round(((this.index() + (this.checked() ? 1 : 0)) / total) * 100);
  });
  protected readonly correctCount = computed(
    () => this.results().filter(Boolean).length,
  );
  protected readonly score = computed(() => {
    const total = this.total();
    return total === 0
      ? 0
      : Math.round((this.correctCount() / total) * 100);
  });
  protected readonly review = computed(() => {
    const questions = this.activity()?.questions ?? [];
    const results = this.results();
    return questions.map((question, index) => ({
      question,
      correct: results[index] ?? false,
    }));
  });
  protected readonly unitPrefix = computed(() =>
    this.question()?.unit === 'brl' ? 'R$' : '',
  );
  protected readonly unitSuffix = computed(() => {
    switch (this.question()?.unit) {
      case 'weeks':
        return 'semanas';
      case 'percent':
        return '%';
      default:
        return '';
    }
  });

  ngOnInit(): void {
    const activity = this.activity();
    if (!activity) {
      this.router.navigateByUrl('/aluno/missoes');
      return;
    }

    if (!this.student()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.title.setTitle(`${activity.title} · Educa$`);
  }

  protected onAnswerInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.answerText.set(value);
    this.inputError.set(null);
  }

  protected selectOption(optionId: string): void {
    if (this.checked()) return;
    this.selectedOption.set(optionId);
    this.inputError.set(null);
  }

  protected toggleHint(): void {
    this.hintOpen.update((value) => !value);
  }

  protected checkAnswer(): void {
    if (this.checked()) return;

    const question = this.question();
    if (!question) return;

    let correct = false;

    if (question.kind === 'numeric') {
      const parsed = parseNumericAnswer(this.answerText());
      if (parsed === null) {
        this.inputError.set('Digite um número para conferir sua resposta.');
        return;
      }
      const expected = question.answer as number;
      const tolerance = question.tolerance ?? 0.01;
      correct = Math.abs(parsed - expected) <= tolerance + 1e-9;
    } else {
      if (!this.selectedOption()) {
        this.inputError.set('Escolha uma das opções antes de conferir.');
        return;
      }
      correct = this.selectedOption() === question.answer;
    }

    const updatedResults = [...this.results()];
    updatedResults[this.index()] = correct;
    this.results.set(updatedResults);

    if (!correct) {
      this.errors.update((count) => count + 1);
    }

    this.inputError.set(null);
    this.feedback.set(correct ? 'correct' : 'wrong');
    this.checked.set(true);
    this.focus('feedback-box');
  }

  protected retryQuestion(): void {
    this.checked.set(false);
    this.feedback.set(null);
    this.answerText.set('');
    this.selectedOption.set(null);
    this.inputError.set(null);
    this.focus('question-title');
  }

  protected next(): void {
    if (this.isLast()) {
      this.finish();
      return;
    }

    this.index.update((index) => index + 1);
    this.resetQuestion();
    this.focus('question-title');
  }

  protected skipAndNext(): void {
    if (this.isLast()) {
      this.finish();
      return;
    }

    this.index.update((index) => index + 1);
    this.resetQuestion();
    this.focus('question-title');
  }

  protected restart(): void {
    this.index.set(0);
    this.answerText.set('');
    this.selectedOption.set(null);
    this.checked.set(false);
    this.feedback.set(null);
    this.results.set([]);
    this.errors.set(0);
    this.hintOpen.set(false);
    this.inputError.set(null);
    this.finished.set(false);
    this.outcome.set(null);
    this.scrollTop();
    this.focus('question-title');
  }

  protected letter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  private resetQuestion(): void {
    this.answerText.set('');
    this.selectedOption.set(null);
    this.checked.set(false);
    this.feedback.set(null);
    this.hintOpen.set(false);
    this.inputError.set(null);
  }

  private finish(): void {
    const activity = this.activity();
    const student = this.student();
    if (!activity || !student) return;

    const score = this.score();
    const passed = score >= PASS_THRESHOLD;
    const outcome = this.data.recordAttempt(
      student.id,
      activity.id,
      score,
      this.errors(),
      passed,
    );

    this.outcome.set(outcome);
    this.finished.set(true);
    this.title.setTitle(
      `${passed ? 'Missão concluída' : 'Tente novamente'} · ${activity.title} · Educa$`,
    );
    this.scrollTop();
    this.focus('result-title');
  }

  private scrollTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private focus(elementId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      document.getElementById(elementId)?.focus();
    }, 0);
  }
}
