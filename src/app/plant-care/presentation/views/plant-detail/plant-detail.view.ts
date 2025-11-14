import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-plant-detail-view',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <section class="plant-detail page-card">
      <button type="button" class="btn btn--outline plant-detail__back" (click)="goBack()">
        {{ 'common:actions.back' | t:'Volver' }}
      </button>
      <ng-container *ngIf="plant(); else loading">
        <header class="plant-detail__header">
          <div>
            <p class="plant-detail__eyebrow">{{ plant()?.species }}</p>
            <h2>{{ plant()?.name }}</h2>
          </div>
          <span class="badge plant-detail__status">
            {{ plant()?.status ?? ('plants:detail.status.unknown' | t:'Sin estado') }}
          </span>
        </header>
        <dl>
          <div><strong>{{ 'plants:detail.fields.species' | t:'Especie:' }}</strong> {{ plant()?.species }}</div>
          <div>
            <strong>{{ 'plants:detail.fields.sensor' | t:'Sensor:' }}</strong>
            {{ plant()?.sensorId ?? ('plants:detail.unassigned' | t:'Sin asignar') }}
          </div>
          <div>
            <strong>{{ 'plants:detail.fields.device' | t:'Dispositivo:' }}</strong>
            {{ plant()?.deviceId ?? ('plants:detail.unassigned' | t:'Sin asignar') }}
          </div>
          <div>
            <strong>{{ 'plants:detail.fields.created' | t:'Creada:' }}</strong>
            {{ plant()?.createdAt | date: 'medium' }}
          </div>
        </dl>

        <section class="plant-alerts">
          <header class="plant-alerts__header">
            <h3>{{ 'plants:detail.alerts.title' | t:'Alertas' }}</h3>
            <span class="badge" [class.badge--warning]="alerts().length">
              {{ alerts().length }}
              {{ 'plants:detail.alerts.active' | t:'activas' }}
            </span>
          </header>

          <p *ngIf="alertsAreLoading()" class="plant-alerts__hint">
            {{ 'plants:detail.alerts.loading' | t:'Cargando alertas...' }}
          </p>
          <p *ngIf="!alertsAreLoading() && !alerts().length" class="plant-alerts__hint">
            {{ 'plants:detail.alerts.empty' | t:'Sin alertas recientes.' }}
          </p>

          <ul *ngIf="alerts().length" class="plant-alerts__list">
            <li *ngFor="let alert of alerts()">
              <div>
                <span class="badge" [ngClass]="badgeClass(alert.status)">
                  {{
                    getStatusCopy(alert.status).key
                      | t:getStatusCopy(alert.status).fallback
                  }}
                </span>
                <strong>{{ alert.type }}</strong>
                <small>{{ alert.occurredAt | date: 'short' }}</small>
              </div>
              <p>{{ alert.message }}</p>
              <small>
                {{ 'plants:detail.alerts.value' | t:'Valor:' }}
                {{ alert.value }} {{ alert.metric }}
              </small>
            </li>
          </ul>
        </section>
      </ng-container>
      <ng-template #loading>
        <p *ngIf="isLoading(); else notFound">
          {{ 'common:generic.loading' | t:'Cargando...' }}
        </p>
      </ng-template>
      <ng-template #notFound>
        <p>{{ 'plants:detail.notFound' | t:'No encontramos la planta solicitada.' }}</p>
      </ng-template>
    </section>
  `,
  styles: [
    `
      dl {
        display: grid;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .plant-alerts__header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: space-between;
      }
      .plant-alerts__list {
        list-style: none;
        padding: 0;
        margin: 1rem 0 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .plant-alerts__list li {
        border: 1px solid var(--color-border);
        border-radius: 0.85rem;
        padding: 0.75rem 1rem;
        background: var(--color-surface);
      }
      .plant-alerts__list li div {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
      }
      .plant-alerts__list p {
        margin: 0.25rem 0;
        color: var(--color-muted);
      }
      @media (min-width: 768px) {
        dl {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `
  ]
})
export class PlantDetailViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly plantFacade = inject(PlantFacade);
  private readonly i18n = inject(I18nService);
  private readonly statusCopies = {
    RESOLVED: { key: 'plants:detail.alerts.status.resolved', fallback: 'Resuelta' },
    ACKNOWLEDGED: { key: 'plants:detail.alerts.status.acknowledged', fallback: 'Reconocida' },
    default: { key: 'plants:detail.alerts.status.open', fallback: 'Abierta' }
  };

  readonly plant = this.plantFacade.selectedPlant;
  readonly isLoading = this.plantFacade.isSelectedPlantLoading;
  readonly alerts = this.plantFacade.alerts;
  readonly alertsAreLoading = this.plantFacade.alertsAreLoading;

  ngOnInit(): void {
    this.i18n.loadNamespace('plants');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.plantFacade.loadPlant(id);
    }
  }

  goBack() {
    history.back();
  }

  badgeClass(status?: string) {
    switch (status) {
      case 'RESOLVED':
        return 'badge--success';
      case 'ACKNOWLEDGED':
        return 'badge--warning';
      default:
        return 'badge--danger';
    }
  }

  getStatusCopy(status?: string | null) {
    if (!status) {
      return this.statusCopies.default;
    }
    return this.statusCopies[status as keyof typeof this.statusCopies] ?? this.statusCopies.default;
  }
}
