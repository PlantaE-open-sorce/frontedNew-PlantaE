import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/infrastructure/services/auth.service';
import { IamService } from '../../../application/services/iam.service';
import { NotificationService } from '../../../../shared/infrastructure/services/notification.service';
import { ProfileFacade } from '../../../application/facades/profile.facade';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="profile-page">
      <section class="page-card profile-card profile-card--account">
        <header class="profile-card__header">
          <div>
            <p class="profile-eyebrow">{{ 'profile:account.eyebrow' | t:'Tu cuenta' }}</p>
            <h2>{{ 'profile:account.title' | t:'Información personal' }}</h2>
            <p class="profile-description">
              {{
                'profile:account.description'
                  | t:'Actualiza tu zona horaria, idioma y nombre para mantener sincronizada tu cuenta.'
              }}
            </p>
          </div>
          <div class="profile-actions">
            <button class="btn btn--outline" type="button" (click)="goToChangePassword()">
              {{ 'profile:actions.changePassword' | t:'Cambiar contraseña' }}
            </button>
            <button class="btn btn--danger" type="button" (click)="deleteAccount()">
              {{ 'profile:actions.delete' | t:'Eliminar cuenta' }}
            </button>
          </div>
        </header>
        <form class="profile-form" [formGroup]="form" (ngSubmit)="save()">
          <div class="profile-form__grid">
            <label class="profile-form__field">
              <span>{{ 'profile:fields.fullName' | t:'Nombre completo' }}</span>
              <input formControlName="fullName" />
            </label>
            <label class="profile-form__field">
              <span>{{ 'profile:fields.timezone' | t:'Zona horaria' }}</span>
              <input formControlName="timezone" placeholder="America/Lima" />
            </label>
            <label class="profile-form__field">
              <span>{{ 'profile:fields.language' | t:'Idioma' }}</span>
              <select formControlName="language">
                <option *ngFor="let lang of languages" [value]="lang">{{ lang | uppercase }}</option>
              </select>
            </label>
          </div>
          <div class="profile-form__footer">
            <button type="submit" class="btn" [disabled]="form.invalid || isSaving()">
              {{ 'profile:actions.saveAccount' | t:'Guardar cambios' }}
            </button>
          </div>
        </form>
      </section>

      <section class="page-card profile-card profile-card--public">
        <header class="profile-card__header">
          <div>
            <p class="profile-eyebrow">{{ 'profile:public.eyebrow' | t:'Presencia' }}</p>
            <h2>{{ 'profile:public.title' | t:'Perfil público' }}</h2>
            <p class="profile-description">
              {{
                'profile:public.description'
                  | t:'Organiza cómo te verán los demás al compartir tu enlace público.'
              }}
            </p>
          </div>
          <div class="profile-share" *ngIf="profile()?.slug">
            <span>{{ 'profile:public.share' | t:'Comparte tu enlace' }}</span>
            <a [href]="publicLink()" target="_blank" rel="noreferrer">{{ publicLink() }}</a>
          </div>
        </header>
        <form class="profile-form" [formGroup]="publicForm" (ngSubmit)="savePublic()">
          <div class="profile-form__grid profile-form__grid--compact">
            <label class="profile-form__field">
              <span>{{ 'profile:fields.displayName' | t:'Nombre para mostrar' }}</span>
              <input formControlName="displayName" />
            </label>
            <label class="profile-form__field">
              <span>{{ 'profile:fields.slug' | t:'Slug público' }}</span>
              <input formControlName="slug" placeholder="mi-perfil" />
            </label>
            <label class="profile-form__field">
              <span>{{ 'profile:fields.avatar' | t:'Avatar URL' }}</span>
              <input formControlName="avatarUrl" placeholder="https://..." />
            </label>
            <label class="profile-form__field">
              <span>{{ 'profile:fields.location' | t:'Ubicación' }}</span>
              <input formControlName="location" />
            </label>
            <label class="profile-form__field profile-form__field--full">
              <span>{{ 'profile:fields.bio' | t:'Bio' }}</span>
              <textarea formControlName="bio" rows="4"></textarea>
            </label>
          </div>
          <div class="profile-form__footer">
            <button class="btn" type="submit" [disabled]="publicForm.invalid || isSaving()">
              {{ 'profile:actions.savePublic' | t:'Guardar perfil público' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
  styles: [
    `
      .profile-page {
        display: grid;
        gap: 1.5rem;
      }
      @media (min-width: 1024px) {
        .profile-page {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      .profile-card {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        height: 100%;
      }
      .profile-card__header {
        display: flex;
        justify-content: space-between;
        gap: 1.5rem;
        flex-wrap: wrap;
        align-items: flex-start;
      }
      .profile-eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--color-muted);
        margin: 0 0 0.25rem;
      }
      .profile-description {
        margin: 0.35rem 0 0;
        color: var(--color-muted);
        max-width: 32rem;
      }
      .profile-actions {
        display: grid;
        gap: 0.75rem;
        min-width: 200px;
      }
      @media (min-width: 720px) {
        .profile-actions {
          grid-auto-flow: column;
          justify-content: flex-end;
        }
      }
      .profile-share {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.2rem;
        font-size: 0.85rem;
        color: var(--color-muted);
        padding: 0.85rem 1rem;
        border: 1px dashed rgba(15, 61, 46, 0.2);
        border-radius: 0.85rem;
        background: #f3f7f3;
      }
      .profile-share a {
        color: var(--color-accent);
        text-decoration: none;
        font-weight: 600;
      }
      .profile-share a:hover {
        text-decoration: underline;
      }
      .profile-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .profile-form__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }
      .profile-form__grid--compact {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
      .profile-form__field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--color-primary);
      }
      .profile-form__field span {
        font-size: 0.85rem;
        color: var(--color-muted);
        font-weight: 500;
      }
      .profile-form__field--full {
        grid-column: 1 / -1;
      }
      textarea {
        resize: vertical;
        min-height: 120px;
      }
      .profile-form__footer {
        display: flex;
        justify-content: flex-end;
      }
      .profile-form__footer .btn {
        min-width: 180px;
      }
      @media (max-width: 720px) {
        .profile-card {
          grid-column: 1 / -1;
        }
        .profile-actions {
          width: 100%;
          grid-auto-flow: row;
        }
        .profile-share {
          align-items: flex-start;
          text-align: left;
        }
        .profile-form__footer {
          width: 100%;
        }
        .profile-form__footer .btn {
          width: 100%;
        }
      }
    `
  ]
})
export class ProfileViewComponent implements OnInit {
  private readonly profileFacade = inject(ProfileFacade);
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  private readonly iamService = inject(IamService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly profile = this.profileFacade.profile;
  readonly isSaving = this.profileFacade.isProfileLoading;
  readonly languages = this.i18n.supportedLanguages();

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    timezone: ['', Validators.required],
    language: [this.i18n.currentLanguage(), Validators.required]
  });
  readonly publicForm = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    slug: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    avatarUrl: [''],
    location: [''],
    bio: ['', Validators.maxLength(500)]
  });
  constructor() {
    effect(() => {
      const data = this.profile();
      if (data) {
        this.form.patchValue(
          {
            fullName: data.fullName,
            timezone: data.timezone,
            language: data.language
          },
          { emitEvent: false }
        );
        this.publicForm.patchValue(
          {
            displayName: data.displayName,
            slug: data.slug,
            avatarUrl: data.avatarUrl ?? '',
            location: data.location ?? '',
            bio: data.bio ?? ''
          },
          { emitEvent: false }
        );
      }
    });
  }

  ngOnInit(): void {
    this.i18n.loadNamespace('profile');
    this.profileFacade.loadProfile();
  }

  save() {
    if (this.form.invalid) {
      return;
    }
    const { fullName, timezone, language } = this.form.getRawValue();
    this.profileFacade.updateProfile({ fullName, timezone, language });
    this.auth.updateLanguage(language);
  }

  goToChangePassword() {
    this.router.navigate(['/profile/change-password']);
  }

  deleteAccount() {
    const confirmMessage = this.i18n.translate(
      'profile:actions.confirmDelete',
      'Esta acción eliminará tu cuenta. ¿Continuar?'
    );
    if (!confirm(confirmMessage)) {
      return;
    }
    this.iamService.deleteAccount().subscribe({
      next: (response) => {
        this.notifications.success(response.message);
        this.auth.logout();
      },
      error: () =>
        this.notifications.error(
          this.i18n.translate('profile:errors.delete', 'No pudimos eliminar la cuenta')
        )
    });
  }

  savePublic() {
    if (this.publicForm.invalid) {
      return;
    }
    const ownerId = this.auth.getUserId();
    if (!ownerId) {
      this.notifications.error(
        this.i18n.translate('profile:errors.identify', 'No pudimos identificar tu cuenta')
      );
      return;
    }
    const { displayName, slug, avatarUrl, location, bio } = this.publicForm.getRawValue();
    this.profileFacade.updatePublicProfile(ownerId, {
      displayName,
      slug,
      avatarUrl: avatarUrl || undefined,
      location: location || undefined,
      bio: bio || undefined
    });
  }

  publicLink() {
    const slug = this.profile()?.slug;
    if (!slug) {
      return '';
    }
    return `${window.location.origin}/u/${slug}`;
  }
}
