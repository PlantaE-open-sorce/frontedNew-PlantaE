import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from '../../../shared/infrastructure/services/api-client.service';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { ProfileDetails, UpdateProfilePayload } from '../../domain/models/profile/profile-details.model';
import {
  NotificationSettings,
  UpdateNotificationsPayload
} from '../../domain/models/profile/notification-settings.model';
import { PublicProfile, UpdatePublicProfilePayload } from '../../domain/models/profile/profile-public.model';

interface ProfileDetailsResponse {
  message: string;
  data: ProfileDetails;
}

interface NotificationSettingsResponse {
  message: string;
  data: NotificationSettings;
}

interface PublicProfileResponse {
  message: string;
  profile: PublicProfile;
}

@Injectable({ providedIn: 'root' })
export class HttpProfileRepository implements ProfileRepository {
  constructor(private readonly api: ApiClientService) {}

  getProfile() {
    return this.api.get<ProfileDetailsResponse>('profile').pipe(map((response) => response.data));
  }

  updateProfile(payload: UpdateProfilePayload) {
    return this.api.put<unknown>('profile', payload).pipe(map(() => undefined));
  }

  getNotificationSettings() {
    return this.api
      .get<NotificationSettingsResponse>('profile/notifications')
      .pipe(map((response) => response.data));
  }

  updateNotificationSettings(payload: UpdateNotificationsPayload) {
    return this.api.put<unknown>('profile/notifications', payload).pipe(map(() => undefined));
  }

  getPublicProfile(slug: string) {
    return this.api.get<PublicProfileResponse>(`profiles/${slug}`).pipe(map((response) => response.profile));
  }

  updatePublicProfile(ownerId: string, payload: UpdatePublicProfilePayload) {
    return this.api.put<unknown>(`profiles/${ownerId}`, payload).pipe(map(() => undefined));
  }
}
