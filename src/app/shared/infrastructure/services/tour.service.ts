import { Injectable, Signal, computed, signal } from '@angular/core';
import { I18nService } from './i18n.service';

export interface TourStep {
  titleKey: string;
  titleFallback: string;
  bodyKey: string;
  bodyFallback: string;
}

type RouteKey = '/dashboard' | '/plants' | '/nursery' | '/sensors' | '/reports';

const STORAGE_KEY = 'plantae.tour.completed';

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly completed = new Set<RouteKey>(this.restoreCompleted());
  private readonly activeRoute = signal<RouteKey | null>(null);
  private readonly stepIndex = signal(0);

  private readonly stepsByRoute: Record<RouteKey, TourStep[]> = {
    '/dashboard': [
      {
        titleKey: 'tour:dashboard.overview.title',
        titleFallback: 'Resumen diario',
        bodyKey: 'tour:dashboard.overview.body',
        bodyFallback: 'Aquí ves métricas clave y alertas recientes para actuar rápido.'
      },
      {
        titleKey: 'tour:dashboard.actions.title',
        titleFallback: 'Acciones rápidas',
        bodyKey: 'tour:dashboard.actions.body',
        bodyFallback: 'Usa los botones y atajos para crear plantas o ver reportes al instante.'
      }
    ],
    '/plants': [
      {
        titleKey: 'tour:plants.filters.title',
        titleFallback: 'Filtra sin escribir todo',
        bodyKey: 'tour:plants.filters.body',
        bodyFallback: 'Busca por palabra clave, especie, sensor o ubicación y ordena la lista.'
      },
      {
        titleKey: 'tour:plants.detail.title',
        titleFallback: 'Abre el detalle',
        bodyKey: 'tour:plants.detail.body',
        bodyFallback: 'Haz clic en “Ver detalle” para editar, ver alertas y vincular sensores.'
      }
    ],
    '/nursery': [
      {
        titleKey: 'tour:nursery.hero.title',
        titleFallback: 'Panel de vivero',
        bodyKey: 'tour:nursery.hero.body',
        bodyFallback: 'El hero te lleva directo a tareas e insumos críticos de tus lotes.'
      },
      {
        titleKey: 'tour:nursery.tasks.title',
        titleFallback: 'Tareas y lotes',
        bodyKey: 'tour:nursery.tasks.body',
        bodyFallback: 'Ve tareas pendientes y lotes en riesgo para priorizar acciones.'
      }
    ],
    '/sensors': [
      {
        titleKey: 'tour:sensors.link.title',
        titleFallback: 'Vincula sin escribir',
        bodyKey: 'tour:sensors.link.body',
        bodyFallback: 'Selecciona sensor y planta de las listas y confirma para vincular.'
      },
      {
        titleKey: 'tour:sensors.readings.title',
        titleFallback: 'Revisa lecturas',
        bodyKey: 'tour:sensors.readings.body',
        bodyFallback: 'Usa “Ver lecturas” para validar datos recientes y calidad del sensor.'
      }
    ],
    '/reports': [
      {
        titleKey: 'tour:reports.filters.title',
        titleFallback: 'Elige rango y métricas',
        bodyKey: 'tour:reports.filters.body',
        bodyFallback: 'Selecciona fechas y métricas antes de generar un PDF o CSV.'
      },
      {
        titleKey: 'tour:reports.preview.title',
        titleFallback: 'Previsualiza antes',
        bodyKey: 'tour:reports.preview.body',
        bodyFallback: 'Revisa el contenido generado y confirma la descarga si es correcto.'
      }
    ]
  };

  readonly currentStep: Signal<TourStep | null> = computed(() => {
    const route = this.activeRoute();
    if (!route) return null;
    const steps = this.stepsByRoute[route];
    const idx = this.stepIndex();
    if (!steps || idx >= steps.length) return null;
    return steps[idx];
  });

  readonly isActive = computed(() => this.currentStep() !== null);

  constructor(private readonly i18n: I18nService) {}

  onRouteChange(url: string) {
        const path = this.normalize(url);
        if (!path || !this.stepsByRoute[path] || this.completed.has(path)) {
          this.activeRoute.set(null);
          this.stepIndex.set(0);
          return;
        }
        this.activeRoute.set(path);
        this.stepIndex.set(0);
  }

  next() {
    const route = this.activeRoute();
    if (!route) return;
    const steps = this.stepsByRoute[route];
    const nextIndex = this.stepIndex() + 1;
    if (steps && nextIndex < steps.length) {
      this.stepIndex.set(nextIndex);
    } else {
      this.complete(route);
    }
  }

  skip() {
    const route = this.activeRoute();
    if (route) {
      this.complete(route);
    }
  }

  private complete(route: RouteKey) {
    this.completed.add(route);
    this.persist();
    this.activeRoute.set(null);
    this.stepIndex.set(0);
  }

  private normalize(url: string): RouteKey | null {
    const clean = url.split('?')[0];
    const segment = clean.startsWith('/') ? clean.split('/')[1] : clean.split('/')[0];
    const key = ('/' + segment) as RouteKey;
    return this.stepsByRoute[key] ? key : null;
  }

  private restoreCompleted(): RouteKey[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as string[];
      return parsed.filter((item) => ['/dashboard', '/plants', '/nursery', '/sensors', '/reports'].includes(item)) as RouteKey[];
    } catch {
      return [];
    }
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.completed)));
  }

  translate(step: TourStep) {
    return {
      title: this.i18n.translate(step.titleKey, step.titleFallback),
      body: this.i18n.translate(step.bodyKey, step.bodyFallback)
    };
  }
}
