export interface PlantSearchParams {
  name?: string;
  species?: string;
  status?: string;
  createdFrom?: string;
  createdTo?: string;
  hasAlerts?: boolean;
  sensorId?: string;
  sort?: string;
  page?: number;
  size?: number;
}
