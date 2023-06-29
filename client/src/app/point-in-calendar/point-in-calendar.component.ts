import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CalendarService} from "../calendar.service";
import {UserService} from "../user.service";
import {PagesService} from "../pages.service";

@Component({
  selector: 'app-point-in-calendar',
  templateUrl: './point-in-calendar.component.html',
  styleUrls: ['./point-in-calendar.component.css']
})
export class PointInCalendarComponent implements OnInit, OnDestroy {
  @Input() hour: string = '';
  @Input() date: Date = new Date();
  @Input() book: any = null;

  bgc: string = 'transparent';
  status: string = 'free';
  strSelected: string = '';

  constructor(public calendar: CalendarService, public user: UserService, public pages: PagesService) { }

  ngOnInit(): void {
    if(this.book != null) {
      this.bgc = '#f44336';
      this.status = 'booked';
    } else if(this.calendar.isBeforeToday(this.date, this.hour)) {
      this.bgc = '#aeaeae';
      this.status = 'passed';
    }

    this.strSelected = this.calendar.dateToString(this.date) + ' ' + this.hour;
    if(this.calendar.selected[this.strSelected] === null) //--- === obbligatorio perché undefined == null
      this.select(null);
  }

  selectOrOpen(event: MouseEvent | null): void {
    if(this.status == 'booked')
      this.open();
    else
      this.select(event);
  }

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

  select(event: MouseEvent | null): void {
    if(event != null && !event.ctrlKey && !this.calendar.selectMore)
      this.calendar.cancelAll();

    if(this.status == 'free') {
      this.status = 'selected';
      this.bgc = '#ffd740';
      this.calendar.selected[this.strSelected] = this;
    } else if(event?.ctrlKey || this.calendar.selectMore) {
      this.status = 'free';
      this.bgc = 'transparent';
      delete this.calendar.selected[this.strSelected];
    }
  }

  ngOnDestroy(): void {
    if(this.status == 'selected')
      this.calendar.selected[this.strSelected] = null;
  }
}
