import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {Client} from '../../models/client';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FirstQuery} from '../../models/first-query';
import {UserService} from '../../services/user.service';
import {BackendClient} from '../../models/backend-client';
import {SnackbarService} from '../../services/snackbar.service';
import {ProgressBarService} from '../../services/progress-bar.service';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  public stepperStarted = new Subject<boolean>();

  public client$$: BehaviorSubject<Client> = new BehaviorSubject<Client>(null);
  public firstQuery$$: BehaviorSubject<FirstQuery> = new BehaviorSubject<FirstQuery>(null);

  public registerStarted = false;
  public clientCode: string | undefined = undefined;

  constructor(private userService: UserService,
              private snackbarService: SnackbarService,
              private progressBarService: ProgressBarService) {
  }

  ngOnInit(): void {
    this.firstQuery$$.subscribe(
      val => console.log('new fq: ' + JSON.stringify(val))
    );
  }

  public registerClient() {
    this.progressBarService.progressBarState = true;
    this.registerStarted = true;
    this.userService.createClient(this.client$$.getValue(), this.firstQuery$$.getValue())
      .pipe(
        switchMap(code => this.userService.setUserCode(code))
      )
      .subscribe(
        (backendClient: BackendClient) => {
          this.progressBarService.progressBarState = false;
          this.clientCode = backendClient.clientCode;
          this.snackbarService.confirm('Die Registrierung war erfolgreich.');
        },
        error => {
          this.progressBarService.progressBarState = false;
          this.snackbarService.error('Es ist ein Fehler aufgetreten. Bitte später erneut versuchen.');
        }
      );
  }

}
