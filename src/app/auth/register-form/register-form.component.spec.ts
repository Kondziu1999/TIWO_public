import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './../service/auth.service';

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { UserRegisterModel } from '../models/user-register.model';
import { RegisterFormComponent, strongPasswordValidator } from './register-form.component';

describe('RegisterFormComponent', () => {
  interface RegisterFormHarnesses {
    email: MatInputHarness,
    username: MatInputHarness,
    password: MatInputHarness,
    confirmPassword: MatInputHarness
  }

  async function getControls(loader: HarnessLoader): Promise<RegisterFormHarnesses> {
    const email = await loader.getHarness(MatInputHarness.with({selector: "#email"}));
    const username = await loader.getHarness(MatInputHarness.with({selector: "#username"}));
    const password = await loader.getHarness(MatInputHarness.with({selector: "#password"}));
    const confirmPassword = await loader.getHarness(MatInputHarness.with({selector: "#confirmPassword"}));

    return {
      email,
      username,
      password,
      confirmPassword,
    }
  }


  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
  let authServiceStub: Partial<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let router: Router;
  let loader: HarnessLoader;

  beforeEach(waitForAsync(() => {
    authServiceStub = {
      register: (model: UserRegisterModel) => of(true),
    }
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    TestBed.configureTestingModule({
      declarations: [ RegisterFormComponent ],
      imports: [
        CommonModule,
        RouterTestingModule.withRoutes([]),
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatDividerModule,
        MatButtonModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {provide: AuthService, useValue: authServiceStub},
        { provide: Router, useValue: routerSpy },
      ]
    })
    .compileComponents();

  }));

  beforeEach(() => {
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should form be valid', async () => {
    await fixture.whenStable();
    const inputs = await getControls(loader);

    await inputs.email.setValue("mail@mail.com");
    await inputs.username.setValue("user12");
    await inputs.password.setValue("Pa$$word");
    await inputs.confirmPassword.setValue("Pa$$word");
    await inputs.confirmPassword.blur();
    component.registrationForm.markAllAsTouched();
    fixture.detectChanges();

    await fixture.whenStable();
    expect(fixture.componentInstance.registrationForm.valid).toBeTruthy()
  })

  it('should form be invalid when email is invalid', async () => {
    await fixture.whenStable();
    const inputs = await getControls(loader);
    // debugger;
    await inputs.email.setValue("invalidMail@");
    await inputs.username.setValue("user12");
    await inputs.password.setValue("Pa$$word");
    await inputs.confirmPassword.setValue("Pa$$word");
    await inputs.confirmPassword.blur();
    component.registrationForm.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.registrationForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.registrationForm.controls.email.errors!["email"]).toBeTruthy();

    await inputs.email.setValue("@mail.com");
    expect(fixture.componentInstance.registrationForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.registrationForm.controls.email.errors!["email"]).toBeTruthy();

    await inputs.email.setValue("invalidMail");
    expect(fixture.componentInstance.registrationForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.registrationForm.controls.email.errors!["email"]).toBeTruthy();
  })

  it('should form be invalid when username has less than 3 characters', async () => {
    await fixture.whenStable();
    const inputs = await getControls(loader);

    await inputs.email.setValue("mail@mail.com");
    await inputs.username.setValue("ab");
    await inputs.password.setValue("Pa$$word");
    await inputs.confirmPassword.setValue("Pa$$word");
    await inputs.confirmPassword.blur();
    component.registrationForm.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.registrationForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.registrationForm.controls.username.errors!["minlength"]).toBeTruthy();
  })

  it('should form be invalid when passwords doesn\'t match', async () => {
    await fixture.whenStable();
    const inputs = await getControls(loader);

    await inputs.email.setValue("mail@mail.com");
    await inputs.username.setValue("user123");
    await inputs.password.setValue("Pa$$word1");
    await inputs.confirmPassword.setValue("Pa$$word2");
    await inputs.confirmPassword.blur();
    component.registrationForm.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.registrationForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.registrationForm.errors!["mismatch"]).toBeTruthy();
  })

  it('should form be invalid when password is to weak', async () => {
    await fixture.whenStable();
    const inputs = await getControls(loader);

    await inputs.email.setValue("mail@mail.com");
    await inputs.username.setValue("user123");
    await inputs.password.setValue("weak");
    await inputs.confirmPassword.setValue("weak");
    await inputs.confirmPassword.blur();
    component.registrationForm.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.registrationForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.registrationForm.controls.password.errors!["weakPassword"]).toBeTruthy();  
  })

  
  it('should redirect to management after submit', fakeAsync(async () => {
    await fixture.whenStable();
    const inputs = await getControls(loader);

    await inputs.email.setValue("mail@mail.com");
    await inputs.username.setValue("user12");
    await inputs.password.setValue("Pa$$word");
    await inputs.confirmPassword.setValue("Pa$$word");
    await inputs.confirmPassword.blur();
    component.registrationForm.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    const button = await loader.getHarness(MatButtonHarness.with({selector: "#registerBtn"}));

    await button.click();
    
    tick();
    flush();
    const navArgs = routerSpy.navigate.calls.first().args[0];
    expect(navArgs).toEqual(["management"]);
  }));

  it('should validator return weak password when no uppercase is used', () => {
    const testControl = new FormControl<string>('');
    testControl.setValue("nouppercase.");

    expect(strongPasswordValidator(testControl)).toEqual({weakPassword: true});
  })

  it('should validator return weak password when is shorter than 6 chars', () => {
    const testControl = new FormControl<string>('');
    testControl.setValue("Abcd.");

    expect(strongPasswordValidator(testControl)).toEqual({weakPassword: true});
  })

  it('should validator return weak password when contains space', () => {
    const testControl = new FormControl<string>('');
    testControl.setValue("Abc d.12");

    expect(strongPasswordValidator(testControl)).toEqual({weakPassword: true});
  })

  
  it('should validator return null', () => {
    const testControl = new FormControl<string>('');
    testControl.setValue("Abcd12");

    expect(strongPasswordValidator(testControl)).toEqual(null);
  })
});
