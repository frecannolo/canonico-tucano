import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'visRoom'
})
export class VisRoomPipe implements PipeTransform {

  transform(value: any[], filter: string): any[] {
    if(filter == null || filter == '')
      return value;

    let toRet: any[] = [];
    value.forEach((zone: any): void => {
      let n = 0;
      zone.rooms.forEach((r: any): void => {
        if(r.name.toLowerCase().includes(filter))
          r.css['background-color'] = '#ffd740';
        else {
          r.css['background-color'] = 'transparent';
          n ++;
        }
      });

      if(zone.rooms.length > n)
        toRet.push(zone);
    });
    return toRet;
  }

}
