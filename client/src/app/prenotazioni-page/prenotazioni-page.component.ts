import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../notifications.service';
import { UserService } from '../user.service';
import { CalendarService } from '../calendar.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ChangeDataService } from '../changeData.service';
import { SetOraNotificaComponent } from '../set-ora-notifica/set-ora-notifica.component';

@Component({
  selector: 'app-prenotazioni-page',
  templateUrl: './prenotazioni-page.component.html',
  styleUrls: ['./prenotazioni-page.component.css']
})
export class PrenotazioniPageComponent implements OnInit {
  readonly OPTIONS: string[] = ['giorno', 'nome', 'zona'];    // array con l'elenco di tutte le opzioni per cui è possibile orinare le prenotazioni
  verso: 'downward' | 'upward' = 'downward';                  // stringa con il verso della freccia di ordinamento (verso l'alto o il basso)
  sortFor: string = this.OPTIONS[0];                          // opzione per ordinare le prenotazioni
  filter: string = '';                                        // stringa del filter della ricerca per nome

  history: any[] = [];                                        // array con tutti le prenotazioni non ancora passate

  /*
    accedo alle istanze pubbliche di:
      - HistoryService per accedere al numero di notifiche
      - UserService per effettuare richieste GET e POST al server
      - CalendarService per utilizzare le funzioni sulle date
      - ChangeDateService per accedere all'oggetto dialog
  */
  constructor(public hs: NotificationsService, public user: UserService, public calendar: CalendarService, public cds: ChangeDataService) { }

  // --- metodo dell'interfaccia OnInit che si esegue all'apertura del component
  ngOnInit(): void {
    this.user.getHistory().subscribe(res => {
      this.history = res.history;
      this.history.filter(event => event.action == 2).forEach(event => {
        //rimuovo tutti gli eventi che sono già stati cancellati
        for(let i = 0; i < this.history.length; i ++)
          if(event.idHistory == this.history[i].id) {
            for(let j = i + 1; j < this.history.length; j++)
              this.history[j - 1] = this.history[j];
            this.history.pop();
          }
      });
      // tengo solo le prenotazioni e le riordino per data mantengo solo quelle non ancora passate
      this.history = this.history.filter(event => event.action == 1);
      this.set();
    });
  }

  // --- metodo che setta e prepara l'array delle prenotazioni in base a sortFor
  set(): void {
    let newArr: any[] = [];
    for(let v of this.history) {
      if (this.calendar.stringToDate(v.day) >= new Date())
        newArr.push(v);
    }

    if(this.sortFor == 'giorno')
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
      let key = this.sortFor == 'nome'? 'room': 'zone';
      // riordino l'array in base al nome o alla zona della stanza
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

  // --- metodo che segna come già letto la prenotazione el
  segnaGiaLetto(el: any): void {
    if(el.visualized == 0)
      this.user.segnaGiaLetto(el.id).subscribe(res => {
        if(res.success) {
          el.visualized = true;
          this.hs.notifications --;
        }
      });
  }

  // --- metodo che apre la prenotazione e la segna come letta
  toggle(ev: any): void {
    this.segnaGiaLetto(ev);
    ev.opened = !ev.opened;
  }

  // --- metodo che fissa la prenotazione el
  fissa(el: any): void {
    this.user.changeSecured(el.id, el.secured).subscribe(() => {
      el.secured = !el.secured;
      this.set();
    });
  }

  // --- metodo che cambia la freccia e setta nuovamente l'array di prenotazioni
  changeWard(): void {
    this.verso = this.verso == 'upward'? 'downward': 'upward';
    this.set();
  }

  // --- metodo eseguito al cambio di sortFor
  changeSortFor(newValue: string): void {
    if(this.sortFor != newValue) {
      this.sortFor = newValue;
      this.verso = 'downward';
      this.set();
    }
  }

  // --- metodo che elimina la prenotazione el del db e dall'array history
  delete(el: any): void {
    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        next: () => {
          this.user.removeEvent(el.id, el.room, el.zone, el.day, el.time).subscribe(() => {
            let ind = this.history.indexOf(el);
            for(let i = ind + 1; i < this.history.length; i ++)
              this.history[i - 1] = this.history[i];
            this.history.pop();
            this.set();

            this.hs.notifications ++; // notifica cancellazione evento
          });
        }
      }
    });

  }

  // --- metodo che apre il dialog per settare l'anticipo della notifica
  open(ev: any): void {
    this.cds.dialog = this.cds.Dialog.open(SetOraNotificaComponent, {
      width: '500px',
      maxWidth: '95%',
      data: {
        pren: ev
      }
    });
  }

  // --- metodo che ritorna la stringa dell'anticipo
  getTimeEmail(s: string): string {
    let [d, h, m] = s.split(' ');
    return `${parseInt(d) == 0? '': parseInt(d) == 1? '1 giorno ': d + ' giorni '}${parseInt(h) == 0? '': parseInt(h) == 1? '1 ora ': h + ' ore '}${parseInt(m) == 0? '': parseInt(m) == 1? '1 minuto': m + ' minuti'}`;
  }
}
