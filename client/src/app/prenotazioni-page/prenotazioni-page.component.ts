import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HistoryService} from "../history.service";
import {UserService} from "../user.service";
import {CalendarService} from "../calendar.service";
import {MatSelect} from "@angular/material/select";
import {ConfirmComponent} from "../confirm/confirm.component";
import {ChangeDataService} from "../changeData.service";

@Component({
  selector: 'app-prenotazioni-page',
  templateUrl: './prenotazioni-page.component.html',
  styleUrls: ['./prenotazioni-page.component.css']
})
export class PrenotazioniPageComponent implements OnInit {
  iconSearch: string = 'search';
  filter: string = '';
  password: string = '';

  constructor(public history: HistoryService, public user: UserService, public calendar: CalendarService, public cds: ChangeDataService) { }

  ngOnInit(): void {
    this.history.events = [{ }]; // oggetto a caso dentro per non far comparire la scritta 'Non hai ancora effettuato alcuna prenotazione'
    this.user.getHistory().subscribe(res => {
      this.history.events = res.history;
      this.history.events.forEach(e => e.opened = false);
      this.history.sort();
    });
    this.user.getData().subscribe(res => this.password = res.password);
  }

  segnaGiaLetto(el: any): void {
    if(el.visualized == 0)
      this.user.segnaGiaLetto(el.id).subscribe(res => {
        el.visualized = res.success == true;  // non posso mettere el.visualized = res.success perché res.success potrebbe essere undefined
      });
  }

  toggle(ev: any): void {
    this.segnaGiaLetto(ev);
    ev.opened = !ev.opened;
  }

  fissa(ev: any): void {
    this.user.changeSecured(ev.id, ev.secured).subscribe(res => {
      ev.secured = !ev.secured;
      this.history.sort();
    });
  }

  changeWard(): void {
    this.history.verso = this.history.verso == 'upward'? 'downward': 'upward';
    this.history.sort();
  }

  changeValue(newValue: string): void {
    if(this.history.value != newValue) {
      this.history.value = newValue;
      this.history.verso = 'downward';
      this.history.sort();
    }
  }

  delete(el: any): void {
    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        password: this.password,
        next: () => {
          this.user.removeEvent(el.id).subscribe(() => {
            let ind = this.history.events.indexOf(el);
            for(let i = ind + 1; i < this.history.events.length; i ++)
              this.history.events[i - 1] = this.history.events[i];
            this.history.events.pop();
            this.history.sort();
          });
        }
      }
    });

  }
}
