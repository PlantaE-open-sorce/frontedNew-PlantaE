import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AuthService } from '../../../../shared/infrastructure/services/auth.service';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';
@Component({
  selector: 'app-register-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink, UpperCasePipe],
  templateUrl: './register.view.html',
  styleUrl: './register.view.css'
})
export class RegisterViewComponent {
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);

  form: FormGroup = this._fb.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    language: ['es', [Validators.required]],
    accountType: ['HOME', [Validators.required]]
  });

  heroStats = [
    { value: '15k+', label: 'iam:register.hero.stats.users', fallback: 'Usuarios activos' },
    { value: '99%', label: 'iam:register.hero.stats.uptime', fallback: 'Tiempo en línea' },
    { value: '24/7', label: 'iam:register.hero.stats.support', fallback: 'Soporte' }
  ];
  readonly languages = this.i18n.supportedLanguages();
  readonly currentLang = this.i18n.currentLanguageSignal;

  submit() {
    if (this.form.valid) {
      const { displayName, email, password, confirmPassword, language, accountType } = this.form.value;
      this._authService.register({
        displayName,
        email,
        password,
        confirmPassword,
        language,
        accountType
      }).subscribe({
        next: () => this._router.navigate(['/login']),
        error: (err) => console.error('Registration failed', err)
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
