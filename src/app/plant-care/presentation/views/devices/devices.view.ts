import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeviceFacade } from '../../../application/facades/device.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PlantOptionsService } from '../../../application/services/plant-options.service';
import { AuthService } from '../../../../shared/infrastructure/services/auth.service';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-devices-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <section class="devices page-card">
      <header class="devices__header">
        <div>
          <p class="devices__eyebrow">{{ 'devices:eyebrow' | t:'Hardware' }}</p>
          <h2>{{ 'devices:title' | t:'Dispositivos' }}</h2>
          <p>{{ 'devices:subtitle' | t:'Registra gateways o hubs y asígnalos a tus plantas.' }}</p>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="register()" class="devices__form">
        <label>
          <span>{{ 'devices:fields.deviceId' | t:'ID del dispositivo' }}</span>
          <input formControlName="deviceId" />
        </label>
        <label>
          <span>{{ 'devices:fields.ownerId' | t:'Propietario' }}</span>
          <input formControlName="ownerId" readonly />
        </label>
        <label>
          <span>{{ 'devices:fields.hwModel' | t:'Modelo hardware' }}</span>
          <input formControlName="hwModel" />
        </label>
        <label>
          <span>{{ 'devices:fields.secret' | t:'Secreto (opcional)' }}</span>
          <input formControlName="secret" />
        </label>
        <button type="submit" class="btn" [disabled]="form.invalid || isLoading()">
          {{ 'devices:actions.register' | t:'Registrar' }}
        </button>
      </form>
      <section class="devices__list" *ngIf="devices().length">
        <label>
          <span>{{ 'devices:fields.selectDevice' | t:'Selecciona dispositivo' }}</span>
          <select (change)="selectDevice($any($event.target).value)">
            <option value="">{{ 'devices:actions.chooseDevice' | t:'Elige un dispositivo' }}</option>
            <option *ngFor="let item of devices()" [value]="item.id">
              {{ item.id }} · {{ item.hwModel }} —
              {{
                item.active
                  ? ('devices:detail.active' | t:'Activo')
                  : ('devices:detail.inactive' | t:'Inactivo')
              }}
            </option>
          </select>
        </label>
      </section>

      <form [formGroup]="lookupForm" (ngSubmit)="fetchDevice()" class="devices__form devices__form--inline">
        <label>
          <span>{{ 'devices:fields.lookupId' | t:'Buscar dispositivo' }}</span>
          <input formControlName="deviceId" />
        </label>
        <button class="btn btn--outline" type="submit" [disabled]="lookupForm.invalid || isLoading()">
          {{ 'devices:actions.load' | t:'Consultar' }}
        </button>
      </form>

      <section *ngIf="device()" class="devices__detail">
        <h3>{{ 'devices:detail.title' | t:'Detalle' }}</h3>
        <p><strong>{{ 'devices:detail.id' | t:'ID:' }}</strong> {{ device()?.id }}</p>
        <p><strong>{{ 'devices:detail.model' | t:'Modelo:' }}</strong> {{ device()?.hwModel }}</p>
        <p>
          <strong>{{ 'devices:detail.status' | t:'Estado:' }}</strong>
          {{
            device()?.active
              ? ('devices:detail.active' | t:'Activo')
              : ('devices:detail.inactive' | t:'Inactivo')
          }}
        </p>
        <p>
          <strong>{{ 'devices:detail.note' | t:'Nota:' }}</strong>
          {{ device()?.note ?? ('common:generic.none' | t:'—') }}
        </p>
        <form [formGroup]="noteForm" (ngSubmit)="saveNote()" class="devices__form">
          <label>
            <span>{{ 'devices:fields.note' | t:'Nota' }}</span>
            <textarea rows="2" formControlName="note"></textarea>
          </label>
          <button class="btn btn--outline" type="submit" [disabled]="noteForm.invalid">
            {{ 'devices:actions.updateNote' | t:'Actualizar nota' }}
          </button>
        </form>
        <form [formGroup]="linkForm" (ngSubmit)="linkDevice()" class="devices__form">
          <label>
            <span>{{ 'devices:fields.plantId' | t:'ID de planta' }}</span>
            <select formControlName="plantId">
              <option value="">{{ 'devices:fields.selectPlant' | t:'Selecciona una planta' }}</option>
              <option *ngFor="let option of plantOptions()" [value]="option.id">{{ option.label }}</option>
            </select>
          </label>
          <button class="btn btn--outline" type="submit" [disabled]="linkForm.invalid">
            {{ 'devices:actions.link' | t:'Vincular a planta' }}
          </button>
        </form>
        <div class="devices__actions">
          <button class="btn btn--outline" type="button" (click)="deactivate()">
            {{ 'devices:actions.deactivate' | t:'Desactivar' }}
          </button>
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      .devices {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .devices__eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--color-muted);
        margin-bottom: 0.1rem;
      }
      .devices__form label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--color-primary);
      }
      .devices__form input {
        padding: 0.85rem 1rem;
        border-radius: 0.85rem;
        border: 1px solid var(--color-border);
        background: #f7fbf8;
      }
      .devices__form select,
      .devices__list select {
        width: 100%;
        padding: 0.85rem 1rem;
        border-radius: 0.85rem;
        border: 1px solid var(--color-border);
        background: #f7fbf8;
      }
      .devices__form {
        display: grid;
        gap: 1rem;
        max-width: 500px;
      }
      .devices__detail {
        margin-top: 2rem;
      }
      .devices__list {
        margin-top: 1rem;
        max-width: 500px;
      }
      .devices__list label {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-weight: 600;
      }
      .devices__form textarea {
        resize: vertical;
      }
      .devices__form--inline {
        grid-template-columns: minmax(200px, 1fr) auto;
        align-items: end;
      }
    `
  ]
})
export class DevicesViewComponent implements OnInit {
  private readonly deviceFacade = inject(DeviceFacade);
  private readonly fb = inject(FormBuilder);
  private readonly plantOptionsService = inject(PlantOptionsService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);

  readonly device = this.deviceFacade.device;
  readonly isLoading = this.deviceFacade.isLoading;
  readonly devices = this.deviceFacade.devices;
  readonly plantOptions = this.plantOptionsService.options;

  readonly form = this.fb.nonNullable.group({
    deviceId: ['', Validators.required],
    ownerId: [this.auth.getUserId() ?? '', Validators.required],
    hwModel: ['', Validators.required],
    secret: ['']
  });
  readonly lookupForm = this.fb.nonNullable.group({
    deviceId: ['', Validators.required]
  });
  readonly noteForm = this.fb.nonNullable.group({
    note: ['', Validators.maxLength(500)]
  });
  readonly linkForm = this.fb.nonNullable.group({
    plantId: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      const current = this.device();
      if (current) {
        this.noteForm.patchValue({ note: current.note ?? '' }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.i18n.loadNamespace('devices');
    this.deviceFacade.loadDevices();
    this.plantOptionsService.load({ page: 0, size: 200, sort: 'name,asc' });
  }

  register() {
    if (this.form.invalid) {
      return;
    }
    const { deviceId, ownerId, hwModel, secret } = this.form.getRawValue();
    this.deviceFacade.register({
      deviceId,
      ownerId,
      hwModel,
      secret: secret || undefined
    });
  }

  deactivate() {
    const current = this.device();
    if (!current) {
      return;
    }
    this.deviceFacade.deactivate(current.id);
  }

  fetchDevice() {
    if (this.lookupForm.invalid) {
      return;
    }
    this.deviceFacade.load(this.lookupForm.getRawValue().deviceId);
  }

  saveNote() {
    const current = this.device();
    if (!current) {
      return;
    }
    this.deviceFacade.updateNote(current.id, this.noteForm.getRawValue());
    this.noteForm.reset({ note: '' });
  }

  linkDevice() {
    const current = this.device();
    if (!current || this.linkForm.invalid) {
      return;
    }
    this.deviceFacade.linkToPlant(current.id, this.linkForm.getRawValue().plantId);
    this.linkForm.reset({ plantId: '' });
  }

  selectDevice(deviceId: string) {
    if (!deviceId) {
      return;
    }
    this.lookupForm.patchValue({ deviceId });
    this.deviceFacade.load(deviceId);
  }
}
