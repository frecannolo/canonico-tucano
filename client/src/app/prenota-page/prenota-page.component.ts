import { Component, OnInit } from '@angular/core';
import { UserService } from "../user.service";
import { PagesService } from "../pages.service";

@Component({
  selector: 'app-prenota-page',
  templateUrl: './prenota-page.component.html',
  styleUrls: ['./prenota-page.component.css']
})
export class PrenotaPageComponent implements OnInit {
  iconSearch: string = 'search';
  zones: any[] = [];
  rooms: any[] = [];
  filter: string = '';

  roomName: string = '';
  roomZone: string = '';

  constructor(public user: UserService, public pages: PagesService) { }

  ngOnInit(): void {
    this.pages.divInSearch = 'div-1';
    this.user.getRooms().subscribe(res => {
      res.rooms.forEach((d: any): void => {
        let i = -1;
        this.zones.forEach((zone, index): void => {
          if(zone.name == d.zona) {
            i = index;
            zone.rooms.push(d);
          }
        });
        if(i == -1)
          this.zones.push({
            name: d.zona,
            rooms: [d]
          });

        this.rooms.push(d);
      });
    });
  }

  changeIcon(input: HTMLInputElement): void {
      this.iconSearch = input.value.trim() != ''? 'close' : 'search';
  }

  cancel(input: HTMLInputElement): void {
    if (this.iconSearch == 'close') {
      input.value = '';
      this.iconSearch = 'search';
      this.filter = '';
    }
  }

  open(name: string, zone: string): void {
    this.pages.divInSearch = 'div-2';
    this.roomName = name;
    this.roomZone = zone;
  }
}
