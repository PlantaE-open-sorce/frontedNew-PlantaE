import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PlantRepository} from '../../domain/repositories/plant.repository';
import {Plant} from '../../domain/models/plant.model';
import {PlantType} from '../../domain/models/plant-type.model';

@Injectable({ providedIn: 'root' })
export class PlantFacade {
  private readonly repository = inject(PlantRepository);

  list(): Observable<Plant[]> {
    return this.repository.list();
  }

  getById(id: string): Observable<Plant> {
    return this.repository.getById(id);
  }

  create(plant: Partial<Plant>): Observable<Plant> {
    return this.repository.create(plant);
  }

  update(id: string, changes: Partial<Plant>): Observable<Plant> {
    return this.repository.update(id, changes);
  }

  delete(id: string): Observable<void> {
    return this.repository.delete(id);
  }

  getPlantTypes(): Observable<PlantType[]> {
    return this.repository.getPlantTypes();
  }
}
