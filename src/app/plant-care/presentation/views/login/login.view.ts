import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AuthService } from '../../../../shared/infrastructure/services/auth.service';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';
@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink, UpperCasePipe],
  templateUrl: './login.view.html',
  styleUrl: './login.view.css'
})
export class LoginViewComponent {
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);

  form: FormGroup = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly languages = this.i18n.supportedLanguages();
  readonly currentLang = this.i18n.currentLanguageSignal;

  heroStats = [
    { value: '15k+', label: 'iam:login.stats.users', fallback: 'Usuarios activos' },
    { value: '99%', label: 'iam:login.stats.uptime', fallback: 'Tiempo en línea' },
    { value: '24/7', label: 'iam:login.stats.support', fallback: 'Soporte' }
  ];

  submit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this._authService.login({ email, password }).subscribe({
        next: () => this._router.navigate(['/dashboard']),
        error: (err) => console.error('Login failed', err)
      });
    }
  }

  changeLang(lang: string) {
    this.i18n.setLanguage(lang);
  }

  isLang(lang: string) {
    return this.currentLang() === lang;
  }
}
