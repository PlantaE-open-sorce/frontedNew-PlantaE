import {Observable} from 'rxjs';
import {SettingsState} from '../models/settings.model';

export abstract class SettingsRepository {
  abstract getSettings(): Observable<SettingsState>;
  abstract updateSettings(payload: Partial<SettingsState>): Observable<SettingsState>;
}
