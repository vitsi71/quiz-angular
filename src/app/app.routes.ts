import {Routes} from '@angular/router';
import {Layout} from './shared/layout/layout';
import {Main} from './views/main/main';
import {authForwardGuard} from './core/auth/auth-forward-guard';
import {authGuard} from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {path: '', component: Main},
      {path: '',loadChildren: () =>
          import('./views/user/user-routing-module').then(m => m.UserRoutingModule),canActivate:[authForwardGuard]},
      {path: '',loadChildren: () =>
          import('./views/test/test-routing-module').then(m => m.TestRoutingModule),canActivate:[authGuard]},
    ]
  }
];
