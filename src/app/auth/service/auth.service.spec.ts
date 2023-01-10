import { UserLoginModel } from './../models/user-login.model';
import { TestBed } from "@angular/core/testing";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { connectAuthEmulator, getAuth, provideAuth } from "@angular/fire/auth";
import { RouterTestingModule } from "@angular/router/testing";
import { firstValueFrom, lastValueFrom, of, switchMap, take } from "rxjs";
import { catchError } from 'rxjs/operators';
import { environment } from "src/environments/environment";
import { UserRegisterModel } from "../models/user-register.model";
import { AuthService } from "./auth.service";

import { Router } from "@angular/router";
import { uuidv4 } from '@firebase/util';

describe('AuthService', () => {
  let service: AuthService;

  let routerStub: Partial<Router> = {
    navigate(commands, extras?) {
        return firstValueFrom(of(true))
    },
  }
  
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        RouterTestingModule.withRoutes([]),
        // Auth - With Dev Emulator
        provideAuth(() => {
          const auth = getAuth();
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

          return auth;
        }),
      ],
      providers: [
        {provide: Router, useValue: routerStub}
      ]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(async () => {
    await lastValueFrom(service.deleteAccount())
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register properly', async () => {
    const usr = uuidv4().slice(0, 10);

    const registerModel: UserRegisterModel = {
      confirmPassword: "Pa$$word",
      password: "Pa$$word",
      email: `${usr}@mail.com`,
      username: "username",
    }

    const isLoggedIn = await lastValueFrom(service.register(registerModel).pipe(
      switchMap(() => service.isLoggedIn$.pipe(take(1)))
    ))

    expect(isLoggedIn).toBe(true);
  })


  it('should logout properly', async () => {
    const usr = uuidv4().slice(0, 10);

    const registerModel: UserRegisterModel = {
      confirmPassword: "Pa$$word",
      password: "Pa$$word",
      email: `${usr}@mail.com`,
      username: usr,
    }

    const isLoggedIn = await lastValueFrom(service.register(registerModel).pipe(
      switchMap(() => service.logOut()),
      switchMap(() => service.isLoggedIn$.pipe(take(1))),
    ))

    expect(isLoggedIn).toBeFalsy();
  })

  it('registration should fail due invalid email', async () => {
    const usr = uuidv4().slice(0, 10);

    const registerModel: UserRegisterModel = {
      confirmPassword: "Pa$$word",
      password: "Pa$$word",
      email: `asd@`,
      username: usr,
    }

    const isSuccessful = await lastValueFrom(service.register(registerModel).pipe(
      catchError(() => of(false))
    ))

    expect(isSuccessful).toBeFalsy();
  })

  it('registration should fail due passwords mismatch', async () => {
    const usr = uuidv4().slice(0, 10);

    const registerModel: UserRegisterModel = {
      confirmPassword: "Pa$$word12",
      password: "Pa$$word",
      email: `${usr}@mail.com`,
      username: usr,
    }

    const isSuccessful = await lastValueFrom(service.register(registerModel).pipe(
      catchError(() => of(false))
    ))

    expect(isSuccessful).toBeFalsy();
  })

  it('login should fail due invalid credentials', async () => {
    const usr = uuidv4().slice(0, 10);

    const nonExistingUserLoginModel: UserLoginModel = {
      password: "Pa$$word13",
      email: `${usr}@nonExists.com`,
    }

    const isSuccessful = await lastValueFrom(service.login(nonExistingUserLoginModel).pipe(
      catchError(() => of(false))
    ))

    expect(isSuccessful).toBeFalsy();
  })

  it('should register, logout and login again', async () => {
    const usr = uuidv4().slice(0, 10);

    const registerModel: UserRegisterModel = {
      confirmPassword: "Pa$$word",
      password: "Pa$$word",
      email: `${usr}@mail.com`,
      username: usr,
    }

    const result = await lastValueFrom(service.register(registerModel).pipe(
      switchMap(() => service.logOut()),
      switchMap(() => service.login({email: registerModel.email, password: registerModel.password}))
    ));

    expect(result).toBeTruthy();
  });
});
