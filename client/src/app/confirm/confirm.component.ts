import { Component, Inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeDataService } from '../changeData.service';
import { UserService } from '../user.service';

// questo è un component speciale, è un MatDialog (un popup), di conseguenza la seguente annotation sarà diversa e l'oggetto ConfirmComponent non sarà presente nell'app.module.ts
@Component({
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
  standalone: true,
  imports: [
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    NgIf,
    MatProgressBarModule,
  ]
})
export class ConfirmComponent {
  passwordHided: boolean = true; // booleana per capire se la password è coperta (nell'input)
  error: boolean = false;        // booleana = true se c'è un errore
  load: boolean = false;         // booleana che gestisce la barra di load

  /*
    accedo alle istanze pubbliche di:
    - @Inject(MAT_DIALOG_DATA) data -> i dati che vengono passati al dialog
    - ChangeDateService -> per chiudere il dialogo
    - UserService -> per leggere la password dell'user
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public cds: ChangeDataService, public user: UserService) { }

  confirm(val: string): void {
    this.load = true;
    this.error = false;

    this.user.checkPassword(val).subscribe(res => {
      setTimeout(() => {
        if(!res.success)
          this.error = true;
        else {
          this.data.next();
          this.cds.dialog.close();
        }

        this.load = false;
      }, 750);
    });
  }
}
