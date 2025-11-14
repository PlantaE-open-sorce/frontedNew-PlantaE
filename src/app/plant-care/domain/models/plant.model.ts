export type PlantStatus = 'ACTIVE' | 'INACTIVE' | 'NEEDS_ATTENTION';

export interface Plant {
  id: string;
  ownerId?: string;
  name: string;
  species: string;
  status?: PlantStatus;
  deviceId?: string;
  sensorId?: string;
  createdAt?: string;
  updatedAt?: string;
  hasAlerts?: boolean;
}
