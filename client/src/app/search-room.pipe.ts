import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchRoom'
})
export class SearchRoomPipe implements PipeTransform {

  transform(rooms: any[], filter: string): any[] {
    if(filter == null)
      return rooms;
    else if(filter == '')
      return [];

    return rooms.filter(r => r.name.toLowerCase().includes(filter));
  }

}
