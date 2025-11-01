export interface PlantMetrics {
  soilHumidity: number;
  ambientTemperature: number;
  batteryLevel: number;
  soilPh: number;
  conductivity: number;
  state: 'optimal' | 'warning' | 'critical';
}
