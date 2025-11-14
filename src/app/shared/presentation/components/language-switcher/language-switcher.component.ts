import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { I18nService } from '../../../infrastructure/services/i18n.service';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [FormsModule, CommonModule, UpperCasePipe, TranslatePipe],
  template: `
    <div
      class="language-switcher"
      role="group"
      [attr.aria-label]="'common:aria.languageSwitcher' | t:'Selector de idioma'"
    >
      <div class="language-switcher__track">
        <span
          class="language-switcher__thumb"
          [style.left]="thumbLeft()"
          [style.width]="thumbWidth()"
        ></span>
        <button
          type="button"
          *ngFor="let lang of languages"
          (click)="onLanguageChange(lang)"
          [class.active]="isActive(lang)"
          [attr.aria-pressed]="isActive(lang)"
        >
          {{ lang | uppercase }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .language-switcher {
        width: 100%;
      }
      .language-switcher__track {
        position: relative;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        padding: 0.15rem;
        display: flex;
        overflow: hidden;
      }
      .language-switcher__thumb {
        position: absolute;
        top: 4px;
        bottom: 4px;
        border-radius: 999px;
        background: #fff;
        opacity: 0.9;
        transition: left 0.2s ease, width 0.2s ease;
        pointer-events: none;
      }
      .language-switcher__track button {
        border: none;
        background: transparent;
        color: #fff;
        padding: 0.35rem 0.4rem;
        border-radius: 999px;
        cursor: pointer;
        flex: 1;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        position: relative;
        z-index: 1;
        transition: color 0.2s ease;
      }
      .language-switcher__track button.active {
        color: var(--color-primary);
      }
      @media (max-width: 640px) {
        .language-switcher__track button {
          font-size: 0.7rem;
        }
      }
    `
  ]
})
export class LanguageSwitcherComponent {
  private readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  readonly languages = this.i18n.supportedLanguages();
  readonly currentLang = this.i18n.currentLanguageSignal;

  onLanguageChange(language: string) {
    this.auth.updateLanguage(language);
  }

  isActive(language: string) {
    return this.currentLang() === language;
  }

  thumbWidth() {
    const count = Math.max(this.languages.length, 1);
    return `calc(${100 / count}% - 12px)`;
  }

  thumbLeft() {
    const count = Math.max(this.languages.length, 1);
    const index = Math.max(this.languages.indexOf(this.currentLang()), 0);
    const percentage = (100 / count) * index;
    return `calc(${percentage}% + 6px)`;
  }
}
