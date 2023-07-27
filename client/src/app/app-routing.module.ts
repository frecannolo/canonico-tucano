import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FormComponent} from './form/form.component';
import {HomeComponent} from './home/home.component';

/*
  array di oggett Route, ogni oggetto può presentare una path (senza lo slash iniziale), il title (ovvero il title della pagina html),
  il component (il component da visualizzare a una determinata route) e redirectTo (specifica a quale route fare la redirect)
 */
const routes: Routes = [
  { path: '', component: FormComponent, title: 'Tucano | login' },
  { path: 'home/account', component: HomeComponent, title: 'Tucano | account' },
  { path: 'home/prenotazioni', component: HomeComponent, title: 'Tucano | prenotazioni' },
  { path: 'home/prenota', component: HomeComponent, title: 'Tucano | prenota' },
  { path: 'home/notifiche', component: HomeComponent, title: 'Tucano | notifiche' },
  { path: 'home', redirectTo: '/home/prenota' },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], // userHash: true -> mette /# davanti alle route per non avere problemi con il proxy
  exports: [RouterModule]
})
export class AppRoutingModule { }
