import { Injectable } from '@angular/core';

// questo è un service, i component li utilizzano per comunicare tra loro perché accedono a essi tramite un'istanza pubblica
@Injectable({
  providedIn: 'root'
})
export class PagesService {
  readonly TEXT_BUTTONS = ['account', 'prenotazioni', 'prenota', 'notifiche'];  // array con il testo dei buttons del menu
  readonly ROUTES = ['account', 'prenotazioni', 'prenota', 'notifiche'];        // array con le route delle pages in base al bottone cliccato
  readonly ICONS = ['person', 'bookmarks', 'search', 'notifications_active'];   // array con le icone dei buttons
  readonly NAME_PAGES = ['account', 'my-bookings', 'books', 'notifications'];   // array con il nome delle pagine

  page: string = '';                          // stringa con il nome della pagina visibile
  menuDialog: any = null;                     // assume il valore di MenuMobileComponent all'apertura del menu da smartphone
  load: boolean = false;                      // boolean che gestisce la barra di load ai piedi della pagina
  divInSearch: 'div-1' | 'div-2' = 'div-1';   // stringa che dice quale div è visibile alla ricerca (div-1 -> ricerca, div-2 -> calendario o info sulle prenotazioni o fine prenotazioni)

  // --- metodo che ritorna un array di oggetti con tutte le informazioni su ogni bottone
  getButtons(): any[] {
    let ret: any[] = [];

    for(let i = 0; i < this.TEXT_BUTTONS.length; i ++)
      ret.push({
        text: this.TEXT_BUTTONS[i],
        icon: this.ICONS[i],
        page: this.NAME_PAGES[i]
      });

    return ret;
  }

  // --- metodo che setta una nuova pagina
  setPage(route: any): void {
    this.page = this.NAME_PAGES[this.ROUTES.indexOf(route)];
  }
}
