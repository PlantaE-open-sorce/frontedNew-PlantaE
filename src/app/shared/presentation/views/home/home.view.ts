import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../../infrastructure/services/auth.service';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink],
  template: `
    <div class="page-layout animate-fade-in">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">{{ 'home:intro' | t:'Bienvenido a PlantaE' }}</h1>
          <p class="hero-desc">{{ 'home:description' | t:'Gestiona tus plantas, sensores y reportes desde un solo lugar.' }}</p>
          
          <div class="hero-actions">
            <a *ngIf="!isLoggedIn()" class="btn btn--primary" routerLink="/register">
              {{ 'home:actions.create' | t:'Comenzar ahora' }}
            </a>
            <a
              class="btn"
              [ngClass]="isLoggedIn() ? 'btn--primary' : 'btn--outline'"
              [routerLink]="isLoggedIn() ? '/plants' : '/about'"
            >
              {{
                isLoggedIn()
                  ? ('home:actions.dashboard' | t:'Ir a mis plantas')
                  : ('home:actions.learn' | t:'Conoce más')
              }}
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      padding: 8rem 2rem 6rem;
      text-align: center;
      max-width: 900px;
      margin: 0 auto;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      color: var(--text-color);
      letter-spacing: -0.03em;
    }

    .hero-desc {
      font-size: 1.25rem;
      color: var(--text-muted);
      margin: 0 auto 3rem;
      max-width: 600px;
      line-height: 1.6;
      font-weight: 400;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 6rem;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 4rem;
      padding-top: 2rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-color);
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .stat-label {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    /* Features */
    .features-section {
      padding: 6rem 2rem;
      border-top: 1px solid var(--border-color);
    }

    .features-header {
      text-align: center;
      margin-bottom: 5rem;
    }

    .features-header h2 {
      font-size: 2rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 4rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .feature-card {
      text-align: left;
    }

    .feature-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--text-color);
    }

    .feature-card p {
      color: var(--text-muted);
      line-height: 1.6;
      font-size: 1rem;
    }
  `]
})
export class HomeViewComponent {
  private readonly auth = inject(AuthService);
  readonly metrics = [
    { value: '350+', label: 'home:metrics.devices', fallback: 'Sensores conectados' },
    { value: '2.5M', label: 'home:metrics.events', fallback: 'Eventos procesados' },
    { value: '17%', label: 'home:metrics.savings', fallback: 'Ahorro de recursos' }
  ];
  readonly features = [
    {
      icon: '📊',
      title: 'home:features.monitoring.title',
      fallbackTitle: 'Monitoreo en tiempo real',
      copy: 'home:features.monitoring.copy',
      fallbackCopy: 'Conoce la humedad, temperatura y nutrición de tus cultivos sin salir del dashboard.'
    },
    {
      icon: '🤖',
      title: 'home:features.automation.title',
      fallbackTitle: 'Automatización inteligente',
      copy: 'home:features.automation.copy',
      fallbackCopy: 'Configura reglas para riego y fertilización basadas en datos reales.'
    },
    {
      icon: '🤝',
      title: 'home:features.collaboration.title',
      fallbackTitle: 'Colaboración segura',
      copy: 'home:features.collaboration.copy',
      fallbackCopy: 'Comparte reportes y alertas con tu equipo o clientes en segundos.'
    }
  ];

  isLoggedIn() {
    return this.auth.isAuthenticated();
  }
}
