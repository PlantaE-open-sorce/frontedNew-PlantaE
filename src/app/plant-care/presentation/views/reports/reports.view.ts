import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReportService } from '../../../application/services/report.service';
import { NotificationService } from '../../../../shared/infrastructure/services/notification.service';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './reports.view.html',
  styleUrl: './reports.view.css'
})
export class ReportsViewComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly reports = inject(ReportService);
  private readonly notifications = inject(NotificationService);
  private readonly plantFacade = inject(PlantFacade);
  private readonly i18n = inject(I18nService);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly selectedMetrics = new Set<string>();
  private pendingFileName: string | null = null;
  private rawPreviewUrl: string | null = null; // Store raw for revocation

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
    { id: 'ph', label: 'reports:metrics.ph', fallback: 'pH' },
    { id: 'light', label: 'reports:metrics.light', fallback: 'Luz' }
  ];
  downloading = false;
  previewUrl: SafeResourceUrl | null = null; // Changed type
  previewText: string | null = null;
  previewType: 'pdf' | 'csv' | null = null;

  ngOnInit(): void {
    this.plantFacade.loadPlants({ size: 50 });
  }

  ngOnDestroy(): void {
    this.cleanupPreview();
  }

  prepare(type: 'pdf' | 'csv' | 'summary') {
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
        this.downloading = false;
        this.setPreview(blob, fileName, type);
      },
      error: () => {
        this.notifications.error(
          this.i18n.translate('reports:errors.generic', 'No pudimos generar el reporte')
        );
        this.downloading = false;
      }
    });
  }

  confirmDownload() {
    if (!this.rawPreviewUrl || !this.pendingFileName) {
      return;
    }
    const a = document.createElement('a');
    a.href = this.rawPreviewUrl;
    a.download = this.pendingFileName;
    a.click();
    this.notifications.success(
      this.i18n.translate('reports:messages.success', 'Reporte generado')
    );
    this.cleanupPreview();
  }

  cancelPreview() {
    this.cleanupPreview();
  }

  private setPreview(blob: Blob, fileName: string, type: 'pdf' | 'csv' | 'summary') {
    this.cleanupPreview();
    this.pendingFileName = fileName;
    this.previewType = type === 'csv' ? 'csv' : 'pdf';

    const url = window.URL.createObjectURL(blob);
    this.rawPreviewUrl = url;

    if (this.previewType === 'csv') {
      this.previewUrl = null; // Not needed for CSV text preview
      blob.text().then((text) => {
        this.previewText = text.split('\n').slice(0, 20).join('\n');
      });
    } else {
      // Sanitize for PDF
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  private cleanupPreview() {
    if (this.rawPreviewUrl) {
      window.URL.revokeObjectURL(this.rawPreviewUrl);
    }
    this.rawPreviewUrl = null;
    this.previewUrl = null;
    this.previewText = null;
    this.previewType = null;
    this.pendingFileName = null;
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
