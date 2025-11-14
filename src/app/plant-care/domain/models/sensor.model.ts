import { PagedResult } from '../../../shared/domain/models/paged-result.model';

export interface Sensor {
  id: string;
  type: string;
  status: string;
  plantId?: string;
  ownerId?: string;
  lastReadingAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SensorActivity {
  sensorId: string;
  readingsCount: number;
}

export interface SensorReading {
  sensorId: string;
  timestamp: string;
  metric: string;
  value: number;
  quality?: string;
}

export interface SensorSearchParams {
  type?: string;
  status?: string;
  plantId?: string;
  page?: number;
  size?: number;
}

export interface RegisterSensorPayload {
  type: string;
  ownerId: string;
  plantId?: string;
}

export interface LinkSensorPayload {
  plantId: string;
}

export interface IngestSensorReadingPayload {
  timestamp?: string;
  metric: string;
  value: number;
  quality?: string;
}
