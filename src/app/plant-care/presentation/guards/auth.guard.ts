import {inject} from '@angular/core';
import {CanActivateChildFn, CanActivateFn, Router, UrlTree} from '@angular/router';
import {AuthFacade} from '../../application/facades/auth.facade';

function evaluateSession(): boolean | UrlTree {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);
  if (authFacade.ensureSession()) {
    return true;
  }
  return router.createUrlTree(['/auth/login']);
}

export const authGuard: CanActivateFn = () => evaluateSession();

export const authChildGuard: CanActivateChildFn = () => evaluateSession();
