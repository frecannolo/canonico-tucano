import {Injectable} from "@angular/core";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  readonly TEXT_BUTTONS = ['account', 'prenotazioni', 'prenota', 'notifiche'];
  readonly ROUTES = ['account', 'prenotazioni', 'prenota', 'notifiche'];
  readonly ICONS = ['person', 'bookmarks', 'search', 'notifications_active'];
  readonly NAME_PAGES = ['account', 'my-bookings', 'books', 'notifications'];

  page: string = '';
  menuDialog: any = null;
  load: boolean = false;
  divInSearch: string = 'div-1';

  constructor(public router: Router) { }

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

  setPage(route: any): void {
    this.page = this.NAME_PAGES[this.ROUTES.indexOf(route)];
  }
}
