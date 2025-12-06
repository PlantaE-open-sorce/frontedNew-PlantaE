import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { PlantaeFrontConfig, PLANTAE_CONFIG } from '../config/app-config.token';
import { I18nService } from './i18n.service';

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number | boolean | null | undefined)[];

interface RequestOptions {
  params?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  responseType?: 'json' | 'blob';
}

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  constructor(
    private readonly http: HttpClient,
    @Inject(PLANTAE_CONFIG) private readonly config: PlantaeFrontConfig,
    private readonly i18n: I18nService
  ) {}

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.http.get<T>(this.toUrl(endpoint), {
      params: this.buildParams(options?.params),
      headers: this.buildHeaders(options?.headers),
      responseType: (options?.responseType ?? 'json') as any
    });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.http.post<T>(this.toUrl(endpoint), body ?? {}, {
      headers: this.buildHeaders(options?.headers)
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.http.put<T>(this.toUrl(endpoint), body ?? {}, {
      headers: this.buildHeaders(options?.headers)
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.http.delete<T>(this.toUrl(endpoint), {
      headers: this.buildHeaders(options?.headers)
    });
  }

  private toUrl(endpoint: string): string {
    const sanitized = endpoint.replace(/^\/+/, '');
    return `${this.config.apiBaseUrl}/${sanitized}`;
  }

  private buildParams(params?: Record<string, QueryValue>) {
    if (!params) {
      return undefined;
    }
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }
      if (Array.isArray(value)) {
        value
          .filter((item) => item !== null && item !== undefined && item !== '')
          .forEach((item) => {
            httpParams = httpParams.append(key, String(item));
          });
        return;
      }
      httpParams = httpParams.append(key, String(value));
    });
    return httpParams;
  }

  private buildHeaders(headers?: Record<string, string>) {
    const merged: Record<string, string> = {
      'Accept-Language': this.i18n.currentLanguage(),
      ...(headers ?? {})
    };
    return new HttpHeaders(merged);
  }
}
