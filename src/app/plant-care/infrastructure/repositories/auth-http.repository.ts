import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable, switchMap} from 'rxjs';
import {AuthRepository} from '../../domain/repositories/auth.repository';
import {AuthCredentials, RegistrationPayload} from '../../domain/models/auth.model';
import {CompleteUserProfile} from '../../domain/models/user-profile.model';
import {environment} from '../../../../environments/environment';

@Injectable()
export class AuthHttpRepository extends AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  override login(credentials: AuthCredentials): Observable<CompleteUserProfile | null> {
    const params = new HttpParams()
      .set('username', credentials.username)
      .set('password', credentials.password);
    return this.http
      .get<CompleteUserProfile[]>(`${this.baseUrl}/users`, { params })
      .pipe(map(users => users.length ? users[0] : null));
  }

  override register(payload: RegistrationPayload): Observable<CompleteUserProfile> {
    const newUser: CompleteUserProfile = {
      id: Date.now(),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      username: payload.username,
      password: payload.password,
      joinDate: new Date().toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
      subscriptionLevel: 'Plan Básico'
    };
    return this.http.post<CompleteUserProfile>(`${this.baseUrl}/users`, newUser).pipe(
      switchMap(() => this.http.put<CompleteUserProfile>(`${this.baseUrl}/profile`, newUser))
    );
  }
}
