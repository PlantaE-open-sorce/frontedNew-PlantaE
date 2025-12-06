import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HomeFacade } from '../../../application/facades/home.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, LocalizedDatePipe],
  templateUrl: './dashboard.view.html',
  styleUrl: './dashboard.view.css'
})
export class DashboardViewComponent implements OnInit {
  private readonly homeFacade = inject(HomeFacade);
  private readonly fb = inject(FormBuilder);

  readonly today = new Date();
  readonly dashboard = this.homeFacade.dashboard;
  readonly manualActions = this.homeFacade.manualActions;
  readonly isDashboardLoading = this.homeFacade.isDashboardLoading;
  readonly isActionsLoading = this.homeFacade.isActionsLoading;

  readonly manualActionForm = this.fb.nonNullable.group({
    actionType: ['', Validators.required],
    notes: [''],
    performedAt: [''],
    durationMinutes: [0]
  });

  ngOnInit(): void {
    this.homeFacade.loadDashboard();
    this.homeFacade.loadManualActions();
  }

  registerAction() {
    if (this.manualActionForm.invalid) {
      return;
    }
    const { actionType, notes, performedAt, durationMinutes } = this.manualActionForm.getRawValue();
    this.homeFacade.registerManualAction({
      actionType,
      notes,
      performedAt: performedAt ? new Date(performedAt).toISOString() : undefined,
      durationMinutes: durationMinutes ?? undefined
    });
    this.manualActionForm.reset({ actionType: '', notes: '', performedAt: '', durationMinutes: 0 });
  }
}
