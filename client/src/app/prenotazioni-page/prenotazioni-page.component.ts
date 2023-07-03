import {Component, OnInit} from '@angular/core';
import {HistoryService} from "../history.service";
import {UserService} from "../user.service";
import {CalendarService} from "../calendar.service";
import {ConfirmComponent} from "../confirm/confirm.component";
import {ChangeDataService} from "../changeData.service";

@Component({
  selector: 'app-prenotazioni-page',
  templateUrl: './prenotazioni-page.component.html',
  styleUrls: ['./prenotazioni-page.component.css']
})
export class PrenotazioniPageComponent implements OnInit {
  readonly OPTIONS: string[] = ['giorno', 'nome', 'zona'];
  verso: string = 'downward';
  value: string = this.OPTIONS[0];
  iconSearch: string = 'search';
  filter: string = '';

  history: any[] = [];

  constructor(public hs: HistoryService, public user: UserService, public calendar: CalendarService, public cds: ChangeDataService) { }

  ngOnInit(): void {
    this.history = this.hs.events;
    this.sort();
  }

  sort(): void {
    let newArr: any[] = [];
    for(let v of this.history) {
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

    this.history = newArr;
  }

  segnaGiaLetto(el: any): void {
    if(el.visualized == 0)
      this.user.segnaGiaLetto(el.id, el.room, el.zone, el.day, el.time).subscribe(res => {
        if(res.success) {
          el.visualized = true;
          this.hs.notifications --;
        }
      });
  }

  toggle(ev: any): void {
    this.segnaGiaLetto(ev);
    ev.opened = !ev.opened;
  }

  fissa(el: any): void {
    this.user.changeSecured(el.id, el.secured, el.room, el.zone, el.day, el.time).subscribe(() => {
      el.secured = !el.secured;
      this.sort();
    });
  }

  changeWard(): void {
    this.verso = this.verso == 'upward'? 'downward': 'upward';
    this.sort();
  }

  changeValue(newValue: string): void {
    if(this.value != newValue) {
      this.value = newValue;
      this.verso = 'downward';
      this.sort();
    }
  }

  delete(el: any): void {
    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        next: () => {
          this.user.removeEvent(el.id, el.room, el.zone, el.day, el.time).subscribe(() => {
            let ind = this.history.indexOf(el);
            for(let i = ind + 1; i < this.history.length; i ++)
              this.history[i - 1] = this.history[i];
            this.history.pop();
            this.sort();

            this.hs.notifications ++; // notifica cancellazione evento
            if(!el.visualized)
              this.hs.notifications --;
          });
        }
      }
    });

  }
}
