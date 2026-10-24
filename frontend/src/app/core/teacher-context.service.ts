import { Injectable, computed, inject, signal } from '@angular/core';
import { DataService } from './data.service';
import { SessionService } from './session.service';
import type { ClassGroup } from './models';

/** Mantém a turma selecionada sincronizada entre as telas do professor. */
@Injectable({ providedIn: 'root' })
export class TeacherContextService {
  private readonly data = inject(DataService);
  private readonly sessions = inject(SessionService);

  private readonly _selectedClassId = signal<string | null>(null);

  readonly classes = computed<ClassGroup[]>(() =>
    this.data.classesForTeacher(this.sessions.session()?.teacherId),
  );

  readonly currentClassId = computed(() => {
    const classes = this.classes();
    const selected = this._selectedClassId();
    if (selected && classes.some((group) => group.id === selected)) {
      return selected;
    }
    return classes[0]?.id ?? '';
  });

  readonly currentClass = computed<ClassGroup | undefined>(() =>
    this.data.classById(this.currentClassId()),
  );

  select(classId: string): void {
    if (!classId) return;
    if (!this.classes().some((group) => group.id === classId)) return;
    this._selectedClassId.set(classId);
  }
}
