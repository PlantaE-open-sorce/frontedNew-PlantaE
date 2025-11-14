import { Observable } from 'rxjs';
import {
  HomeDashboard,
  HomeManualAction,
  RegisterManualActionPayload
} from '../models/home/home-dashboard.model';

export abstract class HomeRepository {
  abstract getDashboard(): Observable<HomeDashboard>;
  abstract listManualActions(): Observable<HomeManualAction[]>;
  abstract registerManualAction(payload: RegisterManualActionPayload): Observable<void>;
}
