import {Observable} from 'rxjs';
import {AuthCredentials, RegistrationPayload} from '../models/auth.model';
import {CompleteUserProfile} from '../models/user-profile.model';

export abstract class AuthRepository {
  abstract login(credentials: AuthCredentials): Observable<CompleteUserProfile | null>;
  abstract register(payload: RegistrationPayload): Observable<CompleteUserProfile>;
}
