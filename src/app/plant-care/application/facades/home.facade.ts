import { Injectable, Signal, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../shared/infrastructure/services/notification.service';
import { HomeRepository } from '../../domain/repositories/home.repository';
import {
  HomeDashboard,
  HomeManualAction,
  RegisterManualActionPayload
} from '../../domain/models/home/home-dashboard.model';

@Injectable({ providedIn: 'root' })
export class HomeFacade {
  private readonly dashboardState = signal<HomeDashboard | null>(null);
  private readonly manualActionsState = signal<HomeManualAction[]>([]);
  private readonly loadingDashboard = signal(false);
  private readonly loadingActions = signal(false);

  readonly dashboard: Signal<HomeDashboard | null> = this.dashboardState.asReadonly();
  readonly manualActions: Signal<HomeManualAction[]> = this.manualActionsState.asReadonly();
  readonly isDashboardLoading: Signal<boolean> = this.loadingDashboard.asReadonly();
  readonly isActionsLoading: Signal<boolean> = this.loadingActions.asReadonly();

  constructor(
    private readonly repository: HomeRepository,
    private readonly notifications: NotificationService
  ) {}

  loadDashboard() {
    this.loadingDashboard.set(true);
    this.repository
      .getDashboard()
      .pipe(finalize(() => this.loadingDashboard.set(false)))
      .subscribe({
        next: (dashboard) => this.dashboardState.set(dashboard),
        error: () => this.notifications.error('No pudimos cargar el dashboard')
      });
  }

  loadManualActions() {
    this.loadingActions.set(true);
    this.repository
      .listManualActions()
      .pipe(finalize(() => this.loadingActions.set(false)))
      .subscribe({
        next: (actions) => this.manualActionsState.set(actions),
        error: () => this.notifications.error('No pudimos cargar las acciones manuales')
      });
  }

  registerManualAction(payload: RegisterManualActionPayload) {
    this.loadingActions.set(true);
    this.repository
      .registerManualAction(payload)
      .pipe(finalize(() => this.loadingActions.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Acción registrada');
          this.loadManualActions();
          this.loadDashboard();
        },
        error: () => this.notifications.error('No pudimos registrar la acción')
      });
  }
}
