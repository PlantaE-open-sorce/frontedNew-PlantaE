import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProfileFacade } from '../../../application/facades/profile.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <section class="settings">
      <header class="settings__header">
        <div>
          <p class="settings__eyebrow">{{ 'settings:eyebrow' | t:'Alertas y recordatorios' }}</p>
          <h2>{{ 'settings:title' | t:'Notificaciones' }}</h2>
          <p class="settings__subtitle">
            {{ 'settings:subtitle' | t:'Configura tus horarios silenciosos y canales preferidos.' }}
          </p>
        </div>
        <span class="settings__status" [class.settings__status--saving]="isSaving()">
          {{
            isSaving()
              ? ('settings:status.saving' | t:'Guardando...')
              : ('settings:status.live' | t:'En tiempo real')
          }}
        </span>
      </header>

      <form class="settings__form" [formGroup]="form" (ngSubmit)="save()">
        <div class="settings__grid">
          <label class="settings__field">
            <span>{{ 'settings:fields.quietStart' | t:'Inicio horas silenciosas' }}</span>
            <input formControlName="quietHoursStart" placeholder="22:00" />
            <small>{{ 'settings:fields.format' | t:'Formato 24h' }}</small>
          </label>
          <label class="settings__field">
            <span>{{ 'settings:fields.quietEnd' | t:'Fin horas silenciosas' }}</span>
            <input formControlName="quietHoursEnd" placeholder="06:00" />
            <small>{{ 'settings:fields.format' | t:'Formato 24h' }}</small>
          </label>
          <label class="settings__field">
            <span>{{ 'settings:fields.digest' | t:'Hora del resumen' }}</span>
            <input formControlName="digestTime" placeholder="08:00" />
            <small>{{ 'settings:fields.digestHint' | t:'Recibirás un resumen diario' }}</small>
          </label>
        </div>

        <div class="settings__preferences" formArrayName="preferences">
          <div class="preference-card" *ngFor="let pref of preferences.controls; let i = index" [formGroupName]="i">
            <div class="preference-card__info">
              <p class="preference-card__type">{{ pref.value.type | titlecase }}</p>
              <p class="preference-card__hint">
                {{ 'settings:preferences.hint' | t:'Elige cómo quieres enterarte.' }}
              </p>
            </div>
            <div class="preference-card__toggles">
              <label class="toggle">
                <input type="checkbox" formControlName="emailEnabled" />
                <span>{{ 'settings:preferences.email' | t:'Correo' }}</span>
              </label>
              <label class="toggle">
                <input type="checkbox" formControlName="inAppEnabled" />
                <span>{{ 'settings:preferences.inApp' | t:'In-app' }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="settings__actions">
          <button type="submit" class="btn" [disabled]="isSaving()">
            {{ 'settings:actions.save' | t:'Guardar cambios' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .settings {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .settings__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }
      .settings__eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--color-muted);
        margin-bottom: 0.25rem;
      }
      .settings__subtitle {
        margin: 0.35rem 0 0;
        color: var(--color-muted);
      }
      .settings__status {
        padding: 0.35rem 0.9rem;
        border-radius: 999px;
        background: rgba(47, 133, 90, 0.12);
        color: var(--color-primary);
        font-size: 0.85rem;
        font-weight: 600;
      }
      .settings__status--saving {
        background: rgba(229, 62, 62, 0.1);
        color: #a32020;
      }
      .settings__form {
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }
      .settings__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }
      .settings__field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 500;
      }
      .settings__field small {
        color: var(--color-muted);
        font-weight: 400;
      }
      .settings__preferences {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .preference-card {
        padding: 1rem 1.25rem;
        border: 1px solid var(--color-border);
        border-radius: 1rem;
        background: var(--color-surface);
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 1rem;
      }
      .preference-card__type {
        margin: 0;
        font-weight: 600;
        color: var(--color-primary);
      }
      .preference-card__hint {
        margin: 0.35rem 0 0;
        color: var(--color-muted);
        font-size: 0.85rem;
      }
      .preference-card__toggles {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        border: 1px solid var(--color-border);
        cursor: pointer;
      }
      .toggle input {
        accent-color: var(--color-primary);
      }
      .settings__actions {
        display: flex;
        justify-content: flex-end;
      }
      @media (max-width: 640px) {
        .preference-card__toggles {
          flex-direction: column;
          align-items: flex-start;
        }
        .settings__actions {
          justify-content: stretch;
        }
        .settings__actions .btn {
          width: 100%;
        }
      }
    `
  ]
})
export class SettingsViewComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileFacade = inject(ProfileFacade);

  readonly settings = this.profileFacade.notificationSettings;
  readonly isSaving = this.profileFacade.isNotificationsLoading;

  readonly form = this.fb.nonNullable.group({
    quietHoursStart: [''],
    quietHoursEnd: [''],
    digestTime: [''],
    preferences: this.fb.array([])
  });

  get preferences() {
    return this.form.get('preferences') as FormArray;
  }

  constructor() {
    effect(() => {
      const settings = this.settings();
      if (settings) {
        this.form.patchValue({
          quietHoursStart: settings.quietHoursStart ?? '',
          quietHoursEnd: settings.quietHoursEnd ?? '',
          digestTime: settings.digestTime ?? ''
        });
        this.preferences.clear();
        settings.preferences.forEach((pref) => {
          this.preferences.push(
            this.fb.nonNullable.group({
              type: [pref.type],
              emailEnabled: [pref.emailEnabled],
              inAppEnabled: [pref.inAppEnabled]
            })
          );
        });
      }
    });
  }

  ngOnInit(): void {
    this.profileFacade.loadNotificationSettings();
  }

  save() {
    const { quietHoursStart, quietHoursEnd, digestTime } = this.form.getRawValue();
    const preferences = this.preferences.getRawValue().map((pref) => ({
      type: pref.type,
      emailEnabled: !!pref.emailEnabled,
      inAppEnabled: !!pref.inAppEnabled
    }));
    this.profileFacade.updateNotifications({
      quietHoursStart: quietHoursStart || null,
      quietHoursEnd: quietHoursEnd || null,
      digestTime: digestTime || null,
      preferences
    });
  }
}
