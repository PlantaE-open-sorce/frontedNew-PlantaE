import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-plant-management-view',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <section class="page-card">
      <header class="mgmt__header">
        <div>
          <p class="mgmt__eyebrow">{{ 'plants:management.eyebrow' | t:'Colección' }}</p>
          <h2>{{ 'plants:management.title' | t:'Gestión de plantas' }}</h2>
        </div>
        <a routerLink="/plants/new" class="btn btn--outline">
          {{ 'plants:management.actions.add' | t:'Añadir planta' }}
        </a>
      </header>

      <table *ngIf="plants().length" class="mgmt__table">
        <thead>
          <tr>
            <th>{{ 'plants:management.table.name' | t:'Nombre' }}</th>
            <th>{{ 'plants:management.table.status' | t:'Estado' }}</th>
            <th>{{ 'plants:management.table.alerts' | t:'Alertas' }}</th>
            <th>{{ 'plants:management.table.actions' | t:'Acciones' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let plant of plants(); trackBy: trackById">
            <td>{{ plant.name }}</td>
            <td>{{ plant.status ?? ('common:generic.na' | t:'N/D') }}</td>
            <td>
              {{
                plant.hasAlerts
                  ? ('plants:management.alerts.yes' | t:'Sí')
                  : ('plants:management.alerts.no' | t:'No')
              }}
            </td>
            <td class="mgmt__actions">
              <a [routerLink]="['/plants', plant.id]" class="btn btn--outline">
                {{ 'plants:management.actions.view' | t:'Ver' }}
              </a>
              <button type="button" class="btn btn--danger" (click)="delete(plant.id)">
                {{ 'plants:management.actions.delete' | t:'Eliminar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="!plants().length && !loading()" class="mgmt__empty">
        {{ 'plants:management.empty' | t:'No hay plantas registradas.' }}
      </p>
    </section>
  `,
  styles: [
    `
      .mgmt__table {
        width: 100%;
        border-collapse: collapse;
      }
      .mgmt__table th,
      .mgmt__table td {
        border-bottom: 1px solid #e4e4e4;
        padding: 0.75rem;
        text-align: left;
      }
      .mgmt__actions {
        display: flex;
        gap: 0.5rem;
      }
    `
  ]
})
export class PlantManagementViewComponent implements OnInit {
  private readonly plantFacade = inject(PlantFacade);
  private readonly i18n = inject(I18nService);
  readonly plants = this.plantFacade.plants;
  readonly loading = this.plantFacade.loading;

  ngOnInit(): void {
    this.i18n.loadNamespace('plants');
    this.plantFacade.loadPlants();
  }

  delete(id: string) {
    const message = this.i18n.translate(
      'plants:management.confirmDelete',
      '¿Eliminar esta planta?'
    );
    if (confirm(message)) {
      this.plantFacade.deletePlant(id);
    }
  }

  trackById(_: number, plant: { id: string }) {
    return plant.id;
  }
}
