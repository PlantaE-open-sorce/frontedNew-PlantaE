import { Injectable, Signal, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../shared/infrastructure/services/notification.service';
import {
  NurseryBatchCard,
  NurseryDashboard,
  NurseryInput,
  NurseryTask,
  RegisterNurseryInputPayload,
  ScheduleNurseryTaskPayload
} from '../../domain/models/nursery/nursery-dashboard.model';
import { NurseryRepository } from '../../domain/repositories/nursery.repository';

@Injectable({ providedIn: 'root' })
export class NurseryFacade {
  private readonly dashboardState = signal<NurseryDashboard | null>(null);
  private readonly batchesState = signal<NurseryBatchCard[]>([]);
  private readonly tasksState = signal<NurseryTask[]>([]);
  private readonly inputsState = signal<NurseryInput[]>([]);
  private readonly loadingDashboard = signal(false);
  private readonly loadingTasks = signal(false);
  private readonly loadingInputs = signal(false);

  readonly dashboard: Signal<NurseryDashboard | null> = this.dashboardState.asReadonly();
  readonly batches: Signal<NurseryBatchCard[]> = this.batchesState.asReadonly();
  readonly tasks: Signal<NurseryTask[]> = this.tasksState.asReadonly();
  readonly inputs: Signal<NurseryInput[]> = this.inputsState.asReadonly();
  readonly isLoadingDashboard = this.loadingDashboard.asReadonly();
  readonly isLoadingTasks = this.loadingTasks.asReadonly();
  readonly isLoadingInputs = this.loadingInputs.asReadonly();

  constructor(
    private readonly repository: NurseryRepository,
    private readonly notifications: NotificationService
  ) {}

  loadDashboard() {
    this.loadingDashboard.set(true);
    this.repository
      .getDashboard()
      .pipe(finalize(() => this.loadingDashboard.set(false)))
      .subscribe({
        next: (response) => this.dashboardState.set(response),
        error: () => this.notifications.error('No pudimos cargar el panel de vivero')
      });
    this.repository.listBatches().subscribe({
      next: (batches) => this.batchesState.set(batches),
      error: () => this.notifications.error('No pudimos obtener los lotes')
    });
  }

  loadTasks() {
    this.loadingTasks.set(true);
    this.repository
      .listTasks()
      .pipe(finalize(() => this.loadingTasks.set(false)))
      .subscribe({
        next: (tasks) => this.tasksState.set(tasks),
        error: () => this.notifications.error('No pudimos cargar las tareas')
      });
  }

  loadInputs() {
    this.loadingInputs.set(true);
    this.repository
      .listInputs()
      .pipe(finalize(() => this.loadingInputs.set(false)))
      .subscribe({
        next: (inputs) => this.inputsState.set(inputs),
        error: () => this.notifications.error('No pudimos cargar los insumos aplicados')
      });
  }

  scheduleTask(payload: ScheduleNurseryTaskPayload) {
    this.repository.scheduleTask(payload).subscribe({
      next: () => {
        this.notifications.success('Tarea creada');
        this.loadTasks();
      },
      error: () => this.notifications.error('No pudimos crear la tarea')
    });
  }

  registerInput(payload: RegisterNurseryInputPayload) {
    this.repository.registerInput(payload).subscribe({
      next: () => {
        this.notifications.success('Insumo registrado');
        this.loadInputs();
      },
      error: () => this.notifications.error('No pudimos registrar el insumo')
    });
  }
}
