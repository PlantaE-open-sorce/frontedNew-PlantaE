import { Injectable, Signal, computed, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../shared/infrastructure/services/notification.service';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { ProfileDetails, UpdateProfilePayload } from '../../domain/models/profile/profile-details.model';
import {
  NotificationSettings,
  UpdateNotificationsPayload
} from '../../domain/models/profile/notification-settings.model';
import { PublicProfile, UpdatePublicProfilePayload } from '../../domain/models/profile/profile-public.model';

@Injectable({ providedIn: 'root' })
export class ProfileFacade {
  private readonly profileState = signal<ProfileDetails | null>(null);
  private readonly notificationState = signal<NotificationSettings | null>(null);
  private readonly loadingProfile = signal(false);
  private readonly loadingNotifications = signal(false);
  private readonly publicProfileState = signal<PublicProfile | null>(null);
  private readonly publicProfileLoading = signal(false);

  readonly profile: Signal<ProfileDetails | null> = this.profileState.asReadonly();
  readonly notificationSettings: Signal<NotificationSettings | null> = this.notificationState.asReadonly();
  readonly isProfileLoading: Signal<boolean> = this.loadingProfile.asReadonly();
  readonly isNotificationsLoading: Signal<boolean> = this.loadingNotifications.asReadonly();
  readonly publicProfile: Signal<PublicProfile | null> = this.publicProfileState.asReadonly();
  readonly isPublicProfileLoading: Signal<boolean> = this.publicProfileLoading.asReadonly();

  constructor(
    private readonly repository: ProfileRepository,
    private readonly notifications: NotificationService
  ) {}

  loadProfile() {
    this.loadingProfile.set(true);
    this.repository
      .getProfile()
      .pipe(finalize(() => this.loadingProfile.set(false)))
      .subscribe({
        next: (profile) => this.profileState.set(profile),
        error: () => this.notifications.error('No pudimos cargar tu perfil')
      });
  }

  loadNotificationSettings() {
    this.loadingNotifications.set(true);
    this.repository
      .getNotificationSettings()
      .pipe(finalize(() => this.loadingNotifications.set(false)))
      .subscribe({
        next: (settings) => this.notificationState.set(settings),
        error: () => this.notifications.error('No pudimos cargar las notificaciones')
      });
  }

  updateProfile(payload: UpdateProfilePayload) {
    this.loadingProfile.set(true);
    this.repository
      .updateProfile(payload)
      .pipe(finalize(() => this.loadingProfile.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Perfil actualizado');
          this.loadProfile();
        },
        error: () => this.notifications.error('No pudimos actualizar tu perfil')
      });
  }

  updateNotifications(payload: UpdateNotificationsPayload) {
    this.loadingNotifications.set(true);
    this.repository
      .updateNotificationSettings(payload)
      .pipe(finalize(() => this.loadingNotifications.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Preferencias guardadas');
          this.notificationState.set(payload);
        },
        error: () => this.notifications.error('No pudimos guardar las notificaciones')
      });
  }

  loadPublicProfile(slug: string) {
    this.publicProfileLoading.set(true);
    this.repository
      .getPublicProfile(slug)
      .pipe(finalize(() => this.publicProfileLoading.set(false)))
      .subscribe({
        next: (profile) => this.publicProfileState.set(profile),
        error: () => this.notifications.error('No pudimos encontrar este perfil')
      });
  }

  updatePublicProfile(payload: UpdatePublicProfilePayload) {
    this.loadingProfile.set(true);
    this.repository
      .updatePublicProfile(payload)
      .pipe(finalize(() => this.loadingProfile.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Perfil público actualizado');
          this.loadProfile();
        },
        error: () => this.notifications.error('No pudimos actualizar el perfil público')
      });
  }
}
