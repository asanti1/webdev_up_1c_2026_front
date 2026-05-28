import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest-guard';


/*   {
    path: '',
    loadComponent: () =>
      import('./pages/home/home')
        .then(m => m.Home),
  }, */
/*   {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/profile')
        .then(m => m.Profile),
  }, */

/*   {
    path: 'reservations',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/reservations/reservations')
        .then(m => m.Reservations),
  },

  {
    path: '**',
    redirectTo: '',
  }, */

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.Register), canActivate: [guestGuard] },
  { path: '**', redirectTo: '' },
  //{ path: 'packages/:id', loadComponent: () => import('./pages/package-detail/package-detail').then(m => m.PackageDetail) }
];
