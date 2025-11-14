import { Injectable, Signal, computed, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../shared/infrastructure/services/notification.service';
import { AlertService, AlertFilters, Alert } from '../services/alert.service';

@Injectable({ providedIn: 'root' })
export class AlertFacade {
  private readonly alertsState = signal<Alert[]>([]);
  private readonly loadingState = signal(false);
  private readonly filtersState = signal<AlertFilters>({ page: 0, size: 20 });
  private readonly hasMoreState = signal<boolean>(false);

  readonly alerts: Signal<Alert[]> = this.alertsState.asReadonly();
  readonly isLoading: Signal<boolean> = this.loadingState.asReadonly();
  readonly page = computed(() => this.filtersState().page ?? 0);
  readonly pageSize = computed(() => this.filtersState().size ?? 20);
  readonly hasMore = this.hasMoreState.asReadonly();
  readonly activeCount = computed(() => this.alerts().filter((alert) => alert.status !== 'RESOLVED').length);

  constructor(
    private readonly service: AlertService,
    private readonly notifications: NotificationService
  ) {}

  load(filters?: AlertFilters) {
    const params = { ...this.filtersState(), ...filters };
    this.filtersState.set(params);
    this.loadingState.set(true);
    this.service
      .getRecent(params)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (alerts) => {
          this.alertsState.set(alerts);
          this.hasMoreState.set(alerts.length === (params.size ?? 20));
        },
        error: () => this.notifications.error('No pudimos obtener las alertas recientes')
      });
  }

  nextPage() {
    if (!this.hasMore()) {
      return;
    }
    const page = (this.filtersState().page ?? 0) + 1;
    this.load({ page });
  }

  previousPage() {
    const current = this.filtersState().page ?? 0;
    if (current === 0) {
      return;
    }
    this.load({ page: current - 1 });
  }

  resolve(alertId: string) {
    this.service.resolve(alertId).subscribe({
      next: () => {
        this.notifications.success('Alerta resuelta');
        this.load();
      },
      error: () => this.notifications.error('No pudimos resolver la alerta')
    });
  }
}
