import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Signup} from './signup/signup';
import {Login} from './login/login';

const routes: Routes = [
  {path:'signup',component:Signup},
  {path:'login',component:Login},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
