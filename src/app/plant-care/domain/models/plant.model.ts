export type PlantStatus = 'ACTIVE' | 'INACTIVE' | 'NEEDS_ATTENTION';

export interface Plant {
  id: string;
  ownerId?: string;
  name: string;
  species: string;
  location?: string;
  status?: PlantStatus;
  sensorId?: string;
  createdAt?: string;
  updatedAt?: string;
  hasAlerts?: boolean;
}
