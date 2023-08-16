import {Component, HostListener} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';
import {PagesService} from '../pages.service';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {HistoryService} from '../history.service';

// questo è un component speciale, è un MatDialog (un popup), di conseguenza la seguente annotation sarà diversa e l'oggetto MenuMobileComponent non sarà presente nell'app.module.ts
@Component({
  templateUrl: './menu-mobile.component.html',
  styleUrls: ['./menu-mobile.component.css'],
  standalone: true,
  imports: [
    MatListModule,
    MatButtonModule,
    NgForOf,
    MatIconModule,
    NgIf
  ]
})
export class MenuMobileComponent {
  /*
  accedo all'istanza pubblica di:
    - UserService per effettuare le API necessarie
    - Router per cambiare la url corrente e effettuare azioni di redirect
    - HistoryService per settare il numero di notifiche
    - PageService per gestire la pagina e il component home
  */
  constructor(public pages: PagesService, public router: Router, public user: UserService, public hs: HistoryService) { }

  close(name: string): void {
    this.pages.menuDialog.close();
    this.pages.page = name;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if(window.innerWidth > 700)
      try {
        // chiudo il dialog del menu
        this.pages.menuDialog.close();
      } catch(ignored) { }
  }

  logout(): void {
    this.pages.load = true;
    this.user.logout(() => this.pages.menuDialog.close());
  }
}
