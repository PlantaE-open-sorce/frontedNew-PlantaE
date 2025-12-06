import { Observable } from 'rxjs';
import { PagedResult } from '../../../shared/domain/models/paged-result.model';
import {
  Sensor,
  SensorActivity,
  SensorReading,
  SensorSearchParams,
  RegisterSensorPayload,
  LinkSensorPayload,
  IngestSensorReadingPayload
} from '../models/sensor.model';

export abstract class SensorRepository {
  abstract search(params: SensorSearchParams): Observable<PagedResult<Sensor>>;
  abstract get(id: string): Observable<Sensor>;
  abstract getActivity(top?: number): Observable<SensorActivity[]>;
  abstract getReadings(sensorId: string, query?: { from?: string; to?: string; metric?: string; page?: number; size?: number }): Observable<PagedResult<SensorReading>>;
  abstract register(payload: RegisterSensorPayload): Observable<Sensor>;
  abstract link(sensorId: string, payload: LinkSensorPayload): Observable<void>;
  abstract deactivate(sensorId: string): Observable<void>;
  abstract ingestReading(sensorId: string, payload: IngestSensorReadingPayload): Observable<void>;
}
