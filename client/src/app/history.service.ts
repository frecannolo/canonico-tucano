import {Injectable} from "@angular/core";
import {CalendarService} from "./calendar.service";

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  events: any[] = [];
  notifications: number = 0;

  constructor(public calendar: CalendarService) { }
}