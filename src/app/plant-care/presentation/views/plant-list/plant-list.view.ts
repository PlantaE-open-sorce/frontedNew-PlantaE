import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';
import { SensorRepository } from '../../../domain/repositories/sensor.repository';
import { PlantSearchParams } from '../../../domain/models/plant-search.model';

@Component({
  selector: 'app-plant-list-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './plant-list.view.html',
  styleUrls: ['./plant-list.view.css']
})
export class PlantListViewComponent implements OnInit {
  private readonly plantFacade = inject(PlantFacade);
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly sensorRepository = inject(SensorRepository);

  showAdvancedFilters = false;

  private readonly statusCopies = {
    ACTIVE: { key: 'plants:list.status.active', fallback: 'Activa' },
    INACTIVE: { key: 'plants:list.status.inactive', fallback: 'Inactiva' },
    HEALTHY: { key: 'plants:list.status.healthy', fallback: 'Saludable' },
    NEEDS_ATTENTION: { key: 'plants:list.status.alert', fallback: 'Atención' },
    default: { key: 'plants:list.status.unknown', fallback: 'Sin estado' }
  };

  readonly plants = this.plantFacade.plants;
  readonly loading = this.plantFacade.loading;
  readonly pageInfo = this.plantFacade.pageInfo;
  readonly statusOptions = [
    { value: '', label: 'plants:list.filters.status.all', fallback: 'Todos' },
    { value: 'ACTIVE', label: 'plants:list.filters.status.active', fallback: 'Activa' },
    { value: 'INACTIVE', label: 'plants:list.filters.status.inactive', fallback: 'Inactiva' },
    { value: 'NEEDS_ATTENTION', label: 'plants:list.filters.status.alert', fallback: 'Atención' }
  ];
  readonly sortOptions = [
    { value: 'createdAt,desc', label: 'plants:list.filters.sortNewest', fallback: 'Más recientes' },
    { value: 'createdAt,asc', label: 'plants:list.filters.sortOldest', fallback: 'Más antiguas' },
    { value: 'name,asc', label: 'plants:list.filters.sortNameAsc', fallback: 'Nombre A-Z' },
    { value: 'name,desc', label: 'plants:list.filters.sortNameDesc', fallback: 'Nombre Z-A' }
  ];
  readonly speciesOptions: string[] = [
    'Ficus lyrata',
    'Monstera deliciosa',
    'Pothos aureus',
    'Sansevieria trifasciata',
    'Dracaena fragrans',
    'Philodendron hederaceum',
    'Lavandula angustifolia'
  ];
  sensorOptions: { id: string; label: string }[] = [];

  readonly filters = this.fb.nonNullable.group({
    keyword: [''],
    name: [''],
    species: [''],
    status: [''],
    hasAlerts: [''],
    location: [''],
    sensorId: [''],
    createdFrom: [''],
    createdTo: [''],
    sort: ['createdAt,desc'],
    page: [0],
    size: [9]
  });

  ngOnInit(): void {
    this.i18n.loadNamespace('plants');
    this.loadSensorOptions();
    this.refresh();
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  applyFilters() {
    this.filters.patchValue({ page: 0 });
    this.plantFacade.loadPlants(this.buildParams());
  }

  resetFilters() {
    this.filters.reset({
      keyword: '',
      name: '',
      species: '',
      status: '',
      hasAlerts: '',
      sensorId: '',
      createdFrom: '',
      createdTo: '',
      sort: 'createdAt,desc',
      page: 0,
      location: '',
      size: 9
    });
    this.applyFilters();
  }

  refresh() {
    this.plantFacade.loadPlants(this.buildParams({ ...this.filters.getRawValue(), page: 0 }));
  }

  changePage(delta: number) {
    const currentPage = this.pageInfo()?.page ?? 0;
    const nextPage = Math.max(0, currentPage + delta);
    this.plantFacade.loadPlants(this.buildParams({ ...this.filters.getRawValue(), page: nextPage }));
  }

  isLastPage() {
    const info = this.pageInfo();
    if (!info) {
      return true;
    }
    return info.page >= info.totalPages - 1;
  }

  statusCopy(status?: string | null) {
    if (!status) {
      return this.statusCopies.default;
    }
    return this.statusCopies[status as keyof typeof this.statusCopies] ?? this.statusCopies.default;
  }

  badgeClass(status?: string) {
    switch (status) {
      case 'ACTIVE':
      case 'HEALTHY':
        return 'badge--success';
      case 'INACTIVE':
        return 'badge--warning';
      case 'NEEDS_ATTENTION':
        return 'badge--danger';
      default:
        return 'badge--warning';
    }
  }

  private loadSensorOptions() {
    this.sensorRepository.search({ page: 0, size: 50 }).subscribe({
      next: (result) =>
      (this.sensorOptions = result.content.map((sensor) => ({
        id: sensor.id,
        label: `${sensor.id} · ${sensor.type ?? 'Sensor'}`
      }))),
      error: () => {
        this.sensorOptions = [];
      }
    });
  }

  private buildParams(raw: any = this.filters.getRawValue()): PlantSearchParams {
    const hasAlerts =
      raw.hasAlerts === 'true' ? true : raw.hasAlerts === 'false' ? false : undefined;

    const params: any = {
      ...raw,
      hasAlerts,
      keyword: raw.keyword || undefined,
      name: raw.name || undefined,
      species: raw.species || undefined,
      location: raw.location || undefined
    };

    // Remove undefined or empty string keys
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key];
      }
    });

    return params;
  }
}
