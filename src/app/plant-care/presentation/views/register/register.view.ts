import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { AuthService } from '../../../../shared/infrastructure/services/auth.service';

@Component({
  selector: 'app-register-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  template: `
    <section class="auth-page auth-page--fullscreen">
      <div class="auth-panel">
        <div class="auth-panel__header">
          <p class="auth-eyebrow">{{ 'iam:register.eyebrow' | t:'Comienza gratis' }}</p>
          <h1>{{ 'iam:register.title' | t:'Crear cuenta' }}</h1>
          <p>{{ 'iam:register.subtitle' | t:'Completa tus datos para comenzar.' }}</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <label>
            <span>{{ 'iam:register.displayName' | t:'Nombre para mostrar' }}</span>
            <input formControlName="displayName" />
          </label>
          <label>
            <span>{{ 'iam:register.email' | t:'Correo' }}</span>
            <input formControlName="email" type="email" />
          </label>
          <label>
            <span>{{ 'iam:register.password' | t:'Contraseña' }}</span>
            <input formControlName="password" type="password" />
          </label>
          <label>
            <span>{{ 'iam:register.confirmPassword' | t:'Confirmar contraseña' }}</span>
            <input formControlName="confirmPassword" type="password" />
          </label>
          <div class="form-grid form-grid--two">
            <label>
              <span>{{ 'iam:register.language' | t:'Idioma' }}</span>
              <select formControlName="language">
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </label>
            <label>
              <span>{{ 'iam:register.accountType' | t:'Tipo de cuenta' }}</span>
              <select formControlName="accountType">
                <option value="HOME">{{ 'iam:register.types.home' | t:'Usuario normal' }}</option>
                <option value="VIVERO_FORESTAL">{{ 'iam:register.types.nursery' | t:'Vivero Forestal' }}</option>
              </select>
            </label>
          </div>
          <button type="submit" class="btn" [disabled]="form.invalid">
            {{ 'iam:register.action' | t:'Registrar' }}
          </button>
        </form>
        <p class="auth-panel__footer">
          {{ 'iam:login.action' | t:'¿Ya tienes cuenta?' }}
          <a routerLink="/login">{{ 'iam:login.title' | t:'Inicia sesión' }}</a>
        </p>
      </div>
      <div class="auth-hero auth-hero--register">
        <div class="auth-hero__overlay auth-hero__overlay--light">
          <h3>{{ 'iam:register.hero.title' | t:'Planifica tu invernadero' }}</h3>
          <p>{{ 'iam:register.hero.subtitle' | t:'Crea equipos, asigna dispositivos y comparte paneles con tu equipo.' }}</p>
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
        display: grid;
        gap: 1rem;
      }
      form label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--color-primary);
      }
      form input,
      form select {
        width: 100%;
        padding: 0.9rem 1rem;
        border-radius: 0.9rem;
        border: 1px solid var(--color-border);
        background: #f7fbf8;
      }
      form .btn {
        width: 100%;
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
        padding: 3rem;
        color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 1rem;
      }
      .auth-hero__overlay--light {
        background: linear-gradient(180deg, rgba(15, 61, 46, 0.7), rgba(15, 61, 46, 0.3));
      }
      .auth-hero__stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }
      .auth-hero__stats article {
        background: rgba(255, 255, 255, 0.12);
        border-radius: 1rem;
        padding: 1rem;
        text-align: center;
      }
      .auth-hero__stats h3 {
        margin: 0;
        font-size: 1.7rem;
      }
    `
  ]
})
export class RegisterViewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    language: ['es', Validators.required],
    accountType: ['HOME', Validators.required]
  });
  readonly heroStats = [
    { value: '15d', label: 'iam:register.stats.setup', fallback: 'Tiempo promedio de implementación' },
    { value: '30%', label: 'iam:register.stats.savings', fallback: 'Ahorro de agua' }
  ];

  submit() {
    if (this.form.invalid) {
      return;
    }
    this.authService.register(this.form.getRawValue()).subscribe(() => {
      this.router.navigate([this.authService.getDefaultRoute()]);
    });
  }
}
