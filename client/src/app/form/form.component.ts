import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

// --- costanti di tipo RegExp che indicano le espressioni regolari della password e dell'username
const REGEX_PASSW: RegExp = /^(=?.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!?]{8,}$/;
const REGEX_USERN: RegExp = /^[a-zA-Z0-9_]{3,}$/;

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent {
  readonly STR_NO_ERROR: string = 'no errors';  // costante stringa che indica che non ci sono errori

  isLogin: boolean = true;                      // booleana che afferma se è in login o in registrazione
  passwordHided: boolean = true;                // booleana che afferma se la password è visibile
  onLoad: boolean = false;                      // booleana che afferma se sta effettuando qualche azione

  error: string = this.STR_NO_ERROR;            // stringa che indica l'errore da segnalare
  noErrorAtSignUp: boolean = false;             // booleana che afferma se c'è un errore da segnalare all'utente

  // --- controlli sui campi di username, password ed email (tutti e tre sono required)
  email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  password: FormControl = new FormControl('', [Validators.required, Validators.pattern(REGEX_PASSW)]);
  username: FormControl = new FormControl('', [Validators.required, Validators.pattern(REGEX_USERN)]);

  /* specifico di utilizzare un'istanza pubblica di:
    - servizio UserService per effettuare richieste http
    - classe Router per cambiare Route in caso di accesso
   */
  constructor(public user: UserService, public router: Router) { }

  // --- metodo richiamato per accedere o registrarsi
  send(): void {
    this.error = this.STR_NO_ERROR;
    this.noErrorAtSignUp = false;
    this.onLoad = true;

    // setTmeout inseritio per simulare una pausa
    setTimeout((): void => {
      if (this.isLogin)
        this.login();
      else
        this.signUp();
    }, 1000);
  }

  // --- metodo per completare il login
  login(): void {
    this.user.login(this.username.getRawValue(), this.password.getRawValue())
      .subscribe(res => {
        this.onLoad = false;

        if(!res.logged)
          this.error = 'Le credenziali inserite non sono corrette';
        else
          this.router.navigate(['/home/prenota']);
      })
  }

  // --- metodo per completare la registrazione
  signUp(): void {
    this.user.signUp(this.username.getRawValue(), this.email.getRawValue(), this.password.getRawValue())
      .subscribe(res => {
        this.onLoad = false;
        if(res.error != this.STR_NO_ERROR) {
          this.error = res.error;
          this.noErrorAtSignUp = false;
        } else
          this.noErrorAtSignUp = true;
      });
  }

  // --- metodo per cambiare da login a sign up e viceversa
  toggleLoginSignUp(): void {
    this.error = this.STR_NO_ERROR;
    this.noErrorAtSignUp = false;
    this.isLogin = !this.isLogin;
  }
}
