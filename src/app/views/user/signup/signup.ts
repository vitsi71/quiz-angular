import {Component} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {LoginResponseType} from '../../../../types/login-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthService} from '../../../core/auth/auth-service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SignupResponseType} from '../../../../types/signup-response.type';

@Component({
  selector: 'app-signup',
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {

  signupForm = new FormGroup({
    name: new FormControl('', [Validators.pattern(/^[А-Я][а-я]+\s*$/), Validators.required]),
    lastName: new FormControl('', [Validators.pattern(/^[А-Я][а-я]+\s*$/), Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.pattern
    (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/), Validators.required]),
    agree: new FormControl('false', [Validators.required])
  })

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {
  }

  signup() {
    if (this.signupForm.valid &&
      this.signupForm.value.email && this.signupForm.value.password &&
      this.signupForm.value.name && this.signupForm.value.lastName) {
      this.authService.signup(this.signupForm.value.name, this.signupForm.value.lastName,
        this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (data: SignupResponseType) => {
            if (data.error || !data.user) {
              this._snackBar.open('Ошибка при регистрации')
              throw new Error(data.message ? data.message : 'Error with data on signup');
            }

            if (this.signupForm.valid && this.signupForm.value.email && this.signupForm.value.password) {
              this.authService.login(this.signupForm.value.email, this.signupForm.value.password)
                .subscribe({
                  next: (data: LoginResponseType) => {
                    if (data.error || !data.accessToken || !data.refreshToken
                      || !data.fullName || !data.userId) {
                      this._snackBar.open('Ошибка при авторизации')

                      throw new Error(data.message ? data.message : 'Error with data on login');
                    }
                    if (this.signupForm.value.email){
                      this.authService.setEmail(this.signupForm.value.email);
                    }
                    this.router.navigate(['/choice']);
                  },
                  error: (error:HttpErrorResponse) => {
                    this._snackBar.open('Ошибка при авторизации');
                    throw new Error(error.error.message);

                  }
                })
            }
          },
          error: (error: HttpErrorResponse) => {
            this._snackBar.open('Ошибка при регистрации');
            throw new Error(error.error.message);

          }
        })
    }
  }
}
