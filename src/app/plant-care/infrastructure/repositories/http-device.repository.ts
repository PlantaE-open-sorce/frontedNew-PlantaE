import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from '../../../shared/infrastructure/services/api-client.service';
import { DeviceRepository } from '../../domain/repositories/device.repository';
import { Device, DeviceNotePayload, RegisterDevicePayload } from '../../domain/models/device.model';

@Injectable({ providedIn: 'root' })
export class HttpDeviceRepository implements DeviceRepository {
  constructor(private readonly api: ApiClientService) {}

  list(activeOnly = false) {
    return this.api.get<Device[]>('devices', { params: { activeOnly } });
  }

  register(payload: RegisterDevicePayload) {
    return this.api.post<Device>('devices', payload);
  }

  get(id: string) {
    return this.api.get<Device>(`devices/${id}`);
  }

  updateNote(id: string, payload: DeviceNotePayload) {
    return this.api.put<Device>(`devices/${id}/note`, payload);
  }

  deactivate(id: string) {
    return this.api.post<Device>(`devices/${id}/deactivate`, {});
  }

  linkToPlant(id: string, plantId: string) {
    return this.api.post<void>(`devices/${id}/link`, { plantId });
  }
}
