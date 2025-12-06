import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SensorFacade } from '../../../application/facades/sensor.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';
import { PlantOptionsService } from '../../../application/services/plant-options.service';
import { AuthService } from '../../../../shared/infrastructure/services/auth.service';
import { RealtimeService } from '../../../../shared/infrastructure/services/realtime.service';

type TabType = 'register' | 'link' | 'manage' | 'ingest';

@Component({
  selector: 'app-sensors-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './sensors.view.html',
  styleUrl: './sensors.view.css'
})
export class SensorsViewComponent implements OnInit, OnDestroy {
  private readonly sensorFacade = inject(SensorFacade);
  private readonly fb = inject(FormBuilder);
  private readonly plantOptionsService = inject(PlantOptionsService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly realtime = inject(RealtimeService);

  activeTab: TabType = 'register';

  private readonly statusCopies = {
    ACTIVE: { key: 'sensors:status.active', fallback: 'Activo' },
    INACTIVE: { key: 'sensors:status.inactive', fallback: 'Inactivo' },
    default: { key: 'sensors:status.unknown', fallback: 'Desconocido' }
  };

  readonly sensors = this.sensorFacade.sensors;
  readonly isLoadingSensors = this.sensorFacade.isLoadingSensors;
  readonly activity = this.sensorFacade.activity;
  readonly plantOptions = this.plantOptionsService.options;
  readonly sensorOptions = computed(() =>
    this.sensors().map((sensor) => ({
      id: sensor.id,
      label: `${sensor.id} · ${this.typeCopy(sensor.type).fallback}`
    }))
  );
  readonly sensorTypeOptions = [
    { value: 'SOIL', label: 'sensors:types.soil', fallback: 'Suelo' },
    { value: 'TEMPERATURE', label: 'sensors:types.temperature', fallback: 'Temperatura' },
    { value: 'HUMIDITY', label: 'sensors:types.humidity', fallback: 'Humedad' },
    { value: 'LIGHT', label: 'sensors:types.light', fallback: 'Luz' },
    { value: 'MULTI', label: 'sensors:types.multi', fallback: 'Multi' }
  ];
  readonly sensorTypeMap = this.sensorTypeOptions.reduce<Record<string, { label: string; fallback: string }>>(
    (acc, option) => ({ ...acc, [option.value]: { label: option.label, fallback: option.fallback } }),
    {}
  );
  readonly readings = this.sensorFacade.readings;
  readonly isLoadingReadings = this.sensorFacade.isLoadingReadings;
  selectedSensorId: string | null = null;
  private disconnectReadings?: () => void;

  readonly filters = this.fb.nonNullable.group({
    type: [''],
    status: [''],
    plantId: ['']
  });
  readonly registerForm = this.fb.nonNullable.group({
    type: ['', Validators.required],
    ownerId: [this.auth.getUserId() ?? '', Validators.required],
    plantId: ['']
  });
  readonly linkForm = this.fb.nonNullable.group({
    sensorId: ['', Validators.required],
    plantId: ['', Validators.required]
  });
  readonly deactivateForm = this.fb.nonNullable.group({
    sensorId: ['', Validators.required]
  });
  readonly ingestForm = this.fb.nonNullable.group({
    sensorId: ['', Validators.required],
    metric: ['', Validators.required],
    value: [0, [Validators.required, Validators.min(0)]],
    timestamp: [''],
    quality: ['']
  });

  ngOnInit(): void {
    this.i18n.loadNamespace('sensors');
    this.sensorFacade.searchSensors();
    this.sensorFacade.loadActivity();
    this.plantOptionsService.load({ page: 0, size: 200, sort: 'name,asc' });
    this.startRealtime();
  }

  ngOnDestroy(): void {
    this.disconnectReadings?.();
    this.disconnectReadings = undefined;
  }

  applyFilters() {
    this.sensorFacade.searchSensors(this.filters.getRawValue());
  }

  resetFilters() {
    this.filters.reset({ type: '', status: '', plantId: '' });
    this.applyFilters();
  }

  reload() {
    this.sensorFacade.searchSensors(this.filters.getRawValue());
    this.sensorFacade.loadActivity();
  }

  badgeClass(status: string) {
    switch (status) {
      case 'ACTIVE':
        return 'badge--success';
      case 'INACTIVE':
        return 'badge--danger';
      default:
        return 'badge--warning';
    }
  }

  getStatusCopy(status?: string | null) {
    if (!status) {
      return this.statusCopies.default;
    }
    return this.statusCopies[status as keyof typeof this.statusCopies] ?? this.statusCopies.default;
  }

  prefillSensor(sensorId: string) {
    this.linkForm.patchValue({ sensorId });
    this.deactivateForm.patchValue({ sensorId });
    this.ingestForm.patchValue({ sensorId });
    this.activeTab = 'manage'; // Switch to manage tab
  }

  registerSensor() {
    if (this.registerForm.invalid) {
      return;
    }
    this.sensorFacade.registerSensor(this.registerForm.getRawValue());
    this.registerForm.reset({ type: '', ownerId: '', plantId: '' });
  }

  linkSensor() {
    if (this.linkForm.invalid) {
      return;
    }
    const { sensorId, plantId } = this.linkForm.getRawValue();
    const sensorLabel =
      this.sensorOptions().find((option) => option.id === sensorId)?.label ?? sensorId;
    const plantLabel =
      this.plantOptions().find((option) => option.id === plantId)?.label ?? plantId;
    this.sensorFacade.linkSensor(sensorId, plantId, { sensorLabel, plantLabel });
    this.linkForm.reset({ sensorId: '', plantId: '' });
  }

  deactivateSensor() {
    if (this.deactivateForm.invalid) {
      return;
    }
    this.sensorFacade.deactivateSensor(this.deactivateForm.getRawValue().sensorId);
    this.deactivateForm.reset({ sensorId: '' });
  }

  ingestReading() {
    if (this.ingestForm.invalid) {
      return;
    }
    const { sensorId, ...rest } = this.ingestForm.getRawValue();
    const payload = { ...rest, timestamp: rest.timestamp || undefined };
    this.sensorFacade.ingestReading(sensorId, payload);
    this.ingestForm.reset({
      sensorId: '',
      metric: '',
      value: 0,
      timestamp: '',
      quality: ''
    });
  }

  viewReadings(sensorId: string) {
    this.selectedSensorId = sensorId;
    this.sensorFacade.loadReadings(sensorId);
  }

  closeReadings() {
    this.selectedSensorId = null;
  }

  typeCopy(type?: string | null) {
    if (!type) {
      return { label: 'common:generic.na', fallback: 'N/A' };
    }
    return this.sensorTypeMap[type] ?? { label: 'common:generic.na', fallback: type };
  }

  metricCopy(metric?: string | null) {
    if (!metric) {
      return { label: 'common:generic.na', fallback: 'N/A' };
    }
    const normalized = metric.replace(/[^A-Za-z]/g, '').toLowerCase();
    const map: Record<string, { label: string; fallback: string }> = {
      soilmoisture: { label: 'sensors:metrics.soilMoisture', fallback: 'Humedad del suelo' },
      temperature: { label: 'sensors:metrics.temperature', fallback: 'Temperatura' },
      humidity: { label: 'sensors:metrics.humidity', fallback: 'Humedad' },
      light: { label: 'sensors:metrics.light', fallback: 'Luz' }
    };
    return map[normalized] ?? { label: 'common:generic.na', fallback: metric };
  }

  private startRealtime() {
    this.disconnectReadings?.();
    this.realtime.connectToReadings((event) => {
      this.sensorFacade.searchSensors(this.filters.getRawValue());
      this.sensorFacade.loadActivity();
      if (this.selectedSensorId && event.sensorId === this.selectedSensorId) {
        this.sensorFacade.loadReadings(event.sensorId);
      }
    });
    this.disconnectReadings = () => this.realtime.closeReadings();
  }
}
