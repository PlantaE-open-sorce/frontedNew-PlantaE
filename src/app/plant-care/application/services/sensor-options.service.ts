import { Injectable, Signal, computed, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { SensorRepository } from '../../domain/repositories/sensor.repository';
import { Sensor, SensorSearchParams } from '../../domain/models/sensor.model';

@Injectable({ providedIn: 'root' })
export class SensorOptionsService {
    private readonly optionsState = signal<Sensor[]>([]);
    private readonly loadingState = signal(false);
    private loaded = false;

    readonly options: Signal<{ id: string; label: string; type: string }[]> = computed(() =>
        this.optionsState().map((sensor) => ({
            id: sensor.id,
            label: `${this.getSensorTypeName(sensor.type)} (${sensor.id.slice(0, 8)}...)`,
            type: sensor.type
        }))
    );
    readonly isLoading = this.loadingState.asReadonly();

    constructor(private readonly sensorRepository: SensorRepository) { }

    load(params: SensorSearchParams = { page: 0, size: 100 }) {
        if (this.loaded) {
            return;
        }
        this.loaded = true;
        this.loadingState.set(true);
        this.sensorRepository
            .search(params)
            .pipe(finalize(() => this.loadingState.set(false)))
            .subscribe({
                next: (result) => this.optionsState.set(result.content),
                error: () => {
                    this.loaded = false;
                }
            });
    }

    reload() {
        this.loaded = false;
        this.load();
    }

    private getSensorTypeName(type: string): string {
        const typeNames: Record<string, string> = {
            SOIL: 'Humedad del Suelo',
            TEMPERATURE: 'Temperatura',
            HUMIDITY: 'Humedad Ambiental',
            LIGHT: 'Luz',
            MULTI: 'Multisensor'
        };
        return typeNames[type] || type;
    }
}
