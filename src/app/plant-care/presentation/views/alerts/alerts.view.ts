import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertFacade } from '../../../application/facades/alert.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-alerts-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="alerts page-card">
      <header class="alerts__header">
        <div>
          <p class="alerts__eyebrow">{{ 'alerts:list.eyebrow' | t:'Monitoreo' }}</p>
          <h2>{{ 'alerts:list.title' | t:'Alertas recientes' }}</h2>
          <p>{{ 'alerts:list.subtitle' | t:'Visualiza eventos críticos y actúa rápido.' }}</p>
        </div>
        <div class="alerts__actions">
          <button class="btn" type="button" (click)="refresh()">
            {{ 'alerts:list.actions.refresh' | t:'Actualizar' }}
          </button>
          <button class="btn btn--ghost" type="button" (click)="resetFilters()">
            {{ 'alerts:list.actions.reset' | t:'Restablecer' }}
          </button>
        </div>
      </header>

      <form [formGroup]="filters" (ngSubmit)="applyFilters()" class="alerts__filters">
        <input
          placeholder="{{ 'alerts:list.filters.plant' | t:'Planta' }}"
          formControlName="plantId"
        />
        <input
          placeholder="{{ 'alerts:list.filters.sensor' | t:'Sensor' }}"
          formControlName="sensorId"
        />
        <input
          placeholder="{{ 'alerts:list.filters.type' | t:'Tipo' }}"
          formControlName="type"
        />
        <button type="submit" class="btn btn--outline">
          {{ 'alerts:list.filters.apply' | t:'Filtrar' }}
        </button>
      </form>

      <article *ngFor="let alert of alerts()" class="alert-card">
        <div class="alert-card__header">
          <strong>{{ alert.type }}</strong>
          <span class="badge" [ngClass]="badgeClass(alert.status)">
            {{
              getStatusCopy(alert.status).key
                | t:getStatusCopy(alert.status).fallback
            }}
          </span>
        </div>
        <p>{{ alert.message }}</p>
        <small class="alert-card__meta">
          {{ 'alerts:list.meta.plant' | t:'Planta:' }}
          <ng-container *ngIf="alert.plantId; else noPlant">
            <a [routerLink]="['/plants', alert.plantId]">{{ alert.plantId }}</a>
          </ng-container>
          <ng-template #noPlant>
            {{ 'common:generic.na' | t:'N/A' }}
          </ng-template>
          ·
          {{ 'alerts:list.meta.sensor' | t:'Sensor:' }}
          {{ alert.sensorId || ('common:generic.na' | t:'N/A') }}
          ·
          {{ alert.occurredAt | date: 'short' }}
        </small>
        <div class="alert-card__actions" *ngIf="alert.status !== 'RESOLVED'">
          <button class="btn btn--outline" type="button" (click)="resolve(alert.id)">
            {{ 'alerts:list.actions.resolve' | t:'Marcar como resuelta' }}
          </button>
        </div>
      </article>

      <p *ngIf="!alerts().length && !isLoading()" class="alerts__empty">
        {{ 'alerts:list.empty' | t:'Sin alertas.' }}
      </p>

      <div class="alerts__pagination" *ngIf="alerts().length">
        <button class="btn btn--outline" type="button" (click)="previousPage()" [disabled]="page() === 0">
          {{ 'alerts:list.pagination.previous' | t:'Anterior' }}
        </button>
        <span>
          {{ 'alerts:list.pagination.page' | t:'Página' }} {{ page() + 1 }}
        </span>
        <button class="btn btn--outline" type="button" (click)="nextPage()" [disabled]="!hasMore()">
          {{ 'alerts:list.pagination.next' | t:'Siguiente' }}
        </button>
      </div>
    </section>
  `,
  styles: [`
      .alerts__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .alerts__actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .alerts__filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .alert-card {
        border: 1px solid var(--color-border);
        border-radius: 0.75rem;
        padding: 1rem;
        background: var(--color-surface);
        margin-bottom: 0.75rem;
      }
      .alert-card__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .alert-card__actions {
        margin-top: 0.5rem;
      }
      .alerts__pagination {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-top: 1rem;
      }
    `]
})
export class AlertsViewComponent implements OnInit {
  private readonly alertFacade = inject(AlertFacade);
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly statusCopies = {
    OPEN: { key: 'alerts:status.open', fallback: 'Abierta' },
    ACKNOWLEDGED: { key: 'alerts:status.acknowledged', fallback: 'Reconocida' },
    RESOLVED: { key: 'alerts:status.resolved', fallback: 'Resuelta' },
    default: { key: 'alerts:status.unknown', fallback: 'Estado desconocido' }
  };

  readonly alerts = this.alertFacade.alerts;
  readonly isLoading = this.alertFacade.isLoading;
  readonly page = this.alertFacade.page;
  readonly hasMore = this.alertFacade.hasMore;

  readonly filters = this.fb.nonNullable.group({
    plantId: [''],
    sensorId: [''],
    type: ['']
  });

  ngOnInit(): void {
    this.i18n.loadNamespace('alerts');
    this.alertFacade.load();
  }

  applyFilters() {
    this.alertFacade.load(this.filters.getRawValue());
  }

  resetFilters() {
    this.filters.reset({ plantId: '', sensorId: '', type: '' });
    this.applyFilters();
  }

  refresh() {
    this.alertFacade.load(this.filters.getRawValue());
  }

  badgeClass(status: string) {
    switch (status) {
      case 'RESOLVED':
        return 'badge--success';
      case 'ACKNOWLEDGED':
        return 'badge--warning';
      default:
        return 'badge--danger';
    }
  }

  nextPage() {
    this.alertFacade.nextPage();
  }

  previousPage() {
    this.alertFacade.previousPage();
  }

  resolve(alertId: string) {
    this.alertFacade.resolve(alertId);
  }

  getStatusCopy(status?: string | null) {
    if (!status) {
      return this.statusCopies.default;
    }
    return this.statusCopies[status as keyof typeof this.statusCopies] ?? this.statusCopies.default;
  }
}
