import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../../../shared/domain/models/paged-result.model';
import { ApiClientService } from '../../../shared/infrastructure/services/api-client.service';
import { Plant } from '../../domain/models/plant.model';
import { PlantSearchParams } from '../../domain/models/plant-search.model';
import { CreatePlantPayload, UpdatePlantPayload } from '../../domain/models/plant-save.model';
import { PlantAlert } from '../../domain/models/plant-alert.model';
import { PlantRepository } from '../../domain/repositories/plant.repository';

@Injectable({ providedIn: 'root' })
export class HttpPlantRepository implements PlantRepository {
  constructor(private readonly api: ApiClientService) {}

  search(params: PlantSearchParams): Observable<PagedResult<Plant>> {
    return this.api.get<PagedResult<Plant>>('plants', {
      params: { ...params } as Record<string, string | number | boolean | undefined>
    });
  }

  get(id: string) {
    return this.api.get<Plant>(`plants/${id}`);
  }

  create(payload: CreatePlantPayload) {
    return this.api.post<Plant>('plants', payload);
  }

  update(id: string, payload: UpdatePlantPayload) {
    return this.api.put<void>(`plants/${id}`, payload);
  }

  delete(id: string) {
    return this.api.delete<void>(`plants/${id}`);
  }

  getAlerts(id: string, page = 0, size = 20) {
    return this.api.get<PlantAlert[]>(`plants/${id}/alerts`, { params: { page, size } });
  }
}
