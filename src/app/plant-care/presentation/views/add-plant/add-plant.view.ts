import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-add-plant-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <section class="add-plant page-card">
      <header class="add-plant__header">
        <div>
          <p class="add-plant__eyebrow">{{ 'plants:add.eyebrow' | t:'Nuevo cultivo' }}</p>
          <h2>{{ 'plants:add.title' | t:'Registrar planta' }}</h2>
          <p>
            {{ 'plants:add.subtitle' | t:'Completa los datos para comenzar a monitorear.' }}
          </p>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="save()" class="add-plant__form">
        <label>
          <span>{{ 'plants:add.fields.name' | t:'Nombre' }}</span>
          <input formControlName="name" [placeholder]="'plants:add.fields.namePlaceholder' | t:'Ej. Ficus Lyrata'" />
        </label>
        <label>
          <span>{{ 'plants:add.fields.species' | t:'Especie' }}</span>
          <input formControlName="species" [placeholder]="'plants:add.fields.speciesPlaceholder' | t:'Nombre botánico'" />
        </label>
        <label>
          <span>{{ 'plants:add.fields.device' | t:'Dispositivo' }}</span>
          <input formControlName="deviceId" [placeholder]="'plants:add.fields.devicePlaceholder' | t:'Opcional'" />
        </label>
        <label>
          <span>{{ 'plants:add.fields.sensor' | t:'Sensor' }}</span>
          <input formControlName="sensorId" [placeholder]="'plants:add.fields.sensorPlaceholder' | t:'Opcional'" />
        </label>
        <div class="form-grid__actions">
          <button type="submit" class="btn" [disabled]="form.invalid">
            {{ 'plants:add.actions.save' | t:'Guardar' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .add-plant {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .add-plant__header p {
        margin: 0.2rem 0 0;
        color: var(--color-muted);
      }
      .add-plant__eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--color-muted);
      }
      .add-plant__form {
        display: grid;
        max-width: 480px;
        gap: 0.75rem;
      }
      .add-plant__form label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--color-primary);
      }
      .add-plant__form input {
        padding: 0.85rem 1rem;
        border-radius: 0.9rem;
        border: 1px solid var(--color-border);
        background: #f7fbf8;
      }
      .form-grid__actions {
        margin-top: 0.5rem;
        display: flex;
        justify-content: flex-end;
      }
    `
  ]
})
export class AddPlantViewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly plantFacade = inject(PlantFacade);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    species: ['', Validators.required],
    deviceId: [''],
    sensorId: ['']
  });

  save() {
    if (this.form.invalid) {
      return;
    }
    const { name, species, deviceId, sensorId } = this.form.getRawValue();
    this.plantFacade
      .createPlant({
        name,
        species,
        deviceId: deviceId || undefined,
        sensorId: sensorId || undefined
      })
      .subscribe({
        next: () => {
          this.form.reset({ name: '', species: '', deviceId: '', sensorId: '' });
          this.router.navigate(['/plants']);
        }
      });
  }
}
