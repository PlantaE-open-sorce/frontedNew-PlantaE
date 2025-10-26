import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SettingsRepository} from '../../domain/repositories/settings.repository';
import {SettingsState} from '../../domain/models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsFacade {
  private readonly repository = inject(SettingsRepository);

  getSettings(): Observable<SettingsState> {
    return this.repository.getSettings();
  }

  updateSettings(payload: Partial<SettingsState>): Observable<SettingsState> {
    return this.repository.updateSettings(payload);
  }
}
