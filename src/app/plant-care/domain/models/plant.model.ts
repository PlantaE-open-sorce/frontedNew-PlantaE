import {PlantMetrics} from './plant-metrics.model';

export type PlantAlertLevel = 'ok' | 'warning' | 'critical';

export interface Plant {
  id: string;
  name: string;
  type: string;
  sowingDate: string;
  sensorCode: string;
  imageUrl: string;
  lastReviewDays: number;
  alertLevel: PlantAlertLevel;
  statusLabel: string;
  sensorModel: string;
  reportsUrl: string;
  metrics: PlantMetrics;
}
