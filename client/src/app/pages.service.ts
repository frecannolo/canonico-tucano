import {HostListener, Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  readonly TEXT_BUTTONS = ['account', 'prenotazioni', 'prenota', 'notifiche', 'impostazioni'];
  readonly ICONS = ['person', 'bookmarks', 'search', 'notifications_active', 'settings'];
  readonly NAME_PAGES = ['account', 'my-bookings', 'books', 'notifications', 'settings'];
  readonly START_PAGE = this.NAME_PAGES[2];

  page: string = this.START_PAGE;
  menuDialog: any = null;
  load: boolean = false;
  divInSearch: string = 'div-1';

  constructor() { }

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
}
