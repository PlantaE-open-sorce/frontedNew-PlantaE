import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Signal, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { PlantaeFrontConfig, PLANTAE_CONFIG } from '../config/app-config.token';

export type TranslationCatalog = Record<string, string>;

type LanguageFile = Record<string, TranslationCatalog>;

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly selectedLanguage = signal<string>('en');
  private readonly catalogs = signal<Record<string, TranslationCatalog>>({});
  private readonly namespaces = new Set<string>();
  private readonly languageFiles: Record<string, LanguageFile> = {};
  private readonly pendingLanguages = new Set<string>();

  readonly currentLanguageSignal: Signal<string> = this.selectedLanguage.asReadonly();

  constructor(
    private readonly http: HttpClient,
    @Inject(PLANTAE_CONFIG) private readonly config: PlantaeFrontConfig
  ) {
    this.selectedLanguage.set(this.config.defaultLanguage);
  }

  defaultLanguage() {
    return this.config.defaultLanguage;
  }

  supportedLanguages() {
    return this.config.supportedLanguages;
  }

  currentLanguage() {
    return this.selectedLanguage();
  }

  setLanguage(language: string) {
    if (!this.config.supportedLanguages.includes(language)) {
      language = this.config.defaultLanguage;
    }
    this.selectedLanguage.set(language);
    this.namespaces.forEach((namespace) => this.fetchNamespace(namespace));
  }

  loadNamespace(namespace: string) {
    this.namespaces.add(namespace);
    return this.fetchNamespace(namespace);
  }

  private fetchNamespace(namespace: string) {
    const language = this.currentLanguage();
    const cacheKey = this.toCacheKey(namespace, language);
    if (this.catalogs()[cacheKey]) {
      return this.catalogs();
    }
    const cachedFile = this.languageFiles[language];
    if (cachedFile) {
      setTimeout(() => this.storeNamespaceCatalogs(language, cachedFile, namespace), 0);
      return this.catalogs();
    }
    if (this.pendingLanguages.has(language)) {
      return this.catalogs();
    }
    this.pendingLanguages.add(language);
    this.http
      .get<LanguageFile>(`assets/i18n/${language}.json`)
      .pipe(
        tap((file) => {
          this.languageFiles[language] = file;
          this.storeNamespaceCatalogs(language, file, namespace);
        }),
        catchError(() => {
          this.languageFiles[language] = {};
          return of({});
        }),
        finalize(() => this.pendingLanguages.delete(language))
      )
      .subscribe();
    return this.catalogs();
  }

  private storeNamespaceCatalogs(language: string, file: LanguageFile, requiredNamespace?: string) {
    const updates: Record<string, TranslationCatalog> = {};
    Object.entries(file).forEach(([namespace, catalog]) => {
      updates[this.toCacheKey(namespace, language)] = catalog;
    });
    if (requiredNamespace && !updates[this.toCacheKey(requiredNamespace, language)]) {
      updates[this.toCacheKey(requiredNamespace, language)] = {};
    }
    this.catalogs.update((current) => ({ ...current, ...updates }));
  }

  translate(key: string, fallback?: string, params?: any): string {
    const [namespace, childKey] = key.split(':');
    if (!namespace || !childKey) {
      return fallback ?? key;
    }
    if (namespace && !this.catalogs()[this.toCacheKey(namespace, this.currentLanguage())]) {
      this.loadNamespace(namespace);
    }
    const catalogKey = this.toCacheKey(namespace, this.currentLanguage());
    const catalog = this.catalogs()[catalogKey];

    let result = '';

    if (catalog) {
      // 1. Try direct match
      if (typeof catalog[childKey] === 'string') {
        result = catalog[childKey];
      } else {
        // 2. Support for nested keys
        const parts = childKey.split('.');
        let value: any = catalog;

        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }

        if (typeof value === 'string') {
          result = value;
        }
      }
    }

    result = result || fallback || childKey || key;

    // 3. Interpolate params
    if (params && result) {
      Object.keys(params).forEach(param => {
        const value = params[param];
        result = result.replace(new RegExp(`{{\\s*${param}\\s*}}`, 'g'), String(value));
      });
    }

    return result;
  }

  private toCacheKey(namespace: string, language: string) {
    return `${namespace}:${language}`;
  }
}
