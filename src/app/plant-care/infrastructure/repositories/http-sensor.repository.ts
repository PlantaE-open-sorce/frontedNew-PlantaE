import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../shared/infrastructure/services/api-client.service';
import { PagedResult } from '../../../shared/domain/models/paged-result.model';
import { SensorRepository } from '../../domain/repositories/sensor.repository';
import {
  IngestSensorReadingPayload,
  LinkSensorPayload,
  RegisterSensorPayload,
  Sensor,
  SensorActivity,
  SensorReading,
  SensorSearchParams
} from '../../domain/models/sensor.model';

@Injectable({ providedIn: 'root' })
export class HttpSensorRepository implements SensorRepository {
  constructor(private readonly api: ApiClientService) {}

  search(params: SensorSearchParams) {
    return this.api.get<PagedResult<Sensor>>('sensors', {
      params: { ...params } as Record<string, string | number | boolean | undefined>
    });
  }

  get(id: string) {
    return this.api.get<Sensor>(`sensors/${id}`);
  }

  getActivity(top = 10) {
    return this.api.get<SensorActivity[]>('sensors/activity', { params: { top } });
  }

  getReadings(sensorId: string, query?: { from?: string; to?: string; metric?: string; page?: number; size?: number }) {
    return this.api.get<PagedResult<SensorReading>>(`sensors/${sensorId}/readings`, {
      params: query ? ({ ...query } as Record<string, string | number | boolean | undefined>) : undefined
    });
  }

  register(payload: RegisterSensorPayload) {
    return this.api.post<Sensor>('sensors', payload);
  }

  link(sensorId: string, payload: LinkSensorPayload) {
    return this.api.post<void>(`sensors/${sensorId}/link`, payload);
  }

  deactivate(sensorId: string) {
    return this.api.post<void>(`sensors/${sensorId}/deactivate`, {});
  }

  ingestReading(sensorId: string, payload: IngestSensorReadingPayload) {
    return this.api.post<void>(`sensors/${sensorId}/readings`, payload);
  }
}
