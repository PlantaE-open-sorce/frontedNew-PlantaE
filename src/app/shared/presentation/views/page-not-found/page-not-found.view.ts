import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../../infrastructure/services/i18n.service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, UpperCasePipe],
  template: `
    <main class="not-found">
      <section class="not-found__card">
        <div class="not-found__top" *ngIf="languages.length">
          <div class="lang-toggle">
            <button
              type="button"
              *ngFor="let lang of languages"
              [class.active]="isLang(lang)"
              (click)="changeLang(lang)"
            >
              {{ lang | uppercase }}
            </button>
          </div>
        </div>
        <p class="not-found__eyebrow">
          {{ 'common:notFound.eyebrow' | t:'Ups, algo salió mal' }}
        </p>
        <div class="not-found__badge">404</div>
        <h1>{{ 'common:notFound.title' | t:'Página no encontrada' }}</h1>
        <p class="not-found__copy">
          {{ 'common:notFound.message' | t:'La ruta que buscas no existe o se movió. Vuelve al inicio para seguir explorando.' }}
        </p>
        <div class="not-found__actions">
          <a routerLink="/" class="btn btn--primary">
            {{ 'common:notFound.home' | t:'Volver al inicio' }}
          </a>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .not-found {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: radial-gradient(circle at 20% 20%, rgba(47, 133, 90, 0.08), transparent 35%),
          radial-gradient(circle at 80% 0%, rgba(15, 61, 46, 0.08), transparent 30%),
          #f7fbf8;
      }
      .not-found__card {
        width: min(640px, 100%);
        text-align: center;
        background: #fff;
        border-radius: 1.25rem;
        padding: 2.25rem;
        border: 1px solid rgba(15, 61, 46, 0.08);
        box-shadow: 0 30px 90px rgba(15, 61, 46, 0.12);
      }
      .not-found__top {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 0.5rem;
      }
      .not-found__eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
        color: var(--color-primary);
        margin: 0 0 0.75rem;
        font-size: 0.85rem;
      }
      .not-found__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        border-radius: 1rem;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        color: #fff;
        font-weight: 800;
        font-size: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 12px 30px rgba(47, 133, 90, 0.35);
      }
      .not-found h1 {
        margin: 0 0 0.4rem;
        font-size: clamp(1.6rem, 3vw, 2rem);
        color: var(--color-text);
      }
      .not-found__copy {
        margin: 0 0 1.5rem;
        color: var(--color-muted);
        line-height: 1.6;
      }
      .not-found__actions {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .lang-toggle {
        display: inline-flex;
        gap: 0.35rem;
        background: #f1f5f3;
        border-radius: 999px;
        padding: 0.15rem;
      }
      .lang-toggle button {
        border: none;
        background: transparent;
        color: var(--color-primary);
        padding: 0.4rem 0.65rem;
        border-radius: 999px;
        font-weight: 700;
        cursor: pointer;
      }
      .lang-toggle button.active {
        background: #fff;
        box-shadow: 0 4px 12px rgba(15, 61, 46, 0.12);
      }
      .btn {
        padding: 0.85rem 1.25rem;
        border-radius: 0.85rem;
        border: none;
        cursor: pointer;
        font-weight: 700;
        text-decoration: none;
      }
      .btn--primary {
        background: var(--color-primary);
        color: #fff;
        box-shadow: 0 12px 30px rgba(15, 61, 46, 0.2);
      }
      .btn--ghost {
        background: transparent;
        color: var(--color-primary);
        border: 1px solid rgba(15, 61, 46, 0.2);
      }
      .btn--ghost:hover {
        background: rgba(15, 61, 46, 0.05);
      }
      @media (max-width: 640px) {
        .not-found__card {
          padding: 1.75rem;
        }
      }
    `
  ]
})
export class PageNotFoundViewComponent {
  private readonly i18n = inject(I18nService);
  readonly languages = this.i18n.supportedLanguages();
  readonly currentLang = this.i18n.currentLanguageSignal;

  changeLang(lang: string) {
    this.i18n.setLanguage(lang);
  }

  isLang(lang: string) {
    return this.currentLang() === lang;
  }
}
