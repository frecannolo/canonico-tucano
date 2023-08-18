import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDataService } from '../changeData.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../user.service';

// questo è un component speciale, è un MatDialog (un popup), di conseguenza la seguente annotation sarà diversa e l'oggetto SetOraNotificaComponent non sarà presente nell'app.module.ts
@Component({
  templateUrl: './set-ora-notifica.component.html',
  styleUrls: ['./set-ora-notifica.component.css'],
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    NgIf
  ]
})
export class SetOraNotificaComponent {
  load: boolean = false;
  pren: any;

  /*
    accedo alle istanze pubbliche di:
    - @Inject(MAT_DIALOG_DATA) data -> i dati che vengono passati al dialog
    - ChangeDateService -> per chiudere il dialog
    - UserService -> per eliminare la mail o settare una nuova mail
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public cds: ChangeDataService, public user: UserService) {
    this.pren = data.pren;
    this.pren.time_email = data.pren.time_email == null? '0 0 0': data.pren.time_email;
  }

  // --- metodo per eliminare la mail
  deleteEmail(): void {
    this.load = true;
    this.user.deleteEmail(this.data.pren.id).subscribe(res => {
      setTimeout(() => {
        if (res.success) {
          this.data.pren.id_email = null;
          this.data.pren.time_email = null;
          this.cds.dialog.close();
        }
        this.load = false;
      }, 1000);
    });
  }

  // --- metodo per settare una nuova mail
  setEmail(d: HTMLInputElement, h: HTMLInputElement, m: HTMLInputElement): void {
    this.load = true;
    this.user.setEmail(this.data.pren.id, `${d.value} ${h.value} ${m.value}`).subscribe(res => {
      setTimeout(() => { // set-timeout per la barra di caricamento
        if (res.success) {
          this.data.pren.id_email = res.id_email;
          this.data.pren.time_email = `${d.value} ${h.value} ${m.value}`;
          this.pren.time_email = `${d.value} ${h.value} ${m.value}`
          this.cds.dialog.close();
        }
        this.load = false;
      }, 1000);
    });
  }
}
