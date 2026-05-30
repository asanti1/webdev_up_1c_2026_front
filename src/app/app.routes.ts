import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest-guard';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.Register), canActivate: [guestGuard] },
  { path: 'packages/:id', loadComponent: () => import('./pages/package-detail/package-detail').then(m => m.PackageDetail) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile/profile').then(m => m.Profile) },
  { path: 'profile/change-password', canActivate: [authGuard], loadComponent: () => import('./pages/change-password/change-password').then(m => m.ChangePassword) },
  { path: '**', redirectTo: '' },
];
