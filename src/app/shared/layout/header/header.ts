import {ChangeDetectorRef, Component, OnInit, signal, WritableSignal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/auth/auth-service';
import {UserInfoType} from '../../../../types/user-info.type';
import {LogoutResponseType} from '../../../../types/logout-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {

  userInfo:WritableSignal<UserInfoType | null> = signal<UserInfoType | null>(null);

  constructor(protected authService: AuthService, private router: Router,
              private _snackBar: MatSnackBar,private cd:ChangeDetectorRef) {
    if (this.authService.getLoggedIn()) {
      this.userInfo.set(this.authService.getUserInfo())  ;
    }
  }

  ngOnInit(): void {

    this.authService.isLogged$
      .subscribe((isLoggedIn: boolean): void => {
         this.userInfo.set( isLoggedIn ? this.authService.getUserInfo() : null);
      })

  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: (value: LogoutResponseType) => {
          if (value && !value.error) {
            this.authService.removeTokens();
            this.authService.removeUserInfo();
            this.authService.removeEmail();
            this._snackBar.open('Вы вышли из системы');
            this.router.navigate(['']);
          } else{
            this._snackBar.open('Ошибка при выходе из системы');
          }
        },
        error: (err: HttpErrorResponse) => {
          this._snackBar.open('Ошибка при выходе из системы');
        }

      })
  }

}
