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
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
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
