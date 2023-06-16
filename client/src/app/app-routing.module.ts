import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FormComponent} from "./form/form.component";

const routes: Routes = [
  { path: 'login', component: FormComponent, title: 'tucano | login' },
  { path: 'sign-up', component: FormComponent, title: 'tucano | sign up' },
  { path: '', component: FormComponent, title: 'tucano | login' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
