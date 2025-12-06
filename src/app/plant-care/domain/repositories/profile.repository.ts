import { Observable } from 'rxjs';
import { ProfileDetails, UpdateProfilePayload } from '../models/profile/profile-details.model';
import { PublicProfile, UpdatePublicProfilePayload } from '../models/profile/profile-public.model';
import {
  NotificationSettings,
  UpdateNotificationsPayload
} from '../models/profile/notification-settings.model';

export abstract class ProfileRepository {
  abstract getProfile(): Observable<ProfileDetails>;
  abstract updateProfile(payload: UpdateProfilePayload): Observable<void>;
  abstract getNotificationSettings(): Observable<NotificationSettings>;
  abstract updateNotificationSettings(payload: UpdateNotificationsPayload): Observable<void>;
  abstract getPublicProfile(slug: string): Observable<PublicProfile>;
  abstract updatePublicProfile(payload: UpdatePublicProfilePayload): Observable<void>;
}
