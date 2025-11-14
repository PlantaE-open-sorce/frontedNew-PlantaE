import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NurseryFacade } from '../../../application/facades/nursery.facade';
import { NurseryAssetType, NurseryTaskPriority } from '../../../domain/models/nursery/nursery-dashboard.model';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-nursery-dashboard-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <section class="nursery-grid">
      <article class="page-card summary-card" *ngIf="dashboard() as data">
        <header>
          <p class="eyebrow">{{ 'nursery:summary.eyebrow' | t:'Indicadores' }}</p>
          <h2>{{ 'nursery:summary.title' | t:'Panel de vivero' }}</h2>
        </header>
        <div class="summary-grid">
          <div>
            <p>{{ 'nursery:summary.plants' | t:'Plantas activas' }}</p>
            <strong>{{ data.totalPlants }}</strong>
          </div>
          <div>
            <p>{{ 'nursery:summary.batches' | t:'Lotes activos' }}</p>
            <strong>{{ data.activeBatches }}</strong>
          </div>
          <div>
            <p>{{ 'nursery:summary.tasks' | t:'Tareas pendientes' }}</p>
            <strong>{{ data.pendingTasks }}</strong>
          </div>
        </div>
      </article>

      <article class="page-card" *ngIf="batches().length">
        <header class="section-header">
          <div>
            <p class="eyebrow">{{ 'nursery:batches.eyebrow' | t:'Destacados' }}</p>
            <h3>{{ 'nursery:batches.title' | t:'Lotes en seguimiento' }}</h3>
          </div>
          <button class="btn btn--ghost" type="button" (click)="reloadDashboard()">
            {{ 'nursery:tasks.refresh' | t:'Actualizar' }}
          </button>
        </header>
        <div class="batch-grid">
          <article *ngFor="let batch of batches()" class="batch-card">
            <div class="batch-card__head">
              <p>{{ batch.label }}</p>
              <span>{{ batch.species }}</span>
            </div>
            <dl>
              <div>
                <dt>{{ 'nursery:batches.plants' | t:'Plantas' }}</dt>
                <dd>{{ batch.plantCount }}</dd>
              </div>
              <div>
                <dt>{{ 'nursery:batches.routine' | t:'Rutina' }}</dt>
                <dd>
                  {{
                    routineStatusLabel(batch.routineStatus).key
                      | t: routineStatusLabel(batch.routineStatus).fallback
                  }}
                </dd>
              </div>
              <div>
                <dt>{{ 'nursery:batches.progress' | t:'Avance' }}</dt>
                <dd>{{ batch.progressPercent }}%</dd>
              </div>
            </dl>
          </article>
        </div>
      </article>

      <article class="page-card">
        <header class="section-header">
          <div>
            <p class="eyebrow">{{ 'nursery:tasks.eyebrow' | t:'Operaciones' }}</p>
            <h3>{{ 'nursery:tasks.title' | t:'Tareas críticas' }}</h3>
          </div>
          <button class="btn btn--ghost" type="button" (click)="reloadTasks()">
            {{ 'nursery:tasks.refresh' | t:'Actualizar' }}
          </button>
        </header>
        <div class="task-list" *ngIf="tasks().length; else noTasks">
          <article *ngFor="let task of tasks()" class="task-card">
            <div>
              <p class="task-card__title">{{ task.title }}</p>
              <p class="task-card__meta">
                #{{ task.assetId }} ·
                {{
                  labelForAssetType(task.assetType).label
                    | t: labelForAssetType(task.assetType).fallback
                }}
                ·
                {{
                  priorityLabel(task.priority).label
                    | t: priorityLabel(task.priority).fallback
                }}
              </p>
            </div>
            <p class="task-card__notes">{{ task.notes ?? ('common:generic.none' | t:'—') }}</p>
            <p class="task-card__due" *ngIf="task.dueDate">
              {{ 'nursery:tasks.due' | t:'Vence' }}: {{ task.dueDate | date: 'mediumDate' }}
            </p>
          </article>
        </div>
        <ng-template #noTasks>
          <p class="empty-state">{{ 'nursery:tasks.empty' | t:'Sin tareas asignadas.' }}</p>
        </ng-template>

        <form [formGroup]="taskForm" (ngSubmit)="createTask()" class="form-grid form-grid--two">
          <label>
            <span>{{ 'nursery:tasks.form.title' | t:'Título' }}</span>
            <input formControlName="title" />
          </label>
          <label>
            <span>{{ 'nursery:tasks.form.assetId' | t:'Activo' }}</span>
            <input formControlName="assetId" />
          </label>
          <label>
            <span>{{ 'nursery:tasks.form.assetType' | t:'Tipo de activo' }}</span>
            <select formControlName="assetType">
              <option *ngFor="let option of assetTypeOptions" [value]="option.value">
                {{ option.label | t: option.fallback }}
              </option>
            </select>
          </label>
          <label>
            <span>{{ 'nursery:tasks.form.priority' | t:'Prioridad' }}</span>
            <select formControlName="priority">
              <option *ngFor="let option of priorityOptions" [value]="option.value">
                {{ option.label | t: option.fallback }}
              </option>
            </select>
          </label>
          <label>
            <span>{{ 'nursery:tasks.form.dueDate' | t:'Fecha límite' }}</span>
            <input type="date" formControlName="dueDate" />
          </label>
          <label class="form-grid__full">
            <span>{{ 'nursery:tasks.form.notes' | t:'Notas' }}</span>
            <textarea rows="2" formControlName="notes"></textarea>
          </label>
          <div class="form-grid__actions">
            <button class="btn" type="submit" [disabled]="taskForm.invalid || isLoadingTasks()">
              {{ 'nursery:tasks.form.action' | t:'Registrar tarea' }}
            </button>
          </div>
        </form>
      </article>

      <article class="page-card">
        <header class="section-header">
          <div>
            <p class="eyebrow">{{ 'nursery:inputs.eyebrow' | t:'Insumos' }}</p>
            <h3>{{ 'nursery:inputs.title' | t:'Aplicaciones recientes' }}</h3>
          </div>
          <button class="btn btn--ghost" type="button" (click)="reloadInputs()">
            {{ 'nursery:tasks.refresh' | t:'Actualizar' }}
          </button>
        </header>
        <table class="inputs-table" *ngIf="inputs().length; else noInputs">
          <thead>
            <tr>
              <th>{{ 'nursery:inputs.asset' | t:'Activo' }}</th>
              <th>{{ 'nursery:inputs.type' | t:'Tipo' }}</th>
              <th>{{ 'nursery:inputs.quantity' | t:'Cantidad' }}</th>
              <th>{{ 'nursery:inputs.cost' | t:'Costo' }}</th>
              <th>{{ 'nursery:inputs.appliedAt' | t:'Aplicado' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let input of inputs()">
              <td>
                #{{ input.assetId }} ·
                {{
                  labelForAssetType(input.assetType).label
                    | t: labelForAssetType(input.assetType).fallback
                }}
              </td>
              <td>{{ input.inputType }}</td>
              <td>{{ input.quantity }} {{ input.unit }}</td>
              <td>$ {{ input.cost | number: '1.2-2' }}</td>
              <td>{{ input.appliedAt ? (input.appliedAt | date: 'short') : ('common:generic.none' | t:'—') }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #noInputs>
          <p class="empty-state">{{ 'nursery:inputs.empty' | t:'Sin registros de insumos.' }}</p>
        </ng-template>

        <form [formGroup]="inputForm" (ngSubmit)="createInput()" class="form-grid form-grid--two">
          <label>
            <span>{{ 'nursery:inputs.form.assetId' | t:'Activo' }}</span>
            <input formControlName="assetId" />
          </label>
          <label>
            <span>{{ 'nursery:inputs.form.assetType' | t:'Tipo de activo' }}</span>
            <select formControlName="assetType">
              <option *ngFor="let option of assetTypeOptions" [value]="option.value">
                {{ option.label | t: option.fallback }}
              </option>
            </select>
          </label>
          <label>
            <span>{{ 'nursery:inputs.form.inputType' | t:'Tipo de insumo' }}</span>
            <input formControlName="inputType" />
          </label>
          <label>
            <span>{{ 'nursery:inputs.form.quantity' | t:'Cantidad' }}</span>
            <input formControlName="quantity" type="number" step="0.1" />
          </label>
          <label>
            <span>{{ 'nursery:inputs.form.unit' | t:'Unidad' }}</span>
            <input formControlName="unit" />
          </label>
          <label>
            <span>{{ 'nursery:inputs.form.cost' | t:'Costo' }}</span>
            <input formControlName="cost" type="number" step="0.01" />
          </label>
          <label>
            <span>{{ 'nursery:inputs.form.appliedAt' | t:'Aplicado en' }}</span>
            <input formControlName="appliedAt" type="datetime-local" />
          </label>
          <label>
            <span>{{ 'nursery:inputs.form.appliedBy' | t:'Aplicado por' }}</span>
            <input formControlName="appliedBy" />
          </label>
          <div class="form-grid__actions">
            <button class="btn" type="submit" [disabled]="inputForm.invalid || isLoadingInputs()">
              {{ 'nursery:inputs.form.action' | t:'Registrar insumo' }}
            </button>
          </div>
        </form>
      </article>
    </section>
  `,
  styles: [
    `
      .nursery-grid {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }
      .summary-grid div {
        background: #f4faf6;
        padding: 1rem;
        border-radius: 1rem;
      }
      .summary-grid strong {
        font-size: 1.8rem;
        display: block;
      }
      .batch-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }
      .batch-card {
        border: 1px solid var(--color-border);
        border-radius: 1rem;
        padding: 1rem;
      }
      .batch-card__head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }
      .task-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .task-card {
        border: 1px solid var(--color-border);
        border-radius: 0.9rem;
        padding: 0.85rem;
      }
      .task-card__title {
        font-weight: 600;
        margin: 0;
      }
      .task-card__meta {
        margin: 0;
        font-size: 0.85rem;
        color: var(--color-muted);
      }
      .task-card__notes {
        margin: 0.5rem 0;
      }
      .inputs-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1.5rem;
      }
      .inputs-table th,
      .inputs-table td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--color-border);
        text-align: left;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--color-muted);
        margin: 0;
      }
      .form-grid {
        gap: 1rem;
      }
      .form-grid__actions {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
      }
      .empty-state {
        color: var(--color-muted);
        margin-bottom: 1rem;
      }
      @media (max-width: 640px) {
        .form-grid__actions {
          justify-content: stretch;
        }
        .form-grid__actions .btn {
          width: 100%;
        }
      }
    `
  ]
})
export class NurseryDashboardViewComponent implements OnInit {
  private readonly facade = inject(NurseryFacade);
  private readonly fb = inject(FormBuilder);

  readonly dashboard = this.facade.dashboard;
  readonly batches = this.facade.batches;
  readonly tasks = this.facade.tasks;
  readonly inputs = this.facade.inputs;
  readonly isLoadingTasks = this.facade.isLoadingTasks;
  readonly isLoadingInputs = this.facade.isLoadingInputs;

  readonly assetTypeOptions: { value: NurseryAssetType; label: string; fallback: string }[] = [
    { value: 'PLANT', label: 'nursery:tasks.form.assetPlant', fallback: 'Planta' },
    { value: 'BATCH', label: 'nursery:tasks.form.assetBatch', fallback: 'Lote' }
  ];

  readonly priorityOptions = [
    { value: 'LOW', label: 'nursery:tasks.priority.low', fallback: 'Baja' },
    { value: 'MEDIUM', label: 'nursery:tasks.priority.medium', fallback: 'Media' },
    { value: 'HIGH', label: 'nursery:tasks.priority.high', fallback: 'Alta' }
  ];

  private readonly routineStatusMap: Record<
    string,
    { key: string; fallback: string }
  > = {
    ON_TRACK: { key: 'nursery:batches.status.onTrack', fallback: 'En curso' },
    DELAYED: { key: 'nursery:batches.status.delayed', fallback: 'Retrasado' },
    AT_RISK: { key: 'nursery:batches.status.atRisk', fallback: 'En riesgo' }
  };

  readonly taskForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    assetId: ['', Validators.required],
    assetType: this.fb.nonNullable.control<NurseryAssetType>('PLANT', { validators: Validators.required }),
    dueDate: [''],
    priority: this.fb.nonNullable.control<NurseryTaskPriority>('MEDIUM', { validators: Validators.required }),
    notes: ['']
  });

  readonly inputForm = this.fb.nonNullable.group({
    assetId: ['', Validators.required],
    assetType: this.fb.nonNullable.control<NurseryAssetType>('PLANT', { validators: Validators.required }),
    inputType: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0.1)]],
    unit: ['', Validators.required],
    cost: [0, [Validators.required, Validators.min(0)]],
    appliedAt: [''],
    appliedBy: ['', Validators.required]
  });

  ngOnInit(): void {
    this.reloadDashboard();
    this.reloadTasks();
    this.reloadInputs();
  }

  reloadDashboard() {
    this.facade.loadDashboard();
  }

  reloadTasks() {
    this.facade.loadTasks();
  }

  reloadInputs() {
    this.facade.loadInputs();
  }

  createTask() {
    if (this.taskForm.invalid) {
      return;
    }
    this.facade.scheduleTask({ ...this.taskForm.getRawValue(), dueDate: this.normalizeDate(this.taskForm.value.dueDate) });
    this.taskForm.reset({
      title: '',
      assetId: '',
      assetType: 'PLANT',
      dueDate: '',
      priority: 'MEDIUM',
      notes: ''
    });
  }

  createInput() {
    if (this.inputForm.invalid) {
      return;
    }
    const payload = this.inputForm.getRawValue();
    this.facade.registerInput({ ...payload, appliedAt: this.normalizeDateTime(payload.appliedAt) });
    this.inputForm.reset({
      assetId: '',
      assetType: 'PLANT',
      inputType: '',
      quantity: 0,
      unit: '',
      cost: 0,
      appliedAt: '',
      appliedBy: ''
    });
  }

  routineStatusLabel(status?: string) {
    if (!status) {
      return { key: 'common:generic.none', fallback: '—' };
    }
    return this.routineStatusMap[status] ?? { key: 'common:generic.none', fallback: status };
  }

  labelForAssetType(type: string) {
    return this.assetTypeOptions.find((option) => option.value === type) ?? this.assetTypeOptions[0];
  }

  priorityLabel(priority: string) {
    return this.priorityOptions.find((option) => option.value === priority) ?? this.priorityOptions[1];
  }

  private normalizeDate(value?: string | null) {
    return value || undefined;
  }

  private normalizeDateTime(value?: string | null) {
    return value || undefined;
  }
}
