import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../application/services/report.service';
import { NotificationService } from '../../../../shared/infrastructure/services/notification.service';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <section class="page-card reports">
      <header class="reports__header">
        <div>
          <p class="reports__eyebrow">{{ 'reports:eyebrow' | t:'Datos históricos' }}</p>
          <h2>{{ 'reports:title' | t:'Reportes' }}</h2>
          <p>{{ 'reports:subtitle' | t:'Descarga reportes en PDF o CSV para tus plantas o un resumen general.' }}</p>
        </div>
      </header>
      <form [formGroup]="form" class="reports__form">
        <label>
          {{ 'reports:fields.plant' | t:'Planta (obligatoria para PDF/CSV)' }}
          <select formControlName="plantId">
            <option value="">{{ 'reports:fields.selectPlant' | t:'Selecciona una planta' }}</option>
            <option *ngFor="let plant of plants()" [value]="plant.id">{{ plant.name }}</option>
          </select>
        </label>
        <label>
          {{ 'reports:fields.from' | t:'Desde' }}
          <input formControlName="from" type="date" />
        </label>
        <label>
          {{ 'reports:fields.to' | t:'Hasta' }}
          <input formControlName="to" type="date" />
        </label>
        <div class="reports__metrics">
          <p>{{ 'reports:fields.metrics' | t:'Métricas' }}</p>
          <div class="metrics-grid">
            <label
              *ngFor="let metric of availableMetrics"
              class="metric-chip"
              [class.metric-chip--selected]="isMetricSelected(metric.id)"
            >
              <input type="checkbox" [value]="metric.id" (change)="toggleMetric(metric.id, $event)" />
              <span>{{ metric.label | t:metric.fallback }}</span>
            </label>
          </div>
        </div>
        <div class="reports__actions">
          <button class="btn" type="button" (click)="download('pdf')" [disabled]="downloading">
            {{ 'reports:actions.pdf' | t:'PDF planta' }}
          </button>
          <button class="btn btn--outline" type="button" (click)="download('csv')" [disabled]="downloading">
            {{ 'reports:actions.csv' | t:'CSV planta' }}
          </button>
          <button class="btn btn--outline" type="button" (click)="download('summary')" [disabled]="downloading">
            {{ 'reports:actions.summary' | t:'Resumen PDF' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [`
      .reports__header {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .reports__eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        color: var(--color-muted);
        margin: 0 0 0.25rem;
      }
      .reports__form {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .reports__form label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--color-primary);
      }
      .reports__form input,
      .reports__form select {
        padding: 0.85rem 1rem;
        border-radius: 0.85rem;
        border: 1px solid var(--color-border);
        background: #f7fbf8;
      }
      .reports__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .reports__metrics {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.65rem;
      }
      .metric-chip {
        border: 1px solid var(--color-border);
        border-radius: 999px;
        padding: 0.4rem 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s, color 0.2s, border-color 0.2s;
      }
      .metric-chip input {
        appearance: none;
        width: 0;
        height: 0;
        margin: 0;
      }
      .metric-chip--selected {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: #fff;
      }
      .metric-chip--selected span {
        color: #fff;
      }
    `]
})
export class ReportsViewComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reports = inject(ReportService);
  private readonly notifications = inject(NotificationService);
  private readonly plantFacade = inject(PlantFacade);
  private readonly i18n = inject(I18nService);
  private readonly selectedMetrics = new Set<string>();

  readonly form = this.fb.nonNullable.group({
    plantId: [''],
    from: ['', Validators.required],
    to: ['', Validators.required]
  });
  readonly plants = this.plantFacade.plants;
  readonly availableMetrics = [
    { id: 'temperature', label: 'reports:metrics.temperature', fallback: 'Temperatura' },
    { id: 'humidity', label: 'reports:metrics.humidity', fallback: 'Humedad' },
    { id: 'soilMoisture', label: 'reports:metrics.soilMoisture', fallback: 'Humedad del suelo' },
    { id: 'ph', label: 'reports:metrics.ph', fallback: 'pH' }
  ];
  downloading = false;

  ngOnInit(): void {
    this.plantFacade.loadPlants({ size: 50 });
  }

  download(type: 'pdf' | 'csv' | 'summary') {
    const { plantId, from, to } = this.form.getRawValue();
    if (!from || !to || !this.isDateRangeValid()) {
      this.notifications.error(
        this.i18n.translate('reports:errors.invalidRange', 'Selecciona un rango de fechas válido')
      );
      return;
    }
    if (type !== 'summary' && !plantId) {
      this.notifications.error(
        this.i18n.translate('reports:errors.plantRequired', 'Debes indicar una planta para PDF/CSV')
      );
      return;
    }
    const metricsList = this.selectedMetrics.size ? Array.from(this.selectedMetrics) : undefined;

    let request$;
    if (type === 'summary') {
      request$ = this.reports.downloadSummary(from!, to!);
    } else if (type === 'pdf') {
      request$ = this.reports.downloadPlantPdf(plantId!, from!, to!, metricsList);
    } else {
      request$ = this.reports.downloadPlantCsv(plantId!, from!, to!);
    }

    this.downloading = true;
    request$.subscribe({
      next: ({ blob, fileName }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notifications.success(
          this.i18n.translate('reports:messages.success', 'Reporte generado')
        );
        this.downloading = false;
      },
      error: () => {
        this.notifications.error(
          this.i18n.translate('reports:errors.generic', 'No pudimos generar el reporte')
        );
        this.downloading = false;
      }
    });
  }

  private isDateRangeValid() {
    const { from, to } = this.form.getRawValue();
    return from && to && new Date(from) <= new Date(to);
  }

  toggleMetric(metric: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedMetrics.add(metric);
    } else {
      this.selectedMetrics.delete(metric);
    }
  }

  isMetricSelected(metric: string) {
    return this.selectedMetrics.has(metric);
  }
}
