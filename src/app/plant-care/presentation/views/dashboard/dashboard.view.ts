import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe, DatePipe, NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {combineLatest, map, Observable} from 'rxjs';
import {DashboardFacade} from '../../../application/facades/dashboard.facade';
import {ProfileFacade} from '../../../application/facades/profile.facade';
import {DashboardSummary} from '../../../domain/models/dashboard-summary.model';
import {CompleteUserProfile} from '../../../domain/models/user-profile.model';

interface DashboardViewModel {
  summary: DashboardSummary;
  user: CompleteUserProfile;
}

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgIf, TranslatePipe],
  templateUrl: './dashboard.view.html',
  styleUrl: './dashboard.view.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardView {
  private readonly dashboardFacade = inject(DashboardFacade);
  private readonly profileFacade = inject(ProfileFacade);

  readonly vm$: Observable<DashboardViewModel> = combineLatest([
    this.dashboardFacade.getSummary(),
    this.profileFacade.getProfile()
  ]).pipe(
    map(([summary, user]) => ({ summary, user }))
  );
}
