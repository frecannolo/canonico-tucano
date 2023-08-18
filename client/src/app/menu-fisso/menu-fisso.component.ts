import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { PagesService } from '../pages.service';
import { NotificationsService } from '../notifications.service';

@Component({
  selector: 'app-menu-fisso',
  templateUrl: './menu-fisso.component.html',
  styleUrls: ['./menu-fisso.component.css']
})
export class MenuFissoComponent {

  /*
  accedo all'istanza pubblica di:
    - UserService per effettuare le API necessarie
    - HistoryService per settare il numero di notifiche
    - PageService per gestire la pagina e il component home
  */
  constructor(public user: UserService, public pages: PagesService, public history: NotificationsService) { }

  logout(): void {
    this.pages.load = true;
    this.user.logout();
  }
}
