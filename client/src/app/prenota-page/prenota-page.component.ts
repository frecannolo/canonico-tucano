import {Component, OnInit} from '@angular/core';
import {UserService} from "../user.service";

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

  constructor(public user: UserService) { }

  ngOnInit(): void {
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
    }
  }
}
