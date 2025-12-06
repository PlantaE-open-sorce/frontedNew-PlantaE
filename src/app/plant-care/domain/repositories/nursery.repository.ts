import { Observable } from 'rxjs';
import {
  NurseryBatchCard,
  NurseryDashboard,
  NurseryInput,
  NurseryTask,
  RegisterNurseryInputPayload,
  ScheduleNurseryTaskPayload
} from '../models/nursery/nursery-dashboard.model';

export abstract class NurseryRepository {
  abstract getDashboard(): Observable<NurseryDashboard>;
  abstract listBatches(): Observable<NurseryBatchCard[]>;
  abstract listTasks(): Observable<NurseryTask[]>;
  abstract scheduleTask(payload: ScheduleNurseryTaskPayload): Observable<NurseryTask>;
  abstract listInputs(): Observable<NurseryInput[]>;
  abstract registerInput(payload: RegisterNurseryInputPayload): Observable<void>;
}
