import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class ChangeDataService {
  dialog: any;
  messages: any[] = [];
  elementsToChange: any[] = [];

  constructor(public Dialog: MatDialog, public user: UserService) { }

  setMessages(): void {
    this.messages = [];

    for(let el of this.elementsToChange)
      if(el.needEmail) {
        this.user.sendEmailChangeData(el.name, el.value).subscribe(res => {
          this.messages.push({
            text: res.success? `completare il cambio di ${el.name} via email`: `errore nel cambio di ${el.name}`,
            icon: res.success? 'schedule': `error`,
            color: res.success? '#ffd740': '#f44336',
            visible: true
          });
        });
      } else {
        this.user.changeData(el.name, el.value).subscribe(() => {
          this.messages.push({
            text: `il campo ${el.name} è stato aggiornato`,
            icon: 'done',
            color: '#2ca62c',
            visible: true
          });
        });
      }
      /*this.messages.push({
        text: el.needEmail? `completare il cambio di ${el.name} via email`: `il campo ${el.name} è stato aggiornato`,
        icon: el.needEmail? 'schedule': 'done',
        color: el.needEmail? '#ffd740': '#2ca62c',
        visible: true
      });*/


  }
}
