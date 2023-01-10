import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators, FormControl, AbstractControl } from '@angular/forms';
import { passwordsMatchValidator } from '../helpers/password-match-validator';
import { UserRegisterModel } from './../models/user-register.model';
import { AuthService } from './../service/auth.service';
import { from } from 'rxjs';

export const strongPasswordValidator: ValidatorFn = (control: AbstractControl) => {    
		let minLength = /.{6}/;
		let upperCase = /.*[A-Z]+.*/;
		let space = /\s/;

		const password = control.value;
		
		const minLengthMatch = password.match(minLength);
		const upperCaseMatch = password.match(upperCase);
		const spaceMatch = password.match(space);

		const isStrong = minLengthMatch !== null && upperCaseMatch !== null && spaceMatch == null;

   return isStrong ? null : {weakPassword: true};
}

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
 	@HostListener('window:keyup', ['$event'])
		keyEvent(event: KeyboardEvent) {
		if (event.key == 'Enter' && this.registrationForm.valid){	
			this.onSubmit();
		}
    }

	registrationForm = this.fb.nonNullable.group({
		username: ['', [Validators.required,Validators.minLength(3)]],
		password: ['', [Validators.required, Validators.minLength(6), strongPasswordValidator]],
		confirmPassword: ['', [Validators.required]],
		email: ['', [Validators.required, Validators.email]]
	}, {
        validators: [passwordsMatchValidator],
        updateOn: 'blur'
    });

	get email() {
		return this.registrationForm.controls.email
	}

	constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { 
	}
	


	onSubmit(): void {
		const userRegisterModel: UserRegisterModel = { ...this.registrationForm.value } as UserRegisterModel;
    this.authService.register(userRegisterModel).subscribe(
      () => this.router.navigate(['management'])
    );
  }
  
}
