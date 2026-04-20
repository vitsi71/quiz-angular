import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from './auth-service';


export const authForwardGuard: CanActivateFn = (route, state) => {
  const authService: AuthService= inject(AuthService);
  const router: Router = inject(Router);
  if (authService.getLoggedIn()) {
    router.navigate(['choice']);
    return false;
  }
  return true;
};
