import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertFacade } from '../../../application/facades/alert.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';
import { RealtimeService } from '../../../../shared/infrastructure/services/realtime.service';
import { AutocompleteComponent } from '../../../../shared/presentation/components/autocomplete/autocomplete.component';
import { PlantOptionsService } from '../../../application/services/plant-options.service';
import { SensorOptionsService } from '../../../application/services/sensor-options.service';

@Component({
  selector: 'app-alerts-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, AutocompleteComponent],
  templateUrl: './alerts.view.html',
  styleUrls: ['./alerts.view.css']
})
export class AlertsViewComponent implements OnInit, OnDestroy {
  private readonly alertFacade = inject(AlertFacade);
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly realtime = inject(RealtimeService);
  private readonly plantOptionsService = inject(PlantOptionsService);
  private readonly sensorOptionsService = inject(SensorOptionsService);

  private readonly statusCopies = {
    OPEN: { key: 'alerts:status.open', fallback: 'Abierta' },
    ACTIVE: { key: 'alerts:status.active', fallback: 'Activa' },
    ACKNOWLEDGED: { key: 'alerts:status.acknowledged', fallback: 'Reconocida' },
    RESOLVED: { key: 'alerts:status.resolved', fallback: 'Resuelta' },
    RECOVERED: { key: 'alerts:status.recovered', fallback: 'Resuelta' },
    default: { key: 'alerts:status.unknown', fallback: 'Estado desconocido' }
  };

  readonly alerts = this.alertFacade.alerts;
  readonly isLoading = this.alertFacade.isLoading;
  readonly page = this.alertFacade.page;
  readonly hasMore = this.alertFacade.hasMore;

  readonly plantOptions = this.plantOptionsService.options;
  readonly sensorOptions = this.sensorOptionsService.options;

  readonly alertTypeOptions = computed(() => [
    { id: 'THRESHOLD_BREACH', label: 'Umbral excedido' },
    { id: 'LOW_BATTERY', label: 'Batería baja' },
    { id: 'SENSOR_OFFLINE', label: 'Sensor desconectado' },
    { id: 'CRITICAL', label: 'Crítica' }
  ]);

  readonly filters = this.fb.nonNullable.group({
    plantId: [''],
    sensorId: [''],
    type: ['']
  });
  private disconnectAlerts?: () => void;

  ngOnInit(): void {
    this.i18n.loadNamespace('alerts');
    this.alertFacade.load();
    this.plantOptionsService.load();
    this.sensorOptionsService.load();
    this.startRealtime();
  }

  ngOnDestroy(): void {
    this.disconnectAlerts?.();
    this.disconnectAlerts = undefined;
  }

  applyFilters() {
    this.alertFacade.load(this.filters.getRawValue());
  }

  resetFilters() {
    this.filters.reset({ plantId: '', sensorId: '', type: '' });
    this.applyFilters();
  }

  refresh() {
    this.alertFacade.load(this.filters.getRawValue());
  }

  badgeClass(status: string) {
    switch (status) {
      case 'RESOLVED':
      case 'RECOVERED':
        return 'badge--success';
      case 'ACKNOWLEDGED':
        return 'badge--warning';
      default:
        return 'badge--danger';
    }
  }

  nextPage() {
    this.alertFacade.nextPage();
  }

  previousPage() {
    this.alertFacade.previousPage();
  }

  resolve(alertId: string) {
    this.alertFacade.resolve(alertId);
  }

  getStatusCopy(status?: string | null) {
    if (!status) {
      return this.statusCopies.default;
    }
    return this.statusCopies[status as keyof typeof this.statusCopies] ?? this.statusCopies.default;
  }

  getAlertTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      THRESHOLD_BREACH: 'Umbral Excedido',
      LOW_BATTERY: 'Batería Baja',
      SENSOR_OFFLINE: 'Sensor Desconectado',
      CRITICAL: 'Crítica'
    };
    return typeNames[type] || type;
  }

  getSensorTypeName(type?: string): string {
    if (!type) return 'Desconocido';
    const typeNames: Record<string, string> = {
      SOIL: 'Humedad del Suelo',
      TEMPERATURE: 'Temperatura',
      HUMIDITY: 'Humedad Ambiental',
      LIGHT: 'Luz',
      MULTI: 'Multisensor'
    };
    return typeNames[type] || type;
  }

  private startRealtime() {
    this.disconnectAlerts?.();
    this.realtime.connectToAlerts(() => {
      this.alertFacade.load(this.filters.getRawValue());
    });
    this.disconnectAlerts = () => this.realtime.closeAlerts();
  }
}
