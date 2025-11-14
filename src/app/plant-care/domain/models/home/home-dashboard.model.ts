export interface HomePlantCard {
  id: string;
  name: string;
  species: string;
  status: string;
  hasAlerts: boolean;
}

export interface HomeManualAction {
  id: string;
  actionType: string;
  notes: string;
  performedAt: string;
  durationMinutes: number;
}

export interface HardwareSnapshot {
  component: string;
  status: string;
  lastUpdated: string;
}

export interface HomeDashboard {
  greeting: string;
  tipOfTheDay: string;
  plants: HomePlantCard[];
  recentActions: HomeManualAction[];
  hardwareStatus: HardwareSnapshot[];
}

export interface RegisterManualActionPayload {
  actionType: string;
  notes?: string;
  performedAt?: string;
  durationMinutes?: number;
}
