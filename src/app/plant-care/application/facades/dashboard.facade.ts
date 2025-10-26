import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DashboardRepository} from '../../domain/repositories/dashboard.repository';
import {DashboardSummary} from '../../domain/models/dashboard-summary.model';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly repository = inject(DashboardRepository);

  getSummary(): Observable<DashboardSummary> {
    return this.repository.getSummary();
  }
}
