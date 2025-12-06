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
  templateUrl: './nursery-dashboard.view.html',
  styleUrl: './nursery-dashboard.view.css'
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

  scrollTo(anchor: string) {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    return (
      this.assetTypeOptions.find((option) => option.value === type) ?? this.assetTypeOptions[0]
    );
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
