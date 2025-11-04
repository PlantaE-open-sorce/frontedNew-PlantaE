import {ChangeDetectionStrategy, Component, OnDestroy, inject} from '@angular/core';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil, tap} from 'rxjs/operators';
import {SettingsFacade} from '../../../application/facades/settings.facade';
import {SettingsState} from '../../../domain/models/settings.model';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './settings.view.html',
  styleUrl: './settings.view.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsView implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly settingsFacade = inject(SettingsFacade);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  readonly form: FormGroup = this.fb.group({
    language: this.fb.nonNullable.control<'es' | 'en'>('es'),
    theme: this.fb.nonNullable.control<'day' | 'night'>('day'),
    notifications: this.fb.group({
      sms: this.fb.nonNullable.control(false),
      email: this.fb.nonNullable.control(false),
      phoneCall: this.fb.nonNullable.control(false),
      socialMedia: this.fb.nonNullable.control(false)
    }),
    alarm: this.fb.group({
      type: this.fb.nonNullable.control(''),
      options: this.fb.nonNullable.control<string[]>([])
    })
  });

  readonly settings$ = this.settingsFacade.getSettings().pipe(
    tap(settings => {
      this.form.patchValue(settings, { emitEvent: false });
      this.translate.use(settings.language);
    })
  );

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(value => {
        const settings = value as SettingsState;
        this.translate.use(settings.language);
        this.settingsFacade.updateSettings(settings).subscribe();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(theme: 'day' | 'night') {
    this.form.get('theme')?.setValue(theme);
  }

  selectLanguage(language: 'es' | 'en') {
    this.form.get('language')?.setValue(language);
  }
}
