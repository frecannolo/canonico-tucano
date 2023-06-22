import {Component, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../confirm/confirm.component";
import {FormControl, Validators} from "@angular/forms";
import {ChangeDataService} from "../changeData.service";

const DATA_TO_CONFIRM = ['email', 'password'];
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

  regexes: any = {
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
    password: REGEX_PASSW,
    username: REGEX_USERN
  }

  constructor(public user: UserService, public cds: ChangeDataService) { }

  ngOnInit(): void {
    this.user.getData().subscribe(res => {
      this.startData = JSON.parse(JSON.stringify(res));

      this.data = [];
      for(let key in res)
        this.data.push({
          name: key,
          value: res[key],
          needEmail: DATA_TO_CONFIRM.includes(key),
          icon: 'edit',
          type: key == 'username' ? 'text' : key,
          regex: this.regexes[key]
        });
    });
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
    this.cds.elementsToChange = [];
    this.data.forEach(d => {
      if(d.value != this.startData[d.name])
        this.cds.elementsToChange.push(d);
    });

    this.cds.dialog = this.cds.Dialog.open(ConfirmComponent, {
      data: {
        password: this.startData.password
      }
    });
  }
}
