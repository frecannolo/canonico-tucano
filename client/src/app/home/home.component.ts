import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../user.service";
import {Router} from "@angular/router";
import {PagesService} from "../pages.service";
import {ChangeDataService} from "../changeData.service";
import {HistoryService} from "../history.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(public user: UserService, public router: Router, public pages: PagesService, public cds: ChangeDataService, public history: HistoryService) { }

  ngOnInit(): void {
    this.user.getLogged().subscribe((res: any) => {
      if(!res.logged)
        this.router.navigate(['/']);
    });
    this.user.srcPhoto().subscribe(res => this.user.photo = res.path);

    this.pages.load = false;
    this.pages.page = this.pages.START_PAGE;
    this.cds.elementsToChange = [];
    this.cds.messages = [];

    this.history.events = [];
    this.history.notifications = 0;
    this.user.getHistory().subscribe(res => this.history.notifications = res.history.filter((e: any) => !Boolean(e.visualized)));
  }

  ngOnDestroy(): void {
    this.user.logout();
  }
}
