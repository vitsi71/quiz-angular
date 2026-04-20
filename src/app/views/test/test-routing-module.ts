import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Result} from './result/result';
import {Answers} from './answers/answers';
import {Choice} from './choice/choice';
import {Test} from './test/test';

const routes: Routes = [
  {path:'choice',component:Choice},
  {path:'test/:id',component:Test},
  {path:'result',component:Result},
  {path:'answers/:id',component:Answers},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestRoutingModule { }
