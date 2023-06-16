import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  username: string | undefined;
  password: string | undefined;
  email: string | undefined;
  fotoProfilo: string | ArrayBuffer | null | undefined;
  id: number | undefined;

  logged: boolean = false;

  constructor(public http: HttpClient) { }

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

  }
}
