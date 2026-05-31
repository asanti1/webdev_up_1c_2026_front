import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest-guard';
import { authGuard } from './core/auth/auth-guard';
import { adminGuard } from './core/auth/admin-guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.Register), canActivate: [guestGuard] },
  { path: 'packages/:id', loadComponent: () => import('./pages/package-detail/package-detail').then(m => m.PackageDetail) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile/profile').then(m => m.Profile) },
  {
    path: 'profile/change-password', canActivate: [authGuard], loadComponent: () =>
      import('./pages/change-password/change-password').then(m => m.ChangePassword)
  },
  {
    path: 'admin', canActivate: [adminGuard], loadComponent: () =>
      import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
  },
  {
    path: 'admin/countries', canActivate: [adminGuard], loadComponent: () =>
      import('./pages/admin/admin-countries/admin-countries').then(m => m.AdminCountries)
  },
  {
    path: 'admin/categories', canActivate: [adminGuard], loadComponent: () =>
      import('./pages/admin/admin-categories/admin-categories').then(m => m.AdminCategories)
  },
  {
    path: 'admin/destinations', canActivate: [adminGuard], loadComponent: () =>
      import('./pages/admin/admin-destinations/admin-destinations').then(m => m.AdminDestinations)
  },
  {
    path: 'admin/packages', canActivate: [adminGuard], loadComponent: () =>
      import('./pages/admin/admin-packages/admin-packages').then(m => m.AdminPackages)
  },
  {
    path: 'admin/reservations', canActivate: [adminGuard], loadComponent: () =>
      import('./pages/admin/admin-reservations/admin-reservations').then(m => m.AdminReservations)
  },
  {
    path: 'admin/users', canActivate: [adminGuard], loadComponent: () =>
      import('./pages/admin/admin-users/admin-users').then(m => m.AdminUsers)
  },

  { path: '**', redirectTo: '' },
];
