import { Injectable, Signal, computed, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PagedResult } from '../../../shared/domain/models/paged-result.model';
import { NotificationService } from '../../../shared/infrastructure/services/notification.service';
import { SensorRepository } from '../../domain/repositories/sensor.repository';
import {
  IngestSensorReadingPayload,
  RegisterSensorPayload,
  Sensor,
  SensorActivity,
  SensorReading,
  SensorSearchParams
} from '../../domain/models/sensor.model';

@Injectable({ providedIn: 'root' })
export class SensorFacade {
  private readonly sensorsState = signal<PagedResult<Sensor> | null>(null);
  private readonly activityState = signal<SensorActivity[]>([]);
  private readonly readingsState = signal<PagedResult<SensorReading> | null>(null);
  private readonly loadingSensors = signal(false);
  private readonly loadingActivity = signal(false);
  private readonly loadingReadings = signal(false);

  readonly sensors = computed(() => this.sensorsState()?.content ?? []);
  readonly activity = this.activityState.asReadonly();
  readonly readings = computed(() => this.readingsState()?.content ?? []);
  readonly sensorsPageInfo = this.sensorsState.asReadonly();
  readonly readingsPageInfo = this.readingsState.asReadonly();
  readonly isLoadingSensors = this.loadingSensors.asReadonly();
  readonly isLoadingActivity = this.loadingActivity.asReadonly();
  readonly isLoadingReadings = this.loadingReadings.asReadonly();

  constructor(
    private readonly repository: SensorRepository,
    private readonly notifications: NotificationService
  ) {}

  searchSensors(params: SensorSearchParams = { page: 0, size: 10 }) {
    this.loadingSensors.set(true);
    this.repository
      .search(params)
      .pipe(finalize(() => this.loadingSensors.set(false)))
      .subscribe({
        next: (result) => this.sensorsState.set(result),
        error: () => this.notifications.error('No pudimos cargar los sensores')
      });
  }

  loadActivity(top = 10) {
    this.loadingActivity.set(true);
    this.repository
      .getActivity(top)
      .pipe(finalize(() => this.loadingActivity.set(false)))
      .subscribe({
        next: (activity) => this.activityState.set(activity),
        error: () => this.notifications.error('No pudimos obtener la actividad')
      });
  }

  loadReadings(sensorId: string, query?: { from?: string; to?: string; metric?: string; page?: number; size?: number }) {
    this.loadingReadings.set(true);
    this.repository
      .getReadings(sensorId, query)
      .pipe(finalize(() => this.loadingReadings.set(false)))
      .subscribe({
        next: (result) => this.readingsState.set(result),
        error: () => this.notifications.error('No pudimos cargar las lecturas del sensor')
      });
  }

  registerSensor(payload: RegisterSensorPayload) {
    this.repository.register(payload).subscribe({
      next: () => {
        this.notifications.success('Sensor registrado');
        this.searchSensors();
      },
      error: () => this.notifications.error('No pudimos registrar el sensor')
    });
  }

  linkSensor(sensorId: string, plantId: string) {
    this.repository.link(sensorId, { plantId }).subscribe({
      next: () => {
        this.notifications.success('Sensor vinculado');
        this.searchSensors();
      },
      error: () => this.notifications.error('No pudimos vincular el sensor')
    });
  }

  deactivateSensor(sensorId: string) {
    this.repository.deactivate(sensorId).subscribe({
      next: () => {
        this.notifications.success('Sensor desactivado');
        this.searchSensors();
      },
      error: () => this.notifications.error('No pudimos desactivar el sensor')
    });
  }

  ingestReading(sensorId: string, payload: IngestSensorReadingPayload) {
    this.repository.ingestReading(sensorId, payload).subscribe({
      next: () => this.notifications.success('Lectura registrada'),
      error: () => this.notifications.error('No pudimos registrar la lectura')
    });
  }
}
