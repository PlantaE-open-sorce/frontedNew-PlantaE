import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HomeFacade } from '../../../application/facades/home.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="dashboard page-grid">
      <section class="page-card dashboard__hero">
        <header>
          <p class="dashboard__eyebrow">{{ 'dashboard:eyebrow' | t:'Resumen diario' }}</p>
          <h1>{{ dashboard()?.greeting ?? ('dashboard:title' | t:'Aún no tienes plantas registradas') }}</h1>
          <p>
            {{
              dashboard()?.tipOfTheDay
                ?? ('dashboard:subtitle' | t:'Rota tus macetas para un crecimiento uniforme.')
            }}
          </p>
        </header>
        <div class="dashboard__grid" *ngIf="dashboard()?.plants?.length; else emptyState">
          <article class="dashboard-card" *ngFor="let plant of dashboard()?.plants">
            <p class="dashboard-card__label">{{ plant.species }}</p>
            <h3>{{ plant.name }}</h3>
            <span [class.alert]="plant.hasAlerts">{{ plant.status }}</span>
          </article>
        </div>
        <ng-template #emptyState>
          <p class="dashboard__empty">
            {{ 'dashboard:empty' | t:'Registra tu primera planta para verla aquí.' }}
          </p>
        </ng-template>
      </section>

      <section class="page-card">
        <h2>{{ 'dashboard:manual.title' | t:'Registrar acción manual' }}</h2>
        <form [formGroup]="manualActionForm" (ngSubmit)="registerAction()" class="manual-form">
          <label>
            <span>{{ 'dashboard:manual.type' | t:'Tipo' }}</span>
            <input formControlName="actionType" placeholder="{{ 'dashboard:manual.typePlaceholder' | t:'Riego, Fertilización...' }}" />
          </label>
          <label>
            <span>{{ 'dashboard:manual.notes' | t:'Notas' }}</span>
            <textarea formControlName="notes" placeholder="{{ 'dashboard:manual.notesPlaceholder' | t:'Observaciones adicionales' }}"></textarea>
          </label>
          <div class="manual-form__split">
            <label>
              <span>{{ 'dashboard:manual.datetime' | t:'Fecha y hora' }}</span>
              <input formControlName="performedAt" type="datetime-local" />
            </label>
            <label>
              <span>{{ 'dashboard:manual.duration' | t:'Duración (min)' }}</span>
              <input formControlName="durationMinutes" type="number" min="0" />
            </label>
          </div>
          <div class="form-grid__actions manual-form__actions">
            <button type="submit" class="btn" [disabled]="manualActionForm.invalid || isActionsLoading()">
              {{ 'dashboard:manual.action' | t:'Registrar' }}
            </button>
          </div>
        </form>
      </section>

      <section class="page-card">
        <h2>{{ 'dashboard:recent.title' | t:'Últimas acciones' }}</h2>
        <ul class="actions-list" *ngIf="manualActions()?.length; else noActions">
          <li *ngFor="let action of manualActions()">
            <div>
              <strong>{{ action.actionType }}</strong>
              <p>{{ action.notes || ('dashboard:recent.noNotes' | t:'Sin notas') }}</p>
            </div>
            <span>{{ action.performedAt | date: 'short' }}</span>
          </li>
        </ul>
        <ng-template #noActions>
          <p class="dashboard__empty">
            {{ 'dashboard:recent.empty' | t:'Todavía no registras acciones.' }}
          </p>
        </ng-template>
      </section>
    </div>
  `,
  styles: [
    `
      .dashboard__hero header {
        margin-bottom: 1rem;
      }
      .dashboard__eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--color-muted);
        margin: 0 0 0.25rem;
      }
      .dashboard__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }
      .dashboard-card {
        border-radius: 1rem;
        border: 1px solid var(--color-border);
        padding: 1rem;
        background: #fff;
      }
      .dashboard-card__label {
        margin: 0;
        color: var(--color-muted);
        font-size: 0.85rem;
      }
      .dashboard-card h3 {
        margin: 0.3rem 0;
      }
      .dashboard-card span.alert {
        color: #b02a37;
        font-weight: 600;
      }
      .dashboard__empty {
        margin: 0;
        color: var(--color-muted);
      }
      .manual-form {
        display: grid;
        gap: 1rem;
      }
      .manual-form label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--color-primary);
      }
      .manual-form input,
      .manual-form textarea {
        padding: 0.85rem 1rem;
        border-radius: 0.9rem;
        border: 1px solid var(--color-border);
        background: #f7fbf8;
      }
      .manual-form textarea {
        min-height: 90px;
      }
      .manual-form__split {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
      }
      .manual-form__actions {
        justify-content: flex-end;
      }
      .actions-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .actions-list li {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--color-border);
      }
      .actions-list li:last-child {
        border-bottom: none;
      }
      .actions-list p {
        margin: 0.15rem 0 0;
        color: var(--color-muted);
        font-size: 0.85rem;
      }
    `
  ]
})
export class DashboardViewComponent implements OnInit {
  private readonly homeFacade = inject(HomeFacade);
  private readonly fb = inject(FormBuilder);

  readonly dashboard = this.homeFacade.dashboard;
  readonly manualActions = this.homeFacade.manualActions;
  readonly isDashboardLoading = this.homeFacade.isDashboardLoading;
  readonly isActionsLoading = this.homeFacade.isActionsLoading;

  readonly manualActionForm = this.fb.nonNullable.group({
    actionType: ['', Validators.required],
    notes: [''],
    performedAt: [''],
    durationMinutes: [0]
  });

  ngOnInit(): void {
    this.homeFacade.loadDashboard();
    this.homeFacade.loadManualActions();
  }

  registerAction() {
    if (this.manualActionForm.invalid) {
      return;
    }
    const { actionType, notes, performedAt, durationMinutes } = this.manualActionForm.getRawValue();
    this.homeFacade.registerManualAction({
      actionType,
      notes,
      performedAt: performedAt ? new Date(performedAt).toISOString() : undefined,
      durationMinutes: durationMinutes ?? undefined
    });
    this.manualActionForm.reset({ actionType: '', notes: '', performedAt: '', durationMinutes: 0 });
  }
}
