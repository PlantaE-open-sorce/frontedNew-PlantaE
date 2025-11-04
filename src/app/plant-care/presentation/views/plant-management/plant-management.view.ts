import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {BehaviorSubject, combineLatest, map} from 'rxjs';
import {PlantFacade} from '../../../application/facades/plant.facade';
import {Plant} from '../../../domain/models/plant.model';

interface SortOption {
  id: 'name' | 'critical' | 'recent' | 'active';
  label: string;
}

@Component({
  selector: 'app-plant-management-view',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, RouterLink, TranslatePipe],
  templateUrl: './plant-management.view.html',
  styleUrl: './plant-management.view.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlantManagementView {
  private readonly plantFacade = inject(PlantFacade);

  private readonly sortSelection$ = new BehaviorSubject<SortOption['id']>('name');

  readonly options: SortOption[] = [
    { id: 'name', label: 'plant-management.sort.name' },
    { id: 'critical', label: 'plant-management.sort.critical' },
    { id: 'recent', label: 'plant-management.sort.recent' },
    { id: 'active', label: 'plant-management.sort.active' }
  ];

  readonly plants$ = combineLatest([
    this.plantFacade.list(),
    this.sortSelection$
  ]).pipe(map(([plants, sort]) => this.sortPlants([...plants], sort)));

  selectSort(option: SortOption['id']): void {
    this.sortSelection$.next(option);
  }

  trackById(_: number, plant: Plant): string {
    return plant.id;
  }

  private sortPlants(plants: Plant[], sort: SortOption['id']): Plant[] {
    switch (sort) {
      case 'critical':
        return plants.sort((a, b) => this.alertWeight(b.alertLevel) - this.alertWeight(a.alertLevel));
      case 'recent':
        return plants.sort((a, b) => new Date(b.sowingDate).getTime() - new Date(a.sowingDate).getTime());
      case 'active':
        return plants.sort((a, b) => b.metrics.conductivity - a.metrics.conductivity);
      default:
        return plants.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  private alertWeight(level: Plant['alertLevel']): number {
    switch (level) {
      case 'critical':
        return 3;
      case 'warning':
        return 2;
      default:
        return 1;
    }
  }
}
