import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SensorFacade } from '../../../application/facades/sensor.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';
import { PlantOptionsService } from '../../../application/services/plant-options.service';
import { AuthService } from '../../../../shared/infrastructure/services/auth.service';

@Component({
  selector: 'app-sensors-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <section class="page-card sensors">
      <header class="sensors__header">
        <div>
          <p class="sensors__eyebrow">{{ 'sensors:eyebrow' | t:'Telemetría' }}</p>
          <h2>{{ 'sensors:title' | t:'Sensores' }}</h2>
          <p>{{ 'sensors:subtitle' | t:'Monitorea el estado y actividad más reciente.' }}</p>
        </div>
        <button class="btn btn--outline" type="button" (click)="reload()">
          {{ 'sensors:actions.refresh' | t:'Actualizar' }}
        </button>
      </header>

      <p class="sensors__hint">
        {{ 'sensors:hint' | t:'Selecciona sensores y plantas desde las listas para vincularlos sin escribir identificadores a mano.' }}
      </p>

      <form [formGroup]="filters" (ngSubmit)="applyFilters()" class="sensors__filters">
        <div class="sensors__filters-grid">
          <label class="sensors__field">
            <span>{{ 'sensors:filters.type' | t:'Tipo' }}</span>
            <input formControlName="type" [placeholder]="'sensors:filters.type' | t:'Tipo'" />
          </label>
          <label class="sensors__field">
            <span>{{ 'sensors:filters.status.all' | t:'Estado' }}</span>
            <select formControlName="status">
              <option value="">{{ 'sensors:filters.status.all' | t:'Estado' }}</option>
              <option value="ACTIVE">{{ 'sensors:filters.status.active' | t:'Activo' }}</option>
              <option value="INACTIVE">{{ 'sensors:filters.status.inactive' | t:'Inactivo' }}</option>
            </select>
          </label>
          <label class="sensors__field">
            <span>{{ 'sensors:filters.plant' | t:'Planta' }}</span>
            <input formControlName="plantId" [placeholder]="'sensors:filters.plant' | t:'Planta'" />
          </label>
        </div>
        <div class="sensors__filters-actions">
          <button class="btn btn--outline" type="submit">
            {{ 'sensors:filters.apply' | t:'Filtrar' }}
          </button>
          <button class="btn btn--ghost" type="button" (click)="resetFilters()">
            {{ 'sensors:filters.reset' | t:'Limpiar' }}
          </button>
        </div>
      </form>

      <section class="sensors__forms-grid">
        <article class="sensors-card">
          <header>
            <h3>{{ 'sensors:forms.register.title' | t:'Registrar sensor' }}</h3>
            <p>{{ 'sensors:forms.register.subtitle' | t:'Crea un sensor y asígnalo a una planta.' }}</p>
          </header>
          <form [formGroup]="registerForm" (ngSubmit)="registerSensor()" class="sensors-card__form">
            <label>
              <span>{{ 'sensors:forms.register.type' | t:'Tipo' }}</span>
              <select formControlName="type">
                <option value="">{{ 'sensors:forms.register.chooseType' | t:'Selecciona un tipo' }}</option>
                <option *ngFor="let option of sensorTypeOptions" [value]="option.value">
                  {{ option.label | t: option.fallback }}
                </option>
              </select>
            </label>
            <label>
              <span>{{ 'sensors:forms.register.ownerId' | t:'Propietario' }}</span>
              <input formControlName="ownerId" readonly />
            </label>
            <label>
              <span>{{ 'sensors:forms.register.plantId' | t:'Planta (opcional)' }}</span>
              <select formControlName="plantId">
                <option value="">{{ 'common:generic.none' | t:'—' }}</option>
                <option *ngFor="let option of plantOptions()" [value]="option.id">{{ option.label }}</option>
              </select>
            </label>
            <button class="btn btn--outline" type="submit" [disabled]="registerForm.invalid">
              {{ 'sensors:forms.register.action' | t:'Registrar' }}
            </button>
          </form>
        </article>

        <article class="sensors-card">
          <header>
            <h3>{{ 'sensors:forms.link.title' | t:'Vincular sensor' }}</h3>
            <p>{{ 'sensors:forms.link.subtitle' | t:'Conecta un sensor activo a una planta.' }}</p>
          </header>
          <form [formGroup]="linkForm" (ngSubmit)="linkSensor()" class="sensors-card__form">
            <label>
              <span>{{ 'sensors:forms.common.sensorId' | t:'ID de sensor' }}</span>
              <select formControlName="sensorId">
                <option value="">{{ 'sensors:forms.link.chooseSensor' | t:'Selecciona un sensor' }}</option>
                <option *ngFor="let option of sensorOptions()" [value]="option.id">{{ option.label }}</option>
              </select>
            </label>
            <label>
              <span>{{ 'sensors:forms.link.plantId' | t:'ID de planta' }}</span>
              <select formControlName="plantId">
                <option value="">{{ 'sensors:forms.link.choosePlant' | t:'Selecciona una planta' }}</option>
                <option *ngFor="let option of plantOptions()" [value]="option.id">{{ option.label }}</option>
              </select>
            </label>
            <button class="btn btn--outline" type="submit" [disabled]="linkForm.invalid">
              {{ 'sensors:forms.link.action' | t:'Vincular' }}
            </button>
          </form>
        </article>

        <article class="sensors-card">
          <header>
            <h3>{{ 'sensors:forms.deactivate.title' | t:'Desactivar sensor' }}</h3>
            <p>{{ 'sensors:forms.deactivate.subtitle' | t:'Detén lecturas cuando ya no se use.' }}</p>
          </header>
          <form [formGroup]="deactivateForm" (ngSubmit)="deactivateSensor()" class="sensors-card__form">
            <label>
              <span>{{ 'sensors:forms.common.sensorId' | t:'ID de sensor' }}</span>
              <select formControlName="sensorId">
                <option value="">{{ 'sensors:forms.link.chooseSensor' | t:'Selecciona un sensor' }}</option>
                <option *ngFor="let option of sensorOptions()" [value]="option.id">{{ option.label }}</option>
              </select>
            </label>
            <button class="btn btn--outline" type="submit" [disabled]="deactivateForm.invalid">
              {{ 'sensors:forms.deactivate.action' | t:'Desactivar' }}
            </button>
          </form>
        </article>

        <article class="sensors-card">
          <header>
            <h3>{{ 'sensors:forms.ingest.title' | t:'Registrar lectura' }}</h3>
            <p>{{ 'sensors:forms.ingest.subtitle' | t:'Carga lecturas manuales para pruebas.' }}</p>
          </header>
          <form [formGroup]="ingestForm" (ngSubmit)="ingestReading()" class="sensors-card__form">
            <label>
              <span>{{ 'sensors:forms.common.sensorId' | t:'ID de sensor' }}</span>
              <select formControlName="sensorId">
                <option value="">{{ 'sensors:forms.link.chooseSensor' | t:'Selecciona un sensor' }}</option>
                <option *ngFor="let option of sensorOptions()" [value]="option.id">{{ option.label }}</option>
              </select>
            </label>
            <label>
              <span>{{ 'sensors:forms.ingest.metric' | t:'Métrica' }}</span>
              <input formControlName="metric" />
            </label>
            <div class="sensors-card__inline">
              <label>
                <span>{{ 'sensors:forms.ingest.value' | t:'Valor' }}</span>
                <input type="number" step="0.01" formControlName="value" />
              </label>
              <label>
                <span>{{ 'sensors:forms.ingest.timestamp' | t:'Fecha y hora' }}</span>
                <input type="datetime-local" formControlName="timestamp" />
              </label>
            </div>
            <label>
              <span>{{ 'sensors:forms.ingest.quality' | t:'Calidad' }}</span>
              <input formControlName="quality" />
            </label>
            <button class="btn btn--outline" type="submit" [disabled]="ingestForm.invalid">
              {{ 'sensors:forms.ingest.action' | t:'Enviar lectura' }}
            </button>
          </form>
        </article>
      </section>

      <ng-container *ngIf="sensors().length; else sensorsEmpty">
        <div class="sensors__table-card">
          <table class="sensors__table">
            <thead>
              <tr>
                <th>{{ 'sensors:table.id' | t:'ID' }}</th>
                <th>{{ 'sensors:table.type' | t:'Tipo' }}</th>
                <th>{{ 'sensors:table.status' | t:'Estado' }}</th>
                <th>{{ 'sensors:table.plant' | t:'Planta' }}</th>
                <th>{{ 'sensors:table.lastReading' | t:'Última lectura' }}</th>
                <th>{{ 'sensors:table.actions' | t:'Acciones' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sensor of sensors()">
                <td>{{ sensor.id }}</td>
                <td>
                  {{
                    typeCopy(sensor.type).label
                      | t:typeCopy(sensor.type).fallback
                  }}
                </td>
                <td>
                  <span class="badge" [ngClass]="badgeClass(sensor.status)">
                    {{
                      getStatusCopy(sensor.status).key
                        | t:getStatusCopy(sensor.status).fallback
                    }}
                  </span>
                </td>
                <td>{{ sensor.plantId ?? ('common:generic.na' | t:'N/A') }}</td>
                <td>{{ sensor.lastReadingAt | date:'short' }}</td>
                <td class="sensors__table-actions">
                  <button class="btn btn--ghost btn--small" type="button" (click)="prefillSensor(sensor.id)">
                    {{ 'sensors:forms.common.useSensor' | t:'Usar en formularios' }}
                  </button>
                  <button class="btn btn--outline btn--small" type="button" (click)="viewReadings(sensor.id)">
                    {{ 'sensors:readings.view' | t:'Ver lecturas' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <ng-template #sensorsEmpty>
        <p *ngIf="!isLoadingSensors()" class="sensors__empty">
          {{ 'sensors:empty' | t:'Sin sensores registrados' }}
        </p>
      </ng-template>

      <section class="sensors__activity-card">
        <h3>{{ 'sensors:activity.title' | t:'Actividad destacada' }}</h3>
        <ul class="sensors__activity">
          <li *ngFor="let item of activity()">
            <strong>{{ item.sensorId }}</strong>
            <span
              >{{ item.readingsCount }}
              {{ 'sensors:activity.readings' | t:'lecturas' }}</span
            >
            <button class="btn btn--ghost btn--small" type="button" (click)="viewReadings(item.sensorId)">
              {{ 'sensors:readings.view' | t:'Ver lecturas' }}
            </button>
          </li>
        </ul>
      </section>

      <section class="page-card sensors__readings" *ngIf="selectedSensorId">
        <header class="sensors__readings-header">
          <div>
            <p class="sensors__eyebrow">{{ 'sensors:readings.eyebrow' | t:'Histórico' }}</p>
            <h3>{{ 'sensors:readings.title' | t:'Lecturas recientes' }}</h3>
            <small>
              {{ 'sensors:readings.sensor' | t:'Sensor' }}:
              {{ selectedSensorId }}
            </small>
          </div>
          <button class="btn btn--ghost btn--small" type="button" (click)="closeReadings()">
            {{ 'sensors:readings.close' | t:'Cerrar' }}
          </button>
        </header>
        <div *ngIf="isLoadingReadings(); else readingsTable" class="sensors__loading">
          {{ 'common:generic.loading' | t:'Cargando...' }}
        </div>
        <ng-template #readingsTable>
          <table *ngIf="readings().length; else noReadings" class="sensors__table sensors__table--compact">
            <thead>
              <tr>
                <th>{{ 'sensors:readings.metric' | t:'Métrica' }}</th>
                <th>{{ 'sensors:readings.value' | t:'Valor' }}</th>
                <th>{{ 'sensors:readings.timestamp' | t:'Fecha' }}</th>
                <th>{{ 'sensors:readings.quality' | t:'Calidad' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reading of readings()">
                <td>
                  {{
                    metricCopy(reading.metric).label
                      | t:metricCopy(reading.metric).fallback
                  }}
                </td>
                <td>{{ reading.value | number: '1.2-2' }}</td>
                <td>{{ reading.timestamp | date: 'short' }}</td>
                <td>{{ reading.quality ?? ('common:generic.na' | t:'N/A') }}</td>
              </tr>
            </tbody>
          </table>
          <ng-template #noReadings>
            <p class="sensors__empty">{{ 'sensors:readings.empty' | t:'Sin lecturas registradas.' }}</p>
          </ng-template>
        </ng-template>
      </section>
    </section>
  `,
  styles: [
    `
      .sensors__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .sensors__hint {
        margin: 0.5rem 0 1rem;
        color: var(--color-muted);
      }
      .sensors__filters {
        margin: 1.25rem 0;
        padding: 1rem 1.25rem;
        border-radius: 1rem;
        border: 1px dashed rgba(15, 61, 46, 0.18);
        background: #f6faf6;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .sensors__filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.85rem;
      }
      .sensors__field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-size: 0.85rem;
        color: var(--color-muted);
      }
      .sensors__field span {
        font-weight: 600;
      }
      .sensors__filters-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.75rem;
      }
      .sensors__forms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.2rem;
        margin: 1.5rem 0;
        align-items: stretch;
      }
      .sensors-card {
        border: 1px solid rgba(19, 38, 25, 0.08);
        border-radius: 1.2rem;
        padding: 1.25rem;
        background: #fff;
        box-shadow: 0 12px 30px rgba(11, 48, 31, 0.08);
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        height: 100%;
      }
      .sensors-card header h3 {
        margin: 0;
        font-size: 1.05rem;
      }
      .sensors-card header p {
        margin: 0.2rem 0 0;
        color: var(--color-muted);
        font-size: 0.85rem;
      }
      .sensors-card__form {
        display: grid;
        gap: 0.75rem;
      }
      .sensors-card__form label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-weight: 600;
        color: var(--color-primary);
      }
      .sensors-card__form input,
      .sensors-card__form select {
        width: 100%;
        padding: 0.95rem 1rem;
        border-radius: 0.9rem;
        border: 1px solid rgba(15, 61, 46, 0.12);
        background: #f7fbf8;
        transition: border-color 0.2s ease;
      }
      .sensors-card__form input:focus,
      .sensors-card__form select:focus {
        border-color: var(--color-accent);
      }
      .sensors-card__form select {
        appearance: none;
        background-image: linear-gradient(45deg, transparent 50%, var(--color-primary) 50%),
          linear-gradient(135deg, var(--color-primary) 50%, transparent 50%);
        background-position: calc(100% - 0.85rem) center, calc(100% - 0.45rem) center;
        background-size: 6px 6px, 6px 6px;
        background-repeat: no-repeat;
      }
      .sensors-card__form select::-ms-expand {
        display: none;
      }
      .sensors-card__inline {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
      }
      .sensors-card__form button {
        width: 100%;
        margin-top: 0.35rem;
      }
      .sensors__table-card {
        margin-top: 1.25rem;
        border: 1px solid var(--color-border);
        border-radius: 1rem;
        overflow-x: auto;
        background: #fff;
      }
      .sensors__table {
        width: 100%;
        border-collapse: collapse;
        min-width: 680px;
      }
      .sensors__table th,
      .sensors__table td {
        border-bottom: 1px solid var(--color-border);
        padding: 0.9rem;
        text-align: left;
      }
      .sensors__table-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }
      .sensors__activity-card {
        margin-top: 1.5rem;
        border-radius: 1rem;
        border: 1px solid var(--color-border);
        padding: 1.25rem;
        background: #f9fcf7;
      }
      .sensors__activity {
        list-style: none;
        padding: 0;
        margin: 0.75rem 0 0;
        display: grid;
        gap: 0.75rem;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
      .sensors__activity li {
        border: 1px solid var(--color-border);
        border-radius: 0.85rem;
        padding: 0.85rem;
        background: var(--color-surface);
        display: grid;
        gap: 0.3rem;
      }
      .sensors__readings {
        margin-top: 1.5rem;
      }
      .sensors__readings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;
      }
      .sensors__loading,
      .sensors__empty {
        text-align: center;
        color: var(--color-muted);
        margin: 1rem 0;
      }
      @media (max-width: 600px) {
        .sensors__filters-actions {
          flex-direction: column;
        }
        .sensors__filters-actions .btn,
        .sensors-card__form button {
          width: 100%;
        }
      }
      .btn--small {
        padding: 0.3rem 0.8rem;
        font-size: 0.85rem;
      }
    `
  ]
})
export class SensorsViewComponent implements OnInit {
  private readonly sensorFacade = inject(SensorFacade);
  private readonly fb = inject(FormBuilder);
  private readonly plantOptionsService = inject(PlantOptionsService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
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
    this.sensorFacade.linkSensor(sensorId, plantId);
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
}
