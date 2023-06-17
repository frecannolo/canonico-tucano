import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FormComponent} from "./form/form.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  { path: '', component: FormComponent, title: 'tucano | login' },
  { path: 'home', component: HomeComponent, title: 'tucano | home' },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
