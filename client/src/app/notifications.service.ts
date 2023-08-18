import { Injectable } from '@angular/core';

// questo è un service, i component li utilizzano per comunicare tra loro perché accedono a essi tramite un'istanza pubblica
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  notifications: number = 0;  // number che indica il numero di notifiche da visualizzare
}
