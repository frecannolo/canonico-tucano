import {Component, HostListener, OnInit} from '@angular/core';
import {UserService} from "../user.service";
import {MatDialog} from "@angular/material/dialog";
import {MenuMobileComponent} from "../menu-mobile/menu-mobile.component";
import {PagesService} from "../pages.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  width: number = 1600;

  constructor(public user: UserService, private dialog: MatDialog, public pages: PagesService) { }

  ngOnInit(): void {
    this.width = window.innerWidth;
    this.user.getUsername().subscribe(res => this.user.username = res.username);
  }

  openMenu(): void {
    this.pages.menuDialog = this.dialog.open(MenuMobileComponent);
  }

  logout(): void {
    this.pages.load = true;
    this.user.logout();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.width = window.innerWidth;
  }
}
