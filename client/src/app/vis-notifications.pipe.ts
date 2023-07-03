import { Pipe, PipeTransform } from '@angular/core';
import {CalendarService} from "./calendar.service";

@Pipe({
  name: 'visNotifications'
})
export class VisNotificationsPipe implements PipeTransform {

  constructor(public calendar: CalendarService) { }

  transform(value: any[], filter: any): any[] {
    if(filter == null)
      return value;

    if(!filter.prenotazioni)
      value = value.filter(v => v.action == 2);
    if(!filter.cancellazioni)
      value = value.filter(v => v.action == 1);

    if(filter.active) {
      let d = new Date();
      d.setDate(d.getDate() - parseInt(filter.giorni));

      return value.filter(v => {
        if(this.calendar.dateToInt(this.calendar.stringToDate(v.date.split(' ')[0])) >= this.calendar.dateToInt(d))
          return v;
      });
    }
    return value;
  }

}
