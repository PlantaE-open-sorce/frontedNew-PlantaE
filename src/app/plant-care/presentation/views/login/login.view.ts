import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {AuthFacade} from '../../../application/facades/auth.facade';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.view.html',
  styleUrl: './login.view.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginView {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly form = this.fb.group({
    username: this.fb.nonNullable.control('', Validators.required),
    password: this.fb.nonNullable.control('', Validators.required)
  });

  readonly error = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.authFacade.login(this.form.getRawValue()).subscribe(user => {
      if (user) {
        const language = this.translate.currentLang || this.translate.getDefaultLang();
        this.translate.use(language ?? 'es');
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set('auth.login.error');
      }
    });
  }
}
