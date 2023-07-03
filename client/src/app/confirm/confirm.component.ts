import {Component, Inject, OnInit} from '@angular/core';
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {ChangeDataService} from "../changeData.service";
import {UserService} from "../user.service";

@Component({
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
  standalone: true,
  imports: [
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    NgIf,
    MatProgressBarModule,
  ]
})
export class ConfirmComponent implements OnInit {
  passwordHided: boolean = true;
  error: boolean = false;
  load: boolean = false;
  password: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public cds: ChangeDataService, public user: UserService) { }

  ngOnInit(): void {
    this.user.getData().subscribe(res => this.password = res.password);
  }

  confirm(val: string): void {
    this.load = true;
    this.error = false;

    setTimeout((): void => {
      if(this.password != val)
        this.error = true;
      else {
        this.data.next();
        this.cds.dialog.close();
      }

      this.load = false;
    }, 1000);
  }
}
