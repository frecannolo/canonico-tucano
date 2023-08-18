import { Injectable } from '@angular/core';


// questo è un service, i component li utilizzano per comunicare tra loro perché accedono a essi tramite un'istanza pubblica
@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  selected: any = { };                                          // Object che ha per chiavi tutti gli orari del calendario selezionati
  selectMore: boolean = false;                                  // boolean che indica se l'opzione "select more" della scelta degli orari durante la prenotazione è attivata
  content: 'calendar' | 'end-book' | 'info-book' = 'calendar';  // stringa che indica la sub-page della prenotazione aperta
  bookOpened: any;                                              // oggetto = alla prenotazione aperta, coincide con content = 'info-book'

  // --- metodo che codifica un oggetto Date in un intero yyyyMMdd
  dateToInt(d: Date): number {
    return d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  // --- metodo che codifica un stringa hh:mm in ub intero hhmm
  timeToInt(t: string): number {
    let [h, m] = t.split(':');
    return parseInt(h) * 100 + parseInt(m);
  }

  // --- metodo che codifica un intero yyyyMMdd in un oggetto Date
  intToDate(i: number): Date {
    let d = new Date();
    d.setFullYear(Math.floor(i / 1e4));
    let t = i % 1e4;
    d.setMonth(Math.floor(t / 100) - 1);
    d.setDate(t % 100);

    return d;
  }

  // --- metodo che codifica un intero hhmm in una stringa hh:mm
  intToTime(i: number): string {
    return this.itoa(Math.floor(i / 100)) + ':' + this.itoa(i % 100);
  }

  // --- metodo che aggiunge uno zero al numero se < 10
  itoa(n: number): string {
    return n < 10? '0' + n: n.toString();
  }

  // --- metodo che codifica un oggetto Date in una stringa dd/MM/yyyy
  dateToString(d: Date): string {
    return this.itoa(d.getDate()) + '/' + this.itoa(d.getMonth() + 1) + '/' + this.itoa(d.getFullYear());
  }

  // --- metodo che codifica una stringa dd/MM/yyyy in un oggetto Date
  stringToDate(s: string): Date {
    let [d, m, y] = s.split('/');
    let ret = new Date();

    ret.setDate(parseInt(d));
    ret.setMonth(parseInt(m) - 1);
    ret.setFullYear(parseInt(y));

    return ret;
  }

  // --- metodo che formatta un orario stringato `dd/MM/yyyy ${congiunzione} hh:mm`
  getDate(d: string): string {
    let [date, cong, hour] = d.split(' ');
    return this.dateToString(this.stringToDate(date)) + ' ' + cong + ' ' + this.intToTime(this.timeToInt(hour));
  }

  // --- metodo che cancella tutte le caselle del calendario selezionate e svuota l'Object selected
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
