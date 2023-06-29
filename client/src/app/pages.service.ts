import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  readonly TEXT_BUTTONS = ['account', 'prenotazioni', 'prenota', 'notifiche', 'impostazioni'];
  readonly ICONS = ['person', 'bookmarks', 'search', 'notifications_active', 'settings'];
  readonly NAME_PAGES = ['account', 'my-bookings', 'books', 'notifications', 'settings'];

  page: string = 'books';
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
