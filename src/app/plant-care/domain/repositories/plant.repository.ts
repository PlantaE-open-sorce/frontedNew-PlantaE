import { Observable } from 'rxjs';
import { PagedResult } from '../../../shared/domain/models/paged-result.model';
import { Plant } from '../models/plant.model';
import { PlantSearchParams } from '../models/plant-search.model';
import { CreatePlantPayload, UpdatePlantPayload } from '../models/plant-save.model';
import { PlantAlert } from '../models/plant-alert.model';

export abstract class PlantRepository {
  abstract search(params: PlantSearchParams): Observable<PagedResult<Plant>>;
  abstract get(id: string): Observable<Plant>;
  abstract create(payload: CreatePlantPayload): Observable<Plant>;
  abstract update(id: string, payload: UpdatePlantPayload): Observable<void>;
  abstract delete(id: string): Observable<void>;
  abstract getAlerts(id: string, page?: number, size?: number): Observable<PlantAlert[]>;
}
