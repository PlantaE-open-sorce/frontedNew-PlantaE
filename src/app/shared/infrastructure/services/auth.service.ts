import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { I18nService } from './i18n.service';
import { NotificationService } from './notification.service';

export interface AuthState {
  token: string | null;
  accountType: string | null;
  language: string;
  userId: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  language: string;
  accountType: string;
}

export interface AuthResponse {
  token: string;
  message: string;
  accountType: string;
}

const STORAGE_KEY = 'plantae.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private expirationTimer: any;
  private readonly state = signal<AuthState>({
    token: null,
    accountType: null,
    language: 'en',
    userId: null
  });

  readonly isAuthenticated = computed(() => !!this.state().token);
  readonly accountType = computed(() => this.state().accountType);

  constructor(
    private readonly api: ApiClientService,
    private readonly router: Router,
    private readonly i18n: I18nService,
    private readonly notifications: NotificationService
  ) {
    const savedState = this.restoreState();
    this.state.set(
      savedState ?? {
        token: null,
        accountType: null,
        language: this.i18n.defaultLanguage(),
        userId: null
      }
    );
    effect(() => {
      const current = this.state();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      this.i18n.setLanguage(current.language);
    });
  }

  login(payload: LoginRequest) {
    return this.api
      .post<AuthResponse>('iam/login', payload, {
        headers: { 'Accept-Language': this.i18n.currentLanguage() }
      })
      .pipe(
        tap((response) => {
          this.persistAuth(response);
          this.notifications.success(response.message);
        }),
        catchError((error) => this.handleAuthError(error))
      );
  }

  register(payload: RegisterRequest) {
    this.i18n.setLanguage(payload.language);
    return this.api
      .post<AuthResponse>('iam/register', payload, {
        headers: { 'Accept-Language': payload.language }
      })
      .pipe(
        tap((response) => {
          this.persistAuth(response);
          this.notifications.success(response.message);
        }),
        catchError((error) => this.handleAuthError(error))
      );
  }

  logout() {
    this.state.set({ token: null, accountType: null, language: this.i18n.defaultLanguage(), userId: null });
    localStorage.removeItem(STORAGE_KEY);
    this.clearExpirationTimer();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.state().token;
  }

  getAccountType(): string | null {
    return this.state().accountType;
  }

  getDefaultRoute(): string {
    const type = this.state().accountType;
    if (type === 'HOME') {
      return '/dashboard';
    }
    if (type === 'VIVERO_FORESTAL') {
      return '/nursery';
    }
    return '/dashboard';
  }

  updateLanguage(language: string) {
    this.i18n.setLanguage(language);
    this.state.update((current) => ({ ...current, language }));
  }

  getUserId(): string | null {
    const state = this.state();
    if (state.userId) {
      return state.userId;
    }
    const userId = state.token ? this.extractUserId(state.token) : null;
    if (userId) {
      this.state.update((current) => ({ ...current, userId }));
    }
    return userId;
  }

  private persistAuth(response: AuthResponse) {
    const payloadLanguage = this.extractLanguage(response.token);
    const language = payloadLanguage ?? this.i18n.currentLanguage();
    this.i18n.setLanguage(language);
    const userId = this.extractUserId(response.token);
    this.state.set({ token: response.token, accountType: response.accountType, language, userId });
    this.scheduleExpiration(response.token);
  }

  private restoreState(): AuthState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Partial<AuthState>;
      return {
        token: parsed.token ?? null,
        accountType: parsed.accountType ?? null,
        language: parsed.language ?? this.i18n.defaultLanguage(),
        userId: parsed.userId ?? null
      };
    } catch (error) {
      console.error('Failed to parse auth state', error as HttpErrorResponse);
      return null;
    }
  }

  private extractLanguage(token: string): string | null {
    try {
      const decoded = this.decodePayload(token);
      return typeof decoded.language === 'string' ? decoded.language : null;
    } catch (error) {
      console.warn('Unable to read token payload', error);
      return null;
    }
  }

  private extractUserId(token: string): string | null {
    try {
      const decoded = this.decodePayload(token);
      return typeof decoded.userId === 'string' ? decoded.userId : null;
    } catch (error) {
      console.warn('Unable to read token payload', error);
      return null;
    }
  }

  private decodePayload(token: string) {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  }

  private scheduleExpiration(token: string) {
    const decoded = this.decodePayloadSafe(token);
    if (!decoded?.exp) {
      return;
    }
    const expiresIn = decoded.exp * 1000 - Date.now() - 5000;
    if (expiresIn <= 0) {
      this.notifications.info(this.i18n.translate('errors:sessionExpired', 'Tu sesión ha expirado'));
      this.logout();
      return;
    }
    this.clearExpirationTimer();
    this.expirationTimer = setTimeout(() => {
      this.notifications.info(this.i18n.translate('errors:sessionExpired', 'Tu sesión ha expirado'));
      this.logout();
    }, expiresIn);
  }

  private decodePayloadSafe(token: string) {
    try {
      return this.decodePayload(token);
    } catch {
      return null;
    }
  }

  private clearExpirationTimer() {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
  }

  private handleAuthError(error: unknown) {
    const message = this.resolveErrorMessage(error) ?? this.i18n.translate('errors:unexpected', 'Ocurrió un error inesperado');
    this.notifications.error(message);
    return throwError(() => error);
  }

  private resolveErrorMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length) {
        return error.error;
      }
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.status === 401) {
        return this.i18n.translate('errors:unauthorized', 'Credenciales incorrectas. Verifica tus datos.');
      }
      if (error.status === 403) {
        return this.i18n.translate('errors:forbidden', 'No tienes permiso para realizar esta acción.');
      }
      if (error.status === 0) {
        return this.i18n.translate('errors:network', 'Error de red. Revisa tu conexión e intenta nuevamente.');
      }
      return this.i18n.translate('errors:unexpected', 'Ocurrió un error inesperado');
    }
    return null;
  }
}
