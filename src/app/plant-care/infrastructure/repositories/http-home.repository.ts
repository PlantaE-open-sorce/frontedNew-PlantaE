import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from '../../../shared/infrastructure/services/api-client.service';
import { HomeRepository } from '../../domain/repositories/home.repository';
import {
  HomeDashboard,
  HomeManualAction,
  RegisterManualActionPayload
} from '../../domain/models/home/home-dashboard.model';

@Injectable({ providedIn: 'root' })
export class HttpHomeRepository implements HomeRepository {
  constructor(private readonly api: ApiClientService) {}

  getDashboard() {
    return this.api.get<HomeDashboard>('home/dashboard');
  }

  listManualActions() {
    return this.api.get<HomeManualAction[]>('home/manual-actions');
  }

  registerManualAction(payload: RegisterManualActionPayload) {
    return this.api.post<unknown>('home/manual-actions', payload).pipe(map(() => undefined));
  }
}
