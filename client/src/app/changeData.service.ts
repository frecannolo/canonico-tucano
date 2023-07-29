import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class ChangeDataService {
  dialog: any;
  messages: any[] = [];

  constructor(public Dialog: MatDialog, public user: UserService) { }

  setMessages(data: any[]): void {
    this.messages = [];

    for(let el of data) {
      if (el.needEmail) {
        this.user.sendEmailChangeData(el.name, el.value).subscribe(res => {
          this.messages.push({
            text: res.success ? `completare il cambio di ${el.name} via email` : `errore nel cambio di ${el.name}`,
            icon: res.success ? 'schedule' : `error`,
            color: res.success ? '#ffd740' : '#f44336',
            visible: true
          });
        });
      } else {
        this.user.changeData(el.name, el.value).subscribe(res => {
          this.messages.push({
            text: res.success? `il campo ${el.name} è stato aggiornato`: `non è stato possibile aggiornare il campo ${el.name}`,
            icon: res.success? 'done': 'error',
            color: res.success? '#2ca62c': '#f44336',
            visible: true
          });

          if(el.name == 'username' && res.success)
            this.user.username = el.value;
        });
      }
    }
  }
}
