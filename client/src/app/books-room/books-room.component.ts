import {Component, HostListener, Input, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {CalendarService} from '../calendar.service';
import {PagesService} from '../pages.service';
import {NotificationsService} from '../notifications.service';

@Component({
  selector: 'app-books-room',
  templateUrl: './books-room.component.html',
  styleUrls: ['./books-room.component.css']
})
export class BooksRoomComponent implements OnInit {
  readonly START: string = '12:00';                                                                         // stringa contenente l'ora di inizio prenotazione
  readonly FINISH: string = '21:00';                                                                        // stringa contenente l'ora di fine prenotazione
  readonly GAP: string = '1:00';                                                                            // stringa contenente il gap, ovvero la durata di un evento
  readonly WIDTH_TO_CHANGE: number = 1000;                                                                  // number con la width per cambiare la dimensione del calendario
  readonly START_DAY_OF_THE_WEEK: number = 1;                                                               // number con il giorno iniziale della settimana (0 = domenica, 1 = lunedì, 2 = martedì, ...)
  readonly DAYS: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']; // string[] con tutti i giorni della settimana
  readonly DAYS_TRANSLATED: any = {                                                                         // Object con i giorni della settimana tradotti
    monday: 'lunedì',
    tuesday: 'martedì',
    wednesday: 'mercoledì',
    thursday: 'giovedì',
    friday: 'venerdì',
    saturday: 'sabato',
    sunday: 'domenica'
  }

  @Input() name: string = '';     // variabile input (settabile con la dichiarazione del tag, es <tag input=val>) con il nome della stanza
  @Input() zone: string = '';     // variabile input (settabile con la dichiarazione del tag, es <tag input=val>) con la zona della stanza

  width: number = 1600;           // width della finestra
  hours: string[] = [];           // stringa contenente le ore per la prenotazione
  startDate: Date = new Date();   // data iniziale settata al giorno attuale
  days: any[] = [];               // giorni visibile sulla tabella
  requests: any[] = [];           // array contenente tutte le richieste di prenotazione
  books: any[] = [];              // array contenente tutte le prenotazioni a quella stanza

  /*
  accedo all'istanza pubblica di:
    - UserService per effettuare le API necessarie
    - HistoryService per settare il numero di notifiche
    - CalendarService per utilizzare delle funzioni sulle date
    - PageService per settare il component da vedere in base alla url
  */
  constructor(public user: UserService, public calendar: CalendarService, public pages: PagesService, public history: NotificationsService) {
    // setto l'array hours inserendo i vari orari possibili
    let start = this.START, finish = false;

    // estraggo dalle stringhe le ore e i minuti del gap e dell'orario finale
    const [hg, mg] = this.GAP.split(':');
    const [HE, ME] = this.FINISH.split(':');

    while(!finish) {
      // estraggo le ore e i minuti dalla variabile start
      let [hs, ms] = start.split(':');

      // calcolo l'ora e il minuto della fine della prenotazione
      let me = parseInt(ms) + parseInt(mg);
      let he = (parseInt(hs) + parseInt(hg) + Math.floor(me / 60)) % 24;
      me = me % 60;

      finish = he * 100 + me >= parseInt(HE) * 100 + parseInt(ME);
      let end = finish? this.FINISH: `${this.calendar.itoa(he)}:${this.calendar.itoa(me)}`;
      // inserisco l'orario e assegno start = end
      this.hours.push(`${start} - ${end}`);
      start = end;
    }
  }

  // --- metodo dell'interfaccia OnInit che si esegue all'apertura del component
  ngOnInit(): void {
    // setto le variabili pubbliche e gli array
    this.calendar.selected = { };
    this.calendar.content = 'calendar';
    this.books = [];
    this.requests = [];

    // richiedo le prenotazioni della specifica stanza
    this.user.getBooks(this.name, this.zone).subscribe(res => {
      this.books = res.data;
      this.books.forEach(b => {
        // estraggo la data e l'ora per poterle riformattare
        let [day, cong, time] = b.date.split(' ');
        day = this.calendar.dateToString(this.calendar.stringToDate(day));
        time = this.calendar.intToTime(this.calendar.timeToInt(time));
        b.date = day + ' ' + cong + ' ' + time;
      });

      this.set();
    });
  }

  // --- metodo per settare le giornate visibili in base alla width del display
  set(d: Date = new Date()): void {
    this.width = window.innerWidth;
    this.startDate = this.width > this.WIDTH_TO_CHANGE? this.getFirstDayOfWeek(d): d;
    this.setDays();
  }

  // --- metodo che setta le giornate visibili sulla tabella
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

  // --- metodo che, data una data, ritorna il primo giorno della settimana
  getFirstDayOfWeek(d: Date): Date {
    let dayOfWeek = d.getDay();
    let ret: Date = new Date(d);

    let diff = dayOfWeek >= this.START_DAY_OF_THE_WEEK? dayOfWeek - this.START_DAY_OF_THE_WEEK: 6;
    ret.setDate(ret.getDate() - diff);

    return ret;
  }

  // --- metodo che cambia le giornate visibili sulla tabella quando si va avanti di un giorno / una settimana
  shiftRight(): void {
    this.startDate.setDate(this.startDate.getDate() + (this.width > this.WIDTH_TO_CHANGE? 7: 1));
    this.setDays();
  }

  // --- metodo che cambia le giornate visibili sulla tabella quando si va indietro di un giorno / una settimana
  shiftLeft(): void {
    this.startDate.setDate(this.startDate.getDate() - (this.width > this.WIDTH_TO_CHANGE? 7: 1));
    this.setDays();
  }

  // --- metodo che scrive la data sull'input mettendo nel corretto ordine giorno, mese e anno
  rewrite(input: HTMLInputElement): void {
    const [m, d, y] = input.value.split('/');
    input.value = d + '/' + m + '/' + y;
  }

  // --- metodo che ritorna la lunghezza (il numero di chiavi) dell'oggetto this.calendar.selected
  lengthSelected(): number {
    return Object.keys(this.calendar.selected).length;
  }

  // --- metodo che setta l'array requests al fine di completare il booking
  completeBooking(): void {
    this.requests = [];

    Object.keys(this.calendar.selected).forEach(key => {
      let [day, hSt, , hEn] = key.split(' '); // ignore perché va ignorato in quanto inutile per l'algoritmo
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

  // --- metodo che rimuove una possibile prenotazione dalla sub page della conferma prenotazioni
  remove(el: any): void {
    const [hg, mg] = this.GAP.split(':');
    let start = el.start, n = 0;

    // cerco tutte le key di calendar.selected relative alla prenotazione
    do {
      let [hs, ms] = start.split(':');

      let me = parseInt(ms) + parseInt(mg);
      let he = (parseInt(hs) + parseInt(hg) + Math.floor(me / 60)) % 24;
      me = me % 60;

      let end = `${this.calendar.itoa(he)}:${this.calendar.itoa(me)}`;
      if(end == el.end)
        n = 1;

      // rimuovo le ore da calendar.selected
      delete this.calendar.selected[el.day + ' ' + start + ' - ' + end];
      start = end;
    } while(n < 1);

    for(let i = this.requests.indexOf(el) + 1; i < this.requests.length; i ++)
      this.requests[i - 1] = this.requests[i];
    this.requests.pop();

    if(this.requests.length == 0)
      this.calendar.content = 'calendar';
  }

  // --- metodo per salvare una prenotazione nel database
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

  // --- ritorna una prenotazione specifica data e orario o null se non esiste
  getBook(day: any, h: string): any {
    for(let b of this.books)
      if(b.day == day.day && this.H1_includes_H2(b.time, h))
        return b;
    return null;
  }

  // --- metodo che india se un orario H2 è incluso nell'orario H1
  H1_includes_H2(h1: string, h2: string): boolean {
    let [h1s, h1e] = h1.split(' - ');
    let [h2s, h2e] = h2.split(' - ');

    return this.calendar.timeToInt(h2s) >= this.calendar.timeToInt(h1s) && this.calendar.timeToInt(h2e) <= this.calendar.timeToInt(h1e);
  }

  // --- funzione collegata all'evento di resize della pagina
  @HostListener('window:resize', ['$event'])
  resize(): void {
    this.set(this.startDate);
  }
}
