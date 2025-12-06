import { Injectable, Signal, computed, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PlantRepository } from '../../domain/repositories/plant.repository';
import { Plant } from '../../domain/models/plant.model';
import { PlantSearchParams } from '../../domain/models/plant-search.model';

@Injectable({ providedIn: 'root' })
export class PlantOptionsService {
  private readonly optionsState = signal<Plant[]>([]);
  private readonly loadingState = signal(false);
  private loaded = false;

  readonly options: Signal<{ id: string; label: string }[]> = computed(() =>
    this.optionsState().map((plant) => ({
      id: plant.id,
      label: `${plant.name ?? 'Plant'} (${plant.species})`
    }))
  );
  readonly isLoading = this.loadingState.asReadonly();

  constructor(private readonly plantRepository: PlantRepository) {}

  load(params: PlantSearchParams = { page: 0, size: 100, sort: 'name,asc' }) {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.loadingState.set(true);
    this.plantRepository
      .search(params)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (result) => this.optionsState.set(result.content),
        error: () => {
          this.loaded = false;
        }
      });
  }
}
