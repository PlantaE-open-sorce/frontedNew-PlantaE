import { HardwareSnapshot } from '../home/home-dashboard.model';

export type NurseryAssetType = 'PLANT' | 'BATCH';
export type NurseryTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface NurseryBatchCard {
  batchId: string;
  label: string;
  species: string;
  plantCount: number;
  routineStatus: string;
  progressPercent: number;
  hardwareProfile: HardwareSnapshot;
}

export interface NurseryTask {
  id: string;
  title: string;
  assetId: string;
  assetType: NurseryAssetType;
  dueDate?: string;
  priority: NurseryTaskPriority;
  status: string;
  notes?: string;
}

export interface NurseryInput {
  id: string;
  assetId: string;
  assetType: NurseryAssetType;
  inputType: string;
  quantity: number;
  unit: string;
  cost: number;
  appliedAt?: string;
  appliedBy: string;
}

export interface NurseryDashboard {
  totalPlants: number;
  activeBatches: number;
  pendingTasks: number;
  highlightedBatches: NurseryBatchCard[];
  criticalTasks: NurseryTask[];
  recentInputs: NurseryInput[];
  hardwareStatus: HardwareSnapshot[];
}

export interface ScheduleNurseryTaskPayload {
  title: string;
  assetId: string;
  assetType: NurseryAssetType;
  dueDate?: string;
  priority: NurseryTaskPriority;
  notes?: string;
}

export interface RegisterNurseryInputPayload {
  assetId: string;
  assetType: NurseryAssetType;
  inputType: string;
  quantity: number;
  unit: string;
  cost: number;
  appliedAt?: string;
  appliedBy: string;
}
