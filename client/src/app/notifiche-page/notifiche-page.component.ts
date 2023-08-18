import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { NotificationsService } from '../notifications.service';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-notifiche-page',
  templateUrl: './notifiche-page.component.html',
  styleUrls: ['./notifiche-page.component.css']
})
export class NotifichePageComponent implements OnInit {
  notifications: any[] = [];  // array con tutte le notifiche non visualizzate

  /*
    accedo alle istanze pubbliche di:
    - UserService per effettuare le chiamate GET e POST al server
    - HistoryService per accedere al numero di notifiche
    - CalendarService per effettuare metodi specifici su date
 */
  constructor(public user: UserService, public history: NotificationsService, public calendar: CalendarService) { }

  // --- metodo dell'interfaccia OnInit che si esegue all'apertura del component
  ngOnInit(): void {
    // richiedo la cronologia
    this.user.getHistory().subscribe(res => {
      this.notifications = res.history;
      this.set();
      this.history.notifications = 0;

      // setto il numero delle notifiche non ancora visualizzate
      this.notifications = this.notifications.filter(n => {
        if(!Boolean(n.visualized)) {
          this.user.segnaGiaLetto(n.id).subscribe(); // senza il subscribe non va
          return n;
        }
      });
    });
  }

  // --- metodo che setta gli attributi delle notifiche
  set(): void {
    this.notifications.forEach(not => {
      not.content1 = `${not.action == 1 ? 'prenotazione' : 'cancellazione evento'} | stanza: ${not.room}`;
      not.content2 = this.calendar.getDate(not.date);
      not.iconToggle = 'event';
      not.iconAndClass = not.action == 1 ? 'done' : 'close';
      not.visualized = Boolean(not.visualized);
    });

    this.notifications = this.notifications.reverse();  // inverto l'array per far comparire come prima notifica l'ultima
  }

  // --- metodo che effettua il toggle delle scritte in caso di display piccolo
  toggle(not: any): void {
    not.iconToggle = not.iconToggle == 'event'? 'description': 'event';
    let t = not.content1;
    not.content1 = not.content2;
    not.content2 = t;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if(window.innerWidth > 500)
      this.set();
    }
}
