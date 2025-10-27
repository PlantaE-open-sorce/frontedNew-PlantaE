import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthFacade} from '../../../application/facades/auth.facade';

@Component({
  selector: 'app-register-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.view.html',
  styleUrl: './register.view.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterView {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    firstName: this.fb.nonNullable.control('', Validators.required),
    lastName: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    username: this.fb.nonNullable.control('', Validators.required),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)])
  });

  readonly error = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.authFacade.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/auth/login'], { queryParams: { registered: 'true' } }),
      error: () => this.error.set('auth.register.error')
    });
  }
}
