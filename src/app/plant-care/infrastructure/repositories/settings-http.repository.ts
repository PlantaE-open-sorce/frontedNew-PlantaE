import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SettingsRepository} from '../../domain/repositories/settings.repository';
import {SettingsState} from '../../domain/models/settings.model';
import {environment} from '../../../../environments/environment';

@Injectable()
export class SettingsHttpRepository extends SettingsRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  override getSettings(): Observable<SettingsState> {
    return this.http.get<SettingsState>(`${this.baseUrl}/settings`);
  }

  override updateSettings(payload: Partial<SettingsState>): Observable<SettingsState> {
    return this.http.patch<SettingsState>(`${this.baseUrl}/settings`, payload);
  }
}
