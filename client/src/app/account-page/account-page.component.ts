import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ChangeDataService } from '../changeData.service';
import { HistoryService } from '../history.service';
import { CalendarService } from '../calendar.service';
import { PagesService } from '../pages.service';

const DATA_TO_CONFIRM: string[] = ['email', 'password'];                  // const con i campi che necessitano di conferma per essere cambiati
const VALUES_TO_HIDE: string[] = ['password'];                            // const con i campi che hanno il loro valore nascosti

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css']
})
export class AccountPageComponent implements OnInit {
  data: any[] = [];                                         // array con tutti i dati cambiabili dall'utente
  startData: any;                                           // oggetto con tutti i valori iniziali dei dati dell'utente
  notImageInserted: boolean = false;                        // boolean che indica se il file inserito è un'immagine
  nPrenotazioni: number = 0;                                // number che indica il numero di prenotazioni non cancellate fatte dall'utente
  historyOpened: boolean = false;                           // boolean che indica se la sub-pagina della cronologia è aperta
  history: any[] = [];                                      // array di oggetti con tutti le azioni della cronologia
  emailCancelAccountSended: boolean = false;                // boolean che visualizza un messaggio se la mail è stata inviata

  regexes: any = {                                          // oggetto con le regex dei vari campi
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
    password: /^(=?.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!?]{8,}$/,
    username: /^[a-zA-Z0-9_]{3,}$/
  }

  /*
  accedo all'istanza pubblica di:
    - UserService per effettuare le API necessarie
    - ChangeDataService per settare una variabile
    - HistoryService per settare il numero di notifiche
    - CalendarService per utilizzare delle funzioni sulle date
    - PageService per gestire la pagina e il component home
  */
  constructor(public user: UserService, public cds: ChangeDataService, public hs: HistoryService,
              public calendar: CalendarService, public pages: PagesService) { }

  // --- metodo dell'interfaccia OnInit che si esegue all'apertura del component
  ngOnInit(): void {
    // richiedo i campi modificabili dall'utente e setto l'array data
    this.user.getData().subscribe(res => {
      this.startData = JSON.parse(JSON.stringify(res));

      for(let key in res)
        this.data.push({
          name: key,
          value: VALUES_TO_HIDE.indexOf(key) > -1? '': res[key],
          needEmail: DATA_TO_CONFIRM.includes(key),
          icon: 'edit',
          type: key == 'username' ? 'text' : key,
          regex: this.regexes[key]
        });
    });

    // richiedo gli eventi della history e setto il numero delle prenotazioni e l'array history
    this.user.getHistory().subscribe(res => {
      this.history = res.history;
      this.nPrenotazioni = this.history.filter(ev => ev.action == 1).length;
      this.set();
    });
  }

  // --- metodo che setta l'array history e gli oggetti al suo interno
  set(): void {
    this.history.forEach(ev => {
      ev.content1 = `${ev.action == 1 ? 'prenotazione' : 'cancellazione evento'} | stanza: ${ev.room}`;
      ev.content2 = this.calendar.getCompleteDateFormatted(ev.date);
      ev.iconToggle = 'event';
      ev.iconAndClass = ev.action == 1 ? 'done' : 'close';
    });
  }

  // --- metodo che cambia il testo visualizzato a click del pulsante visibile con telefono o con schermi piccoli
  toggle(ev: any): void {
    ev.iconToggle = ev.iconToggle == 'event'? 'description': 'event';
    let t = ev.content1;
    ev.content1 = ev.content2;
    ev.content2 = t;
  }

  // --- metodo che cambia l'icona e salva i nuovi parametri
  editOrSave(el: any, input: HTMLInputElement): void {
    if(el.icon == 'edit')
      this.edit(el, input);
    else {
      el.value = input.value;
      el.icon = 'edit';
    }
  }

  // --- metodo per editare i nuovi campi
  edit(el: any, input: HTMLInputElement): void {
    el.icon = 'save';
    input.focus();
  }

  // --- metodo che indica se i button sono disattivati in base a un possibile cambio di parametri
  buttonChangesDisabled(): boolean {
    for(let d of this.data) {
      if(!d.regex.test(d.value))
        return true;
    }

    for(let d of this.data)
      if(d.value != this.startData[d.name])
        return false;
    return true;
  }

  // --- metodo che setta la nuova foto profilo
  setNewPhoto(event: any): void {
    let file: File = event.target.files[0];

    // controllo che il file inserito sia un'immagine
    if(file != undefined && file.type.indexOf('image/') == 0) {
      this.notImageInserted = false;

      let formData = new FormData();
      formData.append('file', file, file.name);

      // invio la nuova foto al server e cambio l'immagine visibile della pagina e dalla navbar
      this.user.sendNewPhoto(formData).subscribe(res => {
        if(res.success) {
          let fr = new FileReader();
          fr.addEventListener('load', (evt: any) => this.user.photo = evt.target.result);
          fr.readAsDataURL(file);
        }
      });
    } else
      this.notImageInserted = true;
  }

  // --- rimuove la foto profilo presente
  removePhoto(): void {
    this.user.remPhoto().subscribe(res => {
      if(res.removed)
        this.user.photo = null
    })
  }

  // --- metodo che apre il MatDialog per inserire la password per cambiare i campi o inviare le relative email di notifica
  reqCambiaCampi(): void {
    let changed: any[] = [];
    for(let d of this.data)
      if(d.value != this.startData[d.name] && d.regex.test(d.value))
        changed.push(d);

    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        // invio la callback da fare una volta inserita la password correttamente
        next: () => {
          this.cds.setMessages(changed);
          changed.forEach(c => this.startData[c.name] = c.value);
          this.startData.username = this.user.username;
          for(let d of this.data)
            if(d.name == 'username')
              d.value = this.user.username;
        }
      }
    });
  }

  // --- metodo che effettua il reset dei campi
  reset(): void {
    this.data.forEach(d => d.value = this.startData[d.name]);
  }

  // --- metodo apre il MatDialog di conferma per cancellare la cronologia
  clearHistory(): void {
    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        next: () => {
          // invio la richiesta al server
          this.user.clearHistory().subscribe(() => {
            this.history = [];
            this.hs.notifications = 0;
            this.nPrenotazioni = 0;
          });
        }
      }
    });
  }

  // --- metodo che apre il MatDialog di conferma per inviare la mail di cancellazione dell'account
  remAccount(): void {
    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        next: () => this.user.remAccount().subscribe(() => {
          this.pages.load = true;
          this.emailCancelAccountSended = true;
          setTimeout(() => {
            this.pages.load = false;
            this.user.logout();
          }, 3200);
        })
      }
    })
  }

  /* --- metodo collegata all'evento di resize della pagina, se la pagine diventa più larga di 500px,
         allora riesegue la funzione set per non avere le scritte invertite alla visualizzazione della history --- */
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if(window.innerWidth > 500)
      this.set();
  }
}
