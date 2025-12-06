export interface PlantSearchParams {
  keyword?: string;
  name?: string;
  species?: string;
  location?: string;
  status?: string;
  createdFrom?: string;
  createdTo?: string;
  hasAlerts?: boolean;
  sensorId?: string;
  sort?: string;
  page?: number;
  size?: number;
}
