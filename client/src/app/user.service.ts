import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  photo: string | null = null;  // variabile utilizzata per salvare la src della foto. Se photo == null, l'utente non ha foto
  username: string = '';        // variabile che salva l'username dell'utente

  // --- accedo all'istanza pubblica di HttpClient e di Router per poter effettuare la richieste http e per cambiare route in caso di logout
  constructor(public http: HttpClient, public router: Router) { }

  // --- effettua e ritorna la request post http per il login
  login(username: string, password: string): Observable<any> {
    return this.http.post('/login', {
      username: username,
      password: password
    });
  }

  // --- effettua e ritorna la request post http per la registrazione
  signUp(username: string, email: string, password: string): Observable<any> {
    return this.http.post('/sign-up', {
      username: username,
      email: email,
      password: password
    });
  }

  // --- effettua e ritorna la request get per il logout e la fine della sessione
  logout(callback?: any): void {
    setTimeout(() => this.http.get('/logout')
      .subscribe(() => {
        if(callback != undefined)
          callback();
        this.router.navigate(['/'])
      }), 1000);
  }

  // --- effettua e ritorna la request post per il controllo delle password
  checkPassword(password: string): Observable<any> {
    return this.http.post('/check-password', { password: password });
  }

  // --- effettua e ritorna la request get http per sapere se l'utente è loggato e se ha la sessione attiva
  getLogged(): Observable<any> {
    return this.http.get('/logged');
  }

  // --- effettua e ritorna la request get http per sapere l'username
  getUsername(): Observable<any> {
    return this.http.get('/account/get-username');
  }

  // --- effettua e ritorna la request get http con tutti i campi modificabili dall'utente
  getData(): Observable<any> {
    return this.http.get('/account/get-data');
  }

  // --- effettua e ritorna la request post http che invia la nuova foto profila
  sendNewPhoto(fd: FormData): Observable<any> {
    return this.http.post('/account/new-photo', fd);
  }

  // --- effettua e ritorna la request get http che ritorna la src della foto profilo
  srcPhoto(): Observable<any> {
    return this.http.get('/account/src-photo');
  }

  // --- effettua e ritorna la request get http che eliminana l'attuale foto profilo dal server
  remPhoto(): Observable<any> {
    return this.http.get('/account/rem-photo');
  }

  // --- effettua e ritorna la request post http che invia la mail per cambiare i dati più sensibili
  sendEmailChangeData(name: string, value: string): Observable<any> {
    return this.http.post('/account/email-change-data', {
      name: name,
      value: value
    });
  }

  // --- effettua e ritorna la request post http per cambiare i direttamente  i dati meno sensibili
  changeData(name: string, value: string): Observable<any> {
    return this.http.post('/account/change-data', {
      name: name,
      value: value
    });
  }

  // --- effettua e ritorna la request post http per sapere tutte le stanze nel database
  getRooms(): Observable<any> {
    return this.http.post('/books/get-rooms', {});
  }

  // --- effettua e ritorna la request get http per salvare la prenotazione sul database dato l nome, la zone, il giorno, l'orario e la motivazione
  saveBook(name: string, zone: string, day: string, time: string, reason: string): Observable<any> {
    return this.http.get(`/books/save-book?name=${name}&zone=${zone}&day=${day}&time=${time}&reason=${reason}`)
  }

  // --- effettua e ritorna la request get http per sapere tutte le prenotizioni di una defertimana stanza in una determinata zona
  getBooks(name: string, zone: string): Observable<any> {
    return this.http.get(`/books/get-books?name=${name}&zone=${zone}`);
  }

  // --- effettua e ritorna la request post http con l'username di un utente associato a un determinato id
  getUsernameById(id: number): Observable<any> {
    return this.http.post('/account/username-by-id', { id: id });
  }

  // --- effettua e ritorna la request get http con tutta la cronologia dell'utente
  getHistory(): Observable<any> {
    return this.http.get('/account/get-history');
  }

  // --- effettua e ritorna la request get http per segnare come letto una notifica di prenotazione o annullamento
  segnaGiaLetto(id: number): Observable<any> {
    return this.http.get(`/my-books/segna-gia-letto?id=${id}`);
  }

  // --- effettua e ritorna la request get http per fissare o non fissare una prenotazione (in base al valore di secured) data da id
  changeSecured(id: number, secured: boolean): Observable<any> {
    return this.http.get(`/my-books/change-secured?id=${id}&value=${Number(!secured)}`);
  }

  // --- effettua e ritorna la request get http per cancellare una prenotazione dato id, stanza, zona, giorno e orario
  removeEvent(id: number | undefined, room: string, zone: string, day: string, time: string): Observable<any> {
      return this.http.get(`/my-books/delete-book?id=${id}&room=${room}&zone=${zone}&day=${day}&time=${time}`);
  }

  // --- effettua e ritorna la request get http che ripulice la cronologia dell'utente
  clearHistory(): Observable<any> {
    return this.http.get('/account/clear-history');
  }

  // --- effettua e ritorna la request post http per inviare la mail per rimuovere l'account
  remAccount(): Observable<any> {
    return this.http.post('/account/email-rem-account', {});
  }

  // --- effettua e ritorna la request get http per inviare una mail di notifica di una prenotazione
  setEmail(id: number, time: string): Observable<any> {
    return this.http.get(`/my-books/set-email?id=${id}&time=${time}`);
  }

  // --- effettua e ritorna la request get http per cancellare la mail di notifica di una prenotazione
  deleteEmail(id: number): Observable<any> {
    return this.http.get(`/my-books/delete-email?id=${id}`);
  }
}
