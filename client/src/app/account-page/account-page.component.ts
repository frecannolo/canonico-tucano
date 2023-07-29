import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { ConfirmComponent } from "../confirm/confirm.component";
import { ChangeDataService } from "../changeData.service";
import { HistoryService } from "../history.service";
import { CalendarService } from "../calendar.service";
import { PagesService } from "../pages.service";

const DATA_TO_CONFIRM = ['email', 'password'];
const VALUES_TO_HIDE = ['password'];
const REGEX_PASSW: RegExp = /^(=?.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!?]{8,}$/;
const REGEX_USERN: RegExp = /^[a-zA-Z0-9_]{3,}$/;

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css']
})
export class AccountPageComponent implements OnInit {
  data: any[] = [];
  startData: any;
  notImageInserted: boolean = false;
  nPrenotazioni: number = 0;
  historyOpened: boolean = false;
  history: any[] = [];

  regexes: any = {
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
    password: REGEX_PASSW,
    username: REGEX_USERN
  }

  constructor(public user: UserService, public cds: ChangeDataService, public hs: HistoryService, public calendar: CalendarService, public pages: PagesService) { }

  ngOnInit(): void {
    this.user.getData().subscribe(res => {
      this.startData = JSON.parse(JSON.stringify(res));

      this.data = [];
      for(let key in res)
        this.data.push({
          name: key,
          value: VALUES_TO_HIDE.indexOf(key) > -1? '': res[key],
          needEmail: DATA_TO_CONFIRM.includes(key),
          icon: 'edit',
          type: key == 'username' ? 'text' : key,
          regex: this.regexes[key]
        });
    });

    this.user.getHistory().subscribe(res => {
      this.history = res.history;
      this.nPrenotazioni = this.history.filter(ev => ev.action == 1).length;
      this.set();
    });
  }

  set(): void {
    this.history.forEach(ev => {
      ev.content1 = `${ev.action == 1 ? 'prenotazione' : 'cancellazione evento'} | stanza: ${ev.room}`;
      ev.content2 = this.calendar.getCompleteDateFormatted(ev.date);
      ev.iconToggle = 'event';
      ev.iconAndClass = ev.action == 1 ? 'done' : 'close';
    });
  }

  toggle(ev: any): void {
    ev.iconToggle = ev.iconToggle == 'event'? 'description': 'event';
    let t = ev.content1;
    ev.content1 = ev.content2;
    ev.content2 = t;
  }

  editOrSave(el: any, input: HTMLInputElement): void {
    if(el.icon == 'edit')
      this.edit(el, input);
    else {
      el.value = input.value;
      el.icon = 'edit';
    }
  }

  edit(el: any, input: HTMLInputElement): void {
    el.icon = 'save';
    input.focus();
  }

  buttonChangesDisabled(): boolean {
    for(let d of this.data) {
      if(!d.regex.test(d.value))
        return true;
    }

    for(let d of this.data)
      if(d.value != this.startData[d.name])
        return false;
    return true;
  }

  setNewPhoto(event: any): void {
    let file: File = event.target.files[0];

    if(file != undefined && file.type.indexOf('image/') == 0) {
      this.notImageInserted = false;

      let formData = new FormData();
      formData.append('file', file, file.name);

      this.user.sendNewPhoto(formData).subscribe(res => {
        if(res.success) {
          let fr = new FileReader();
          fr.addEventListener('load', (evt: any) => this.user.photo = evt.target.result);
          fr.readAsDataURL(file);
        }
      });
    } else
      this.notImageInserted = true;
  }

  removePhoto(): void {
    this.user.remPhoto().subscribe(res => {
      if(res.removed)
        this.user.photo = null
    })
  }

  open(): void {
    let changed: any[] = [];
    for(let d of this.data)
      if(d.value != this.startData[d.name] && d.regex.test(d.value))
        changed.push(d);

    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        next: () => {
          this.cds.setMessages(changed);
          changed.forEach(c => this.startData[c.name] = c.value);
          this.startData.username = this.user.username;
          for(let d of this.data)
            if(d.name == 'username')
              d.value = this.user.username;
        }
      }
    });
  }

  reset(): void {
    this.data.forEach(d => d.value = this.startData[d.name]);
  }

  clearHistory(): void {
    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        next: () => {
          this.user.clearHistory().subscribe(() => {
            this.history = [];
            this.hs.notifications = 0;
            this.nPrenotazioni = 0;
          });
        }
      }
    });
  }

  remAccount(): void {
    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        next: () => this.user.remAccount().subscribe(() => {
          this.pages.load = true;
          setTimeout(() => {
            this.pages.load = false;
            this.user.logout();
          }, 1500);
        })
      }
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if(window.innerWidth > 500)
      this.set();
  }
}
