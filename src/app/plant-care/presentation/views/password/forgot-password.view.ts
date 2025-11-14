import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IamService } from '../../../application/services/iam.service';
import { NotificationService } from '../../../../shared/infrastructure/services/notification.service';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-forgot-password-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="page-card">
      <h2>{{ 'iam:forgot.title' | t:'Recuperar contraseña' }}</h2>
      <p>{{ 'iam:forgot.subtitle' | t:'Te enviaremos instrucciones si el correo existe.' }}</p>
      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <label>
          <span>{{ 'iam:forgot.email' | t:'Correo electrónico' }}</span>
          <input formControlName="email" type="email" />
        </label>
        <button class="btn" type="submit" [disabled]="form.invalid">
          {{ 'iam:forgot.action' | t:'Enviar' }}
        </button>
      </form>
      <a routerLink="/login" class="btn btn--outline">
        {{ 'common:actions.back' | t:'Volver' }}
      </a>
    </section>
  `
})
export class ForgotPasswordViewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly iam = inject(IamService);
  private readonly notifications = inject(NotificationService);
  private readonly i18n = inject(I18nService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit() {
    if (this.form.invalid) {
      return;
    }
    this.iam.forgotPassword(this.form.getRawValue()).subscribe({
      next: (response) => this.notifications.success(response.message),
      error: () =>
        this.notifications.error(
          this.i18n.translate('iam:forgot.error', 'No pudimos procesar la solicitud')
        )
    });
  }
}
