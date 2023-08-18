import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CalendarService } from '../calendar.service';
import { UserService } from '../user.service';
import { PagesService } from '../pages.service';

@Component({
  selector: 'app-point-in-calendar',
  templateUrl: './point-in-calendar.component.html',
  styleUrls: ['./point-in-calendar.component.css']
})
export class PointInCalendarComponent implements OnInit, OnDestroy {
  @Input() hour: string = '';                                                 // variabile input (settabile con la dichiarazione del tag, es <tag input=val>) con l'orario di prenotazione
  @Input() date: Date = new Date();                                           // variabile input (settabile con la dichiarazione del tag, es <tag input=val>) con la data di prenotazione
  @Input() book: any = null;                                                  // variabile input (settabile con la dichiarazione del tag, es <tag input=val>) con la prenotazione (null se non è prenotato)

  bcg: 'transparent' | '#f44336' | '#aeaeae' | '#ffd740' = 'transparent';     // colore del background del punto (transparent, #f44336, #aeaeae, #ffd740)
  status: 'free' | 'booked' | 'passed' | 'selected' = 'free';                 // status dell'ora (free = libero, booked = già prenotato, passed = già superato ma non prenotato, selected = selezionato dall'utente)
  strSelected: string = '';                                                   // stringa key in calendar.selected

  constructor(public calendar: CalendarService, public user: UserService, public pages: PagesService) { }

  // --- metodo dell'interfaccia OnInit che si esegue all'apertura del component
  ngOnInit(): void {
    // assegno bcg e status in base a book
    if(this.book != null) {
      this.bcg = '#f44336';
      this.status = 'booked';
    } else if(this.date <= new Date()) {
      this.bcg = '#aeaeae';
      this.status = 'passed';
    }

    this.strSelected = this.calendar.dateToString(this.date) + ' ' + this.hour;
    if(this.calendar.selected[this.strSelected] === null) // --- === obbligatorio perché undefined == null
      this.select(null);
  }

  // --- metodo che apre la sub-page della prenotazione o seleziona il punto
  selectOrOpen(event: MouseEvent | null): void {
    if(this.status == 'booked')
      this.open();
    else
      this.select(event);
  }

  // --- metodo che apre la subpage e chiede l'username di chi ha effettuato la prenotazione
  open(): void {
    this.pages.load = true;
    this.user.getUsernameById(this.book.user).subscribe(res => {
      this.book.user = res.user;
      setTimeout(() => {
        this.pages.load = false;
        this.calendar.bookOpened = this.book;
        this.calendar.content = 'info-book';
      }, 500);
    });
  }

  // --- metodo che seleziona il punto controllando l'evento mouse per sapere se è anche premuto il tasto ctrl
  select(event: MouseEvent | null): void {
    if(event != null && !event.ctrlKey && !this.calendar.selectMore)
      this.calendar.cancelAll();

    // cambio lo status e il bcg
    if(this.status == 'free') {
      this.status = 'selected';
      this.bcg = '#ffd740';
      this.calendar.selected[this.strSelected] = this;
    } else if(event?.ctrlKey || this.calendar.selectMore) {
      this.status = 'free';
      this.bcg = 'transparent';
      delete this.calendar.selected[this.strSelected];
    }
  }

  // --- metodo dell'interfaccia OnDestroy che si esegue alla chiusura del component
  ngOnDestroy(): void {
    if(this.status == 'selected')
      this.calendar.selected[this.strSelected] = null;
  }
}
