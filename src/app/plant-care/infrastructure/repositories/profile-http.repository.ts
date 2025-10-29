import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProfileRepository} from '../../domain/repositories/profile.repository';
import {CompleteUserProfile, UserProfile} from '../../domain/models/user-profile.model';
import {environment} from '../../../../environments/environment';

@Injectable()
export class ProfileHttpRepository extends ProfileRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  override getProfile(): Observable<CompleteUserProfile> {
    return this.http.get<CompleteUserProfile>(`${this.baseUrl}/profile`);
  }

  override updateProfile(payload: Partial<UserProfile>): Observable<CompleteUserProfile> {
    return this.http.patch<CompleteUserProfile>(`${this.baseUrl}/profile`, payload);
  }
}
