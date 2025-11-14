import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { PlantaeFrontConfig, PLANTAE_CONFIG } from '../../../shared/infrastructure/config/app-config.token';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private readonly http: HttpClient,
    @Inject(PLANTAE_CONFIG) private readonly config: PlantaeFrontConfig
  ) {}

  downloadPlantPdf(plantId: string, from: string, to: string, metrics?: string[]) {
    const params: Record<string, string | string[]> = { from, to };
    if (metrics && metrics.length) {
      params['metrics'] = metrics;
    }
    return this.download(`/reports/plants/${plantId}.pdf`, params);
  }

  downloadPlantCsv(plantId: string, from: string, to: string) {
    return this.download(`/reports/plants/${plantId}.csv`, { from, to });
  }

  downloadSummary(from: string, to: string) {
    return this.download('/reports/summary.pdf', { from, to });
  }

  private download(endpoint: string, params: Record<string, string | string[]>) {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => query.append(key, item));
      } else if (value) {
        query.append(key, value);
      }
    });
    const downloadUrl = `${url}?${query.toString()}`;
    return this.http
      .get(downloadUrl, { responseType: 'blob', observe: 'response' })
      .pipe(
        map((response) => {
          const fileName = this.resolveFilename(response.headers.get('content-disposition'));
          return { blob: response.body as Blob, fileName };
        })
      );
  }

  private resolveFilename(disposition: string | null): string {
    if (!disposition) {
      return 'report';
    }
    const match = /filename=([^;]+)/i.exec(disposition);
    return match ? match[1].replace(/"/g, '') : 'report';
  }
}
