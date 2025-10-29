import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {AsyncPipe, DatePipe, NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {ProfileFacade} from '../../../application/facades/profile.facade';
import {Observable, shareReplay, tap, catchError, of} from 'rxjs';
import {CompleteUserProfile} from '../../../domain/models/user-profile.model';
import {RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgIf, TranslatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './profile.view.html',
  styleUrl: './profile.view.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileView {
  private readonly profileFacade = inject(ProfileFacade);
  private readonly fb = inject(FormBuilder);

  readonly status = signal<'idle' | 'saving' | 'success' | 'error'>('idle');

  readonly form = this.fb.group({
    firstName: this.fb.nonNullable.control('', Validators.required),
    lastName: this.fb.nonNullable.control('', Validators.required),
    username: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    subscriptionLevel: this.fb.nonNullable.control('', Validators.required),
    photoUrl: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^https?:\/\//i)])
  });

  readonly profile$: Observable<CompleteUserProfile> = this.profileFacade.getProfile().pipe(
    tap(profile => this.resetForm(profile)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  submit(profile: CompleteUserProfile): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('saving');
    this.profileFacade
      .updateProfile({ id: profile.id, ...this.form.getRawValue() })
      .pipe(
        tap(updated => {
          if (updated) {
            this.resetForm(updated, true);
          }
          this.status.set('success');
        }),
        catchError(() => {
          this.status.set('error');
          return of(null);
        })
      )
      .subscribe();
  }

  resetForm(profile: CompleteUserProfile, preserveStatus = false): void {
    this.form.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      email: profile.email,
      subscriptionLevel: profile.subscriptionLevel,
      photoUrl: profile.photoUrl
    });
    if (!preserveStatus) {
      this.status.set('idle');
    }
  }
}
