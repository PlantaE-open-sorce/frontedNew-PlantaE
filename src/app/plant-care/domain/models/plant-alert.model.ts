export interface PlantAlert {
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
