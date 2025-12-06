import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IamService } from '../../../../application/services/iam.service';
import { NotificationService } from '../../../../../shared/infrastructure/services/notification.service';
import { TranslatePipe } from '../../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-forgot-password-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, UpperCasePipe],
  templateUrl: './forgot-password.view.html',
  styleUrl: './forgot-password.view.css'
})
export class ForgotPasswordViewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly iam = inject(IamService);
  private readonly notifications = inject(NotificationService);
  private readonly i18n = inject(I18nService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly submitting = signal(false);
  readonly successMessage = signal('');
  readonly languages = this.i18n.supportedLanguages();
  readonly currentLang = this.i18n.currentLanguageSignal;

  submit() {
    if (this.form.invalid || this.submitting()) {
      return;
    }
    this.successMessage.set('');
    this.submitting.set(true);
    this.iam.forgotPassword(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.submitting.set(false);
        const message =
          response.message ||
          this.i18n.translate(
            'iam:forgot.sent',
            'Solicitud enviada. Revisa tu correo electrónico para continuar.'
          );
        this.successMessage.set(message);
        this.notifications.success(message);
      },
      error: () => {
        this.submitting.set(false);
        this.notifications.error(
          this.i18n.translate('iam:forgot.error', 'No pudimos procesar la solicitud')
        );
      }
    });
  }

  changeLang(lang: string) {
    this.i18n.setLanguage(lang);
  }

  isLang(lang: string) {
    return this.currentLang() === lang;
  }
}
