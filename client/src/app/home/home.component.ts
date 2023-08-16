import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { PagesService } from '../pages.service';
import { ChangeDataService } from '../changeData.service';
import { HistoryService } from '../history.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  /*
  accedo all'istanza pubblica di:
    - UserService per effettuare le API necessarie
    - Router per effettuare azioni di redirect e per visualizzare la route corrente
    - PageService per settare il component da vedere in base alla url
    - cds per settare una variabile
    - history per settare il numero di notifiche
  */
  constructor(public user: UserService, public router: Router, public pages: PagesService,
              public cds: ChangeDataService, public history: HistoryService) { }

  // --- funzione dell'interfaccia OnInit che si esegue all'apertura del component
  ngOnInit(): void {
    // controllo se l'utente è loggato, se non lo è viene redirect-ato alla pagina di login
    this.user.getLogged().subscribe((res: any) => {
      if(!res.logged) {
        this.router.navigate(['/']);
      }
    });

    // setto il component da visualizzare e la src della foto profilo o null se non c'è
    this.pages.setPage(this.router.url.split('/').pop());
    this.user.srcPhoto().subscribe(res => this.user.photo = res.path);

    // viene azzerato il load generale e l'array di messaggi di ChangeDataService
    this.pages.load = false;
    this.cds.messages = [];

    // richiedo la history dell'utente per scoprirne il numero di notifiche non lette
    this.user.getHistory().subscribe(
      res => this.history.notifications = res.history.filter((e: any) => !Boolean(e.visualized)).length
    );
  }
}
