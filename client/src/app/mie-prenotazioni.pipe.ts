import { Pipe, PipeTransform } from '@angular/core';
import {CalendarService} from './calendar.service';

@Pipe({
  name: 'miePrenotazioni'
})
export class MiePrenotazioniPipe implements PipeTransform {

  constructor(public calendar: CalendarService) {
  }

  transform(values: any[], filter: string): any[] {
    if(filter == null || filter == '')
      return values;

    let toRet: any[] = [];
    for(let v of values)
      if(v.room.includes(filter) ||
        v.zone.includes(filter) ||
        v.day.includes(filter) ||
        v.time.split(' ').join('').includes(filter.split(' ').join('')))
        toRet.push(v);

    return toRet;
  }
}
