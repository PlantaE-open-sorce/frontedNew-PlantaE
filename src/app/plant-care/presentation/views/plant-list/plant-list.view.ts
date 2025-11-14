import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-plant-list-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="plant-list">
      <header class="plant-list__header">
        <div>
          <h2>{{ 'plants:list.title' | t:'Plantas registradas' }}</h2>
          <p class="plant-list__subtitle">
            {{ 'plants:list.subtitle' | t:'Gestiona tus cultivos desde un solo lugar.' }}
          </p>
        </div>
        <div class="plant-list__actions">
          <a class="btn" routerLink="/plants/new">{{ 'plants:list.add' | t:'Agregar planta' }}</a>
          <button type="button" class="btn btn--ghost" (click)="refresh()">
            {{ 'plants:list.actions.refresh' | t:'Actualizar' }}
          </button>
        </div>
      </header>

      <form [formGroup]="filters" (ngSubmit)="applyFilters()" class="plant-list__filters">
        <div class="plant-list__filters-grid">
          <label>
            <span>{{ 'plants:list.filters.name' | t:'Nombre' }}</span>
            <input
              formControlName="name"
              type="text"
              [placeholder]="'plants:list.filters.name' | t:'Nombre'"
            />
          </label>
          <label>
            <span>{{ 'plants:list.filters.species' | t:'Especie' }}</span>
            <input
              formControlName="species"
              type="text"
              [placeholder]="'plants:list.filters.species' | t:'Especie'"
            />
          </label>
          <label>
            <span>{{ 'plants:list.filters.status.all' | t:'Estado' }}</span>
            <select formControlName="status">
              <option *ngFor="let option of statusOptions" [value]="option.value">
                {{ option.label | t:option.fallback }}
              </option>
            </select>
          </label>
        </div>
        <div class="plant-list__filters-actions">
          <button type="submit" class="btn btn--outline">
            {{ 'plants:list.filters.search' | t:'Buscar' }}
          </button>
          <button type="button" class="btn btn--ghost" (click)="resetFilters()">
            {{ 'plants:list.filters.clear' | t:'Limpiar' }}
          </button>
        </div>
        <p class="plant-list__filters-hint">
          {{
            'plants:list.filters.helper'
              | t:'Combina filtros para encontrar plantas rápidamente.'
          }}
        </p>
      </form>

      <div *ngIf="loading()" class="plant-list__loading">
        {{ 'plants:list.loading' | t:'Cargando...' }}
      </div>

      <div *ngIf="!loading() && plants().length" class="plant-list__cards">
        <article class="plant-card" *ngFor="let plant of plants()">
          <header>
            <p class="plant-card__label">{{ plant.species }}</p>
            <h3>{{ plant.name }}</h3>
            <span class="plant-card__status" [class.alert]="plant.status === 'NEEDS_ATTENTION'">
              {{
                statusCopy(plant.status).key
                  | t:statusCopy(plant.status).fallback
              }}
            </span>
          </header>
          <dl>
            <div>
              <dt>{{ 'plants:list.sensor' | t:'Sensor' }}</dt>
              <dd>{{ plant.sensorId ?? ('plants:list.unassigned' | t:'Sin asignar') }}</dd>
            </div>
            <div>
              <dt>{{ 'plants:list.device' | t:'Dispositivo' }}</dt>
              <dd>{{ plant.deviceId ?? ('plants:list.unassigned' | t:'Sin asignar') }}</dd>
            </div>
          </dl>
          <a class="btn btn--outline" [routerLink]="['/plants', plant.id]">
            {{ 'plants:list.view' | t:'Ver detalle' }}
          </a>
        </article>
      </div>

      <p *ngIf="!loading() && !plants().length" class="plant-list__empty">
        {{ 'plants:list.empty' | t:'No encontramos plantas con esos filtros.' }}
      </p>

      <nav *ngIf="pageInfo()" class="plant-list__pagination">
        <button
          type="button"
          class="btn btn--outline"
          (click)="changePage(-1)"
          [disabled]="(pageInfo()?.page ?? 0) === 0"
        >
          {{ 'plants:list.pagination.previous' | t:'Anterior' }}
        </button>
        <span>
          {{ 'plants:list.pagination.page' | t:'Página' }}
          {{ (pageInfo()?.page ?? 0) + 1 }}
          {{ 'plants:list.pagination.of' | t:'de' }}
          {{ pageInfo()?.totalPages ?? 1 }}
        </span>
        <button
          type="button"
          class="btn btn--outline"
          (click)="changePage(1)"
          [disabled]="isLastPage()"
        >
          {{ 'plants:list.pagination.next' | t:'Siguiente' }}
        </button>
      </nav>
    </section>
  `,
  styles: [
    `
      .plant-list__header {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: space-between;
        align-items: flex-start;
      }
      .plant-list__header > div {
        flex: 1;
      }
      .plant-list__actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
      }
      .plant-list__subtitle {
        margin: 0.2rem 0 0;
        color: var(--color-muted);
      }
      .plant-list__filters {
        margin: 1.25rem 0;
        padding: 1rem 1.25rem;
        border-radius: 1rem;
        border: 1px dashed rgba(15, 61, 46, 0.18);
        background: #f6faf6;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .plant-list__filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.85rem;
      }
      .plant-list__filters label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: var(--color-muted);
      }
      .plant-list__filters-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.75rem;
      }
      .plant-list__filters-hint {
        margin: 0;
        font-size: 0.85rem;
        color: var(--color-muted);
      }
      .plant-list__cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }
      .plant-card {
        border: 1px solid var(--color-border);
        border-radius: 1rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: var(--color-surface);
      }
      .plant-card header {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .plant-card__label {
        margin: 0;
        color: var(--color-muted);
        font-size: 0.85rem;
      }
      .plant-card__status {
        display: inline-flex;
        padding: 0.15rem 0.6rem;
        border-radius: 999px;
        background: rgba(47, 133, 90, 0.1);
        color: var(--color-primary);
        font-size: 0.8rem;
        font-weight: 600;
      }
      .plant-card__status.alert {
        background: rgba(229, 62, 62, 0.1);
        color: #b02a37;
      }
      .plant-card dl {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem 1rem;
        margin: 0;
      }
      .plant-card dt {
        font-size: 0.75rem;
        color: var(--color-muted);
      }
      .plant-card dd {
        margin: 0;
        font-weight: 600;
        color: var(--color-primary);
      }
      .plant-list__pagination {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      @media (max-width: 600px) {
        .plant-list__filters-actions {
          flex-direction: column;
        }
        .plant-list__filters-actions .btn {
          width: 100%;
        }
      }
    `
  ]
})
export class PlantListViewComponent implements OnInit {
  private readonly plantFacade = inject(PlantFacade);
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly statusCopies = {
    ACTIVE: { key: 'plants:list.status.active', fallback: 'Activa' },
    INACTIVE: { key: 'plants:list.status.inactive', fallback: 'Inactiva' },
    HEALTHY: { key: 'plants:list.status.healthy', fallback: 'Saludable' },
    NEEDS_ATTENTION: { key: 'plants:list.status.alert', fallback: 'Atención' },
    default: { key: 'plants:list.status.unknown', fallback: 'Sin estado' }
  };

  readonly plants = this.plantFacade.plants;
  readonly loading = this.plantFacade.loading;
  readonly pageInfo = this.plantFacade.pageInfo;
  readonly statusOptions = [
    { value: '', label: 'plants:list.filters.status.all', fallback: 'Todos' },
    { value: 'ACTIVE', label: 'plants:list.filters.status.active', fallback: 'Activa' },
    { value: 'INACTIVE', label: 'plants:list.filters.status.inactive', fallback: 'Inactiva' },
    {
      value: 'NEEDS_ATTENTION',
      label: 'plants:list.filters.status.alert',
      fallback: 'Atención'
    }
  ];

  readonly filters = this.fb.nonNullable.group({
    name: [''],
    species: [''],
    status: ['']
  });

  ngOnInit(): void {
    this.i18n.loadNamespace('plants');
    this.refresh();
  }

  applyFilters() {
    this.plantFacade.loadPlants({ ...this.filters.getRawValue(), page: 0 });
  }

  resetFilters() {
    this.filters.reset({ name: '', species: '', status: '' });
    this.applyFilters();
  }

  refresh() {
    this.plantFacade.loadPlants({ page: 0 });
  }

  changePage(delta: number) {
    const currentPage = this.pageInfo()?.page ?? 0;
    const nextPage = Math.max(0, currentPage + delta);
    this.plantFacade.loadPlants({ ...this.filters.getRawValue(), page: nextPage });
  }

  isLastPage() {
    const info = this.pageInfo();
    if (!info) {
      return true;
    }
    return info.page >= info.totalPages - 1;
  }

  statusCopy(status?: string | null) {
    if (!status) {
      return this.statusCopies.default;
    }
    return this.statusCopies[status as keyof typeof this.statusCopies] ?? this.statusCopies.default;
  }
}
