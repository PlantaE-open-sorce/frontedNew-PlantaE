import { Injectable, signal } from '@angular/core';
import { ApiClientService } from './api-client.service';

export interface SpeciesOption {
  label: string;
  value: string;
}

export interface SpeciesGroup {
  name: string;
  items: SpeciesOption[];
}

export interface SpeciesCategory {
  key: string;
  label: string;
  groups: SpeciesGroup[];
}

@Injectable({ providedIn: 'root' })
export class SpeciesCatalogService {
  private readonly categoriesState = signal<SpeciesCategory[]>([]);
  private loaded = false;

  constructor(private readonly api: ApiClientService) {}

  categories() {
    if (!this.loaded) {
      this.loaded = true;
      this.api.get<SpeciesCategory[]>('catalogs/species').subscribe({
        next: (cats) => this.categoriesState.set(cats ?? []),
        error: () => this.categoriesState.set([])
      });
    }
    return this.categoriesState.asReadonly();
  }
}
