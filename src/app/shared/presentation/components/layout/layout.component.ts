import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FooterContentComponent } from '../footer-content/footer-content.component';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { I18nService } from '../../../infrastructure/services/i18n.service';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { AlertFacade } from '../../../../plant-care/application/facades/alert.facade';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TourOverlayComponent } from '../tour-overlay/tour-overlay.component';
import { TourService } from '../../../infrastructure/services/tour.service';
import { Subscription, filter } from 'rxjs';

interface SidebarLink {
  path: string;
  labelKey: string;
  fallback: string;
  icon: string;
  exact?: boolean;
  requiresPro?: boolean;
  hasBadge?: boolean;
  allowedAccountTypes?: string[];
}

type AccountTypeCopy = {
  key: string;
  fallback: string;
};

type IconPath = {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  opacity?: string | number;
};

interface IconDefinition {
  viewBox: string;
  paths: IconPath[];
}

const ICONS: Record<string, IconDefinition> = {
  home: {
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M13.993 3.434c-1.136-1.01-2.849-1.01-3.986 0L2.336 10.253c-.413.367-.45.999-.083 1.412.366.412.998.45 1.41.083L4 11.449v5.617c0 .886 0 1.65.082 2.262.088.656.288 1.284.797 1.793.51.51 1.138.708 1.794.797.612.082 1.376.082 2.262.082h6.132c.886 0 1.65 0 2.262-.082.656-.089 1.284-.287 1.794-.797.51-.509.708-1.137.797-1.793.082-.612.082-1.376.082-2.262v-5.617l.336.298c.412.367 1.044.329 1.411-.083.366-.413.329-1.045-.084-1.412L13.993 3.434ZM12 16c-.552 0-1 .448-1 1v2a1 1 0 1 1-2 0v-2a3 3 0 1 1 6 0v2a1 1 0 1 1-2 0v-2c0-.552-.448-1-1-1Z',
        fill: 'currentColor'
      }
    ]
  },
  dashboard: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M4 4h7v5H4z', fill: 'currentColor' },
      { d: 'M13 4h7v9h-7z', fill: 'currentColor' },
      { d: 'M4 11h7v9H4z', fill: 'currentColor', opacity: 0.75 },
      { d: 'M13 14h7v6h-7z', fill: 'currentColor', opacity: 0.6 }
    ]
  },
  plant: {
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M21 3v2c0 3.866-3.134 7-7 7h-1v1h5v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7h5v-3c0-3.866 3.134-7 7-7h3Zm-15.5-1C8.03 2 10.265 3.251 11.624 5.169 10.604 6.51 10 8.185 10 10v1h-.5C5.358 11 2 7.642 2 3.5V2h3.5Z',
        fill: 'currentColor'
      }
    ]
  },
  sensor: {
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M6 9V13M10 9V13M20 12H22M20 8L22 6M22 18L20 16M5.2 19H12.8C13.9201 19 14.4802 19 14.908 18.782C15.2843 18.5903 15.5903 18.2843 15.782 17.908C16 17.4802 16 16.9201 16 15.8V8.2C16 7.0799 16 6.51984 15.782 6.09202C15.5903 5.71569 15.2843 5.40973 14.908 5.21799C14.4802 5 13.9201 5 12.8 5H5.2C4.0799 5 3.51984 5 3.09202 5.21799C2.71569 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.07989 2 8.2V15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.07989 19 5.2 19Z',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    ]
  },
  management: {
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M20,16.18V15a3,3,0,0,0-3-3H13V10h3a3,3,0,0,0,3-3V5a3,3,0,0,0-3-3H8A3,3,0,0,0,5,5V7a3,3,0,0,0,3,3h3v2H7a3,3,0,0,0-3,3v1.18a3,3,0,1,0,2,0V15a1,1,0,0,1,1-1h4v2.18a3,3,0,1,0,2,0V14h4a1,1,0,0,1,1,1v1.18a3,3,0,1,0,2,0ZM7,7V5A1,1,0,0,1,8,4h8a1,1,0,0,1,1,1V7a1,1,0,0,1-1,1H8A1,1,0,0,1,7,7ZM5,20a1,1,0,1,1,1-1A1,1,0,0,1,5,20Zm7,0a1,1,0,1,1,1-1A1,1,0,0,1,12,20Zm7,0a1,1,0,1,1,1-1A1,1,0,0,1,19,20Z',
        fill: 'currentColor'
      }
    ]
  },
  alert: {
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9-4v5a1 1 0 1 0 2 0V8a1 1 0 1 0-2 0Zm2 7.989a1 1 0 1 0-2 0V16a1 1 0 1 0 2 0v-.011Z',
        fill: 'currentColor'
      }
    ]
  },
  report: {
    viewBox: '0 0 6.35 6.35',
    paths: [
      {
        d: 'M1.5867 0c-.5817 0-1.0588.4771-1.0588 1.0589V5.291c0 .5818.4771 1.0589 1.0588 1.0589H4.762c.5817 0 1.0588-.4771 1.0588-1.0589V2.647H4.276c-.6795 0-1.2346-.5572-1.2346-1.2366V0Zm1.9844.001v1.409c0 .3954.3095.7069.7049.7069h1.545A1.588 1.588 0 0 0 5.104.4005C4.68.0866 4.141.0042 3.571.001ZM1.5867 1.125h.7948a.2646.2646 0 0 1 0 .5293h-.7948a.2646.2646 0 1 1 0-.5293Zm0 .9922h.7948a.2646.2646 0 1 1 0 .5293h-.7948a.2646.2646 0 1 1 0-.5293Zm.8769.8072v1.076c0 .0371-.0218.0584-.0589.0584H1.336c.0781-.38.5424-.8468 1.1276-.9281Zm.5292.0388c.5589.1543.9746.6632.9746 1.2696 0 .7275-.5949 1.324-1.3224 1.324-.6036 0-1.1101-.413-1.2671-.9685h1.0268c.3212 0 .5881-.2669.5881-.5881Z',
        fill: 'currentColor'
      }
    ]
  },
  profile: {
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z',
        fill: 'currentColor'
      }
    ]
  },
  logout: {
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M9 5h-3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: 'none'
      },
      {
        d: 'M15 16 19 12 15 8',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: 'none'
      },
      {
        d: 'M11 12h8',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round'
      }
    ]
  },
  default: {
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M6 12h12',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round'
      }
    ]
  }
};

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FooterContentComponent,
    LanguageSwitcherComponent,
    TranslatePipe,
    TourOverlayComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  readonly navLinks: SidebarLink[] = [
    { path: '/', labelKey: 'layout:menu.home', fallback: 'Inicio', icon: 'home', exact: true },
    {
      path: '/dashboard',
      labelKey: 'layout:menu.dashboard',
      fallback: 'Dashboard',
      icon: 'dashboard',
      allowedAccountTypes: ['HOME']
    },
    { path: '/plants', labelKey: 'layout:menu.plants', fallback: 'Plantas', icon: 'plant' },
    { path: '/sensors', labelKey: 'layout:menu.sensors', fallback: 'Sensores', icon: 'sensor' },
    {
      path: '/nursery',
      labelKey: 'layout:menu.nursery',
      fallback: 'Vivero',
      icon: 'dashboard',
      allowedAccountTypes: ['VIVERO_FORESTAL']
    },
    {
      path: '/management',
      labelKey: 'layout:menu.management',
      fallback: 'Gestión',
      icon: 'management',
      requiresPro: true,
      allowedAccountTypes: ['HOME', 'VIVERO_FORESTAL']
    },
    { path: '/alerts', labelKey: 'layout:menu.alerts', fallback: 'Alertas', icon: 'alert', hasBadge: true },
    { path: '/reports', labelKey: 'layout:menu.reports', fallback: 'Reportes', icon: 'report' },
    { path: '/profile', labelKey: 'layout:menu.profile', fallback: 'Perfil', icon: 'profile' }
  ];
  readonly accountTypeCopy: Record<string, AccountTypeCopy> = {
    HOME: { key: 'iam:accountTypes.home', fallback: 'Usuario normal' },
    VIVERO_FORESTAL: { key: 'iam:accountTypes.nursery', fallback: 'Vivero Forestal' }
  };
  private readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  private readonly alertFacade = inject(AlertFacade);
  private readonly tour = inject(TourService);
  private readonly router = inject(Router);
  private navSub?: Subscription;
  readonly exactMatch = { exact: true };
  readonly defaultMatch = { exact: false };
  private readonly icons = ICONS;

  constructor() {
    ['home', 'iam', 'dashboard', 'layout'].forEach((namespace) => this.i18n.loadNamespace(namespace));
  }

  readonly accountType = this.auth.accountType;
  readonly alertCount = this.alertFacade.activeCount;

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
    if (this.auth.isAuthenticated()) {
      this.alertFacade.load({ size: 10 });
    }
    this.navSub = this.router.events
      .pipe(filter((evt) => evt instanceof NavigationEnd))
      .subscribe((evt: any) => this.tour.onRouteChange(evt.urlAfterRedirects ?? evt.url));
    this.tour.onRouteChange(this.router.url);
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  canDisplay(link: SidebarLink) {
    if (link.allowedAccountTypes && link.allowedAccountTypes.length > 0) {
      const type = this.auth.getAccountType();
      return !!type && link.allowedAccountTypes.includes(type);
    }
    if (link.requiresPro) {
      return this.isProAccount();
    }
    return true;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  getIcon(name: string): IconDefinition {
    return this.icons[name] ?? this.icons['default'];
  }

  isProAccount() {
    const type = this.auth.getAccountType();
    return type === 'VIVERO_FORESTAL';
  }

  logout() {
    this.auth.logout();
  }
}
