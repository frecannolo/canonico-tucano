import {Component, HostListener} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { NgForOf } from '@angular/common';
import {PagesService} from "../pages.service";
import {Router} from "@angular/router";
import {UserService} from "../user.service";

@Component({
  templateUrl: './menu-mobile.component.html',
  styleUrls: ['./menu-mobile.component.css'],
  standalone: true,
  imports: [
    MatListModule,
    MatButtonModule,
    NgForOf,
    MatIconModule
  ]
})
export class MenuMobileComponent {

  constructor(public pages: PagesService, public router: Router, public user: UserService) { }

  close(name: string): void {
    this.pages.menuDialog.close();
    this.pages.page = name;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if(window.innerWidth > 700)
      try {
        this.pages.menuDialog.close();
      } catch(ignored) { }
  }

  logout(): void {
    this.pages.load = true;
    this.user.logout(() => this.pages.menuDialog.close());
  }
}
