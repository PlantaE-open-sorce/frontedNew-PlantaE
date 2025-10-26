import {inject, Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {AuthRepository} from '../../domain/repositories/auth.repository';
import {AuthCredentials, RegistrationPayload} from '../../domain/models/auth.model';
import {CompleteUserProfile} from '../../domain/models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly repository = inject(AuthRepository);
  private readonly storageKey = 'flor.currentUser';
  private _currentUser: CompleteUserProfile | null = null;

  constructor() {
    this.restoreSession();
  }

  get currentUser(): CompleteUserProfile | null {
    return this._currentUser;
  }

  login(credentials: AuthCredentials): Observable<CompleteUserProfile | null> {
    return this.repository.login(credentials).pipe(
      tap(user => {
        this._currentUser = user;
        this.persistUser();
      })
    );
  }

  register(payload: RegistrationPayload): Observable<CompleteUserProfile> {
    return this.repository.register(payload).pipe(
      tap(user => {
        this._currentUser = user;
        this.persistUser();
      })
    );
  }

  logout(): void {
    this._currentUser = null;
    this.persistUser();
  }

  ensureSession(): CompleteUserProfile | null {
    if (!this._currentUser) {
      this.restoreSession();
    }
    return this._currentUser;
  }

  private restoreSession(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this._currentUser = JSON.parse(stored) as CompleteUserProfile;
      } catch {
        this._currentUser = null;
        window.localStorage.removeItem(this.storageKey);
      }
    }
  }

  private persistUser(): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (this._currentUser) {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this._currentUser));
    } else {
      window.localStorage.removeItem(this.storageKey);
    }
  }
}
