import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProfileFacade } from '../../../application/facades/profile.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './settings.view.html',
  styleUrl: './settings.view.css'
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
