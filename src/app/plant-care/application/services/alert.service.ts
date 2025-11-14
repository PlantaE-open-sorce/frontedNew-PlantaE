import { Injectable } from '@angular/core';
import { ApiClientService } from '../../../shared/infrastructure/services/api-client.service';
import { Observable } from 'rxjs';

export interface Alert {
  id: string;
  plantId: string;
  sensorId: string;
  type: string;
  status: string;
  message: string;
  occurredAt: string;
  resolvedAt?: string;
  value: number;
  metric: string;
}

export interface AlertFilters {
  plantId?: string;
  sensorId?: string;
  type?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private readonly api: ApiClientService) {}

  getRecent(filters: AlertFilters): Observable<Alert[]> {
    return this.api.get<Alert[]>('alerts/recent', {
      params: { ...filters } as Record<string, string | number>
    });
  }

  resolve(alertId: string) {
    return this.api.post<{ message: string }>(`alerts/${alertId}/resolve`, {});
  }
}
