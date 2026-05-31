import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from './auth-state';

export const adminGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  const user = authState.user();

  if (user?.role === 'ADMIN') {
    return true;
  }

  router.navigateByUrl('/');
  return false;
};
