import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../shared/infrastructure/services/auth.service';
import { IamService } from '../../../../application/services/iam.service';
import { NotificationService } from '../../../../../shared/infrastructure/services/notification.service';
import { ProfileFacade } from '../../../../application/facades/profile.facade';
import { I18nService } from '../../../../../shared/infrastructure/services/i18n.service';
import { TranslatePipe } from '../../../../../shared/presentation/pipes/translate.pipe';
import { ConfirmationModalComponent } from '../../../../../shared/presentation/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, ConfirmationModalComponent],
  templateUrl: './profile.view.html',
  styleUrls: ['./profile.view.css']
})
export class ProfileViewComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly iam = inject(IamService);
  private readonly notifications = inject(NotificationService);
  private readonly profileFacade = inject(ProfileFacade);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly profile = this.profileFacade.profile;
  readonly isLoading = this.profileFacade.isProfileLoading;
  showDeleteModal = false;

  readonly languages = this.i18n.supportedLanguages();

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    timezone: [''],
    language: ['es', Validators.required]
  });

  readonly publicForm = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    slug: ['', Validators.required],
    avatarUrl: [''],
    location: [''],
    bio: ['']
  });

  readonly locationPreviewUrl = computed(() => {
    const value = this.publicForm.controls.location.value;
    if (!value) {
      return '';
    }
    const encoded = encodeURIComponent(value);
    return `https://www.openstreetmap.org/export/embed.html?search=${encoded}`;
  });

  ngOnInit(): void {
    this.i18n.loadNamespace('profile');
    this.profileFacade.loadProfile();

    effect(() => {
      const profile = this.profile();
      if (profile) {
        this.form.patchValue({
          fullName: profile.fullName ?? '',
          timezone: profile.timezone ?? '',
          language: profile.language ?? 'es'
        });
        this.publicForm.patchValue({
          displayName: profile.displayName ?? '',
          slug: profile.slug ?? '',
          avatarUrl: profile.avatarUrl ?? '',
          location: profile.location ?? '',
          bio: profile.bio ?? ''
        });
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.profileFacade.updateProfile(this.form.getRawValue());
  }

  savePublic() {
    if (this.publicForm.invalid) return;
    this.profileFacade.updatePublicProfile(this.publicForm.getRawValue());
  }

  updateLocationPreview() {
    this.publicForm.controls.location.updateValueAndValidity({ emitEvent: false });
  }

  locationMapsLink() {
    const value = this.publicForm.controls.location.value;
    return value ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(value)}` : '';
  }

  publicLink() {
    const slug = this.profile()?.slug;
    if (!slug) return '';
    return `${window.location.origin}/u/${slug}`;
  }

  goToChangePassword() {
    this.router.navigate(['/profile/change-password']);
  }

  deleteAccount() {
    this.showDeleteModal = true;
  }

  confirmDelete() {
    this.showDeleteModal = false;
    this.iam.deleteAccount().subscribe({
      next: () => {
        this.auth.logout();
        this.notifications.success(
          this.i18n.translate('profile:actions.deleted', 'Cuenta eliminada')
        );
      },
      error: () => {
        this.notifications.error(
          this.i18n.translate('profile:actions.deleteError', 'No pudimos eliminar la cuenta')
        );
      }
    });
  }
}
