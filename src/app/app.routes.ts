import {Routes} from '@angular/router';
import {PlantCareShellComponent} from './plant-care/presentation/components/plant-care-shell/plant-care-shell';
import {authChildGuard, authGuard} from './plant-care/presentation/guards/auth.guard';

const login = () => import('./plant-care/presentation/views/login/login.view').then(m => m.LoginView);
const register = () => import('./plant-care/presentation/views/register/register.view').then(m => m.RegisterView);
const dashboard = () => import('./plant-care/presentation/views/dashboard/dashboard.view').then(m => m.DashboardView);
const settings = () => import('./plant-care/presentation/views/settings/settings.view').then(m => m.SettingsView);
const profile = () => import('./plant-care/presentation/views/profile/profile.view').then(m => m.ProfileView);
const addPlant = () => import('./plant-care/presentation/views/add-plant/add-plant.view').then(m => m.AddPlantView);
const plantList = () => import('./plant-care/presentation/views/plant-list/plant-list.view').then(m => m.PlantListView);
const plantDetail = () => import('./plant-care/presentation/views/plant-detail/plant-detail.view').then(m => m.PlantDetailView);
const plantManagement = () => import('./plant-care/presentation/views/plant-management/plant-management.view').then(m => m.PlantManagementView);

const baseTitle = 'Flor Plant Care';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: login, title: `${baseTitle} - Login` },
      { path: 'register', loadComponent: register, title: `${baseTitle} - Register` },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: PlantCareShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: 'dashboard', loadComponent: dashboard, title: `${baseTitle} - Dashboard` },
      { path: 'settings', loadComponent: settings, title: `${baseTitle} - Settings` },
      { path: 'profile', loadComponent: profile, title: `${baseTitle} - Profile` },
      {
        path: 'plants',
        children: [
          { path: 'add', loadComponent: addPlant, title: `${baseTitle} - Add Plant` },
          { path: 'list', loadComponent: plantList, title: `${baseTitle} - My Plants` },
          { path: 'manage', loadComponent: plantManagement, title: `${baseTitle} - Manage Plants` },
          { path: ':id', loadComponent: plantDetail, title: `${baseTitle} - Plant Detail` },
          { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
