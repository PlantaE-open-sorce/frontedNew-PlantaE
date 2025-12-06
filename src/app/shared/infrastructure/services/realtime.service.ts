import { Inject, Injectable, OnDestroy } from '@angular/core';
import { PlantaeFrontConfig, PLANTAE_CONFIG } from '../config/app-config.token';
import { AuthService } from './auth.service';

export interface ReadingEvent {
  sensorId: string;
  plantId?: string | null;
  metric: string;
  value: number;
  timestamp: string;
}

export interface AlertEvent {
  id: string;
  plantId: string;
  sensorId?: string | null;
  type: string;
  status: string;
  occurredAt: string;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private readingsSource?: EventSource;
  private alertsSource?: EventSource;

  constructor(
    @Inject(PLANTAE_CONFIG) private readonly config: PlantaeFrontConfig,
    private readonly auth: AuthService
  ) {}

  connectToReadings(onEvent: (event: ReadingEvent) => void) {
    this.closeReadings();
    const url = this.buildUrl('stream/readings');
    if (!url) {
      return;
    }
    this.readingsSource = new EventSource(url);
    this.readingsSource.addEventListener('reading', (event) => {
      try {
        const parsed = JSON.parse((event as MessageEvent<string>).data) as ReadingEvent;
        onEvent(parsed);
      } catch (error) {
        console.warn('Invalid reading event', error);
      }
    });
    this.readingsSource.onerror = () => this.closeReadings();
  }

  connectToAlerts(onEvent: (event: AlertEvent) => void) {
    this.closeAlerts();
    const url = this.buildUrl('stream/alerts');
    if (!url) {
      return;
    }
    this.alertsSource = new EventSource(url);
    this.alertsSource.addEventListener('alert', (event) => {
      try {
        const parsed = JSON.parse((event as MessageEvent<string>).data) as AlertEvent;
        onEvent(parsed);
      } catch (error) {
        console.warn('Invalid alert event', error);
      }
    });
    this.alertsSource.onerror = () => this.closeAlerts();
  }

  closeReadings() {
    if (this.readingsSource) {
      this.readingsSource.close();
      this.readingsSource = undefined;
    }
  }

  closeAlerts() {
    if (this.alertsSource) {
      this.alertsSource.close();
      this.alertsSource = undefined;
    }
  }

  ngOnDestroy(): void {
    this.closeReadings();
    this.closeAlerts();
  }

  private buildUrl(path: string): string | null {
    const token = this.auth.getToken();
    if (!token) {
      return null;
    }
    const base = this.config.apiBaseUrl.replace(/\/$/, '');
    const endpoint = `${base}/${path.replace(/^\/+/, '')}`;
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}token=${encodeURIComponent(token)}`;
  }
}
