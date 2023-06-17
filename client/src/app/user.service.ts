import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  logged: boolean = false;

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

  logout(): void {
    setTimeout(
      () => this.http.get('/logout').subscribe(
        () => this.router.navigate(['/'])),
      1000);
  }

  getLogged(): Observable<any> {
    return this.http.get('/logged');
  }

  getUsername(): Observable<any> {
    return this.http.get('/getUsername');
  }
}
