import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DashboardRepository} from '../../domain/repositories/dashboard.repository';
import {DashboardSummary} from '../../domain/models/dashboard-summary.model';
import {environment} from '../../../../environments/environment';

@Injectable()
export class DashboardHttpRepository extends DashboardRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  override getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboardSummary`);
  }
}
