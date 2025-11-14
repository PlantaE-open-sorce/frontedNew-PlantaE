import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AuthService } from '../../../../shared/infrastructure/services/auth.service';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  template: `
    <section class="auth-page auth-page--fullscreen">
      <div class="auth-panel">
        <div class="auth-panel__header">
          <p class="auth-eyebrow">{{ 'iam:login.eyebrow' | t:'Bienvenido de vuelta' }}</p>
          <h1>{{ 'iam:login.title' | t:'Inicia sesión' }}</h1>
          <p>{{ 'iam:login.subtitle' | t:'Ingresa tus credenciales para continuar.' }}</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <label>
            <span>{{ 'iam:login.email' | t:'Correo' }}</span>
            <input formControlName="email" type="email" required />
          </label>
          <label>
            <span>{{ 'iam:login.password' | t:'Contraseña' }}</span>
            <input formControlName="password" type="password" required />
          </label>
          <div class="auth-panel__links">
            <a routerLink="/forgot-password" class="link-sm">
              {{ 'iam:login.forgot' | t:'¿Olvidaste tu contraseña?' }}
            </a>
          </div>
        <button type="submit" class="btn" [disabled]="form.invalid">
          {{ 'iam:login.action' | t:'Entrar' }}
        </button>
      </form>
      <p class="auth-panel__footer">
        {{ 'iam:login.noAccount' | t:'¿No tienes cuenta?' }}
        <a routerLink="/register">{{ 'iam:login.register' | t:'Regístrate' }}</a>
      </p>
      </div>
      <div class="auth-hero">
        <div class="auth-hero__overlay">
          <p>{{ 'iam:login.hero.quote' | t:'“Las plantas felices comienzan con datos claros.”' }}</p>
          <div class="auth-hero__stats">
            <article *ngFor="let stat of heroStats">
              <h3>{{ stat.value }}</h3>
              <p>{{ stat.label | t:stat.fallback }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .auth-page {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        min-height: 100vh;
        margin: 0 auto;
        background: var(--color-background);
        border: none;
        padding: 0;
        box-shadow: none;
      }
      .auth-panel {
        padding: 4rem 5vw;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        justify-content: center;
      }
      .auth-eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--color-muted);
        margin: 0;
      }
      .auth-panel__header h1 {
        margin: 0;
        font-size: 2.4rem;
      }
      .auth-panel__header p {
        margin: 0;
        color: var(--color-muted);
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      form label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--color-primary);
      }
      form input {
        width: 100%;
        padding: 0.9rem 1rem;
        border-radius: 0.9rem;
        border: 1px solid var(--color-border);
        background: #f7fbf8;
      }
      form .btn {
        width: 100%;
      }
      .auth-panel__links {
        display: flex;
        justify-content: flex-end;
      }
      .auth-panel__footer {
        color: var(--color-muted);
      }
      .auth-hero {
        position: relative;
        background-image: url('https://images.pexels.com/photos/631909/pexels-photo-631909.jpeg');
        background-size: cover;
        background-position: center;
        min-height: 100vh;
      }
      .auth-hero__overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(15, 61, 46, 0.8), rgba(15, 61, 46, 0.4));
        color: #fff;
        padding: 3rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 1.5rem;
      }
      .auth-hero__stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }
      .auth-hero__stats article {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 1rem;
        text-align: center;
      }
      .auth-hero__stats h3 {
        margin: 0;
        font-size: 1.8rem;
      }
    `
  ]
})
export class LoginViewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  readonly heroStats = [
    { value: '120+', label: 'iam:login.stats.devices', fallback: 'Dispositivos activos' },
    { value: '98%', label: 'iam:login.stats.success', fallback: 'Alertas atendidas' },
    { value: '24/7', label: 'iam:login.stats.monitoring', fallback: 'Monitoreo continuo' }
  ];

  submit() {
    if (this.form.invalid) {
      return;
    }
    this.authService.login(this.form.getRawValue()).subscribe(() => {
      this.router.navigate([this.authService.getDefaultRoute()]);
    });
  }
}
