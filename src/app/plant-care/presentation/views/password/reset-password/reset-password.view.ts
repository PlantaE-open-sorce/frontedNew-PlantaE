import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IamService } from '../../../../application/services/iam.service';
import { NotificationService } from '../../../../../shared/infrastructure/services/notification.service';
import { I18nService } from '../../../../../shared/infrastructure/services/i18n.service';
import { TranslatePipe } from '../../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-reset-password-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, UpperCasePipe],
  templateUrl: './reset-password.view.html',
  styleUrl: './reset-password.view.css'
})
export class ResetPasswordViewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly iam = inject(IamService);
  private readonly notifications = inject(NotificationService);
  private readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';
  readonly languages = this.i18n.supportedLanguages();
  readonly currentLang = this.i18n.currentLanguageSignal;

  readonly form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (!this.token) {
      return;
    }
    if (this.form.invalid) {
      this.notifications.error('Por favor, completa todos los campos (mínimo 8 caracteres).');
      return;
    }
    const { newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.notifications.error(
        this.i18n.translate('iam:reset.mismatch', 'Las contraseñas no coinciden')
      );
      return;
    }
    this.iam.resetPassword({ token: this.token, newPassword }).subscribe({
      next: (response) => {
        this.notifications.success(response.message);
        this.router.navigate(['/login']);
      },
      error: () =>
        this.notifications.error(
          this.i18n.translate('iam:reset.error', 'No pudimos restablecer tu contraseña')
        )
    });
  }

  changeLang(lang: string) {
    this.i18n.setLanguage(lang);
  }

  isLang(lang: string) {
    return this.currentLang() === lang;
  }
}
