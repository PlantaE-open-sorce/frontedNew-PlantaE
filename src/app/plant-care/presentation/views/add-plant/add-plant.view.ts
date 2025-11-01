import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Observable, catchError, of, shareReplay, tap} from 'rxjs';
import {PlantFacade} from '../../../application/facades/plant.facade';
import {PlantType} from '../../../domain/models/plant-type.model';

@Component({
  selector: 'app-add-plant-view',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './add-plant.view.html',
  styleUrl: './add-plant.view.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPlantView {
  private readonly fb = inject(FormBuilder);
  private readonly plantFacade = inject(PlantFacade);
  private readonly translate = inject(TranslateService);

  readonly status = signal<'idle' | 'success' | 'error'>('idle');
  readonly form: FormGroup = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    type: this.fb.nonNullable.control('', Validators.required),
    sowingDate: this.fb.nonNullable.control('', Validators.required),
    sensorCode: this.fb.nonNullable.control('', Validators.required),
    imageUrl: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^https?:\/\//i)
    ])
  });

  readonly plantTypes$: Observable<PlantType[]> = this.plantFacade.getPlantTypes().pipe(
    tap(types => {
      this.plantTypesSnapshot = types;
      const current = this.form.get('type')?.value;
      if (!current && types.length) {
        this.form.get('type')?.setValue(types[0].id);
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly selectedType = computed(() => {
    const typeId = this.form.get('type')?.value as string | null;
    let selected: PlantType | undefined;
    if (typeId) {
      const snapshot = (this.plantTypesSnapshot ?? []).find(type => type.id === typeId);
      selected = snapshot;
    }
    return selected ?? null;
  });

  private plantTypesSnapshot: PlantType[] | null = null;

  constructor() {
    const today = new Date().toISOString().substring(0, 10);
    this.form.patchValue({ sowingDate: today });
  }

  getPreviewName(type: PlantType | null): string {
    if (!type) {
      return '';
    }
    const currentLang = this.translate.currentLang || this.translate.getDefaultLang();
    return type.name[(currentLang as 'es' | 'en') ?? 'es'];
  }

  getPreviewImage(type: PlantType | null): string {
    const control = this.form.get('imageUrl');
    const value = (control?.value as string | null)?.trim();
    if (value) {
      return value;
    }
    return type?.imageUrl ?? '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('idle');
    const type = this.plantTypesSnapshot?.find(item => item.id === this.form.value.type);
    const typeName = type ? type.name.es : (this.form.value.type as string);
    const imageUrlControl = (this.form.value.imageUrl as string | null)?.trim();
    const resolvedImageUrl = imageUrlControl && imageUrlControl.length
      ? imageUrlControl
      : type?.imageUrl ?? '';
    const reportSlug =
      this.form.value.name?.toString().toLowerCase().replace(/\s+/g, '-') ?? 'nueva-planta';
    this.plantFacade
      .create({
        ...this.form.getRawValue(),
        type: typeName,
        statusLabel: this.translate.instant('add-plant.new-status'),
        alertLevel: 'ok',
        lastReviewDays: 0,
        sensorModel: type?.name.en ?? '',
        reportsUrl: `https://example.com/report/${reportSlug}`,
        imageUrl: resolvedImageUrl,
        metrics: {
          soilHumidity: 40,
          ambientTemperature: 22,
          batteryLevel: 95,
          soilPh: 6.5,
          conductivity: 320,
          state: 'optimal'
        }
      })
      .pipe(
        tap(() => this.status.set('success')),
        catchError(() => {
          this.status.set('error');
          return of(null);
        })
      )
      .subscribe();
  }

  resetStatus(): void {
    this.status.set('idle');
  }
}
