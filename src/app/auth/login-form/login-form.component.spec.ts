import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './../service/auth.service';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { invalidCredentialsMessage, LoginFormComponent } from './login-form.component';
import { of, defer } from 'rxjs';
import { UserLoginModel } from '../models/user-login.model';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatButtonHarness} from '@angular/material/button/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';


describe('LoginFormComponent', () => {
  let authServiceStub: Partial<AuthService>;
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
  let router: Router;
  let loader: HarnessLoader;


  beforeEach(waitForAsync(() => {
    authServiceStub = {
      isLoggedIn$: of(false),
      login: (model: UserLoginModel) => of(true)
    }

    TestBed.configureTestingModule({
      declarations: [ LoginFormComponent ],
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
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    })
    .compileComponents();

  }));

  beforeEach(() => {
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  }); 


  it('should form be valid', async () => {
    const login = await loader.getHarness(MatInputHarness.with({selector: "#login"}));
    const password = await loader.getHarness(MatInputHarness.with({selector: "#password"}));

    await login.setValue("mail@mail.com");
    await password.setValue("Pa$$word");

    expect(fixture.componentInstance.loginForm.valid).toBeTruthy();
  });

  it('should form be invalid when putting invalid email', async () => {
    const login = await loader.getHarness(MatInputHarness.with({selector: "#login"}));
    const password = await loader.getHarness(MatInputHarness.with({selector: "#password"}));

    await login.setValue("invalidMail");
    await password.setValue("Pa$$word");

    expect(fixture.componentInstance.loginForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.loginForm.controls.email.errors!['email']).toBeTruthy();

    await login.setValue("mail@");
    expect(fixture.componentInstance.loginForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.loginForm.controls.email.errors!['email']).toBeTruthy();

    await login.setValue("@mail.com");
    expect(fixture.componentInstance.loginForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.loginForm.controls.email.errors!['email']).toBeTruthy();
  });

  it('should form be invalid when putting no password', async () => {
    const login = await loader.getHarness(MatInputHarness.with({selector: "#login"}));
    const password = await loader.getHarness(MatInputHarness.with({selector: "#password"}));

    await login.setValue("mail@mail.com");
    await password.setValue("");

    expect(fixture.componentInstance.loginForm.invalid).toBeTruthy();
    expect(fixture.componentInstance.loginForm.controls.password.errors!['required']).toBeTruthy();
  });

  /// Integration
  it('should navigate to management on successful login', fakeAsync(async () => {
    const login = await loader.getHarness(MatInputHarness.with({selector: "#login"}));
    const password = await loader.getHarness(MatInputHarness.with({selector: "#password"}));
    const button =  await loader.getHarness(MatButtonHarness.with({selector: "#loginBtn"}));

    await login.setValue("mail@mail.com");
    await password.setValue("Pa$$word");

    await button.click();
    
    tick();
    const navArgs = routerSpy.navigate.calls.first().args[0];
    expect(navArgs).toEqual(["management"]);
  }));

  it('should display snackbar on invalid credentials', fakeAsync(async () => {
    authServiceStub.login = (model) => defer(() => {throw new Error('invalid login')});

    const login = await loader.getHarness(MatInputHarness.with({selector: "#login"}));
    const password = await loader.getHarness(MatInputHarness.with({selector: "#password"}));
    const button =  await loader.getHarness(MatButtonHarness.with({selector: "#loginBtn"}));

    await login.setValue("mail@mail.com");
    await password.setValue("Pa$$word");

    await button.click();
    
    tick();
    expect(snackBarSpy.open).toHaveBeenCalledWith(invalidCredentialsMessage);
  }));

});