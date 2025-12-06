import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from '../../../shared/infrastructure/services/api-client.service';
import {
  NurseryBatchCard,
  NurseryDashboard,
  NurseryInput,
  NurseryTask,
  RegisterNurseryInputPayload,
  ScheduleNurseryTaskPayload
} from '../../domain/models/nursery/nursery-dashboard.model';
import { NurseryRepository } from '../../domain/repositories/nursery.repository';

@Injectable({ providedIn: 'root' })
export class HttpNurseryRepository implements NurseryRepository {
  constructor(private readonly api: ApiClientService) {}

  getDashboard() {
    return this.api.get<NurseryDashboard>('nursery/dashboard');
  }

  listBatches() {
    return this.api.get<NurseryBatchCard[]>('nursery/batches');
  }

  listTasks() {
    return this.api.get<NurseryTask[]>('nursery/tasks/todo');
  }

  scheduleTask(payload: ScheduleNurseryTaskPayload) {
    return this.api.post<NurseryTask>('nursery/tasks/specific', payload);
  }

  listInputs() {
    return this.api.get<NurseryInput[]>('nursery/inputs');
  }

  registerInput(payload: RegisterNurseryInputPayload) {
    return this.api.post<void>('nursery/inputs', payload).pipe(map(() => undefined));
  }
}
