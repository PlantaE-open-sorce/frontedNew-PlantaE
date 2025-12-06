import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../shared/infrastructure/services/api-client.service';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class IamService {
  constructor(private readonly api: ApiClientService) {}

  forgotPassword(payload: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('iam/forgot-password', payload);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('iam/reset-password', payload);
  }

  changePassword(payload: ChangePasswordRequest): Observable<{ message: string }> {
    return this.api.put<{ message: string }>('iam/change-password', payload);
  }

  deleteAccount(): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>('iam');
  }
}
