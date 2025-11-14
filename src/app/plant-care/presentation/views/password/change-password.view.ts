import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IamService } from '../../../application/services/iam.service';
import { NotificationService } from '../../../../shared/infrastructure/services/notification.service';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-change-password-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <section class="page-card">
      <h2>{{ 'iam:password.title' | t:'Cambiar contraseña' }}</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <label>
          <span>{{ 'iam:password.current' | t:'Actual' }}</span>
          <input formControlName="currentPassword" type="password" />
        </label>
        <label>
          <span>{{ 'iam:password.new' | t:'Nueva' }}</span>
          <input formControlName="newPassword" type="password" />
        </label>
        <button class="btn" type="submit" [disabled]="form.invalid">
          {{ 'iam:password.action' | t:'Actualizar' }}
        </button>
      </form>
    </section>
  `
})
export class ChangePasswordViewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly iam = inject(IamService);
  private readonly notifications = inject(NotificationService);
  private readonly i18n = inject(I18nService);

  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (this.form.invalid) {
      return;
    }
    this.iam.changePassword(this.form.getRawValue()).subscribe({
      next: (response) => this.notifications.success(response.message),
      error: () =>
        this.notifications.error(
          this.i18n.translate('iam:password.error', 'No pudimos cambiar la contraseña')
        )
    });
  }
}
