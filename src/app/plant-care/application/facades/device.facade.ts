import { Injectable, Signal, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../shared/infrastructure/services/notification.service';
import { DeviceRepository } from '../../domain/repositories/device.repository';
import { Device, DeviceNotePayload, RegisterDevicePayload } from '../../domain/models/device.model';

@Injectable({ providedIn: 'root' })
export class DeviceFacade {
  private readonly selectedDeviceState = signal<Device | null>(null);
  private readonly loading = signal(false);
  private readonly devicesState = signal<Device[]>([]);

  readonly device: Signal<Device | null> = this.selectedDeviceState.asReadonly();
  readonly isLoading: Signal<boolean> = this.loading.asReadonly();
  readonly devices = this.devicesState.asReadonly();

  constructor(
    private readonly repository: DeviceRepository,
    private readonly notifications: NotificationService
  ) {}

  register(payload: RegisterDevicePayload) {
    this.loading.set(true);
    this.repository
      .register(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (device) => {
          this.notifications.success('Dispositivo registrado');
          this.selectedDeviceState.set(device);
          this.upsertDevice(device);
        },
        error: () => this.notifications.error('No pudimos registrar el dispositivo')
      });
  }

  load(id: string) {
    this.loading.set(true);
    this.repository
      .get(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (device) => {
          this.selectedDeviceState.set(device);
          this.upsertDevice(device);
        },
        error: () => this.notifications.error('No pudimos encontrar el dispositivo')
      });
  }

  updateNote(id: string, payload: DeviceNotePayload) {
    this.repository.updateNote(id, payload).subscribe({
      next: (device) => {
        this.notifications.success('Nota actualizada');
        this.selectedDeviceState.set(device);
        this.upsertDevice(device);
      },
      error: () => this.notifications.error('No pudimos actualizar la nota')
    });
  }

  deactivate(id: string) {
    this.repository.deactivate(id).subscribe({
      next: (device) => {
        this.notifications.success('Dispositivo desactivado');
        this.selectedDeviceState.set(device);
        this.upsertDevice(device);
      },
      error: () => this.notifications.error('No pudimos desactivar el dispositivo')
    });
  }

  linkToPlant(id: string, plantId: string) {
    this.repository.linkToPlant(id, plantId).subscribe({
      next: () => this.notifications.success('Dispositivo vinculado'),
      error: () => this.notifications.error('No pudimos vincular el dispositivo')
    });
  }

  loadDevices(activeOnly = false) {
    this.repository.list(activeOnly).subscribe({
      next: (devices) => this.devicesState.set(devices),
      error: () => this.notifications.error('No pudimos cargar tus dispositivos')
    });
  }

  private upsertDevice(device: Device) {
    this.devicesState.update((current) => {
      const index = current.findIndex((item) => item.id === device.id);
      if (index >= 0) {
        const updated = [...current];
        updated[index] = device;
        return updated;
      }
      return [device, ...current];
    });
  }
}
