import {Component, HostListener, OnInit} from '@angular/core';
import {UserService} from "../user.service";
import {HistoryService} from "../history.service";
import {CalendarService} from "../calendar.service";

@Component({
  selector: 'app-notifiche-page',
  templateUrl: './notifiche-page.component.html',
  styleUrls: ['./notifiche-page.component.css']
})
export class NotifichePageComponent implements OnInit {
  notifications: any[] = [];

  constructor(public user: UserService, public history: HistoryService, public calendar: CalendarService) { }

  ngOnInit(): void {
    this.user.getHistory().subscribe(res => {
      this.notifications = res.history;
      this.set();
      this.history.notifications = 0;

      this.notifications = this.notifications.filter(n => {
        if(!Boolean(n.visualized)) {
          this.user.segnaGiaLetto(n.id).subscribe(() => { }); // senza il subscribe non va
          return n;
        }
      });

      this.history.events.forEach(ev => ev.visualized = 1);
    });
  }

  set(): void {
    this.notifications.forEach(not => {
      not.content1 = `${not.action == 1 ? 'prenotazione' : 'cancellazione evento'} | stanza: ${not.room}`;
      not.content2 = this.calendar.getCompleteDateFormatted(not.date);
      not.iconToggle = 'event';
      not.iconAndClass = not.action == 1 ? 'done' : 'close';
      not.visualized = Boolean(not.visualized);
    });

    let i = this.notifications.length - 1;
    if(i > -1) {
      let n_0 = this.calendar.dateToInt(this.calendar.stringToDate(this.notifications[0].date.split(' ')[0])),
        n_i = this.calendar.dateToInt(this.calendar.stringToDate(this.notifications[i].date.split(' ')[0]))
      if (n_0 < n_i || (n_0 == n_i && this.calendar.timeToInt(this.notifications[0].date.split(' ')[2]) < this.calendar.timeToInt(this.notifications[i].date.split(' ')[2])))
        this.notifications.reverse();
    }
  }

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
