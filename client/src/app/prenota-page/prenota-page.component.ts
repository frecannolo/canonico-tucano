import { Component, OnInit } from '@angular/core';
import { UserService } from "../user.service";
import { PagesService } from "../pages.service";

@Component({
  selector: 'app-prenota-page',
  templateUrl: './prenota-page.component.html',
  styleUrls: ['./prenota-page.component.css']
})
export class PrenotaPageComponent implements OnInit {
  iconSearch: 'search' | 'close' = 'search';  // icona della ricerca dall'input della stanza
  zones: any[] = [];                          // array delle zone delle stanze
  rooms: any[] = [];                          // array delle varie stanze di prenotazione
  filter: string = '';                        // filter della ricerca

  roomName: string = '';                      // nome della stanza aperta
  roomZone: string = '';                      // zona della stanza aperta

  /*
    accedo alle istanze pubbliche di:
      - UserService per effettuare richieste GET e POST al server
      - PagesService per cambiare component alla scelta della stanza
  */
  constructor(public user: UserService, public pages: PagesService) { }

  // --- metodo dell'interfaccia OnInit che si esegue all'apertura del component
  ngOnInit(): void {
    this.pages.divInSearch = 'div-1';
    // richiedo le stanze e le catalogo in base alla loro zona
    this.user.getRooms().subscribe(res => {
      res.rooms.forEach((d: any): void => {
        let i = -1;
        this.zones.forEach((zone, index): void => {
          if(zone.name == d.zona) {
            i = index;
            zone.rooms.push(d);
          }
        });
        if(i == -1)
          this.zones.push({
            name: d.zona,
            rooms: [d]
          });

        this.rooms.push(d);
      });
    });
  }

  // --- metodo che cambia l'icona della ricerca
  changeIcon(input: HTMLInputElement): void {
      this.iconSearch = input.value.trim() != ''? 'close' : 'search';
  }

  // --- metodo che cancella l'input, cambia l'icona e azzera il filter
  cancel(input: HTMLInputElement): void {
    if (this.iconSearch == 'close') {
      input.value = '';
      this.iconSearch = 'search';
      this.filter = '';
    }
  }

  // --- metodo che apre la page della stanza
  open(name: string, zone: string): void {
    this.pages.divInSearch = 'div-2';
    this.roomName = name;
    this.roomZone = zone;
  }
}
