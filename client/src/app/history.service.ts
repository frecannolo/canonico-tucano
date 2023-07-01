import {Injectable} from "@angular/core";
import {CalendarService} from "./calendar.service";

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  readonly OPTIONS: string[] = ['giorno', 'nome', 'zona'];
  verso: string = 'downward';
  value: string = this.OPTIONS[0];
  events: any[] = [];

  constructor(public calendar: CalendarService) {
  }

  sort(): void {
    let newArr: any[] = [];
    for(let v of this.events) {
      if (this.calendar.dateToInt(this.calendar.stringToDate(v.day)) >= this.calendar.dateToInt(new Date()) && v.action == 1)
        newArr.push(v);
    }

    if(this.value == 'giorno')
      for(let i = 1; i < newArr.length; i ++)
        for(let j = 0; j < i; j ++) {
          let n_i = this.calendar.dateToInt(this.calendar.stringToDate(newArr[i].day));
          let n_j = this.calendar.dateToInt(this.calendar.stringToDate(newArr[j].day))
          if(((n_i < n_j || (n_i == n_j && this.calendar.timeToInt(newArr[i].time.split(' - ')[0]) < this.calendar.timeToInt(newArr[j].time.split(' - ')[0]))) && this.verso == 'downward') ||
            ((n_i > n_j || (n_i == n_j && this.calendar.timeToInt(newArr[i].time.split(' - ')[0]) > this.calendar.timeToInt(newArr[j].time.split(' - ')[0]))) && this.verso == 'upward')) {
            let t = JSON.parse(JSON.stringify(newArr[i]));
            newArr[i] = newArr[j];
            newArr[j] = t;
          }
        }
    else {
      let key = this.value == 'nome'? 'room': 'zone';
      newArr.sort((a: any, b: any) => a[key].localeCompare(b[key], undefined, { numeric: true, sensitivity: 'base' }));
      if(this.verso === 'upward')
        newArr.reverse();
    }

    let nUp = 0; // numero di fissi già messi sopra
    for(let i = 0; i < newArr.length; i ++)
      if(newArr[i].secured == 1) {
        let t = JSON.parse(JSON.stringify(newArr[i]));
        for(let j = i - 1; j >= nUp; j --) {
          newArr[j + 1] = newArr[j];
        }
        newArr[nUp] = t;
        nUp ++;
      }

    this.events = newArr;
  }
}
