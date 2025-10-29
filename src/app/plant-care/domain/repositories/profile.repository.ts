import {Observable} from 'rxjs';
import {CompleteUserProfile, UserProfile} from '../models/user-profile.model';

export abstract class ProfileRepository {
  abstract getProfile(): Observable<CompleteUserProfile>;
  abstract updateProfile(payload: Partial<UserProfile>): Observable<CompleteUserProfile>;
}
