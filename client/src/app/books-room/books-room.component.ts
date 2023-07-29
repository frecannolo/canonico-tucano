import {Component, HostListener, Input, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {CalendarService} from "../calendar.service";
import {PagesService} from "../pages.service";
import {HistoryService} from "../history.service";

@Component({
  selector: 'app-books-room',
  templateUrl: './books-room.component.html',
  styleUrls: ['./books-room.component.css']
})
export class BooksRoomComponent implements OnInit {
  readonly START: string = '12:00';
  readonly FINISH: string = '21:00';
  readonly GAP: string = '1:00';
  readonly WIDTH_TO_CHANGE: number = 1000;
  readonly START_DAY_OF_THE_WEEK: number = 1;
  readonly DAYS: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  readonly DAYS_TRANSLATED: any = {
    monday: 'lunedì',
    tuesday: 'martedì',
    wednesday: 'mercoledì',
    thursday: 'giovedì',
    friday: 'venerdì',
    saturday: 'sabato',
    sunday: 'domenica'
  }

  @Input() name: string = '';
  @Input() zone: string = '';

  width: number = 1600;
  hours: string[] = [];
  startDate: Date = new Date();
  days: any[] = [];
  requests: any[] = [];
  books: any[] = [];

  constructor(public user: UserService, public calendar: CalendarService, public pages: PagesService, public history: HistoryService) {
    let start = this.START, finish = false;
    const [hg, mg] = this.GAP.split(':');
    const [HE, ME] = this.FINISH.split(':');

    while(!finish) {
      let [hs, ms] = start.split(':');

      let me = parseInt(ms) + parseInt(mg);
      let he = (parseInt(hs) + parseInt(hg) + Math.floor(me / 60)) % 24;
      me = me % 60;

      finish = he * 100 + me >= parseInt(HE) * 100 + parseInt(ME);
      let end = finish? this.FINISH: `${this.calendar.itoa(he)}:${this.calendar.itoa(me)}`;
      this.hours.push(`${start} - ${end}`);
      start = end;
    }
  }

  ngOnInit(): void {
    this.calendar.selected = { };
    this.calendar.content = 'calendar';
    this.requests = [];

    this.user.getBooks(this.name, this.zone).subscribe(res => {
      this.books = res.data;
      this.books.forEach(b => {
        let [day, cong, time] = b.date.split(' ');
        day = this.calendar.dateToString(this.calendar.stringToDate(day));
        time = this.calendar.intToTime(this.calendar.timeToInt(time));
        b.date = day + ' ' + cong + ' ' + time;
      });

      this.set();
    });
  }

  set(d: Date = new Date()): void {
    this.width = window.innerWidth;
    this.startDate = this.width > this.WIDTH_TO_CHANGE? this.getFirstDayOfWeek(d): d;
    this.setDays();
  }

  setDays(): void {
    this.days = [];
    for(let i = 0, d = new Date(this.startDate); i < (this.width > this.WIDTH_TO_CHANGE? 7: 1); i ++, d.setDate(d.getDate() + 1)) {
      let s = d.getDay() == 0? this.DAYS_TRANSLATED[this.DAYS[this.DAYS.length - 1]]: this.DAYS_TRANSLATED[this.DAYS[d.getDay() - 1]];

      this.days.push({
        day: this.calendar.dateToString(d),
        dayName: s,
        today: this.calendar.dateToString(d) == this.calendar.dateToString(new Date())
      });
    }
  }

  getFirstDayOfWeek(d: Date): Date {
    let dayOfWeek = d.getDay();
    let ret: Date = new Date(d);

    let diff = dayOfWeek >= this.START_DAY_OF_THE_WEEK? dayOfWeek - this.START_DAY_OF_THE_WEEK: 6;
    ret.setDate(ret.getDate() - diff);

    return ret;
  }

  shiftRight(): void {
    this.startDate.setDate(this.startDate.getDate() + (this.width > this.WIDTH_TO_CHANGE? 7: 1));
    this.setDays();
  }

  shiftLeft(): void {
    this.startDate.setDate(this.startDate.getDate() - (this.width > this.WIDTH_TO_CHANGE? 7: 1));
    this.setDays();
  }

  rewrite(input: HTMLInputElement): void {
    const [m, d, y] = input.value.split('/');
    input.value = d + '/' + m + '/' + y;
  }

  lengthSelected(): number {
    return Object.keys(this.calendar.selected).length;
  }

  completeBooking(): void {
    this.requests = [];

    Object.keys(this.calendar.selected).forEach(key => {
      let [day, hSt, ignore, hEn] = key.split(' '); // ignore perché va ignorato in quanto inutile per l'algoritmo
      this.requests.push({
        day: this.calendar.dateToInt(this.calendar.stringToDate(day)),
        start: this.calendar.timeToInt(hSt),
        end: this.calendar.timeToInt(hEn)
      });
    });

    for(let i = 1; i < this.requests.length; i ++)
      for(let j = 0; j < i; j ++)
        if(this.requests[i].day < this.requests[j].day || (this.requests[i].day == this.requests[j].day && this.requests[i].start < this.requests[j].start)) {
          let t = JSON.parse(JSON.stringify(this.requests[j]));
          this.requests[j] = this.requests[i];
          this.requests[i] = t;
        }

    for(let i = 1; i < this.requests.length; i ++) {
      if(this.requests[i].day == this.requests[i - 1].day && this.requests[i - 1].end == this.requests[i].start) {
        this.requests[i - 1].end = this.requests[i].end;

        for(let j = i + 1; j < this.requests.length; j ++)
          this.requests[j - 1] = JSON.parse(JSON.stringify(this.requests[j]));

        this.requests.pop();  // solo per rimuovere l'ultimo elemento
        i --;
      }
    }

    this.requests.forEach(r => {
      r.nHours = Math.floor((r.end - r.start) / this.calendar.timeToInt(this.GAP));
      r.endConfirm = false;
      r.day = this.calendar.dateToString(this.calendar.intToDate(r.day));
      r.start = this.calendar.intToTime(r.start);
      r.end = this.calendar.intToTime(r.end);
    });

    this.calendar.content = 'end-book';
  }

  remove(el: any): void {
    delete this.calendar.selected[el.day + ' ' + el.start + ' - ' + el.end];
    for(let i = this.requests.indexOf(el) + 1; i < this.requests.length; i ++)
      this.requests[i - 1] = this.requests[i];
    this.requests.pop();

    if(this.requests.length == 0)
      this.calendar.content = 'calendar';
  }

  saveBook(el: any, inp: HTMLTextAreaElement): void {
    this.user.saveBook(this.name, this.zone, el.day, el.start + ' - ' + el.end, inp.value)
      .subscribe(res => {
        if(res.success) {
          this.remove(el);
          let [d, cong, t] = res.save.date.split(' ');
          res.save.date = this.calendar.dateToString(this.calendar.stringToDate(d)) + ' ' + cong + ' ' + this.calendar.intToTime(this.calendar.timeToInt(t)); // per formattare la data
          this.books.push(res.save);

          this.history.notifications ++;
        }
      });
  }

  getBook(day: any, h: string): any {
    for(let b of this.books)
      if(b.day == day.day && this.H1_includes_H2(b.time, h))
        return b;
    return null;
  }

  H1_includes_H2(h1: string, h2: string): boolean {
    let [h1s, h1e] = h1.split(' - ');
    let [h2s, h2e] = h2.split(' - ');

    return this.calendar.timeToInt(h2s) >= this.calendar.timeToInt(h1s) && this.calendar.timeToInt(h2e) <= this.calendar.timeToInt(h1e);
  }

  @HostListener('window:resize', ['$event'])
  resize(): void {
    this.set(this.startDate);
  }
}
