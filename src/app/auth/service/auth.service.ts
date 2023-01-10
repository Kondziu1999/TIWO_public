import { filter, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, updateProfile, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { defer, from, Observable, BehaviorSubject, Subscription, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApplicationUserModel } from 'src/app/shared/model/application-user.model';
import { UserRegisterModel } from '../models/user-register.model';
import { UserLoginModel } from './../models/user-login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userDisposable: Subscription|undefined;

  private currentUserSubject = new BehaviorSubject<ApplicationUserModel | null>(null);
  isLoggedIn$: Observable<boolean>;

  get user$(): Observable<ApplicationUserModel | null> {
    return this.currentUserSubject.asObservable();
  }

	constructor(private auth: Auth, private router: Router) {
    this.isLoggedIn$ = authState(this.auth).pipe(map(x => x !== null));

    this.userDisposable = authState(this.auth).subscribe(x => {
      if(x !== null) {
        const appUser: ApplicationUserModel = {
          id: x.uid,
          email: x.email!,
          username: x.displayName!
        }
        this.currentUserSubject.next(appUser);
      } else {
        this.currentUserSubject.next(x);
      }
      
    });
	}

	 
  register(model: UserRegisterModel): Observable<boolean> {
    if (model.password !== model.confirmPassword) {
      return throwError(() => new Error("passwords mismatch"));  
    }

    return defer(
      () => createUserWithEmailAndPassword(this.auth, model.email, model.password)
    ).pipe(
      map(x => x.user),
      switchMap(user => from(updateProfile(user, {displayName: model.username})).pipe(map(() => true))),
    )
  }

  login(model: UserLoginModel): Observable<boolean> {
    return defer(() => signInWithEmailAndPassword(this.auth, model.email, model.password)).pipe(
      map(x => true),
    )
  }

  logOut(): Observable<boolean> {
    return defer(() => signOut(this.auth)).pipe(
      switchMap(() => from(this.router.navigate(['auth'])))
    );
  }

  // Cleanup logic
  deleteAccount(): Observable<void> {
    const currUser = this.auth.currentUser;
    
    return  currUser !== null ? from(currUser.delete()) : of(void 0);
  }

  ngOnDestroy(): void {
    if (this.userDisposable) {
      this.userDisposable.unsubscribe();
    }
  }

}
