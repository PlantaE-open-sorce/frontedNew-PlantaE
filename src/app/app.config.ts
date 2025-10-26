import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {AuthRepository} from './plant-care/domain/repositories/auth.repository';
import {AuthHttpRepository} from './plant-care/infrastructure/repositories/auth-http.repository';
import {DashboardRepository} from './plant-care/domain/repositories/dashboard.repository';
import {DashboardHttpRepository} from './plant-care/infrastructure/repositories/dashboard-http.repository';
import {ProfileRepository} from './plant-care/domain/repositories/profile.repository';
import {ProfileHttpRepository} from './plant-care/infrastructure/repositories/profile-http.repository';
import {SettingsRepository} from './plant-care/domain/repositories/settings.repository';
import {SettingsHttpRepository} from './plant-care/infrastructure/repositories/settings-http.repository';
import {PlantRepository} from './plant-care/domain/repositories/plant.repository';
import {PlantHttpRepository} from './plant-care/infrastructure/repositories/plant-http.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
      fallbackLang: 'en'
    }),
    provideRouter(routes),
    { provide: AuthRepository, useClass: AuthHttpRepository },
    { provide: DashboardRepository, useClass: DashboardHttpRepository },
    { provide: ProfileRepository, useClass: ProfileHttpRepository },
    { provide: SettingsRepository, useClass: SettingsHttpRepository },
    { provide: PlantRepository, useClass: PlantHttpRepository }
  ]
};
