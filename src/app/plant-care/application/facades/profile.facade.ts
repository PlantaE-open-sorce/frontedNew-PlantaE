import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ProfileRepository} from '../../domain/repositories/profile.repository';
import {CompleteUserProfile, UserProfile} from '../../domain/models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileFacade {
  private readonly repository = inject(ProfileRepository);

  getProfile(): Observable<CompleteUserProfile> {
    return this.repository.getProfile();
  }

  updateProfile(payload: Partial<UserProfile>): Observable<CompleteUserProfile> {
    return this.repository.updateProfile(payload);
  }
}
