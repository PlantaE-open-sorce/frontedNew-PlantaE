import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';
import { NotificationService } from '../../../../shared/infrastructure/services/notification.service';
import { SensorRepository } from '../../../domain/repositories/sensor.repository';
import {
  SpeciesCatalogService,
  SpeciesCategory,
  SpeciesGroup
} from '../../../../shared/infrastructure/services/species-catalog.service';

@Component({
  selector: 'app-plant-detail-view',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ReactiveFormsModule],
  templateUrl: './plant-detail.view.html',
  styleUrls: ['./plant-detail.view.css']
})
export class PlantDetailViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly plantFacade = inject(PlantFacade);
  private readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);
  private readonly sensorRepository = inject(SensorRepository);
  private readonly speciesCatalog = inject(SpeciesCatalogService);
  private readonly notifications = inject(NotificationService);
  private readonly statusCopies = {
    RESOLVED: { key: 'plants:detail.alerts.status.resolved', fallback: 'Resuelta' },
    ACKNOWLEDGED: { key: 'plants:detail.alerts.status.acknowledged', fallback: 'Reconocida' },
    default: { key: 'plants:detail.alerts.status.open', fallback: 'Abierta' }
  };

  readonly plant = this.plantFacade.selectedPlant;
  readonly isLoading = this.plantFacade.isSelectedPlantLoading;
  readonly alerts = this.plantFacade.alerts;
  readonly alertsAreLoading = this.plantFacade.alertsAreLoading;
  readonly catalog = this.speciesCatalog.categories();
  readonly fallbackCatalog: SpeciesCategory[] = [];
  editing = false;
  saving = false;
  sensorOptions: { id: string; label: string }[] = [];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    species: ['', Validators.required],
    location: [''],
    sensorId: ['']
  });

  ngOnInit(): void {
    this.i18n.loadNamespace('plants');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.plantFacade.loadPlant(id);
      this.loadSensors();
    }
    effect(() => {
      const p = this.plant();
      if (p) {
        this.form.patchValue({
          name: p.name ?? '',
          species: p.species ?? '',
          location: p.location ?? '',
          sensorId: p.sensorId ?? ''
        });
      }
    });
  }

  goBack() {
    history.back();
  }

  exportPdf() {
    const current = this.plant();
    if (!current) return;
    this.plantFacade.downloadReport(current.id, 'pdf').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `plant-${current.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.notifications.success(this.i18n.translate('plants:detail.exported', 'Reporte descargado'));
      },
      error: () =>
        this.notifications.error(
          this.i18n.translate('errors:unexpected', 'No pudimos exportar el reporte')
        )
    });
  }

  badgeClass(status?: string) {
    switch (status) {
      case 'RESOLVED':
        return 'badge--success';
      case 'ACKNOWLEDGED':
        return 'badge--warning';
      default:
        return 'badge--danger';
    }
  }

  getStatusCopy(status?: string | null) {
    if (!status) {
      return this.statusCopies.default;
    }
    return this.statusCopies[status as keyof typeof this.statusCopies] ?? this.statusCopies.default;
  }

  get categories() {
    const api = this.catalog();
    return api.length ? api : this.fallbackCatalog;
  }

  get groups(): SpeciesGroup[] {
    const api = this.catalog();
    if (api.length) {
      const current = api.find((c) => c.key === api[0].key) ?? api[0];
      return current?.groups ?? [];
    }
    return [];
  }

  toggleEdit() {
    this.editing = !this.editing;
  }

  save() {
    const current = this.plant();
    if (!current || this.form.invalid) return;
    this.saving = true;
    const { name, species, location, sensorId } = this.form.getRawValue();
    this.plantFacade.updatePlant(current.id, {
      name,
      species,
      location: location || undefined,
      sensorId: sensorId || undefined
    });
    this.saving = false;
    this.editing = false;
    this.notifications.success(this.i18n.translate('plants:detail.updated', 'Planta actualizada'));
  }

  private loadSensors() {
    this.sensorRepository.search({ page: 0, size: 50 }).subscribe({
      next: (result) =>
      (this.sensorOptions = result.content.map((sensor) => ({
        id: sensor.id,
        label: `${sensor.id} · ${sensor.type ?? 'Sensor'}`
      }))),
      error: () => (this.sensorOptions = [])
    });
  }
}
