import { Observable } from 'rxjs';
import { Device, DeviceNotePayload, RegisterDevicePayload } from '../models/device.model';

export abstract class DeviceRepository {
  abstract list(activeOnly?: boolean): Observable<Device[]>;
  abstract register(payload: RegisterDevicePayload): Observable<Device>;
  abstract get(id: string): Observable<Device>;
  abstract updateNote(id: string, payload: DeviceNotePayload): Observable<Device>;
  abstract deactivate(id: string): Observable<Device>;
  abstract linkToPlant(id: string, plantId: string): Observable<void>;
}
