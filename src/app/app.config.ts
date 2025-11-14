import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './shared/infrastructure/interceptors/auth.interceptor';
import { PlantRepository } from './plant-care/domain/repositories/plant.repository';
import { HttpPlantRepository } from './plant-care/infrastructure/repositories/http-plant.repository';
import { ProfileRepository } from './plant-care/domain/repositories/profile.repository';
import { HttpProfileRepository } from './plant-care/infrastructure/repositories/http-profile.repository';
import { HomeRepository } from './plant-care/domain/repositories/home.repository';
import { HttpHomeRepository } from './plant-care/infrastructure/repositories/http-home.repository';
import { SensorRepository } from './plant-care/domain/repositories/sensor.repository';
import { HttpSensorRepository } from './plant-care/infrastructure/repositories/http-sensor.repository';
import { DeviceRepository } from './plant-care/domain/repositories/device.repository';
import { HttpDeviceRepository } from './plant-care/infrastructure/repositories/http-device.repository';
import { NurseryRepository } from './plant-care/domain/repositories/nursery.repository';
import { HttpNurseryRepository } from './plant-care/infrastructure/repositories/http-nursery.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: PlantRepository, useExisting: HttpPlantRepository },
    { provide: ProfileRepository, useExisting: HttpProfileRepository },
    { provide: HomeRepository, useExisting: HttpHomeRepository },
    { provide: SensorRepository, useExisting: HttpSensorRepository },
    { provide: DeviceRepository, useExisting: HttpDeviceRepository },
    { provide: NurseryRepository, useExisting: HttpNurseryRepository }
  ]
};
