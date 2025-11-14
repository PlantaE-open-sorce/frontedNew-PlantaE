import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/presentation/components/layout/layout.component';
import { HomeViewComponent } from './shared/presentation/views/home/home.view';
import { AboutViewComponent } from './shared/presentation/views/about/about.view';
import { PageNotFoundViewComponent } from './shared/presentation/views/page-not-found/page-not-found.view';
import { LoginViewComponent } from './plant-care/presentation/views/login/login.view';
import { RegisterViewComponent } from './plant-care/presentation/views/register/register.view';
import { DashboardViewComponent } from './plant-care/presentation/views/dashboard/dashboard.view';
import { PlantListViewComponent } from './plant-care/presentation/views/plant-list/plant-list.view';
import { AddPlantViewComponent } from './plant-care/presentation/views/add-plant/add-plant.view';
import { PlantDetailViewComponent } from './plant-care/presentation/views/plant-detail/plant-detail.view';
import { PlantManagementViewComponent } from './plant-care/presentation/views/plant-management/plant-management.view';
import { NurseryDashboardViewComponent } from './plant-care/presentation/views/nursery-dashboard/nursery-dashboard.view';
import { ProfileViewComponent } from './plant-care/presentation/views/profile/profile.view';
import { SettingsViewComponent } from './plant-care/presentation/views/settings/settings.view';
import { SensorsViewComponent } from './plant-care/presentation/views/sensors/sensors.view';
import { DevicesViewComponent } from './plant-care/presentation/views/devices/devices.view';
import { ForgotPasswordViewComponent } from './plant-care/presentation/views/password/forgot-password.view';
import { ChangePasswordViewComponent } from './plant-care/presentation/views/password/change-password.view';
import { ReportsViewComponent } from './plant-care/presentation/views/reports/reports.view';
import { AlertsViewComponent } from './plant-care/presentation/views/alerts/alerts.view';
import { PublicProfilePageComponent } from './plant-care/presentation/views/profile/public-profile-page.view';
import { authGuard } from './plant-care/presentation/guards/auth.guard';
import { accountTypeGuard } from './plant-care/presentation/guards/account-type.guard';

export const routes: Routes = [
  { path: 'login', component: LoginViewComponent },
  { path: 'register', component: RegisterViewComponent },
  { path: 'forgot-password', component: ForgotPasswordViewComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeViewComponent },
      { path: 'about', component: AboutViewComponent },
      {
        path: 'dashboard',
        component: DashboardViewComponent,
        canActivate: [authGuard, accountTypeGuard],
        data: { accountTypes: ['HOME'] }
      },
      { path: 'plants', component: PlantListViewComponent, canActivate: [authGuard] },
      { path: 'plants/new', component: AddPlantViewComponent, canActivate: [authGuard] },
      { path: 'plants/:id', component: PlantDetailViewComponent, canActivate: [authGuard] },
      {
        path: 'management',
        component: PlantManagementViewComponent,
        canActivate: [authGuard, accountTypeGuard],
        data: { accountTypes: ['HOME', 'VIVERO_FORESTAL'] }
      },
      {
        path: 'nursery',
        component: NurseryDashboardViewComponent,
        canActivate: [authGuard, accountTypeGuard],
        data: { accountTypes: ['VIVERO_FORESTAL'] }
      },
      {
        path: 'sensors',
        component: SensorsViewComponent,
        canActivate: [authGuard, accountTypeGuard],
        data: { accountTypes: ['HOME', 'VIVERO_FORESTAL'] }
      },
      {
        path: 'devices',
        component: DevicesViewComponent,
        canActivate: [authGuard, accountTypeGuard],
        data: { accountTypes: ['HOME', 'VIVERO_FORESTAL'] }
      },
      { path: 'reports', component: ReportsViewComponent, canActivate: [authGuard] },
      { path: 'alerts', component: AlertsViewComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfileViewComponent, canActivate: [authGuard] },
      { path: 'profile/change-password', component: ChangePasswordViewComponent, canActivate: [authGuard] },
      { path: 'settings', component: SettingsViewComponent, canActivate: [authGuard] }
    ]
  },
  { path: 'u/:slug', component: PublicProfilePageComponent },
  { path: '**', component: PageNotFoundViewComponent }
];
