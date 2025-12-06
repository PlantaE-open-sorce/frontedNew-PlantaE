import { InjectionToken } from '@angular/core';
import { environment } from '../../../../environments/environment';

export interface PlantaeFrontConfig {
  apiBaseUrl: string;
  supportedLanguages: string[];
  defaultLanguage: string;
}

export const PLANTAE_CONFIG = new InjectionToken<PlantaeFrontConfig>('PLANTAE_CONFIG', {
  providedIn: 'root',
  factory: (): PlantaeFrontConfig => ({
    apiBaseUrl: environment.apiBaseUrl,
    supportedLanguages: environment.supportedLanguages || ['en', 'es'],
    defaultLanguage: environment.defaultLanguage || 'es'
  })
});
