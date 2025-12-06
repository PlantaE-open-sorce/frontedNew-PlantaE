import { Injectable, Signal, computed, signal } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { NotificationService } from '../../../shared/infrastructure/services/notification.service';
import { PagedResult } from '../../../shared/domain/models/paged-result.model';
import { Plant } from '../../domain/models/plant.model';
import { PlantSearchParams } from '../../domain/models/plant-search.model';
import { PlantRepository } from '../../domain/repositories/plant.repository';
import { CreatePlantPayload, UpdatePlantPayload } from '../../domain/models/plant-save.model';
import { PlantAlert } from '../../domain/models/plant-alert.model';

@Injectable({ providedIn: 'root' })
export class PlantFacade {
  private readonly resultState = signal<PagedResult<Plant> | null>(null);
  private readonly loadingState = signal(false);
  private readonly selectedPlantState = signal<Plant | null>(null);
  private readonly selectedPlantLoading = signal(false);
  private readonly alertsState = signal<PlantAlert[]>([]);
  private readonly alertsLoading = signal(false);
  private readonly filtersState = signal<PlantSearchParams>({ page: 0, size: 10, sort: 'createdAt,desc' });

  readonly plants: Signal<Plant[]> = computed(() => this.resultState()?.content ?? []);
  readonly loading: Signal<boolean> = this.loadingState.asReadonly();
  readonly pageInfo: Signal<PagedResult<Plant> | null> = this.resultState.asReadonly();
  readonly selectedPlant: Signal<Plant | null> = this.selectedPlantState.asReadonly();
  readonly isSelectedPlantLoading: Signal<boolean> = this.selectedPlantLoading.asReadonly();
  readonly alerts: Signal<PlantAlert[]> = this.alertsState.asReadonly();
  readonly alertsAreLoading: Signal<boolean> = this.alertsLoading.asReadonly();

  constructor(
    private readonly plantRepository: PlantRepository,
    private readonly notifications: NotificationService
  ) {}

  loadPlants(overrides?: PlantSearchParams) {
    const params: PlantSearchParams = { ...this.filtersState(), ...overrides };
    this.filtersState.set(params);
    const cleanedParams = this.cleanParams({ ...params });
    this.loadingState.set(true);
    this.plantRepository
      .search(cleanedParams)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (result) => this.resultState.set(result),
        error: () => this.notifications.error('No pudimos cargar las plantas')
      });
  }

  loadPlant(id: string) {
    this.selectedPlantLoading.set(true);
    this.plantRepository
      .get(id)
      .pipe(finalize(() => this.selectedPlantLoading.set(false)))
      .subscribe({
        next: (plant) => this.selectedPlantState.set(plant),
        error: () => this.notifications.error('No pudimos obtener la planta')
      });
    this.loadAlerts(id);
  }

  createPlant(payload: CreatePlantPayload) {
    this.loadingState.set(true);
    return this.plantRepository.create(payload).pipe(
      tap({
        next: () => {
          this.notifications.success('Planta creada correctamente');
          this.loadPlants({ page: 0 });
        },
        error: () => this.notifications.error('No pudimos crear la planta')
      }),
      finalize(() => this.loadingState.set(false))
    );
  }

  updatePlant(id: string, payload: UpdatePlantPayload) {
    this.selectedPlantLoading.set(true);
    this.plantRepository
      .update(id, payload)
      .pipe(finalize(() => this.selectedPlantLoading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Planta actualizada');
          this.loadPlant(id);
          this.loadPlants();
        },
        error: () => this.notifications.error('No pudimos actualizar la planta')
      });
  }

  deletePlant(id: string) {
    this.loadingState.set(true);
    this.plantRepository
      .delete(id)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Planta eliminada');
          this.loadPlants();
        },
        error: () => this.notifications.error('No pudimos eliminar la planta')
      });
  }

  downloadReport(id: string, format: 'pdf' | 'csv' = 'pdf') {
    return this.plantRepository.downloadReport(id, format);
  }

  private loadAlerts(id: string) {
    this.alertsLoading.set(true);
    this.plantRepository
      .getAlerts(id)
      .pipe(finalize(() => this.alertsLoading.set(false)))
      .subscribe({
        next: (alerts) => this.alertsState.set(alerts),
        error: () => this.notifications.error('No pudimos cargar las alertas de la planta')
      });
  }

  private cleanParams(params: PlantSearchParams): PlantSearchParams {
    const cleaned = { ...params };
    delete (cleaned as any).keyword;

    const hasAlertsValue = (cleaned as any).hasAlerts;
    if (typeof hasAlertsValue === 'string') {
      if (hasAlertsValue === 'true') cleaned.hasAlerts = true;
      else if (hasAlertsValue === 'false') cleaned.hasAlerts = false;
      else delete (cleaned as any).hasAlerts;
    } else if (typeof hasAlertsValue !== 'boolean') {
      delete (cleaned as any).hasAlerts;
    }

    (['name', 'species', 'status', 'sensorId', 'location'] as const).forEach((key) => {
      const value = cleaned[key];
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
          cleaned[key] = trimmed;
        } else {
          delete cleaned[key];
        }
      }
    });
    return cleaned;
  }
}
