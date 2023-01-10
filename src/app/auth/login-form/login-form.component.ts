import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { UserLoginModel } from './../models/user-login.model';

export const invalidCredentialsMessage = "invalid credentials";
export const loginFormFactory = () => new FormBuilder().nonNullable.group(
  {
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  }
);

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4000}}
  ]
})
export class LoginFormComponent {

  @HostListener('window:keyup', ['$event'])
      keyEvent(event: KeyboardEvent) {
    if (event.key == 'Enter' && this.loginForm.valid){
      this.onSubmit();
    }
  }

  loginForm = loginFormFactory();
  
  	get email() {
		return this.loginForm.controls.email
	}

  	get password() {
		return this.loginForm.controls.password
	}

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar, 
    private router: Router,
  ) {}

  onSubmit(){
    const userLoginModel: UserLoginModel = {...this.loginForm.value} as UserLoginModel;

    this.authService.login(userLoginModel).subscribe({
        next: () => this.router.navigate(['management']),
        error: () => this.snackBar.open(invalidCredentialsMessage)
      }
    );
  }

}
