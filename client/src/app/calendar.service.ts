import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  selected: any = { };
  selectMore: boolean = false;
  content: string = 'calendar';
  bookOpened: any;

  isBeforeToday(day: Date, hour: string = '00:00'): boolean {
    const [h, m] = hour.split(':');
    day.setHours(parseInt(h));
    day.setMinutes(parseInt(m));

    return this.dateToIntComplete(day) < this.dateToIntComplete(new Date());
  }

  dateToInt(d: Date): number {
    return d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  timeToInt(t: string): number {
    let [h, m] = t.split(':');
    return parseInt(h) * 100 + parseInt(m);
  }

  intToDate(i: number): Date {
    let d = new Date();
    d.setFullYear(Math.floor(i / 1e4));
    let t = i % 1e4;
    d.setMonth(Math.floor(t / 100) - 1);
    d.setDate(t % 100);

    return d;
  }

  intToTime(i: number): string {
    return this.itoa(Math.floor(i / 100)) + ':' + this.itoa(i % 100);
  }

  itoa(n: number): string {
    return n < 10? '0' + n: n.toString();
  }

  dateToIntComplete(d: Date): number {
    return this.dateToInt(d) * 1e6 + d.getHours() * 1e4 + d.getMinutes() * 100 + d.getSeconds();
  }

  dateToString(d: Date): string {
    return this.itoa(d.getDate()) + '/' + this.itoa(d.getMonth() + 1) + '/' + this.itoa(d.getFullYear());
  }

  stringToDate(s: string): Date {
    let [d, m, y] = s.split('/');
    let ret = new Date();

    ret.setDate(parseInt(d));
    ret.setMonth(parseInt(m) - 1);
    ret.setFullYear(parseInt(y));

    return ret;
  }

  getDate(d: string): string {
    let [date, cong, hour] = d.split(' ');
    return this.dateToString(this.stringToDate(date)) + ' ' + cong + ' ' + this.intToTime(this.timeToInt(hour));
  }

  getCompleteDateFormatted(date: string): string {
    let [d, cong, t] = date.split(' ');
    return this.dateToString(this.stringToDate(d)) + ' ' + cong + ' ' + this.intToTime(this.timeToInt(t));
  }

  cancelAll(): void {
    for(let key in this.selected) {
      if(this.selected[key] != null) {
        this.selected[key].bgc = 'transparent';
        this.selected[key].status = 'free';
      }
      delete this.selected[key];
    }
  }
}
