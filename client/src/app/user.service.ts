import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly URL_S: string = 'http://localhost:3000';
  photo: string | null = null;

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

  logout(callback?: any): void {
    setTimeout(() => this.http.get('/logout')
      .subscribe(() => {
        if(callback != undefined)
          callback();
        this.router.navigate(['/'])
      }), 1000);
  }

  getLogged(): Observable<any> {
    return this.http.get('/logged');
  }

  getUsername(): Observable<any> {
    return this.http.get('/account/getUsername');
  }

  getData(): Observable<any> {
    return this.http.get('/account/getData');
  }

  sendNewPhoto(fd: FormData): Observable<any> {
    return this.http.post('/account/newPhoto', fd);
  }

  srcPhoto(): Observable<any> {
    return this.http.get('/account/srcPhoto');
  }

  remPhoto(): Observable<any> {
    return this.http.get('/account/remPhoto');
  }

  sendEmailChangeData(name: string, value: string): Observable<any> {
    return this.http.post('/account/emailChangeData', {
      name: name,
      value: value
    });
  }

  changeData(name: string, value: string): Observable<any> {
    return this.http.post('/account/changeData', {
      name: name,
      value: value
    });
  }

  getRooms(): Observable<any> {
    return this.http.post('/books/getRooms', {});
  }

  saveBook(name: string, zone: string, day: string, time: string, reason: string): Observable<any> {
    return this.http.get(`/books/saveBook?name=${name}&zone=${zone}&day=${day}&time=${time}&reason=${reason}`)
  }

  getBooks(name: string, zone: string): Observable<any> {
    return this.http.get(`/books/getBooks?name=${name}&zone=${zone}`);
  }

  getUsernameById(id: number): Observable<any> {
    return this.http.post('/account/username-by-id', { id: id });
  }

  getHistory(): Observable<any> {
    return this.http.get('/account/get-history');
  }

  segnaGiaLetto(id: number | undefined, room: string, zone: string, day: string, time: string): Observable<any> {
    console.log(id)
    if(typeof id == 'number')
      return this.http.get(`/my-books/segna-gia-letto?id=${id}`);
    return this.http.get(`/my-books/segna-gia-letto?room=${room}&zone=${zone}&day=${day}&time=${time}`);
  }

  changeSecured(id: number | undefined, secured: boolean, room: string, zone: string, day: string, time: string): Observable<any> {
    if(typeof id == 'number')
      return this.http.get(`/my-books/change-secured?id=${id}&value=${Number(!secured)}`);
    return this.http.get(`/my-books/change-secured?value=${Number(!secured)}&room=${room}&zone=${zone}&day=${day}&time=${time}`);
  }

  removeEvent(id: number | undefined, room: string, zone: string, day: string, time: string): Observable<any> {
    if(typeof id == 'number')
      return this.http.get(`/my-books/delete-book?id=${id}&room=${room}&zone=${zone}&day=${day}&time=${time}`);
    return this.http.get(`/my-books/delete-book?room=${room}&zone=${zone}&day=${day}&time=${time}`);
  }

  clearHistory(): Observable<any> {
    return this.http.get('/account/clear-history');
  }
}
