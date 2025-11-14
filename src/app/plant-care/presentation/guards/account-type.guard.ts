import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../../shared/infrastructure/services/auth.service';

export const accountTypeGuard: CanActivateFn = (route) => {
  const allowed = route.data?.['accountTypes'] as string[] | undefined;
  if (!allowed || allowed.length === 0) {
    return true;
  }
  const auth = inject(AuthService);
  const router = inject(Router);
  const accountType = auth.getAccountType();
  if (accountType && allowed.includes(accountType)) {
    return true;
  }
  router.navigate([auth.getDefaultRoute()]);
  return false;
};
