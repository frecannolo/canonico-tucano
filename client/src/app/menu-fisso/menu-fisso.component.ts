import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { PagesService } from '../pages.service';
import { HistoryService } from '../history.service';

@Component({
  selector: 'app-menu-fisso',
  templateUrl: './menu-fisso.component.html',
  styleUrls: ['./menu-fisso.component.css']
})
export class MenuFissoComponent {

  constructor(public user: UserService, public pages: PagesService, public history: HistoryService) { }

  logout(): void {
    this.pages.load = true;
    this.user.logout();
  }
}
