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
    <section class="home-hero page-card">
      <div>
        <p class="home-eyebrow">{{ 'home:eyebrow' | t:'Ecosistemas conectados' }}</p>
        <h1>{{ 'home:intro' | t:'Bienvenido a PlantaE' }}</h1>
        <p>{{ 'home:description' | t:'Gestiona tus plantas, sensores y reportes desde un solo lugar.' }}</p>
        <div class="home-actions">
          <a *ngIf="!isLoggedIn()" class="btn" routerLink="/register">
            {{ 'home:actions.create' | t:'Crea tu cuenta' }}
          </a>
          <a
            class="btn"
            [ngClass]="isLoggedIn() ? 'btn--outline' : 'btn--ghost'"
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
      <ul class="home-stats">
        <li *ngFor="let metric of metrics">
          <h3>{{ metric.value }}</h3>
          <p>{{ metric.label | t:metric.fallback }}</p>
        </li>
      </ul>
    </section>

    <section class="page-card">
      <h2>{{ 'home:features.title' | t:'Todo lo que necesitas para cultivar con precisión' }}</h2>
      <div class="page-grid page-grid--responsive">
        <article *ngFor="let feature of features" class="home-feature">
          <h3>{{ feature.title | t:feature.fallbackTitle }}</h3>
          <p>{{ feature.copy | t:feature.fallbackCopy }}</p>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .home-hero {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 2rem;
        align-items: center;
      }
      .home-eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--color-muted);
        margin: 0 0 0.25rem;
      }
      .home-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .home-actions .btn {
        min-width: 160px;
      }
      .home-stats {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }
      .home-stats li {
        border: 1px solid var(--color-border);
        border-radius: 1rem;
        padding: 1rem;
        text-align: center;
      }
      .home-stats h3 {
        margin: 0;
        font-size: 2rem;
      }
      .home-feature h3 {
        margin-top: 0;
      }
    `
  ]
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
      title: 'home:features.monitoring.title',
      fallbackTitle: 'Monitoreo en tiempo real',
      copy: 'home:features.monitoring.copy',
      fallbackCopy: 'Conoce la humedad, temperatura y nutrición de tus cultivos sin salir del dashboard.'
    },
    {
      title: 'home:features.automation.title',
      fallbackTitle: 'Automatización inteligente',
      copy: 'home:features.automation.copy',
      fallbackCopy: 'Configura reglas para riego y fertilización basadas en datos reales.'
    },
    {
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
