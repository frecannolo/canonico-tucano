import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormComponent } from './form/form.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MenuFissoComponent } from './menu-fisso/menu-fisso.component';
import { AccountPageComponent } from './account-page/account-page.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrenotaPageComponent } from './prenota-page/prenota-page.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { SearchRoomPipe } from './search-room.pipe';
import { VisRoomPipe } from './vis-room.pipe';
import { BooksRoomComponent } from './books-room/books-room.component';
import { PointInCalendarComponent } from './point-in-calendar/point-in-calendar.component';
import {MatCheckboxModule } from '@angular/material/checkbox';
import { PrenotazioniPageComponent } from './prenotazioni-page/prenotazioni-page.component';
import { MiePrenotazioniPipe } from './mie-prenotazioni.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { NotifichePageComponent } from './notifiche-page/notifiche-page.component';
import { VisNotificationsPipe } from './vis-notifications.pipe';

@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    HomeComponent,
    NavbarComponent,
    MenuFissoComponent,
    AccountPageComponent,
    PrenotaPageComponent,
    SearchRoomPipe,
    VisRoomPipe,
    BooksRoomComponent,
    PointInCalendarComponent,
    PrenotazioniPageComponent,
    MiePrenotazioniPipe,
    NotifichePageComponent,
    VisNotificationsPipe
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule, // module necessario per usare HttpClient per effettuare le richieste http
        MatCardModule,
        MatListModule,
        FormsModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatProgressBarModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatMenuModule,
        CdkAccordionModule,
        MatTooltipModule,
        MatExpansionModule,
        MatChipsModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatTabsModule,
        MatCheckboxModule,
        MatBadgeModule,
        MatSelectModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
