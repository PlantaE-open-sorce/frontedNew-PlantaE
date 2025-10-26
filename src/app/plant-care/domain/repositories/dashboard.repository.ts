import {Observable} from 'rxjs';
import {DashboardSummary} from '../models/dashboard-summary.model';

export abstract class DashboardRepository {
  abstract getSummary(): Observable<DashboardSummary>;
}
