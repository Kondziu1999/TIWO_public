import { map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { AuthService } from './../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot,
    ): Observable<boolean | UrlTree> {
        return this.authService.isLoggedIn$.pipe(
          switchMap(isLoggedIn => {
            if(isLoggedIn) {
              return of(true);
            }
            return from(this.router.navigate(['auth']))
          })
        )
    }
}
