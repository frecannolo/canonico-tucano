import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { MenuMobileComponent } from '../menu-mobile/menu-mobile.component';
import { PagesService } from '../pages.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  width: number = 1600;  // number equivalente alla width della pagina

  /*
  accedo all'istanza pubblica di:
    UserService per effettuare richieste al server e leggere il path della foto profilo e l'username
    MatDialog per aprire il MatDIalog del menu
    PagesService per effettuera azioni sulla paiina e sull'home component
  */
  constructor(public user: UserService, private dialog: MatDialog, public pages: PagesService) { }

  ngOnInit(): void {
    this.width = window.innerWidth;
    // chiedo l'username dell'utente e lo assegno a user.username
    this.user.getUsername().subscribe(res => this.user.username = res.username);
  }

  // apre il menu tramite il MenuMobileComponent
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
